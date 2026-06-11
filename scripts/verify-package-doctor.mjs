import assert from "node:assert/strict";
import { buildPackageDoctorReport } from "./lib/package-doctor.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const root = frameworkRoot();
const report = buildPackageDoctorReport(root);

const passingSingles = report.scopes.filter(
  (scope) =>
    scope.status === "pass" &&
    scope.selectedPackages.length === 1 &&
    ["claude", "opencode", "codex", "pi", "cursor"].includes(scope.host),
);
const failingConflicts = report.scopes.filter((scope) => scope.scope.endsWith("core+workflow"));

assert.equal(passingSingles.length, 15, "expected fifteen passing single-package scopes");
assert.equal(failingConflicts.length, 5, "expected five failing conflict scopes");
assert.ok(
  failingConflicts.every(
    (scope) =>
      scope.status === "fail" &&
      scope.issues.some(
        (issue) =>
          issue.code === "edition_conflict" &&
          Array.isArray(issue.recovery) &&
          issue.recovery.length > 0,
      ),
  ),
  "conflict scopes must provide recovery steps",
);

console.log(`Package doctor verification: PASS (${report.scopes.length} evaluated scopes)`);
