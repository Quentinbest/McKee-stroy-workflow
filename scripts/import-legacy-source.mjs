import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "src");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function addStableMetadata(content, id) {
  if (!content.startsWith("---\n")) {
    throw new Error(`Missing frontmatter for ${id}`);
  }
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`Unterminated frontmatter for ${id}`);
  }
  const frontmatter = content.slice(4, end);
  const body = content.slice(end + 5);
  const metadata = [
    `id: ${id}`,
    "version: 1.0.0",
    "contract-version: 1",
  ];
  return `---\n${metadata.join("\n")}\n${frontmatter}\n---\n${body}`;
}

function sortedDirectories(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function sortedMarkdownFiles(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

rmSync(sourceRoot, { recursive: true, force: true });
mkdirSync(join(sourceRoot, "skills"), { recursive: true });
mkdirSync(join(sourceRoot, "roles"), { recursive: true });
mkdirSync(join(sourceRoot, "templates"), { recursive: true });
mkdirSync(join(sourceRoot, "prompts"), { recursive: true });

const ledger = {
  schemaVersion: 1,
  generatedAt: "2026-06-06",
  entries: [],
};

for (const id of sortedDirectories(join(root, "skills"))) {
  const legacyPath = join(root, "skills", id);
  const canonicalPath = join(sourceRoot, "skills", id);
  cpSync(legacyPath, canonicalPath, { recursive: true });
  const skillPath = join(canonicalPath, "SKILL.md");
  if (!existsSync(skillPath)) {
    throw new Error(`Missing SKILL.md for ${id}`);
  }
  const legacy = readFileSync(join(legacyPath, "SKILL.md"), "utf8");
  const canonical = addStableMetadata(legacy, id);
  writeFileSync(skillPath, canonical);
  ledger.entries.push({
    id,
    kind: "skill",
    legacyPath: relative(root, join(legacyPath, "SKILL.md")),
    canonicalPath: relative(root, skillPath),
    legacySha256: sha256(legacy),
    canonicalSha256: sha256(canonical),
    classification: "public",
  });
}

for (const filename of sortedMarkdownFiles(join(root, "agents"))) {
  const id = basename(filename, ".md");
  const legacyPath = join(root, "agents", filename);
  const canonicalPath = join(sourceRoot, "roles", filename);
  const legacy = readFileSync(legacyPath, "utf8");
  const canonical = addStableMetadata(legacy, id);
  writeFileSync(canonicalPath, canonical);
  ledger.entries.push({
    id,
    kind: "role",
    legacyPath: relative(root, legacyPath),
    canonicalPath: relative(root, canonicalPath),
    legacySha256: sha256(legacy),
    canonicalSha256: sha256(canonical),
    classification: "public",
  });
}

for (const filename of readdirSync(join(root, "templates")).sort()) {
  const legacyPath = join(root, "templates", filename);
  const canonicalPath = join(sourceRoot, "templates", filename);
  cpSync(legacyPath, canonicalPath);
  const content = readFileSync(legacyPath);
  ledger.entries.push({
    id: filename,
    kind: "template",
    legacyPath: relative(root, legacyPath),
    canonicalPath: relative(root, canonicalPath),
    legacySha256: sha256(content),
    canonicalSha256: sha256(content),
    classification: filename === "persona.md" ? "public-template" : "public",
  });
}

writeFileSync(
  join(sourceRoot, "source-provenance.json"),
  `${JSON.stringify(ledger, null, 2)}\n`,
);

console.log(
  `Imported ${ledger.entries.length} canonical sources into ${relative(root, sourceRoot)}.`,
);
