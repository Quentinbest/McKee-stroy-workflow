import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  lstatSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { join, relative, sep } from "node:path";
import { writePackageArtifacts } from "./package-adapters.mjs";
import { writePackageInstallSmokeReport } from "./package-install-smoke.mjs";
import { frameworkRoot } from "./package-model.mjs";
import { writeRcArtifacts } from "./release-artifacts.mjs";

const TAR_BLOCK_SIZE = 512;

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function sha256File(path) {
  return sha256(readFileSync(path));
}

function portablePath(path) {
  return path.split(sep).join("/");
}

function collectFiles(root, inputPaths) {
  const files = [];

  function visit(path) {
    const absolutePath = join(root, path);
    const stat = lstatSync(absolutePath);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(absolutePath).sort()) {
        visit(join(path, entry));
      }
      return;
    }
    if (!stat.isFile()) throw new Error(`unsupported archive input: ${path}`);
    files.push({
      path: portablePath(relative(root, absolutePath)),
      content: readFileSync(absolutePath),
    });
  }

  for (const path of [...inputPaths].sort()) visit(path);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function splitTarPath(path) {
  if (Buffer.byteLength(path) <= 100) return { name: path, prefix: "" };

  const parts = path.split("/");
  for (let index = parts.length - 1; index > 0; index -= 1) {
    const prefix = parts.slice(0, index).join("/");
    const name = parts.slice(index).join("/");
    if (Buffer.byteLength(name) <= 100 && Buffer.byteLength(prefix) <= 155) {
      return { name, prefix };
    }
  }

  throw new Error(`tar path exceeds USTAR limits: ${path}`);
}

function writeString(buffer, offset, length, value) {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.length > length) throw new Error(`tar path exceeds ${length} bytes: ${value}`);
  bytes.copy(buffer, offset);
}

function writeOctal(buffer, offset, length, value) {
  const octal = Math.floor(value).toString(8);
  if (octal.length > length - 1) throw new Error(`tar numeric field overflow: ${value}`);
  buffer.write(octal.padStart(length - 1, "0"), offset, length - 1, "ascii");
  buffer[offset + length - 1] = 0;
}

