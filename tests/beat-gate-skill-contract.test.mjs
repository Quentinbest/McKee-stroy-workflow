import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const skill = fs.readFileSync(new URL("../skills/story-beat-gate/SKILL.md", import.meta.url), "utf8");

test("story-beat-gate references adjacent runner and detect-only fallback", () => {
  assert.match(skill, /skills\/story-beat-gate\/scripts\/beat-gate-rules\.mjs/);
  assert.match(skill, /execution_mode: detect-only/);
  assert.match(skill, /Apply no `AUTO`/);
});

test("story-beat-gate defines consolidated writer output and resume behavior", () => {
  assert.match(skill, /one consolidated summary/i);
  assert.match(skill, /resume from the first incomplete stage/i);
  assert.match(skill, /The Beat Gate does not declare the Beat aesthetically approved/i);
});

test("story-beat-gate encodes bounded fallback briefs", () => {
  assert.match(skill, /The blind critic receives only:/);
  assert.match(skill, /The blind critic must not see:/);
  assert.match(skill, /When diversity is required, provide only:/);
});

test("story-beat-gate requires prose-only batch pattern review", () => {
  assert.match(skill, /batch-beat-pattern-auditor/);
  assert.match(skill, /at least 6 cleaned Beats across at least 2 scenes/);
  assert.match(skill, /Do not provide mechanism labels/);
  assert.match(skill, /Mechanism labels are bookkeeping/);
});
