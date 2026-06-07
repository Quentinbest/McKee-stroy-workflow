import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const report = JSON.parse(readFileSync("reports/conformance-pilots.json", "utf8"));
const nativeReport = JSON.parse(
  readFileSync("reports/native-conformance-pilots.json", "utf8"),
);

test("all five harnesses pass all repository-level pilots", () => {
  assert.deepEqual(Object.keys(report.harnesses).sort(), [
    "claude",
    "codex",
    "cursor",
    "opencode",
    "pi",
  ]);
  for (const result of Object.values(report.harnesses)) {
    assert.equal(
      Object.values(result.pilots).every((pilot) => pilot.status === "pass"),
      true,
    );
    assert.equal(result.measures.acceptancePassRate, 1);
    assert.equal(result.measures.falseCompletionRate, 0);
    assert.equal(result.measures.safetyIncidents, 0);
  }
});

test("native execution limitations are explicit rather than hidden", () => {
  assert.ok(report.capabilityExceptions.length >= 1);
  assert.equal(report.humanEvaluation.status, "approved");
});

test("native pilots preserve passed runs and unresolved gates", () => {
  assert.equal(nativeReport.status, "passed");
  assert.equal(nativeReport.summary.nativeHarnessPassCount, 3);
  assert.equal(nativeReport.summary.threeHarnessStoryLifecycleGate, "passed");
  assert.equal(nativeReport.summary.singleAgentBaselineGate, "passed");
  assert.equal(
    nativeReport.summary.fiveHarnessPilotGate,
    "passed-with-approved-capability-exceptions",
  );
  assert.equal(nativeReport.harnesses.cursor.status, "approved-capability-exception");
  assert.equal(nativeReport.harnesses.claude.status, "approved-capability-exception");
  for (const harness of ["pi", "opencode", "codex"]) {
    assert.equal(nativeReport.harnesses[harness].externalVerification, "pass");
  }
});
