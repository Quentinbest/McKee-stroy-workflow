import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import { gunzipSync, gzipSync } from "node:zlib";
import {
  buildArchiveArtifacts,
  createTarGzip,
  inspectTarGzip,
  verifyArchiveArtifacts,
} from "../../scripts/lib/archive-artifacts.mjs";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

function rewriteFirstPath(archive, path, updateChecksum = true) {
  const tar = gunzipSync(archive);
  const header = tar.subarray(0, 512);
  const pathBytes = Buffer.from(path, "utf8");
  assert.ok(pathBytes.length <= 100);
  header.fill(0, 0, 100);
  header.fill(0, 345, 500);
  pathBytes.copy(header, 0);

  if (updateChecksum) {
    header.fill(0x20, 148, 156);
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    header.write(checksum.toString(8).padStart(6, "0"), 148, 6, "ascii");
    header[154] = 0;
    header[155] = 0x20;
  }

  return gzipSync(tar, { level: 9, mtime: 0 });
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

test("archive export writes both expected tarballs", () => {
  const manifest = buildArchiveArtifacts(root);

  assert.equal(manifest.assets.length, 2);
  assert.ok(existsSync(`${root}/release-assets/dist.tar.gz`));
  assert.ok(existsSync(`${root}/release-assets/reports.tar.gz`));
});

test("archive export recreates required reports from a clean generated state", () => {
  const generatedReports = [
    "reports/package-artifacts.json",
    "reports/package-doctor.json",
    "reports/package-install-smoke.json",
    "reports/package-models.json",
    "reports/package-pilots.json",
    "reports/rc-artifacts.json",
  ];
  for (const path of generatedReports) rmSync(`${root}/${path}`, { force: true });

  buildArchiveArtifacts(root);

  for (const path of generatedReports) {
    assert.ok(existsSync(`${root}/${path}`), `${path} was not regenerated`);
  }
});

test("archive verification validates manifest and checksums", () => {
  buildArchiveArtifacts(root);
  const manifest = verifyArchiveArtifacts(root);

  assert.equal(manifest.assets.length, 2);
});

test("archive export is byte-deterministic", () => {
  const first = buildArchiveArtifacts(root);
  const second = buildArchiveArtifacts(root);

  assert.deepEqual(
    first.assets.map(({ name, sha256 }) => ({ name, sha256 })),
    second.assets.map(({ name, sha256 }) => ({ name, sha256 })),
  );
});

test("archive entries are safe and constrained to declared roots", () => {
  buildArchiveArtifacts(root);
  const distEntries = inspectTarGzip(readFileSync(`${root}/release-assets/dist.tar.gz`));
  const reportEntries = inspectTarGzip(readFileSync(`${root}/release-assets/reports.tar.gz`));

  assert.ok(distEntries.every((entry) => entry.path.startsWith("dist/")));
  assert.ok(reportEntries.every((entry) => entry.path.startsWith("reports/")));
  assert.ok([...distEntries, ...reportEntries].every((entry) => !entry.path.includes("../")));
});

test("archive inspection rejects absolute paths, traversal, and malformed headers", () => {
  buildArchiveArtifacts(root);
  const archive = readFileSync(`${root}/release-assets/reports.tar.gz`);

  assert.throws(() => inspectTarGzip(rewriteFirstPath(archive, "/unsafe")));
  assert.throws(() => inspectTarGzip(rewriteFirstPath(archive, "../unsafe")));
  assert.throws(() => inspectTarGzip(rewriteFirstPath(archive, "reports/unsafe", false)));
});

test("archive verification rejects unexpected relative entries", () => {
  buildArchiveArtifacts(root);
  const archivePath = `${root}/release-assets/reports.tar.gz`;
  const manifestPath = `${root}/release-assets/manifest.json`;
  const checksumsPath = `${root}/release-assets/checksums.txt`;

  try {
    const archive = rewriteFirstPath(readFileSync(archivePath), "outside/package-doctor.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const asset = manifest.assets.find(({ name }) => name === "reports.tar.gz");
    asset.sha256 = sha256(archive);
    writeFileSync(archivePath, archive);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(
      checksumsPath,
      manifest.assets.map(({ name, sha256: digest }) => `${digest}  ${name}`).join("\n").concat("\n"),
    );

    assert.throws(() => verifyArchiveArtifacts(root), /unexpected archive entry/);
  } finally {
    buildArchiveArtifacts(root);
  }
});

test("USTAR prefix fields preserve paths longer than 100 bytes", () => {
  const longPath = `dist/${"nested/".repeat(12)}skill/SKILL.md`;
  assert.ok(Buffer.byteLength(longPath) > 100);

  const entries = inspectTarGzip(
    createTarGzip([{ path: longPath, content: Buffer.from("content\n") }]),
  );

  assert.equal(entries[0].path, longPath);
});
