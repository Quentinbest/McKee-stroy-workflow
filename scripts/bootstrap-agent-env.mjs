import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error(`Node.js 20+ required; found ${process.versions.node}`);
  process.exit(1);
}

for (const path of ["AGENTS.md", "docs/agent/README.md", "src/skills", "src/roles", "schemas"]) {
  if (!existsSync(join(root, path))) {
    console.error(`Missing required repository path: ${path}`);
    process.exit(1);
  }
}

const sibling = resolve(root, "../LLM-Wiki-Story");
const wikiRoot = process.env.MCKEE_WIKI_ROOT
  ?? (existsSync(join(sibling, "wiki/CANONICAL.md")) ? sibling : null);
console.log(`Agent environment: PASS (Node ${process.versions.node})`);
console.log(
  wikiRoot
    ? `Wiki dependency: available at ${wikiRoot}`
    : "Wiki dependency: optional/unavailable; set MCKEE_WIKI_ROOT for dependency validation",
);
