import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const adjudication = fs.readFileSync(
  new URL("../skills/story-writer-adjudication/SKILL.md", import.meta.url),
  "utf8",
);
const beatGate = fs.readFileSync(
  new URL("../skills/story-beat-gate/SKILL.md", import.meta.url),
  "utf8",
);
const storyScene = fs.readFileSync(
  new URL("../skills/story-scene/SKILL.md", import.meta.url),
  "utf8",
);

test("writer adjudication separates preference, finding, and source-aware disposition", () => {
  assert.match(adjudication, /Do not collapse these questions/);
  assert.match(adjudication, /Stage 1 — Create and blind-review/);
  assert.match(adjudication, /Stage 2A — Blind finding adjudication/);
  assert.match(adjudication, /Stage 2B — Source-role reveal and disposition/);
  assert.match(adjudication, /Stage 3 — Score without auto-applying/);
  assert.match(adjudication, /Stage 4 — Preview and apply approved variants/);
  assert.match(adjudication, /unsupported-finding controls/);
  assert.match(adjudication, /`PASS`, `WARN`, or `FAIL`/);
  assert.match(adjudication, /Keeping the baseline is never/);
  assert.match(adjudication, /default is always `DRY_RUN`/);
  assert.match(adjudication, /Aggregate completed runs/);
  assert.match(adjudication, /run-writer-adjudication\.mjs prepare/);
  assert.match(adjudication, /never\s+generates a challenger/);
  assert.match(adjudication, /New runs must use input version `2\.1\.0`/);
  assert.match(adjudication, /only `supported` may be accepted/);
  assert.match(adjudication, /duplicated evidence judgments fail closed/i);
});

test("writer adjudication preserves protected authority", () => {
  assert.match(adjudication, /must not silently reopen or\s+mutate Premise/);
  assert.match(adjudication, /Final aesthetic judgment remains human-only/);
  assert.match(beatGate, /run `\/story-writer-adjudication`/);
  assert.match(storyScene, /Writer adjudication never substitutes/);
});
