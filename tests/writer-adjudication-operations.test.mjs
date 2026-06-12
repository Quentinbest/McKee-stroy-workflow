import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  aggregateAdjudicationRuns,
  applyAdjudicationRun,
  createAdjudicationRun,
  prepareAdjudicationInput,
  revealAdjudicationRun,
  scoreAdjudicationRun,
} from "../scripts/run-writer-adjudication.mjs";

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function completeSingleComparisonRun({ inputPath, outputDir }) {
  createAdjudicationRun({
    inputPath,
    outputDir,
    seed: "operations-seed",
  });
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  const comparison = manifest.comparisons[0];
  const challengerLabel = Object.entries(comparison.variant_roles).find(
    ([, role]) => role === "challenger",
  )[0];
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");
  const stageOne = readJson(stageOnePath);
  stageOne.status = "COMPLETE";
  stageOne.reviewer = {
    id: "test-writer",
    started_at: "2026-06-12T15:00:00Z",
    completed_at: "2026-06-12T15:02:00Z",
  };
  stageOne.comparisons[0] = {
    ...stageOne.comparisons[0],
    preferred_variant: challengerLabel,
    confidence: 4,
    meaningful_difference: "yes",
    reasons: ["more precise"],
  };
  writeJson(stageOnePath, stageOne);

  revealAdjudicationRun({ outputDir, stageOnePath });
  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");
  const stageTwo = readJson(stageTwoPath);
  stageTwo.status = "COMPLETE";
  stageTwo.reviewer = {
    id: "test-writer",
    started_at: "2026-06-12T15:02:00Z",
    completed_at: "2026-06-12T15:03:00Z",
  };
  stageTwo.comparisons[0] = {
    ...stageTwo.comparisons[0],
    finding_disposition: "accept",
    adopt_preferred_variant: "yes",
    rationale: "Use the selected revision.",
  };
  stageTwo.batch_effect = {
    cross_scene_repetition: "unchanged",
    notes: "",
  };
  writeJson(stageTwoPath, stageTwo);
  scoreAdjudicationRun({
    outputDir,
    stageOnePath,
    stageTwoPath,
  });
}

