import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const storyNew = fs.readFileSync(new URL("../skills/story-new/SKILL.md", import.meta.url), "utf8");
const premise = fs.readFileSync(new URL("../skills/story-premise/SKILL.md", import.meta.url), "utf8");
const cast = fs.readFileSync(new URL("../skills/story-cast/SKILL.md", import.meta.url), "utf8");
const characterForger = fs.readFileSync(new URL("../agents/character-forger.md", import.meta.url), "utf8");

test("story-new separates exploration from initialization", () => {
  assert.match(storyNew, /Explore vs\. initialize/);
  assert.match(storyNew, /do not create directories/);
  assert.match(storyNew, /Only initialize project artifacts after the writer explicitly asks/);
});

test("premise changes require explicit reopen decision", () => {
  assert.match(premise, /protected creative contract/i);
  assert.match(premise, /must not silently mutate the premise/i);
  assert.match(premise, /Do not edit the locked premise card without that decision/i);
});

test("cast and character forger preserve locked desire authority", () => {
  assert.match(cast, /Locked character desire is protected creative authority/i);
  assert.match(cast, /Reopen desire/);
  assert.match(characterForger, /must not silently change that desire/i);
});
