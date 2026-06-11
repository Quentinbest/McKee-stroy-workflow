import assert from "node:assert/strict";
import { writePackageInstallSmokeReport } from "./lib/package-install-smoke.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const report = writePackageInstallSmokeReport(frameworkRoot());

assert.equal(report.results.length, 15, "expected fifteen package installation smoke results");
assert.ok(report.results.every((result) => result.install === "pass"));
assert.ok(report.results.every((result) => result.discovery === "pass"));
assert.ok(report.results.every((result) => result.uninstall === "pass"));
assert.equal(report.userConfigurationMutation, false);
assert.equal(report.network, "not-used");

console.log(`Package install smoke: PASS (${report.results.length} isolated projections)`);

