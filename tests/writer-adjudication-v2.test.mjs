import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  applyAdjudicationRun,
  createAdjudicationRun,
  revealAdjudicationRun,
  revealRolesAdjudicationRun,
  scoreAdjudicationRun,
} from "../scripts/run-writer-adjudication.mjs";

const fixturePath = new URL(
  "./fixtures/writer-adjudication/v2-calibration.json",
  import.meta.url,
);
const fixtureFilePath = fileURLToPath(fixturePath);
const runnerPath = fileURLToPath(
  new URL("../scripts/run-writer-adjudication.mjs", import.meta.url),
);

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runCli(args) {
  const result = spawnSync(process.execPath, [runnerPath, ...args], {
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    0,
    `CLI failed:\n${result.stdout}\n${result.stderr}`,
  );
  return result.stdout;
}

function completeStageOne(outputDir, { weakChallengerWins = false } = {}) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");
  const stageOne = readJson(stageOnePath);
  stageOne.status = "COMPLETE";
  stageOne.reviewer = {
    id: "test-writer",
    started_at: "2026-06-13T04:00:00Z",
    completed_at: "2026-06-13T04:10:00Z",
  };
  for (const decision of stageOne.comparisons) {
    const comparison = manifestById.get(decision.comparison_id);
    const controlType = comparison.calibration.control_type;
    const preferredRole =
      controlType === "weak_challenger" && !weakChallengerWins
        ? "baseline"
        : "challenger";
    decision.preferred_variant = Object.entries(
      comparison.variant_roles,
    ).find(([, role]) => role === preferredRole)[0];
    decision.confidence = 4;
    decision.meaningful_difference =
      controlType === "unsupported_finding" ? "no" : "yes";
    decision.reasons = ["bounded test decision"];
  }
  writeJson(stageOnePath, stageOne);
  return stageOnePath;
}

function completeStageTwoA(
  outputDir,
  { acceptUnsupported = false, reconcile = true } = {},
) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const stageTwoAPath = path.join(outputDir, "stage-2a-decisions.json");
  const stageTwoA = readJson(stageTwoAPath);
  stageTwoA.status = "COMPLETE";
  stageTwoA.reviewer = {
    id: "test-writer",
    started_at: "2026-06-13T04:10:00Z",
    completed_at: "2026-06-13T04:16:00Z",
  };
  for (const decision of stageTwoA.comparisons) {
    const comparison = manifestById.get(decision.comparison_id);
    const unsupported =
      comparison.calibration.control_type === "unsupported_finding";
    decision.finding_disposition =
      unsupported && !acceptUnsupported ? "reject" : "accept";
    decision.rationale = unsupported
      ? "The evidence already states that the door closed."
      : "The finding identifies a bounded prose issue.";
    decision.blind_difference_reconciliation =
      unsupported && acceptUnsupported && reconcile
        ? "The variants were similar, but the underlying diagnostic claim still needs separate review."
        : "";
  }
  writeJson(stageTwoAPath, stageTwoA);
  return stageTwoAPath;
}

function completeStageTwoB(outputDir) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const stageTwoBPath = path.join(outputDir, "stage-2b-decisions.json");
  const stageTwoB = readJson(stageTwoBPath);
  stageTwoB.status = "COMPLETE";
  stageTwoB.reviewer = {
    id: "test-writer",
    started_at: "2026-06-13T04:16:00Z",
    completed_at: "2026-06-13T04:20:00Z",
  };
  for (const decision of stageTwoB.comparisons) {
    const comparison = manifestById.get(decision.comparison_id);
    decision.variant_disposition =
      comparison.calibration.control_type === "weak_challenger"
        ? "keep_baseline"
        : "adopt_challenger";
    decision.rationale = "Final source-aware disposition.";
  }
  stageTwoB.batch_effect = {
    cross_scene_repetition: "unchanged",
    notes: "",
  };
  writeJson(stageTwoBPath, stageTwoB);
  return stageTwoBPath;
}

