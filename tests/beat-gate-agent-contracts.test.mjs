import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const blindCritic = fs.readFileSync(new URL("../agents/blind-beat-critic.md", import.meta.url), "utf8");
const diversity = fs.readFileSync(new URL("../agents/diversity-challenger.md", import.meta.url), "utf8");
const skill = fs.readFileSync(new URL("../skills/story-beat-gate/SKILL.md", import.meta.url), "utf8");

test("blind critic excludes drafter context and does not rewrite prose", () => {
  assert.match(blindCritic, /must not read[\s\S]*drafter reasoning/i);
  assert.match(blindCritic, /Do not rewrite the Beat/i);
  assert.match(blindCritic, /drafts\/\{slug\}\/audit\/beat-gate\/\{act\}-\{scene\}-\{beat\}-critic\.md/);
});

test("diversity challenger preserves protected creative authority", () => {
  assert.match(diversity, /must not change[\s\S]*Premise/i);
  assert.match(diversity, /Scene Gap/i);
  assert.match(diversity, /Do not output near-synonymous rewrites/i);
});

test("skill fallback brief preserves agent exclusions", () => {
  assert.match(skill, /drafter reasoning/);
  assert.match(skill, /prior verdicts/);
  assert.match(skill, /It must not mutate Premise, desire, Scene Gap, or Value Shift/i);
});
