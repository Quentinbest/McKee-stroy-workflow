import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(root, "src/skills");
const roleRoot = join(root, "src/roles");

function directories(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function markdownFiles(path) {
  return readdirSync(path)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

const skillIds = directories(skillRoot);
const roleIds = markdownFiles(roleRoot).map((name) => basename(name, ".md"));
const knownIds = new Set([...skillIds, ...roleIds]);

function frontmatterValue(content, key) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  return frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function description(content, fallback) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  const single = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (single && single !== "|") return single;
  const block = frontmatter.match(/^description:\s*\|\n((?: {2}.+\n?)+)/m)?.[1];
  return block?.split("\n").map((line) => line.trim()).join(" ").trim() || fallback;
}

function referencedIds(content, self) {
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, "");
  const found = [];
  for (const id of [...knownIds].sort()) {
    if (id !== self && new RegExp(`(?:/|\\b)${id}\\b`).test(body)) found.push(id);
  }
  return found.slice(0, 8);
}

function artifactPaths(content) {
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, "");
  const paths = [...body.matchAll(/`((?:drafts|characters|scenes|reports)\/[^`\n]+)`/g)]
    .map((match) => match[1])
    .filter((value, index, all) => all.indexOf(value) === index);
  return paths.slice(0, 8);
}

function insertContract(content, contract) {
  const line = `contract: ${JSON.stringify(contract)}`;
  if (/^contract: \{.*\}$/m.test(content)) {
    return content.replace(/^contract: \{.*\}$/m, line);
  }
  const marker = "\n---\n";
  const end = content.indexOf(marker, 4);
  if (end === -1) throw new Error("unterminated frontmatter");
  return `${content.slice(0, end)}\n${line}${content.slice(end)}`;
}

const fixtureCatalog = { schemaVersion: 1, skills: {} };

for (const id of skillIds) {
  const path = join(skillRoot, id, "SKILL.md");
  const content = readFileSync(path, "utf8");
  const writes = /\b(?:Write|Edit)\b/.test(content);
  const handoff = referencedIds(content, id);
  const artifacts = artifactPaths(content);
  const contract = {
    purpose: description(content, `Execute the ${id} workflow.`),
    trigger: [`/${id}`, id.replaceAll("-", " ")],
    exclusions: ["unrelated requests", "operations outside the active task scope"],
    inputs: {
      required: ["active task or explicit user goal"],
      optional: ["story project artifacts", "McKee wiki references"],
    },
    preconditions: [
      "applicable instructions and task scope are loaded",
      "required private-data access is explicitly authorized",
    ],
    procedure: [
      "follow the ordered workflow in the SKILL.md body",
      "validate produced artifacts against the stated quality gates",
    ],
    artifacts: artifacts.length ? artifacts : ["structured response or task-scoped story artifact"],
    quality_gates: [
      "required workflow steps are completed",
      "outputs remain consistent with canonical terminology and task acceptance",
    ],
    failure_behavior: [
      "report missing inputs or authorization as blocked",
      "apply story-stop-loss when bounded revision limits are reached",
    ],
    side_effects: writes
      ? ["task-scoped story artifact writes", "no network or publication by default"]
      : ["read-only analysis", "no network or publication by default"],
    handoff: handoff.length ? handoff : ["return control to the primary agent"],
    fixtures: {
      positive: `${id}:positive`,
      negative: `${id}:missing-trigger`,
    },
  };
  writeFileSync(path, insertContract(content, contract));
  fixtureCatalog.skills[id] = {
    positive: { contract },
    negativeMutation: { remove: "trigger" },
  };
}

for (const filename of markdownFiles(roleRoot)) {
  const id = basename(filename, ".md");
  const path = join(roleRoot, filename);
  const content = readFileSync(path, "utf8");
  const tools = frontmatterValue(content, "tools") ?? "";
  const writes = /\b(?:Write|Edit)\b/.test(tools);
  const handoff = referencedIds(content, id);
  const outputs = artifactPaths(content);
  const contract = {
    purpose: description(content, `Execute the ${id} specialist role.`),
    mode: writes ? "scoped_write" : "read_only",
    inputs: ["bounded delegation envelope", "task-scoped story artifacts"],
    outputs: outputs.length ? outputs : ["structured specialist report"],
    allowed_paths: writes
      ? ["task-approved story artifact paths"]
      : ["task-approved read paths"],
    forbidden_actions: [
      "publish",
      "modify canonical story outside delegated scope",
      "read private data without authorization",
      "delegate irreversible actions",
    ],
    verification: ["output matches the delegation envelope", "evidence cites inspected artifacts"],
    handoff: handoff.length ? handoff : ["primary-agent"],
  };
  writeFileSync(path, insertContract(content, contract));
}

writeFileSync(
  join(root, "tests/fixtures/contracts/skill-contracts.json"),
  `${JSON.stringify(fixtureCatalog, null, 2)}\n`,
);
console.log(`Normalized ${skillIds.length} skills and ${roleIds.length} roles.`);