test("V2 keeps roles hidden through blind finding adjudication", () => {
  const outputDir = tempDir("writer-adjudication-v2-blind-");

  try {
    const metadata = createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "protocol-v2",
    });
    assert.equal(metadata.protocol_version, "2.0.0");
    const stageOnePath = completeStageOne(outputDir);
    const result = revealAdjudicationRun({ outputDir, stageOnePath });

    assert.equal(result.status, "AWAITING_BLIND_FINDING_ADJUDICATION");
    assert.equal(
      fs.existsSync(path.join(outputDir, "stage-2a-decisions.json")),
      true,
    );
    assert.match(
      readJson(
        path.join(outputDir, "stage-2a-decisions.json"),
      ).finding_package_sha256,
      /^[a-f0-9]{64}$/,
    );
    assert.equal(
      fs.existsSync(path.join(outputDir, "role-reveal-package.md")),
      false,
    );
    const findingPackage = fs.readFileSync(
      path.join(outputDir, "finding-package.md"),
      "utf8",
    );
    assert.doesNotMatch(
      findingPackage,
      /\bbaseline\b|\bchallenger\b|weak_challenger|unsupported_finding/i,
    );
    assert.doesNotMatch(findingPackage, /Source reference:/);
    assert.throws(
      () =>
        revealRolesAdjudicationRun({
          outputDir,
          stageOnePath,
          stageTwoAPath: path.join(outputDir, "stage-2a-decisions.json"),
        }),
      /Stage 2A status must be COMPLETE/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("V2 rejects role-leaking findings and missing control classes", () => {
  const rootDir = tempDir("writer-adjudication-v2-invalid-");
  const outputDir = path.join(rootDir, "output");
  const inputPath = path.join(rootDir, "input.json");

  try {
    const roleLeak = readJson(fixturePath);
    roleLeak.comparisons[0].finding.evidence =
      "The baseline is insufficiently specific.";
    writeJson(inputPath, roleLeak);
    assert.throws(
      () =>
        createAdjudicationRun({
          inputPath,
          outputDir,
          seed: "protocol-v2-invalid",
        }),
      /must not leak source roles or calibration controls/,
    );

    const controlLeak = readJson(fixturePath);
    controlLeak.comparisons[0].context =
      "This is an unsupported_finding control.";
    writeJson(inputPath, controlLeak);
    assert.throws(
      () =>
        createAdjudicationRun({
          inputPath,
          outputDir,
          seed: "protocol-v2-invalid",
        }),
      /must not leak source roles or calibration controls/,
    );

    const missingControl = readJson(fixturePath);
    const unsupported = missingControl.comparisons.find(
      (comparison) =>
        comparison.calibration.control_type === "unsupported_finding",
    );
    unsupported.calibration.control_type = "none";
    writeJson(inputPath, missingControl);
    assert.throws(
      () =>
        createAdjudicationRun({
          inputPath,
          outputDir,
          seed: "protocol-v2-invalid",
        }),
      /at least 1 unsupported finding controls/,
    );
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test("V2 requires reconciliation before accepting a finding after no meaningful difference", () => {
  const outputDir = tempDir("writer-adjudication-v2-reconcile-");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "protocol-v2",
    });
    const stageOnePath = completeStageOne(outputDir);
    revealAdjudicationRun({ outputDir, stageOnePath });
    const stageTwoAPath = completeStageTwoA(outputDir, {
      acceptUnsupported: true,
      reconcile: false,
    });

    assert.throws(
      () =>
        revealRolesAdjudicationRun({
          outputDir,
          stageOnePath,
          stageTwoAPath,
        }),
      /blind_difference_reconciliation must explain/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("V2 rejects tampered finding and role-reveal packages", () => {
  const findingDir = tempDir("writer-adjudication-v2-finding-tamper-");
  const roleDir = tempDir("writer-adjudication-v2-role-tamper-");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: findingDir,
      seed: "protocol-v2-finding-tamper",
    });
    const findingStageOne = completeStageOne(findingDir);
    revealAdjudicationRun({
      outputDir: findingDir,
      stageOnePath: findingStageOne,
    });
    const findingStageTwoA = completeStageTwoA(findingDir);
    fs.appendFileSync(
      path.join(findingDir, "finding-package.md"),
      "\nchanged\n",
    );
    assert.throws(
      () =>
        revealRolesAdjudicationRun({
          outputDir: findingDir,
          stageOnePath: findingStageOne,
          stageTwoAPath: findingStageTwoA,
        }),
      /finding-package\.md no longer matches/,
    );

    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: roleDir,
      seed: "protocol-v2-role-tamper",
    });
    const roleStageOne = completeStageOne(roleDir);
    revealAdjudicationRun({
      outputDir: roleDir,
      stageOnePath: roleStageOne,
    });
    const roleStageTwoA = completeStageTwoA(roleDir);
    revealRolesAdjudicationRun({
      outputDir: roleDir,
      stageOnePath: roleStageOne,
      stageTwoAPath: roleStageTwoA,
    });
    const roleStageTwoB = completeStageTwoB(roleDir);
    fs.appendFileSync(
      path.join(roleDir, "role-reveal-package.md"),
      "\nchanged\n",
    );
    assert.throws(
      () =>
        scoreAdjudicationRun({
          outputDir: roleDir,
          stageOnePath: roleStageOne,
          stageTwoAPath: roleStageTwoA,
          stageTwoBPath: roleStageTwoB,
        }),
      /role-reveal-package\.md no longer matches/,
    );
  } finally {
    fs.rmSync(findingDir, { recursive: true, force: true });
    fs.rmSync(roleDir, { recursive: true, force: true });
  }
});

test("V2 scores clean controls as PASS and keeps baseline distinct from adoption", () => {
  const outputDir = tempDir("writer-adjudication-v2-pass-");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "protocol-v2",
    });
    const stageOnePath = completeStageOne(outputDir);
    revealAdjudicationRun({ outputDir, stageOnePath });
    const stageTwoAPath = completeStageTwoA(outputDir);
    const reveal = revealRolesAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoAPath,
    });
    assert.equal(reveal.status, "AWAITING_ROLE_REVEAL_DECISION");
    const rolePackage = fs.readFileSync(
      path.join(outputDir, "role-reveal-package.md"),
      "utf8",
    );
    assert.match(rolePackage, /Baseline variant:/);
    assert.doesNotMatch(
      rolePackage,
      /weak_challenger|unsupported_finding/i,
    );
    assert.match(
      readJson(
        path.join(outputDir, "stage-2b-decisions.json"),
      ).role_reveal_package_sha256,
      /^[a-f0-9]{64}$/,
    );

    const stageTwoBPath = completeStageTwoB(outputDir);
    const report = scoreAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoAPath,
      stageTwoBPath,
    });

    assert.equal(report.calibration.status, "PASS");
    assert.equal(report.calibration.gate_passed, true);
    assert.equal(report.calibration.weak_challenger_resistance_rate_percent, 100);
    assert.equal(report.calibration.unsupported_findings_accepted, 0);
    assert.equal(report.calibration.weak_challenger_variants_adopted, 0);
    assert.equal(
      report.metrics.findings_accepted_without_meaningful_blind_difference,
      0,
    );
    assert.equal(report.metrics.challenger_variants_adopted, 3);
    assert.equal(report.metrics.baselines_kept, 1);
    assert.equal(report.metrics.preferred_variants_adopted, 3);
    assert.equal(
      report.comparisons.some(
        (comparison) =>
          comparison.variant_disposition === "keep_baseline" &&
          comparison.adopt_preferred_variant === "yes",
      ),
      false,
    );
    const application = applyAdjudicationRun({
      outputDir,
      inputPath: fixturePath,
      rootDir: outputDir,
      write: false,
    });
    assert.equal(application.operations.length, 3);
    assert.equal(
      application.operations.some(
        (operation) =>
          operation.source_id === "v2-weak-challenger",
      ),
      false,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("V2 reports WARN for weak-control preference and FAIL for unsupported acceptance", () => {
  const warnDir = tempDir("writer-adjudication-v2-warn-");
  const failDir = tempDir("writer-adjudication-v2-fail-");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: warnDir,
      seed: "protocol-v2-warn",
    });
    const warnStageOne = completeStageOne(warnDir, {
      weakChallengerWins: true,
    });
    revealAdjudicationRun({
      outputDir: warnDir,
      stageOnePath: warnStageOne,
    });
    const warnStageTwoA = completeStageTwoA(warnDir);
    revealRolesAdjudicationRun({
      outputDir: warnDir,
      stageOnePath: warnStageOne,
      stageTwoAPath: warnStageTwoA,
    });
    const warnStageTwoB = completeStageTwoB(warnDir);
    const warnReport = scoreAdjudicationRun({
      outputDir: warnDir,
      stageOnePath: warnStageOne,
      stageTwoAPath: warnStageTwoA,
      stageTwoBPath: warnStageTwoB,
    });
    assert.equal(warnReport.calibration.status, "WARN");
    assert.equal(warnReport.calibration.gate_passed, false);

    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: failDir,
      seed: "protocol-v2-fail",
    });
    const failStageOne = completeStageOne(failDir);
    revealAdjudicationRun({
      outputDir: failDir,
      stageOnePath: failStageOne,
    });
    const failStageTwoA = completeStageTwoA(failDir, {
      acceptUnsupported: true,
    });
    revealRolesAdjudicationRun({
      outputDir: failDir,
      stageOnePath: failStageOne,
      stageTwoAPath: failStageTwoA,
    });
    const failStageTwoB = completeStageTwoB(failDir);
    const failReport = scoreAdjudicationRun({
      outputDir: failDir,
      stageOnePath: failStageOne,
      stageTwoAPath: failStageTwoA,
      stageTwoBPath: failStageTwoB,
    });
    assert.equal(failReport.calibration.status, "FAIL");
    assert.equal(failReport.calibration.gate_passed, false);
    assert.equal(failReport.calibration.unsupported_findings_accepted, 1);
    assert.equal(
      failReport.metrics.findings_accepted_without_meaningful_blind_difference,
      1,
    );
  } finally {
    fs.rmSync(warnDir, { recursive: true, force: true });
    fs.rmSync(failDir, { recursive: true, force: true });
  }
});