function tarHeader(path, size) {
  const header = Buffer.alloc(TAR_BLOCK_SIZE);
  const { name, prefix } = splitTarPath(path);
  writeString(header, 0, 100, name);
  writeOctal(header, 100, 8, 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  writeString(header, 257, 6, "ustar\0");
  writeString(header, 263, 2, "00");
  writeString(header, 345, 155, prefix);

  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(checksum.toString(8).padStart(6, "0"), 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

function createTar(files) {
  const parts = [];
  for (const file of files) {
    parts.push(tarHeader(file.path, file.content.length));
    parts.push(file.content);
    const padding = (TAR_BLOCK_SIZE - (file.content.length % TAR_BLOCK_SIZE)) % TAR_BLOCK_SIZE;
    if (padding) parts.push(Buffer.alloc(padding));
  }
  parts.push(Buffer.alloc(TAR_BLOCK_SIZE * 2));
  return Buffer.concat(parts);
}

export function createTarGzip(files) {
  return gzipSync(createTar(files), { level: 9, mtime: 0 });
}

function readNullTerminated(buffer, offset, length) {
  const slice = buffer.subarray(offset, offset + length);
  const end = slice.indexOf(0);
  return slice.subarray(0, end === -1 ? slice.length : end).toString("utf8");
}

function readOctal(buffer, offset, length) {
  const value = readNullTerminated(buffer, offset, length).trim();
  return value ? Number.parseInt(value, 8) : 0;
}

function verifyHeaderChecksum(header, path) {
  const expected = readOctal(header, 148, 8);
  const copy = Buffer.from(header);
  copy.fill(0x20, 148, 156);
  const actual = copy.reduce((sum, byte) => sum + byte, 0);
  if (actual !== expected) throw new Error(`invalid tar header checksum: ${path}`);
}

export function inspectTarGzip(content) {
  const tar = gunzipSync(content);
  const entries = [];
  const seen = new Set();
  let offset = 0;

  while (offset + TAR_BLOCK_SIZE <= tar.length) {
    const header = tar.subarray(offset, offset + TAR_BLOCK_SIZE);
    if (header.every((byte) => byte === 0)) break;

    const name = readNullTerminated(header, 0, 100);
    const prefix = readNullTerminated(header, 345, 155);
    const path = prefix ? `${prefix}/${name}` : name;
    verifyHeaderChecksum(header, path);
    const parts = path.split("/");
    if (
      !path ||
      path.startsWith("/") ||
      path.includes("\\") ||
      parts.some((part) => !part || part === "." || part === "..")
    ) {
      throw new Error(`unsafe archive path: ${path || "<empty>"}`);
    }
    if (seen.has(path)) throw new Error(`duplicate archive path: ${path}`);
    seen.add(path);

    const type = String.fromCharCode(header[156] || "0".charCodeAt(0));
    if (type !== "0") throw new Error(`unsupported tar entry type ${type}: ${path}`);
    const size = readOctal(header, 124, 12);
    const dataStart = offset + TAR_BLOCK_SIZE;
    const dataEnd = dataStart + size;
    if (dataEnd > tar.length) throw new Error(`truncated tar entry: ${path}`);

    entries.push({ path, size, sha256: sha256(tar.subarray(dataStart, dataEnd)) });
    offset = dataStart + Math.ceil(size / TAR_BLOCK_SIZE) * TAR_BLOCK_SIZE;
  }

  return entries;
}

function archiveSpec(root) {
  return [
    {
      name: "dist.tar.gz",
      files: collectFiles(root, ["dist"]),
      expected: (path) => path.startsWith("dist/"),
    },
    {
      name: "reports.tar.gz",
      files: collectFiles(root, [
        "reports/package-doctor.json",
        "reports/package-artifacts.json",
        "reports/package-pilots.json",
        "reports/package-models.json",
        "reports/rc-artifacts.json",
        "reports/package-install-smoke.json",
      ]),
      expected: (path) =>
        [
          "reports/package-doctor.json",
          "reports/package-artifacts.json",
          "reports/package-pilots.json",
          "reports/package-models.json",
          "reports/rc-artifacts.json",
          "reports/package-install-smoke.json",
        ].includes(path),
    },
  ];
}

export function buildArchiveArtifacts(root = frameworkRoot()) {
  writePackageArtifacts(root);
  writeRcArtifacts(root);
  writePackageInstallSmokeReport(root);
  const assetRoot = join(root, "release-assets");
  rmSync(assetRoot, { recursive: true, force: true });
  mkdirSync(assetRoot, { recursive: true });

  const artifacts = archiveSpec(root).map((spec) => {
    const content = createTarGzip(spec.files);
    const path = join(assetRoot, spec.name);
    writeFileSync(path, content);
    return {
      name: spec.name,
      sha256: sha256(content),
      entryCount: spec.files.length,
      entries: spec.files.map((file) => file.path),
    };
  });

  const checksums = artifacts
    .map((artifact) => `${artifact.sha256}  ${artifact.name}`)
    .join("\n")
    .concat("\n");
  writeFileSync(join(assetRoot, "checksums.txt"), checksums);

  const manifest = {
    schemaVersion: 1,
    generatedAt: "archive-artifact-runtime",
    deterministic: true,
    assets: artifacts,
  };
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(join(assetRoot, "manifest.json"), serialized);
  writeFileSync(join(root, "reports/archive-artifacts.json"), serialized);
  return manifest;
}

export function verifyArchiveArtifacts(root = frameworkRoot()) {
  const assetRoot = join(root, "release-assets");
  const manifestPath = join(assetRoot, "manifest.json");
  const checksumsPath = join(assetRoot, "checksums.txt");

  if (!existsSync(manifestPath)) throw new Error("release-assets/manifest.json is missing");
  if (!existsSync(checksumsPath)) throw new Error("release-assets/checksums.txt is missing");

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const checksums = readFileSync(checksumsPath, "utf8");
  const specs = new Map(archiveSpec(root).map((spec) => [spec.name, spec]));
  if (manifest.deterministic !== true) throw new Error("archive manifest must declare deterministic output");
  if (manifest.assets?.length !== specs.size) throw new Error("archive manifest asset count mismatch");

  for (const asset of manifest.assets) {
    const path = join(assetRoot, asset.name);
    const spec = specs.get(asset.name);
    if (!spec) throw new Error(`unexpected archive asset ${asset.name}`);
    if (!existsSync(path)) throw new Error(`missing archive asset ${asset.name}`);
    const actual = sha256File(path);
    if (actual !== asset.sha256) throw new Error(`checksum mismatch for ${asset.name}`);
    if (!checksums.includes(`${asset.sha256}  ${asset.name}`)) {
      throw new Error(`checksums.txt missing entry for ${asset.name}`);
    }

    const entries = inspectTarGzip(readFileSync(path));
    if (entries.length !== asset.entryCount) throw new Error(`entry count mismatch for ${asset.name}`);
    if (entries.some((entry) => !spec.expected(entry.path))) {
      throw new Error(`unexpected archive entry in ${asset.name}`);
    }
    const paths = entries.map((entry) => entry.path);
    if (JSON.stringify(paths) !== JSON.stringify(asset.entries)) {
      throw new Error(`archive entry manifest mismatch for ${asset.name}`);
    }
  }

  return manifest;
}
