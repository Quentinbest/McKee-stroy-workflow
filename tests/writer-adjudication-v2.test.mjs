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
const evidenceGateFixturePath = new URL(
  "./fixtures/writer-adjudication/v2.1-calibration.json",
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

function completeEvidenceGateStageTwoA(outputDir) {
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
    decision.evidence_support = unsupported ? "contradicted" : "supported";
    decision.evidence_basis = unsupported
      ? `${decision.comparison_id}: the displayed prose already states the event the finding claims is absent.`
      : `${decision.comparison_id}: the displayed evidence identifies a concrete missing or repeated prose effect.`;
    decision.counterevidence_checked =
      `${decision.comparison_id}: checked the displayed context and both prose variants for facts weakening that diagnosis.`;
    decision.finding_disposition = unsupported ? "reject" : "accept";
    decision.rationale = unsupported
      ? `${decision.comparison_id}: the diagnostic claim conflicts with the explicit textual fact.`
      : `${decision.comparison_id}: the specific evidence supports the bounded diagnostic claim.`;
    decision.blind_difference_reconciliation = "";
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
      readJson(path.join(outputDir, "stage-2a-decisions.json")).version,
      "2.0.0",
    );
    assert.equal(
      "evidence_support" in
        readJson(path.join(outputDir, "stage-2a-decisions.json")).comparisons[0],
      false,
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

test("V2.1 preserves its exact version while V2.0 remains replayable", () => {
  const v21Dir = tempDir("writer-adjudication-v2.1-version-");
  const v20Dir = tempDir("writer-adjudication-v2.0-version-");

  try {
    const v21Metadata = createAdjudicationRun({
      inputPath: evidenceGateFixturePath,
      outputDir: v21Dir,
      seed: "protocol-v2.1-version",
    });
    assert.equal(v21Metadata.version, "2.1.0");
    assert.equal(v21Metadata.protocol_version, "2.1.0");
    assert.equal(
      readJson(path.join(v21Dir, "sealed-manifest.json")).protocol_version,
      "2.1.0",
    );

    const v20Metadata = createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: v20Dir,
      seed: "protocol-v2.0-version",
    });
    assert.equal(v20Metadata.version, "2.0.0");
    assert.equal(v20Metadata.protocol_version, "2.0.0");
  } finally {
    fs.rmSync(v21Dir, { recursive: true, force: true });
    fs.rmSync(v20Dir, { recursive: true, force: true });
  }
});

