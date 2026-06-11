import assert from "node:assert/strict";
import { buildPackageArtifacts } from "./lib/package-adapters.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const root = frameworkRoot();
const first = buildPackageArtifacts(root);
const second = buildPackageArtifacts(root);

assert.deepEqual(first, second, "full package projections must be deterministic");
assert.equal(first.length, 15, "expected fifteen full host projections");

for (const artifact of first) {
  const expectedSkillCount =
    artifact.edition === "core" ? 20 : artifact.edition === "workflow" ? 33 : 1;
  assert.equal(
    artifact.projectedSkillIds.length,
    expectedSkillCount,
    `${artifact.host}:${artifact.packageId} skill count mismatch`,
  );
}

for (const artifact of first.filter((entry) => entry.edition === "workflow")) {
  assert.ok(!artifact.projectedRoleIds.includes("wiki-librarian"));
  assert.ok(!artifact.files.some((file) => /(?:agents|roles)\/wiki-librarian\.md$/.test(file.path)));
}

for (const artifact of first.filter((entry) => entry.edition === "wiki-maintainer")) {
  assert.deepEqual(artifact.projectedSkillIds, ["wiki-librarian"]);
  assert.ok(
    artifact.projectedRoleIds.length === 0 ||
      JSON.stringify(artifact.projectedRoleIds) === JSON.stringify(["wiki-librarian"]),
  );
}

console.log(`Package artifact verification: PASS (${first.length} host projections)`);
