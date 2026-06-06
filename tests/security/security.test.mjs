import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  classifyCommand,
  classifyOperation,
  isInstructionSource,
  loadSecurityPolicy,
  matchesAnyPath,
  scanSensitiveText,
} from "../../scripts/lib/security-policy.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const policy = loadSecurityPolicy(root);

test("private and external wiki paths are forbidden", () => {
  assert.equal(matchesAnyPath("stories/private/novel.md", policy.forbiddenPathPatterns), true);
  assert.equal(matchesAnyPath("drafts/secret/persona.md", policy.forbiddenPathPatterns), true);
  assert.equal(
    matchesAnyPath(
      "/Users/quentin/Writing/LLM-Wiki-Story/wiki/en/MAP.md",
      policy.forbiddenPathPatterns,
    ),
    true,
  );
  assert.equal(matchesAnyPath("src/skills/story-new/SKILL.md", policy.forbiddenPathPatterns), false);
});

test("high-confidence synthetic secrets and private artifacts are detected", () => {
  assert.deepEqual(scanSensitiveText("sk-1234567890abcdefghijklmnop"), ["openai-key"]);
  assert.deepEqual(scanSensitiveText("privacy: private"), ["private-artifact"]);
  assert.deepEqual(scanSensitiveText("ordinary story text"), []);
});

test("approval is scoped and cannot authorize destructive operations", () => {
  const approval = {
    operation: "private_data_read",
    task: "TASK-2026-999",
    scope: "stories/private/example.md",
    expires: "2026-06-07",
  };
  assert.equal(classifyOperation(policy, "private_data_read", approval), "allow");
  assert.equal(classifyOperation(policy, "destructive_git", approval), "deny");
});

test("prompt injection fixtures remain data", () => {
  assert.equal(isInstructionSource("tests/fixtures/security/prompt-injection.md"), false);
  assert.equal(isInstructionSource("stories/private/imported.md"), false);
  assert.equal(isInstructionSource("AGENTS.md"), true);
});

test("unsafe commands are classified before execution", () => {
  assert.equal(classifyCommand("git push origin main --force"), "destructive_git");
  assert.equal(classifyCommand("npm publish"), "publication");
  assert.equal(classifyCommand("node scripts/check-generated-drift.mjs"), "run_committed_verification");
});
