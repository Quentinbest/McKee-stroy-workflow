import assert from "node:assert/strict";
import test from "node:test";
import {
  runPackageInstallSmoke,
  smokeArtifactInstall,
} from "../../scripts/lib/package-install-smoke.mjs";
import { buildRcArtifacts } from "../../scripts/lib/release-artifacts.mjs";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

test("all package projections install, discover, and uninstall in isolated sandboxes", () => {
  const results = runPackageInstallSmoke(root);
  assert.equal(results.length, 15);
  assert.ok(results.every((result) => result.install === "pass"));
  assert.ok(results.every((result) => result.discovery === "pass"));
  assert.ok(results.every((result) => result.uninstall === "pass"));
});

test("offline installation smoke results are deterministic", () => {
  assert.deepEqual(runPackageInstallSmoke(root), runPackageInstallSmoke(root));
});

test("installation rejects package paths that escape the sandbox", () => {
  const artifact = structuredClone(buildRcArtifacts(root)[0]);
  artifact.files.push({
    path: "../escape.txt",
    content: "escape\n",
    sourcePath: "synthetic",
    sha256: "synthetic",
  });

  assert.throws(() => smokeArtifactInstall(artifact), /unsafe package path/);
});

