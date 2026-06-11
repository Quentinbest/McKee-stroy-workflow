import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lifecycle = JSON.parse(fs.readFileSync(new URL("../templates/lifecycle.json", import.meta.url), "utf8"));
const storyStatus = fs.readFileSync(new URL("../skills/story-status/SKILL.md", import.meta.url), "utf8");
const storyScene = fs.readFileSync(new URL("../skills/story-scene/SKILL.md", import.meta.url), "utf8");

test("lifecycle template declares beat gate artifact paths and version field", () => {
  assert.equal(lifecycle.workflow_versions.beat_gate, null);
  assert.equal(lifecycle.artifacts.beat_gate_policy, "drafts/{{slug}}/beat-gate-policy.json");
  assert.equal(lifecycle.artifacts.beat_gate_audit_dir, "drafts/{{slug}}/audit/beat-gate/");
  assert.equal(lifecycle.artifacts.rolling_audit_dir, "drafts/{{slug}}/audit/rolling/");
});

test("story-status reports beat gate execution state", () => {
  assert.match(storyStatus, /workflow_versions\.beat_gate/);
  assert.match(storyStatus, /Beat Gate:\s+\{current \| stale \| unverified \| absent\}/);
  assert.match(storyStatus, /Pending Gate:/);
  assert.match(storyStatus, /Beat Gate version status/);
});

test("story-scene documents artifact-based resume and ledger updates", () => {
  assert.match(storyScene, /drafts\/\{slug\}\/audit\/beat-gate\/\{act\}-\{scene\}\.json/);
  assert.match(storyScene, /resume from the first incomplete stage/i);
  assert.match(storyScene, /Persist the final writer decision for each Beat/);
});
