import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const artifacts = JSON.parse(
  readFileSync("src/artifacts/story-artifacts.json", "utf8"),
).artifacts;
const lifecycle = JSON.parse(
  readFileSync("src/control-plane/story-lifecycle.json", "utf8"),
);

function artifact(id) {
  return artifacts.find((entry) => entry.id === id);
}

test("cast system is the required input to the story spine", () => {
  assert.equal(
    artifact("story-spine").required_input_version,
    "cast-system@1.0.0",
  );
  assert.ok(artifact("cast-system").consumers.includes("story-spine"));
});

test("lifecycle orders cast before spine and act design", () => {
  const castIndex = lifecycle.states.indexOf("cast");
  const spineIndex = lifecycle.states.indexOf("spine");
  const actIndex = lifecycle.states.indexOf("act_design");
  const castCheckpoint = lifecycle.checkpoints.find(
    (checkpoint) => checkpoint.after === "cast",
  );

  assert.ok(castIndex >= 0);
  assert.ok(castIndex < spineIndex);
  assert.ok(spineIndex < actIndex);
  assert.deepEqual(castCheckpoint, {
    after: "cast",
    requiredArtifact: "cast-system@1.0.0",
    humanApproval: true,
  });
});

test("canonical skill and role guidance agrees with the artifact chain", () => {
  const storyCast = readFileSync("src/skills/story-cast/SKILL.md", "utf8");
  const storySpine = readFileSync("src/skills/story-spine/SKILL.md", "utf8");
  const castBalancer = readFileSync("src/roles/cast-balancer.md", "utf8");
  const structureSkeleton = readFileSync("src/roles/structure-skeleton.md", "utf8");

  assert.match(storyCast, /before story-spine turns the pressure system/);
  assert.doesNotMatch(storyCast, /Use after spine is locked and before scene-level work/);
  assert.match(storySpine, /after the cast pressure system is locked/);
  assert.match(castBalancer, /before structure-skeleton builds the spine/);
  assert.match(structureSkeleton, /cast pressure system are locked/);
});
