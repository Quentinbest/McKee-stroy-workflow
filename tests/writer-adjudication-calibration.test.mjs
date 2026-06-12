import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createAdjudicationRun,
  revealAdjudicationRun,
  scoreAdjudicationRun,
} from "../scripts/run-writer-adjudication.mjs";

const fixturePath = new URL(
  "../benchmarks/writer-adjudication/glass-orchard-calibration-v2.json",
  import.meta.url,
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

test("prospective calibration hides controls and enforces declared coverage", () => {
  const outputDir = tempDir("writer-calibration-create-");

  try {
    const metadata = createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "20260612-v2",
    });
    const blindPackage = fs.readFileSync(
      path.join(outputDir, "blind-package.md"),
      "utf8",
    );
    const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));

    assert.equal(metadata.comparison_count, 12);
    assert.equal(metadata.calibration.mode, "prospective");
    assert.equal(metadata.calibration.distinct_scenes, 4);
    assert.equal(metadata.calibration.control_count, 3);
    assert.doesNotMatch(
      blindPackage,
      /weak_challenger|control_type|expected_role/i,
    );
    assert.equal(
      manifest.comparisons.filter(
        (comparison) =>
          comparison.calibration.control_type === "weak_challenger",
      ).length,
      3,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("prospective calibration rejects insufficient scene coverage", () => {
  const outputDir = tempDir("writer-calibration-invalid-output-");
  const inputDir = tempDir("writer-calibration-invalid-input-");
  const invalidPath = path.join(inputDir, "invalid.json");

  try {
    const input = readJson(fixturePath);
    for (const comparison of input.comparisons) {
      if (comparison.scene_ref === "1-4") {
        comparison.scene_ref = "1-3";
      }
    }
    writeJson(invalidPath, input);

    assert.throws(
      () =>
        createAdjudicationRun({
          inputPath: invalidPath,
          outputDir,
          seed: "20260612-v2",
        }),
      /at least 4 distinct scenes/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.rmSync(inputDir, { recursive: true, force: true });
  }
});

test("calibration scoring reports control resistance separately", () => {
  const outputDir = tempDir("writer-calibration-score-");
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");
  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "20260612-v2",
    });
    const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
    const manifestById = new Map(
      manifest.comparisons.map((comparison) => [
        comparison.comparison_id,
        comparison,
      ]),
    );
    const stageOne = readJson(stageOnePath);
    stageOne.status = "COMPLETE";
    stageOne.reviewer = {
      id: "test-writer",
      started_at: "2026-06-12T14:00:00Z",
      completed_at: "2026-06-12T14:20:00Z",
    };
    for (const decision of stageOne.comparisons) {
      const comparison = manifestById.get(decision.comparison_id);
      const isControl =
        comparison.calibration.control_type === "weak_challenger";
      decision.preferred_variant = Object.entries(
        comparison.variant_roles,
      ).find(([, role]) => role === (isControl ? "baseline" : "challenger"))[0];
      decision.confidence = 4;
      decision.meaningful_difference = "yes";
      decision.reasons = [
        isControl ? "baseline is more precise" : "challenger is more effective",
      ];
    }
    writeJson(stageOnePath, stageOne);

    revealAdjudicationRun({ outputDir, stageOnePath });
    const revealPackage = fs.readFileSync(
      path.join(outputDir, "reveal-package.md"),
      "utf8",
    );
    assert.doesNotMatch(
      revealPackage,
      /weak_challenger|control_type|expected_role/i,
    );
    const stageTwo = readJson(stageTwoPath);
    stageTwo.status = "COMPLETE";
    stageTwo.reviewer = {
      id: "test-writer",
      started_at: "2026-06-12T14:20:00Z",
      completed_at: "2026-06-12T14:30:00Z",
    };
    stageTwo.batch_effect = {
      cross_scene_repetition: "reduced",
      notes: "",
    };
    for (const decision of stageTwo.comparisons) {
      const comparison = manifestById.get(decision.comparison_id);
      const isControl =
        comparison.calibration.control_type === "weak_challenger";
      decision.finding_disposition = isControl ? "reject" : "accept";
      decision.adopt_preferred_variant = isControl ? "no" : "yes";
      decision.rationale = isControl
        ? "The proposed intervention makes the prose worse."
        : "The finding and selected revision are useful.";
    }
    writeJson(stageTwoPath, stageTwo);

    const report = scoreAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoPath,
    });

    assert.equal(report.calibration.distinct_scenes, 4);
    assert.equal(report.calibration.control_count, 3);
    assert.equal(report.calibration.control_baseline_preferred, 3);
    assert.equal(report.calibration.control_challenger_preferred, 0);
    assert.equal(report.calibration.control_resistance_rate_percent, 100);
    assert.equal(report.calibration.non_control_challenger_preferred, 9);
    assert.equal(report.calibration.by_category.closure.comparisons, 2);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("retained prospective calibration is pending without human evidence", () => {
  const runRoot = new URL(
    "../benchmarks/writer-adjudication/runs/2026-06-12-glass-orchard-calibration-v2/",
    import.meta.url,
  );
  const metadata = readJson(new URL("run-metadata.json", runRoot));
  const stageOne = readJson(new URL("stage-1-decisions.json", runRoot));
  const manifest = readJson(new URL("sealed-manifest.json", runRoot));

  assert.equal(metadata.status, "AWAITING_BLIND_REVIEW");
  assert.equal(metadata.human_evidence_recorded, false);
  assert.equal(metadata.comparison_count, 12);
  assert.equal(metadata.calibration.distinct_scenes, 4);
  assert.equal(metadata.calibration.control_count, 3);
  assert.equal(stageOne.status, "AWAITING_WRITER");
  assert.equal(manifest.comparisons.length, 12);
});