test("V2 CLI runs create, both reveals, and score end to end", () => {
  const outputDir = tempDir("writer-adjudication-v2-cli-");

  try {
    assert.match(
      runCli([
        "create",
        "--input",
        fixtureFilePath,
        "--output",
        outputDir,
        "--seed",
        "protocol-v2-cli",
      ]),
      /AWAITING_BLIND_REVIEW/,
    );
    const stageOnePath = completeStageOne(outputDir);
    assert.match(
      runCli([
        "reveal",
        "--output",
        outputDir,
        "--stage-1",
        stageOnePath,
      ]),
      /AWAITING_BLIND_FINDING_ADJUDICATION/,
    );
    const stageTwoAPath = completeStageTwoA(outputDir);
    assert.match(
      runCli([
        "reveal-roles",
        "--output",
        outputDir,
        "--stage-1",
        stageOnePath,
        "--stage-2a",
        stageTwoAPath,
      ]),
      /AWAITING_ROLE_REVEAL_DECISION/,
    );
    const stageTwoBPath = completeStageTwoB(outputDir);
    assert.match(
      runCli([
        "score",
        "--output",
        outputDir,
        "--stage-1",
        stageOnePath,
        "--stage-2a",
        stageTwoAPath,
        "--stage-2b",
        stageTwoBPath,
      ]),
      /COMPLETE \(4 comparisons\)/,
    );
    assert.equal(
      readJson(path.join(outputDir, "adjudication-report.json"))
        .calibration.status,
      "PASS",
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
