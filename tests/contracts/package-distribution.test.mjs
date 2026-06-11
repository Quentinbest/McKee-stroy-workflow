import assert from "node:assert/strict";
import test from "node:test";
import { buildPackageModels, canonicalSkillIds, frameworkRoot, readPackageDistribution, validatePackageDistribution } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

test("package distribution classifies every canonical skill exactly once", () => {
  const config = readPackageDistribution(root);
  const skills = canonicalSkillIds(root);
  assert.equal(config.skillCatalog.length, skills.length);
  assert.deepEqual(
    [...new Set(config.skillCatalog.map((entry) => entry.id))].sort(),
    skills,
  );
});

test("core and workflow package conflicts are mutual", () => {
  const config = readPackageDistribution(root);
  const core = config.packages.find((entry) => entry.id === "mckee-story-core");
  const workflow = config.packages.find((entry) => entry.id === "mckee-story-workflow");
  assert.deepEqual(core.conflicts, ["mckee-story-workflow"]);
  assert.deepEqual(workflow.conflicts, ["mckee-story-core"]);
});

test("workflow package is self-contained and includes core skills", () => {
  const models = buildPackageModels(root);
  const workflow = models.find((entry) => entry.id === "mckee-story-workflow");
  const core = models.find((entry) => entry.id === "mckee-story-core");
  assert.ok(workflow.skills.length > core.skills.length);
  for (const id of core.skills) assert.equal(workflow.skills.includes(id), true, id);
  assert.equal(workflow.skills.length, 33);
});

test("distribution validation rejects duplicate classified skills", () => {
  const config = readPackageDistribution(root);
  const broken = structuredClone(config);
  broken.skillCatalog.push({ ...broken.skillCatalog[0] });
  const errors = validatePackageDistribution(broken, canonicalSkillIds(root));
  assert.ok(errors.some((error) => error.includes("duplicate skillCatalog id")));
});
