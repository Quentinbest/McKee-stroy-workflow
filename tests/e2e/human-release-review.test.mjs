import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const verifier = "scripts/verify-human-release-review.mjs";

test("pending human release review is valid but does not approve release", () => {
  const result = spawnSync("node", [verifier], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const review = JSON.parse(readFileSync("reports/human-release-review.json", "utf8"));
  assert.equal(review.status, "pending");
  assert.equal(review.releaseApproval.stableRelease, false);
});

test("forged approval without reviewer and evidence is rejected", () => {
  const temp = mkdtempSync(join(tmpdir(), "mckee-human-review-"));
  try {
    const path = join(temp, "review.json");
    const review = JSON.parse(readFileSync("reports/human-release-review.json", "utf8"));
    review.status = "approved";
    review.releaseApproval.stableRelease = true;
    writeFileSync(path, `${JSON.stringify(review, null, 2)}\n`);

    const result = spawnSync("node", [verifier, path], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /approved review requires named reviewer/);
    assert.match(result.stderr, /approved criterion lacks evidence/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
