import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCodexMarketplaceManifest,
  buildRcArtifacts,
} from "../../scripts/lib/release-artifacts.mjs";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

test("RC artifacts include install metadata files", () => {
  const artifacts = buildRcArtifacts(root);
  assert.equal(artifacts.length, 15);

  for (const artifact of artifacts) {
    for (const required of ["package-manifest.json", "checksums.txt", "provenance.json", "README.md"]) {
      assert.ok(artifact.files.some((file) => file.path === required));
    }
    const provenance = JSON.parse(
      artifact.files.find((file) => file.path === "provenance.json").content,
    );
    const expectedLicense =
      provenance.licenseStatus === "included" ? "LICENSE" : "LICENSE-REVIEW-REQUIRED.txt";
    assert.ok(artifact.files.some((file) => file.path === expectedLicense));
  }
});

test("RC checksums cover all distributed files except the checksum file itself", () => {
  const artifacts = buildRcArtifacts(root);

  for (const artifact of artifacts) {
    const checksums = artifact.files.find((file) => file.path === "checksums.txt").content;
    const listedPaths = checksums
      .trim()
      .split("\n")
      .map((line) => line.split("  ").slice(1).join("  "));

    for (const file of artifact.files) {
      if (file.path === "checksums.txt") continue;
      assert.ok(listedPaths.includes(file.path), `${artifact.packageId} missing checksum for ${file.path}`);
    }
  }
});

test("RC provenance records Git and license state", () => {
  const artifacts = buildRcArtifacts(root);

  for (const artifact of artifacts) {
    const provenance = JSON.parse(
      artifact.files.find((file) => file.path === "provenance.json").content,
    );
    assert.match(provenance.sourceCommit, /^[0-9a-f]{40}$/);
    assert.ok(["included", "review-required"].includes(provenance.licenseStatus));
    if (provenance.licenseStatus === "review-required") {
      assert.ok(!artifact.files.some((file) => file.path === "LICENSE"));
    }
  }
});

test("Codex RCs form a local marketplace with relative in-root plugin sources", () => {
  const artifacts = buildRcArtifacts(root);
  const marketplace = buildCodexMarketplaceManifest(artifacts);

  assert.equal(marketplace.name, "mckee-story-workflow-local");
  assert.equal(marketplace.plugins.length, 3);
  for (const plugin of marketplace.plugins) {
    assert.equal(plugin.source.source, "local");
    assert.equal(plugin.source.path, `./plugins/${plugin.name}`);
    assert.equal(plugin.policy.installation, "AVAILABLE");
    assert.equal(plugin.policy.authentication, "ON_INSTALL");
  }
});
