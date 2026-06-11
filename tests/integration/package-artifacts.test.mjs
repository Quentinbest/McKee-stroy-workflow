import assert from "node:assert/strict";
import test from "node:test";
import { buildPackageArtifacts } from "../../scripts/lib/package-adapters.mjs";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

test("full package projections cover three editions and five hosts", () => {
  const artifacts = buildPackageArtifacts(root);

  assert.equal(artifacts.length, 15);
  assert.deepEqual(
    [...new Set(artifacts.map((artifact) => artifact.edition))].sort(),
    ["core", "wiki-maintainer", "workflow"],
  );
  assert.deepEqual(
    [...new Set(artifacts.map((artifact) => artifact.host))].sort(),
    ["claude", "codex", "cursor", "opencode", "pi"],
  );
});

test("full package Skill counts match edition classification", () => {
  const expected = {
    core: 20,
    workflow: 33,
    "wiki-maintainer": 1,
  };

  for (const artifact of buildPackageArtifacts(root)) {
    assert.equal(artifact.projectedSkillIds.length, expected[artifact.edition]);
  }
});

test("workflow excludes Wiki-maintenance authority", () => {
  const artifacts = buildPackageArtifacts(root).filter(
    (artifact) => artifact.edition === "workflow",
  );

  for (const artifact of artifacts) {
    assert.ok(!artifact.projectedSkillIds.includes("wiki-librarian"));
    assert.ok(!artifact.projectedRoleIds.includes("wiki-librarian"));
    assert.ok(!artifact.files.some((file) => file.path.includes("wiki-librarian")));
  }
});

test("wiki-maintainer is isolated to the Wiki Librarian capability", () => {
  const artifacts = buildPackageArtifacts(root).filter(
    (artifact) => artifact.edition === "wiki-maintainer",
  );

  for (const artifact of artifacts) {
    assert.deepEqual(artifact.projectedSkillIds, ["wiki-librarian"]);
    assert.ok(
      artifact.projectedRoleIds.length === 0 ||
        JSON.stringify(artifact.projectedRoleIds) === JSON.stringify(["wiki-librarian"]),
    );
    assert.ok(
      artifact.files
        .filter((file) => /SKILL\.md$/.test(file.path))
        .every((file) => file.path.includes("wiki-librarian")),
    );
  }
});

test("full projections remain deterministic", () => {
  assert.deepEqual(buildPackageArtifacts(root), buildPackageArtifacts(root));
});
