import assert from "node:assert/strict";
import test from "node:test";
import { buildPilotPackageArtifacts, PILOT_SKILL_IDS } from "../../scripts/lib/package-adapters.mjs";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

test("pilot package projections are deterministic", () => {
  const first = buildPilotPackageArtifacts(root);
  const second = buildPilotPackageArtifacts(root);
  assert.deepEqual(first, second);
});

test("Claude core pilot contains only mck-gap-find and no native role adapters", () => {
  const artifact = buildPilotPackageArtifacts(root).find(
    (entry) => entry.host === "claude" && entry.packageId === "mckee-story-core",
  );

  assert.deepEqual(artifact.projectedSkillIds, ["mck-gap-find"]);
  assert.equal(artifact.projectedRoleIds.length, 0);
  assert.ok(artifact.files.some((file) => file.path === "skills/mck-gap-find/SKILL.md"));
  assert.ok(artifact.files.some((file) => file.path === ".claude-plugin/plugin.json"));
  assert.ok(!artifact.files.some((file) => file.path === "skills/mck-setup-payoff/SKILL.md"));
  assert.ok(!artifact.files.some((file) => file.path.startsWith("agents/")));
  const manifest = JSON.parse(artifact.files.find((file) => file.path === "package-manifest.json").content);
  assert.ok(manifest.permissionProfile.every((entry) => entry.enforcementLevel !== "native"));
});

test("workflow pilots contain both pilot skills and native role adapters", () => {
  const artifacts = buildPilotPackageArtifacts(root).filter(
    (entry) => entry.packageId === "mckee-story-workflow" && ["claude", "opencode"].includes(entry.host),
  );

  assert.equal(artifacts.length, 2);
  for (const artifact of artifacts) {
    assert.deepEqual(artifact.projectedSkillIds, PILOT_SKILL_IDS);
    assert.ok(artifact.projectedRoleIds.length > 0);
  }
});

test("OpenCode workflow roles drop Claude-only tools frontmatter", () => {
  const artifact = buildPilotPackageArtifacts(root).find(
    (entry) => entry.host === "opencode" && entry.packageId === "mckee-story-workflow",
  );
  const role = artifact.files.find((file) => file.path === ".opencode/agents/setting-surveyor.md");
  const fragment = artifact.files.find((file) => file.path === "opencode.fragment.json");
  const manifest = JSON.parse(artifact.files.find((file) => file.path === "package-manifest.json").content);

  assert.ok(role);
  assert.ok(fragment);
  assert.match(role.content, /^generated: true$/m);
  assert.doesNotMatch(role.content, /^tools:/m);
  assert.ok(manifest.permissionProfile.some((entry) => entry.enforcementLevel === "native"));
});

test("Codex workflow remains skills-only with no native role adapters", () => {
  const artifact = buildPilotPackageArtifacts(root).find(
    (entry) => entry.host === "codex" && entry.packageId === "mckee-story-workflow",
  );

  assert.equal(artifact.projectedRoleIds.length, 0);
  assert.ok(artifact.files.some((file) => file.path === ".codex-plugin/plugin.json"));
  assert.ok(artifact.files.some((file) => file.path === "skills/mck-gap-find/SKILL.md"));
  assert.ok(!artifact.files.some((file) => file.path.startsWith("agents/")));
});

test("Pi workflow includes role reference cards for fallback", () => {
  const artifact = buildPilotPackageArtifacts(root).find(
    (entry) => entry.host === "pi" && entry.packageId === "mckee-story-workflow",
  );

  assert.ok(artifact.files.some((file) => file.path === "package.json"));
  assert.ok(artifact.files.some((file) => file.path === "references/roles/setting-surveyor.md"));
  const manifest = JSON.parse(artifact.files.find((file) => file.path === "package.json").content);
  assert.ok(manifest.keywords.includes("pi-package"));
  assert.deepEqual(manifest.pi.skills, ["./skills"]);
  assert.equal(manifest.skills, undefined);
});

test("Cursor workflow uses manual fallback skills and rules only", () => {
  const artifact = buildPilotPackageArtifacts(root).find(
    (entry) => entry.host === "cursor" && entry.packageId === "mckee-story-workflow",
  );

  assert.equal(artifact.projectedRoleIds.length, 0);
  assert.ok(artifact.files.some((file) => file.path === ".cursor/skills/mck-gap-find/SKILL.md"));
  assert.ok(artifact.files.some((file) => file.path === ".cursor/rules/mckee-story-workflow.mdc"));
  assert.ok(!artifact.files.some((file) => file.path === ".cursor-plugin/plugin.json"));
});