test("approved variant application is dry-run by default and exact-match only", () => {
  const rootDir = tempDir("writer-adjudication-apply-root-");
  const outputDir = tempDir("writer-adjudication-apply-run-");
  const inputPath = path.join(rootDir, "input.json");
  const targetPath = path.join(rootDir, "drafts", "scene.md");
  const baseline = "The gate stayed closed.";
  const challenger = "The gate shuddered once, then stayed closed.";

  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, `${baseline}\n`);
    writeJson(inputPath, {
      version: "1.0.0",
      run_id: "operations-apply",
      title: "Operations apply",
      comparisons: [
        {
          id: "apply-1",
          source_ref: "scene-1",
          authority_attestation: {
            protected_fields_unchanged: true,
            notes: "No protected field changes.",
          },
          context: "A gate is under pressure.",
          baseline_text: baseline,
          challenger_text: challenger,
          application: {
            target_file: "drafts/scene.md",
          },
          finding: {
            predicate: "specificity",
            evidence: "The pressure is abstract.",
            question: "Does one physical response improve the beat?",
          },
        },
      ],
    });
    completeSingleComparisonRun({ inputPath, outputDir });
    const reportPath = path.join(outputDir, "adjudication-report.json");
    const originalReport = readJson(reportPath);
    const tamperedReport = structuredClone(originalReport);
    tamperedReport.comparisons[0].adopt_preferred_variant = "no";
    writeJson(reportPath, tamperedReport);
    assert.throws(
      () =>
        applyAdjudicationRun({
          outputDir,
          inputPath,
          rootDir,
          write: false,
        }),
      /report no longer matches decisions/,
    );

    const legacyReport = structuredClone(originalReport);
    delete legacyReport.comparisons[0].source_id;
    writeJson(reportPath, legacyReport);

    const dryRun = applyAdjudicationRun({
      outputDir,
      inputPath,
      rootDir,
      write: false,
    });
    assert.equal(dryRun.status, "DRY_RUN");
    assert.equal(dryRun.operations[0].status, "READY");
    assert.equal(fs.readFileSync(targetPath, "utf8"), `${baseline}\n`);

    const applied = applyAdjudicationRun({
      outputDir,
      inputPath,
      rootDir,
      write: true,
    });
    assert.equal(applied.status, "APPLIED");
    assert.equal(fs.readFileSync(targetPath, "utf8"), `${challenger}\n`);

    fs.writeFileSync(targetPath, "The source changed independently.\n");
    assert.throws(
      () =>
        applyAdjudicationRun({
          outputDir,
          inputPath,
          rootDir,
          write: true,
        }),
      /exactly once/,
    );
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("aggregate report combines completed runs and calibration controls", () => {
  const runsDir = tempDir("writer-adjudication-aggregate-");

  try {
    writeJson(path.join(runsDir, "run-a", "adjudication-report.json"), {
      status: "COMPLETE",
      run_id: "run-a",
      metrics: {
        comparisons: 2,
        challenger_preferred: 2,
        baseline_preferred: 0,
        ties: 0,
        findings_accepted: 2,
        findings_rejected: 0,
        findings_uncertain: 0,
        preferred_variants_adopted: 2,
        writer_review_minutes: 10,
      },
      calibration: null,
    });
    writeJson(path.join(runsDir, "run-b", "adjudication-report.json"), {
      status: "COMPLETE",
      run_id: "run-b",
      metrics: {
        comparisons: 12,
        challenger_preferred: 9,
        baseline_preferred: 3,
        ties: 0,
        findings_accepted: 9,
        findings_rejected: 3,
        findings_uncertain: 0,
        preferred_variants_adopted: 9,
        writer_review_minutes: 30,
      },
      calibration: {
        control_count: 3,
        control_baseline_preferred: 3,
        control_ties: 0,
        control_challenger_preferred: 0,
        control_findings_rejected: 3,
        non_control_comparisons: 9,
        non_control_challenger_preferred: 9,
      },
    });

    const aggregate = aggregateAdjudicationRuns({ runsDir });
    assert.equal(aggregate.metrics.completed_runs, 2);
    assert.equal(aggregate.metrics.comparisons, 14);
    assert.equal(aggregate.metrics.challenger_preferred, 11);
    assert.equal(aggregate.metrics.writer_review_minutes, 40);
    assert.equal(aggregate.calibration.control_count, 3);
    assert.equal(aggregate.calibration.control_resistance_rate_percent, 100);

    writeJson(path.join(runsDir, "run-c", "adjudication-report.json"), {
      ...readJson(path.join(runsDir, "run-b", "adjudication-report.json")),
    });
    assert.throws(
      () => aggregateAdjudicationRuns({ runsDir }),
      /Duplicate adjudication run_id/,
    );
  } finally {
    fs.rmSync(runsDir, { recursive: true, force: true });
  }
});

test("prepare joins unresolved findings to explicit variants", () => {
  const rootDir = tempDir("writer-adjudication-prepare-");
  const findingsPath = path.join(rootDir, "findings.json");
  const variantsPath = path.join(rootDir, "variants.json");
  const outputPath = path.join(rootDir, "prepared-input.json");

  try {
    writeJson(findingsPath, {
      scene_reviews: [
        {
          scene_ref: "2-1",
          findings: [
            {
              beat_ref: "2-1-2",
              classification: "REVIEW",
              predicate: "desire_pressure",
              evidence: "The action is not connected to the locked desire.",
              question: "Does the concrete cue make the desire causal?",
            },
            {
              beat_ref: "2-1-3",
              classification: "REVIEW",
              assessment: "confirmed",
              predicate: "closure",
              evidence: "This finding was already resolved.",
              question: "This should not enter a new run.",
            },
          ],
        },
      ],
    });
    writeJson(variantsPath, {
      version: "1.0.0",
      process_metrics: {
        critic_agent_calls: 1,
        variant_generation_agent_calls: 1,
        notes: "",
      },
      variants: [
        {
          id: "prepared-2-1-2-desire",
          scene_ref: "2-1",
          beat_ref: "2-1-2",
          predicate: "desire_pressure",
          authority_attestation: {
            protected_fields_unchanged: true,
            notes: "The locked desire is unchanged.",
          },
          context: "A courier must protect her sister without changing course.",
          baseline_text: "She closed the case.",
          challenger_text: "Her sister's hospital tag caught in the latch as she closed the case.",
        },
      ],
    });

    const prepared = prepareAdjudicationInput({
      findingsPath,
      variantsPath,
      outputPath,
      runId: "prepared-run",
      title: "Prepared run",
      createdAt: "2026-06-12",
    });

    assert.equal(prepared.comparisons.length, 1);
    assert.equal(prepared.comparisons[0].source_ref, "2-1-2");
    assert.equal(
      prepared.comparisons[0].finding.predicate,
      "desire_pressure",
    );
    assert.equal(fs.existsSync(outputPath), true);

    const missingVariants = readJson(variantsPath);
    missingVariants.variants = [];
    writeJson(variantsPath, missingVariants);
    assert.throws(
      () =>
        prepareAdjudicationInput({
          findingsPath,
          variantsPath,
          outputPath,
          runId: "prepared-run",
          title: "Prepared run",
          createdAt: "2026-06-12",
        }),
      /Missing variant for unresolved finding/,
    );

    missingVariants.variants = [
      {
        id: "extra",
        beat_ref: "9-9-9",
        predicate: "closure",
      },
    ];
    writeJson(variantsPath, missingVariants);
    assert.throws(
      () =>
        prepareAdjudicationInput({
          findingsPath,
          variantsPath,
          outputPath,
          runId: "prepared-run",
          title: "Prepared run",
          createdAt: "2026-06-12",
        }),
      /Variants have no unresolved finding/,
    );
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});
