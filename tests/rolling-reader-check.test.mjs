import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const storyScene = fs.readFileSync(new URL("../skills/story-scene/SKILL.md", import.meta.url), "utf8");
const storyRevise = fs.readFileSync(new URL("../skills/story-revise/SKILL.md", import.meta.url), "utf8");
const reader = fs.readFileSync(new URL("../agents/reader-simulator.md", import.meta.url), "utf8");
const pacing = fs.readFileSync(new URL("../agents/pacing-analyst.md", import.meta.url), "utf8");

test("story-scene defines rolling review cadence and advisory-only outputs", () => {
  assert.match(storyScene, /Rolling blind read trigger/);
  assert.match(storyScene, /After every 2-3 newly committed Scenes/);
  assert.match(storyScene, /must not automatically rewrite accepted prose/i);
});

test("reader simulator supports FULL and WINDOW modes with blind boundaries", () => {
  assert.match(reader, /Invoke in FULL mode/);
  assert.match(reader, /WINDOW mode/);
  assert.match(reader, /Do not read `spine\.md`, `characters\/`, `world-bible\.md`/);
  assert.match(reader, /drafts\/\{slug\}\/audit\/rolling\/\{through-scene\}-reader\.md/);
});

test("pacing analyst supports FULL and WINDOW output separation", () => {
  assert.match(pacing, /Invoke in FULL mode/);
  assert.match(pacing, /WINDOW mode/);
  assert.match(pacing, /drafts\/\{slug\}\/audit\/rolling\/\{through-scene\}-pacing\.md/);
});

test("story-revise keeps rolling evidence secondary to final pass 7", () => {
  assert.match(storyRevise, /Review any existing rolling WINDOW reports/);
  assert.match(storyRevise, /never substitute for the final full-draft Pass 7 read/i);
});
