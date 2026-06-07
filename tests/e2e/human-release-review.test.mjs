import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const verifier = "scripts/verify-human-release-review.mjs";

test("authorized human release review approves stable release", () => {
  const result = spawnSync("node", [verifier], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const review = JSON.parse(readFileSync("reports/human-release-review.json", "utf8"));
  assert.equal(review.status, "approved");
  assert.equal(review.releaseApproval.stableRelease, true);
  assert.equal(review.releaseApproval.externalPublication, false);
  assert.ok(review.reviewer.name);
  assert.ok(review.reviewer.role);
  assert.ok(review.reviewer.reviewedAt);
});

test("forged approval without reviewer and evidence is rejected", () => {
  const temp = mkdtempSync(join(tmpdir(), "mckee-human-review-"));
  try {
    const path = join(temp, "review.json");
    const review = JSON.parse(readFileSync("reports/human-release-review.json", "utf8"));
    review.reviewer = null;
    for (const sectionName of ["literaryReview", "operationalReview"]) {
      review[sectionName].status = "approved";
      review[sectionName].criteria = review[sectionName].criteria.map((criterion) => ({
        ...criterion,
        score: 3,
        evidence: null,
      }));
    }
    writeFileSync(path, `${JSON.stringify(review, null, 2)}\n`);

    const result = spawnSync("node", [verifier, path], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /approved review requires named reviewer/);
    assert.match(result.stderr, /approved criterion lacks evidence/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