test("V2.1 creates an evidence-first Stage 2A package without role leakage", () => {
  const outputDir = tempDir("writer-adjudication-v2.1-template-");

  try {
    createAdjudicationRun({
      inputPath: evidenceGateFixturePath,
      outputDir,
      seed: "protocol-v2.1-template",
    });
    const stageOnePath = completeStageOne(outputDir);
    revealAdjudicationRun({ outputDir, stageOnePath });

    const stageTwoA = readJson(
      path.join(outputDir, "stage-2a-decisions.json"),
    );
    assert.equal(stageTwoA.version, "2.1.0");
    assert.deepEqual(Object.keys(stageTwoA.comparisons[0]), [
      "comparison_id",
      "evidence_support",
      "evidence_basis",
      "counterevidence_checked",
      "finding_disposition",
      "rationale",
      "blind_difference_reconciliation",
    ]);
    assert.equal(stageTwoA.comparisons[0].evidence_support, null);
    assert.equal(stageTwoA.comparisons[0].evidence_basis, "");
    assert.equal(stageTwoA.comparisons[0].counterevidence_checked, "");

    const findingPackage = fs.readFileSync(
      path.join(outputDir, "finding-package.md"),
      "utf8",
    );
    assert.match(
      findingPackage,
      /Judge whether the evidence supports the predicate before choosing a disposition\./,
    );
    assert.match(
      findingPackage,
      /`supported`, `contradicted`, or `insufficient`/,
    );
    assert.match(
      findingPackage,
      /Check contrary or weakening textual evidence and record what you checked\./,
    );
    assert.doesNotMatch(
      findingPackage,
      /\bbaseline\b|\bchallenger\b|weak_challenger|unsupported_finding/i,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("V2.1 enforces the evidence-support disposition matrix", () => {
  const cases = [
    ["supported", "accept", true],
    ["supported", "uncertain", true],
    ["contradicted", "reject", true],
    ["insufficient", "reject", true],
    ["insufficient", "uncertain", true],
    ["contradicted", "accept", false],
    ["insufficient", "accept", false],
    ["supported", "reject", false],
  ];

  for (const [support, disposition, allowed] of cases) {
    const outputDir = tempDir(`writer-adjudication-v2.1-${support}-`);
    try {
      createAdjudicationRun({
        inputPath: evidenceGateFixturePath,
        outputDir,
        seed: `protocol-v2.1-${support}-${disposition}`,
      });
      const stageOnePath = completeStageOne(outputDir);
      revealAdjudicationRun({ outputDir, stageOnePath });
      const stageTwoAPath = completeEvidenceGateStageTwoA(outputDir);
      const stageTwoA = readJson(stageTwoAPath);
      stageTwoA.comparisons[0].evidence_support = support;
      stageTwoA.comparisons[0].finding_disposition = disposition;
      if (disposition === "accept") {
        stageTwoA.comparisons[0].blind_difference_reconciliation =
          "The evidence judgment remains the basis for this acceptance.";
      }
      writeJson(stageTwoAPath, stageTwoA);

      const run = () =>
        revealRolesAdjudicationRun({
          outputDir,
          stageOnePath,
          stageTwoAPath,
        });
      if (allowed) {
        assert.equal(run().status, "AWAITING_ROLE_REVEAL_DECISION");
      } else {
        assert.throws(
          run,
          /evidence_support=.*does not allow finding_disposition=/,
        );
        assert.equal(
          fs.existsSync(path.join(outputDir, "role-reveal-package.md")),
          false,
        );
        assert.equal(
          fs.existsSync(path.join(outputDir, "stage-2b-decisions.json")),
          false,
        );
      }
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }
});

test("V2.1 rejects missing, generic, and duplicated evidence judgments", () => {
  const mutations = [
    {
      apply(stageTwoA) {
        stageTwoA.comparisons[0].evidence_basis = "";
      },
      error: /C01\.evidence_basis must contain at least 12/,
    },
    {
      apply(stageTwoA) {
        stageTwoA.comparisons[0].rationale =
          "Writer explicitly confirmed acceptance of this finding.";
      },
      error: /C01\.rationale must contain a specific evidence judgment/,
    },
    {
      apply(stageTwoA) {
        stageTwoA.comparisons[0].counterevidence_checked =
          "No contrary evidence found";
      },
      error: /C01\.counterevidence_checked must identify what was checked/,
    },
    {
      apply(stageTwoA) {
        stageTwoA.comparisons[1].evidence_basis =
          stageTwoA.comparisons[0].evidence_basis;
      },
      error: /C02\.evidence_basis duplicates C01\.evidence_basis/,
    },
    {
      apply(stageTwoA) {
        stageTwoA.comparisons[1].rationale =
          `  ${stageTwoA.comparisons[0].rationale.toUpperCase()}  `;
      },
      error: /C02\.rationale duplicates C01\.rationale/,
    },
  ];

  for (const mutation of mutations) {
    const outputDir = tempDir("writer-adjudication-v2.1-specificity-");
    try {
      createAdjudicationRun({
        inputPath: evidenceGateFixturePath,
        outputDir,
        seed: "protocol-v2.1-specificity",
      });
      const stageOnePath = completeStageOne(outputDir);
      revealAdjudicationRun({ outputDir, stageOnePath });
      const stageTwoAPath = completeEvidenceGateStageTwoA(outputDir);
      const stageTwoA = readJson(stageTwoAPath);
      mutation.apply(stageTwoA);
      writeJson(stageTwoAPath, stageTwoA);

      assert.throws(
        () =>
          revealRolesAdjudicationRun({
            outputDir,
            stageOnePath,
            stageTwoAPath,
          }),
        mutation.error,
      );
      assert.equal(
        fs.existsSync(path.join(outputDir, "role-reveal-package.md")),
        false,
      );
      assert.equal(
        fs.existsSync(path.join(outputDir, "stage-2b-decisions.json")),
        false,
      );
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
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

test("V2.1 reports evidence support without inventing V2.0 data", () => {
  const v21Dir = tempDir("writer-adjudication-v2.1-report-");
  const v20Dir = tempDir("writer-adjudication-v2.0-report-");

  try {
    createAdjudicationRun({
      inputPath: evidenceGateFixturePath,
      outputDir: v21Dir,
      seed: "protocol-v2.1-report",
    });
    const v21StageOne = completeStageOne(v21Dir);
    revealAdjudicationRun({
      outputDir: v21Dir,
      stageOnePath: v21StageOne,
    });
    const v21StageTwoA = completeEvidenceGateStageTwoA(v21Dir);
    revealRolesAdjudicationRun({
      outputDir: v21Dir,
      stageOnePath: v21StageOne,
      stageTwoAPath: v21StageTwoA,
    });
    const v21StageTwoB = completeStageTwoB(v21Dir);
    const v21Report = scoreAdjudicationRun({
      outputDir: v21Dir,
      stageOnePath: v21StageOne,
      stageTwoAPath: v21StageTwoA,
      stageTwoBPath: v21StageTwoB,
    });
    assert.deepEqual(v21Report.evidence_gate, {
      protocol_version: "2.1.0",
      support_counts: {
        supported: 3,
        contradicted: 1,
        insufficient: 0,
      },
      by_disposition: {
        accept: { supported: 3, contradicted: 0, insufficient: 0 },
        reject: { supported: 0, contradicted: 1, insufficient: 0 },
        uncertain: { supported: 0, contradicted: 0, insufficient: 0 },
      },
    });
    assert.match(
      fs.readFileSync(path.join(v21Dir, "adjudication-report.md"), "utf8"),
      /Evidence gate protocol \| 2\.1\.0 \|/,
    );

    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: v20Dir,
      seed: "protocol-v2.0-report",
    });
    const v20StageOne = completeStageOne(v20Dir);
    revealAdjudicationRun({
      outputDir: v20Dir,
      stageOnePath: v20StageOne,
    });
    const v20StageTwoA = completeStageTwoA(v20Dir);
    revealRolesAdjudicationRun({
      outputDir: v20Dir,
      stageOnePath: v20StageOne,
      stageTwoAPath: v20StageTwoA,
    });
    const v20StageTwoB = completeStageTwoB(v20Dir);
    const v20Report = scoreAdjudicationRun({
      outputDir: v20Dir,
      stageOnePath: v20StageOne,
      stageTwoAPath: v20StageTwoA,
      stageTwoBPath: v20StageTwoB,
    });
    assert.equal(v20Report.evidence_gate, null);
  } finally {
    fs.rmSync(v21Dir, { recursive: true, force: true });
    fs.rmSync(v20Dir, { recursive: true, force: true });
  }
});

test("V2.0 retained decisions replay without evidence-first fields", () => {
  const outputDir = tempDir("writer-adjudication-v2.0-replay-");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "protocol-v2.0-replay",
    });
    const stageOnePath = completeStageOne(outputDir);
    revealAdjudicationRun({
      outputDir,
      stageOnePath,
    });
    const stageTwoAPath = completeStageTwoA(outputDir);
    const stageTwoA = readJson(stageTwoAPath);
    assert.equal("evidence_support" in stageTwoA.comparisons[0], false);
    revealRolesAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoAPath,
    });
    const stageTwoBPath = completeStageTwoB(outputDir);
    const report = scoreAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoAPath,
      stageTwoBPath,
    });

    assert.equal(report.protocol_version, "2.0.0");
    assert.equal(report.evidence_gate, null);
    assert.equal(
      report.comparisons.some(
        (comparison) => "evidence_support" in comparison,
      ),
      false,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
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
        fileURLToPath(evidenceGateFixturePath),
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
    const stageTwoAPath = completeEvidenceGateStageTwoA(outputDir);
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
    assert.equal(
      readJson(path.join(outputDir, "adjudication-report.json")).evidence_gate
        .protocol_version,
      "2.1.0",
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
