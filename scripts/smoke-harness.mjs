import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const harness = process.argv[2];
const checks = {
  claude: [
    "CLAUDE.md",
    ".claude/rules/canonical-workflow.md",
    ".claude/skills/story-new/SKILL.md",
    ".claude/agents/premise-prospector.md",
    ".claude/settings.json",
  ],
  cursor: ["AGENTS.md", ".cursor/rules/canonical-workflow.mdc"],
  pi: ["AGENTS.md", ".agents/skills/story-new/SKILL.md", ".pi/README.md"],
  opencode: [
    "AGENTS.md",
    ".agents/skills/story-new/SKILL.md",
    ".opencode/agents/premise-prospector.md",
    "opencode.jsonc",
  ],
  codex: ["AGENTS.md", ".agents/skills/story-new/SKILL.md", ".codex/config.toml"],
};

if (!checks[harness]) {
  console.error(`Usage: node scripts/smoke-harness.mjs ${Object.keys(checks).join("|")}`);
  process.exit(2);
}

const failures = checks[harness].filter((path) => !existsSync(join(root, path)));
const task = readFileSync(join(root, "tasks/TASK-2026-001-cross-harness-migration.md"), "utf8");
for (const heading of ["# Goal", "# Acceptance Criteria", "# Verification"]) {
  if (!task.includes(heading)) failures.push(`task contract missing ${heading}`);
}
if (failures.length) {
  console.error(`${harness} smoke failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`${harness} smoke: PASS`);
