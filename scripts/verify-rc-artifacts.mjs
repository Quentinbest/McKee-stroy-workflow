import assert from "node:assert/strict";
import { buildRcArtifacts } from "./lib/release-artifacts.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const artifacts = buildRcArtifacts(frameworkRoot());

assert.equal(artifacts.length, 15, "expected fifteen RC artifacts");

for (const artifact of artifacts) {
  const checksumFile = artifact.files.find((file) => file.path === "checksums.txt");
  const listedPaths = checksumFile.content
    .trim()
    .split("\n")
    .map((line) => line.split("  ").slice(1).join("  "));

  for (const required of ["package-manifest.json", "README.md", "provenance.json"]) {
    assert.ok(artifact.files.some((file) => file.path === required), `${artifact.packageId} missing ${required}`);
  }
  const provenance = JSON.parse(
    artifact.files.find((file) => file.path === "provenance.json").content,
  );
  const licensePath =
    provenance.licenseStatus === "included" ? "LICENSE" : "LICENSE-REVIEW-REQUIRED.txt";
  assert.ok(
    artifact.files.some((file) => file.path === licensePath),
    `${artifact.packageId} missing ${licensePath}`,
  );

  const covered = artifact.files
    .filter((file) => file.path !== "checksums.txt")
    .every((file) => listedPaths.includes(file.path));
  assert.ok(covered, `${artifact.packageId} checksums must cover every distributed file`);
}

console.log(`RC artifact verification: PASS (${artifacts.length} installable directories)`);
