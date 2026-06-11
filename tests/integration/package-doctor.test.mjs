import assert from "node:assert/strict";
import test from "node:test";
import { buildPackageDoctorReport } from "../../scripts/lib/package-doctor.mjs";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

test("doctor passes every single-package scope", () => {
  const report = buildPackageDoctorReport(root);
  const passingSingles = report.scopes.filter(
    (scope) => scope.status === "pass" && scope.selectedPackages.length === 1,
  );

  assert.equal(passingSingles.length, 15);
});

test("doctor fails core and workflow coexistence with recovery guidance", () => {
  const report = buildPackageDoctorReport(root);
  const conflicts = report.scopes.filter((scope) => scope.scope.endsWith("core+workflow"));

  assert.equal(conflicts.length, 5);
  for (const conflict of conflicts) {
    assert.equal(conflict.status, "fail");
    assert.ok(conflict.issues.some((issue) => issue.code === "edition_conflict"));
    assert.ok(conflict.issues.every((issue) => issue.recovery.length > 0));
  }
});

test("doctor requires OpenCode permission fragment in single-package scopes", () => {
  const report = buildPackageDoctorReport(root);
  const opencodeScopes = report.scopes.filter(
    (scope) => scope.host === "opencode" && scope.selectedPackages.length === 1,
  );

  assert.ok(opencodeScopes.every((scope) => scope.status === "pass"));
});

test("doctor requires Codex and Pi host manifests in single-package scopes", () => {
  const report = buildPackageDoctorReport(root);
  const codexScopes = report.scopes.filter(
    (scope) => scope.host === "codex" && scope.selectedPackages.length === 1,
  );
  const piScopes = report.scopes.filter(
    (scope) => scope.host === "pi" && scope.selectedPackages.length === 1,
  );

  assert.ok(codexScopes.every((scope) => scope.status === "pass"));
  assert.ok(piScopes.every((scope) => scope.status === "pass"));
});

test("doctor requires Cursor fallback rule and skill files", () => {
  const report = buildPackageDoctorReport(root);
  const cursorScopes = report.scopes.filter(
    (scope) => scope.host === "cursor" && scope.selectedPackages.length === 1,
  );

  assert.ok(cursorScopes.every((scope) => scope.status === "pass"));
});
