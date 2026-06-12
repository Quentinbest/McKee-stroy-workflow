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

test("writer adjudication separates blind preference from revealed finding", () => {
  assert.match(adjudication, /Do not collapse these questions into one prompt/);
  assert.match(adjudication, /Stage 1 — Create and blind-review/);
  assert.match(adjudication, /Stage 2 — Reveal and adjudicate the finding/);
  assert.match(adjudication, /Stage 3 — Score without auto-applying/);
  assert.match(adjudication, /Stage 4 — Preview and apply approved variants/);
  assert.match(adjudication, /default is always `DRY_RUN`/);
  assert.match(adjudication, /Aggregate completed runs/);
});

test("writer adjudication preserves protected authority", () => {
  assert.match(adjudication, /must not silently reopen or\s+mutate Premise/);
  assert.match(adjudication, /Final aesthetic judgment remains human-only/);
  assert.match(beatGate, /run `\/story-writer-adjudication`/);
  assert.match(storyScene, /Writer adjudication never substitutes/);
});
