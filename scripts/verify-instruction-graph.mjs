import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const rootGuide = readFileSync(join(root, "AGENTS.md"), "utf8");
if (rootGuide.split("\n").length > 200) failures.push("AGENTS.md exceeds 200 lines");

for (const path of [
  "AGENTS.md",
  "docs/AGENTS.md",
  "scripts/AGENTS.md",
  "src/skills/AGENTS.md",
  "tests/AGENTS.md",
]) {
  if (!existsSync(join(root, path))) failures.push(`missing instruction file: ${path}`);
}

for (const path of [
  "docs/agent/README.md",
  "docs/agent/project-context.md",
  "docs/agent/repository-map.md",
  "docs/agent/development-workflow.md",
  "docs/agent/testing-and-verification.md",
  "docs/agent/safety-and-permissions.md",
]) {
  if (!rootGuide.includes(path)) failures.push(`root guide does not link ${path}`);
}

const claude = readFileSync(join(root, "CLAUDE.md"), "utf8");
if (!claude.startsWith("@AGENTS.md")) failures.push("CLAUDE.md must import @AGENTS.md");
if (!claude.includes("GENERATED FILE. DO NOT EDIT")) failures.push("CLAUDE.md lacks generated header");

const generatedManifest = JSON.parse(readFileSync(join(root, "generated-manifest.json"), "utf8"));
for (const entry of generatedManifest.files) {
  if (!existsSync(join(root, entry.path))) failures.push(`manifest target missing: ${entry.path}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Instruction graph: PASS");
