import assert from "node:assert/strict";
import { buildPilotPackageArtifacts, PILOT_SKILL_IDS } from "./lib/package-adapters.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const root = frameworkRoot();
const first = buildPilotPackageArtifacts(root);
const second = buildPilotPackageArtifacts(root);

assert.deepEqual(first, second, "pilot package projections must be deterministic");
assert.equal(first.length, 10, "expected ten pilot host projections");

const core = first.find((artifact) => artifact.packageId === "mckee-story-core" && artifact.host === "claude");
const workflow = first.find(
  (artifact) => artifact.packageId === "mckee-story-workflow" && artifact.host === "opencode",
);
const claudeWorkflow = first.find(
  (artifact) => artifact.packageId === "mckee-story-workflow" && artifact.host === "claude",
);
const codexWorkflow = first.find(
  (artifact) => artifact.packageId === "mckee-story-workflow" && artifact.host === "codex",
);
const piWorkflow = first.find(
  (artifact) => artifact.packageId === "mckee-story-workflow" && artifact.host === "pi",
);
const cursorWorkflow = first.find(
  (artifact) => artifact.packageId === "mckee-story-workflow" && artifact.host === "cursor",
);

assert.deepEqual(core?.projectedSkillIds, ["mck-gap-find"]);
assert.deepEqual(workflow?.projectedSkillIds, PILOT_SKILL_IDS);
assert.match(
  workflow.files.find((file) => file.path === ".opencode/agents/setting-surveyor.md")?.content ?? "",
  /^generated: true$/m,
);
assert.doesNotMatch(
  workflow.files.find((file) => file.path === ".opencode/agents/setting-surveyor.md")?.content ?? "",
  /^tools:/m,
);
assert.ok(workflow.files.some((file) => file.path === "opencode.fragment.json"));
const claudeManifest = JSON.parse(
  claudeWorkflow.files.find((file) => file.path === "package-manifest.json").content,
);
assert.ok(
  claudeManifest.permissionProfile.every((entry) => entry.enforcementLevel !== "native"),
  "Claude pilot must not claim unsupported native permission enforcement",
);
assert.equal(codexWorkflow.projectedRoleIds.length, 0);
assert.ok(codexWorkflow.files.some((file) => file.path === ".codex-plugin/plugin.json"));
assert.ok(piWorkflow.files.some((file) => file.path === "package.json"));
assert.ok(piWorkflow.files.some((file) => file.path === "references/roles/setting-surveyor.md"));
assert.equal(cursorWorkflow.projectedRoleIds.length, 0);
assert.ok(cursorWorkflow.files.some((file) => file.path === ".cursor/skills/mck-gap-find/SKILL.md"));
assert.ok(cursorWorkflow.files.some((file) => file.path === ".cursor/rules/mckee-story-workflow.mdc"));

console.log(`Pilot package verification: PASS (${first.length} host projections)`);
