import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const storyScene = fs.readFileSync(new URL("../skills/story-scene/SKILL.md", import.meta.url), "utf8");
const stopLoss = fs.readFileSync(new URL("../skills/story-stop-loss/SKILL.md", import.meta.url), "utf8");
const proseDrafter = fs.readFileSync(new URL("../agents/prose-drafter.md", import.meta.url), "utf8");

test("story-scene routes candidate beats through Beat Gate", () => {
  assert.match(storyScene, /Draft Candidate Beats, then run Beat Gate/);
  assert.match(storyScene, /Invoke `\/story-beat-gate`/);
  assert.match(storyScene, /one consolidated result/i);
});

test("story-scene preserves batch deferral and resume semantics", () => {
  assert.match(storyScene, /deferred_to_batch_boundary/);
  assert.match(storyScene, /resume from the first incomplete stage/i);
  assert.match(storyScene, /protected-field conflict/i);
});

test("scene flow keeps full-scene critics after Beat Gate", () => {
  assert.match(storyScene, /Run Full-Scene Critic Audits/);
  assert.match(storyScene, /Beat Gate does \*\*not\*\* replace this step/);
  assert.match(stopLoss, /Round 2 on the same unresolved Beat predicate requires a diversity challenge/);
});

test("prose-drafter moves authoring annotations out of reader-facing prose", () => {
  assert.match(proseDrafter, /Do not place beat-progress markers or review notes inline/);
  assert.match(proseDrafter, /<!-- AUTHORING \(stripped at publish\) -->/);
});
