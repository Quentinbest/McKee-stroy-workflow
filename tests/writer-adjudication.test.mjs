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
  "../benchmarks/writer-adjudication/memory-tide-pilot.json",
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

function completeStageOne(filePath) {
  const stageOne = readJson(filePath);
  stageOne.status = "COMPLETE";
  stageOne.reviewer = {
    id: "test-writer",
    started_at: "2026-06-12T12:55:00Z",
    completed_at: "2026-06-12T13:00:00Z",
  };
  stageOne.comparisons[0] = {
    ...stageOne.comparisons[0],
    preferred_variant: "A",
    confidence: 4,
    meaningful_difference: "yes",
    reasons: ["clearer causal pressure"],
  };
  stageOne.comparisons[1] = {
    ...stageOne.comparisons[1],
    preferred_variant: "A",
    confidence: 3,
    meaningful_difference: "uncertain",
    reasons: ["stronger compression"],
  };
  writeJson(filePath, stageOne);
}

function completeStageTwo(filePath) {
  const stageTwo = readJson(filePath);
  stageTwo.status = "COMPLETE";
  stageTwo.reviewer = {
    id: "test-writer",
    started_at: "2026-06-12T13:05:00Z",
    completed_at: "2026-06-12T13:10:00Z",
  };
  stageTwo.batch_effect = {
    cross_scene_repetition: "reduced",
    notes: "The revised set varies its evidence delivery.",
  };
  stageTwo.comparisons[0] = {
    ...stageTwo.comparisons[0],
    finding_disposition: "accept",
    adopt_preferred_variant: "yes",
    rationale: "The added pressure earns the action.",
  };
  stageTwo.comparisons[1] = {
    ...stageTwo.comparisons[1],
    finding_disposition: "reject",
    adopt_preferred_variant: "no",
    rationale: "The baseline is more forceful.",
  };
  writeJson(filePath, stageTwo);
}

test("create produces a deterministic balanced blind package without role leakage", () => {
  const firstDir = tempDir("writer-adjudication-first-");
  const secondDir = tempDir("writer-adjudication-second-");

  try {
    const first = createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: firstDir,
      seed: "20260612",
    });
    const second = createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: secondDir,
      seed: "20260612",
    });

    assert.deepEqual(first, second);
    assert.equal(first.status, "AWAITING_BLIND_REVIEW");
    assert.equal(first.human_evidence_recorded, false);
    assert.equal(
      fs.readFileSync(path.join(firstDir, "blind-package.md"), "utf8"),
      fs.readFileSync(path.join(secondDir, "blind-package.md"), "utf8"),
    );

    const blindPackage = fs.readFileSync(
      path.join(firstDir, "blind-package.md"),
      "utf8",
    );
    assert.doesNotMatch(
      blindPackage,
      /\bbaseline\b|\bchallenger\b|\bfinding\b|\bpredicate\b/i,
    );

    const manifest = readJson(
      path.join(firstDir, "sealed-manifest.json"),
    );
    const baselineLabels = manifest.comparisons.map((comparison) =>
      Object.entries(comparison.variant_roles).find(
        ([, role]) => role === "baseline",
      )[0],
    );
    assert.deepEqual(new Set(baselineLabels), new Set(["A", "B"]));

    const stageOnePath = path.join(firstDir, "stage-1-decisions.json");
    const stageOne = readJson(stageOnePath);
    stageOne.comparisons[0].notes = "partial human work";
    writeJson(stageOnePath, stageOne);
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: firstDir,
      seed: "20260612",
    });
    assert.equal(
      readJson(stageOnePath).comparisons[0].notes,
      "partial human work",
    );
    assert.throws(
      () =>
        createAdjudicationRun({
          inputPath: fixturePath,
          outputDir: firstDir,
          seed: "different-seed",
        }),
      /different adjudication input or seed/,
    );
  } finally {
    fs.rmSync(firstDir, { recursive: true, force: true });
    fs.rmSync(secondDir, { recursive: true, force: true });
  }
});

test("reveal refuses incomplete decisions and package tampering", () => {
  const outputDir = tempDir("writer-adjudication-gate-");
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "20260612",
    });
    assert.throws(
      () => revealAdjudicationRun({ outputDir, stageOnePath }),
      /status must be COMPLETE/,
    );

    completeStageOne(stageOnePath);
    fs.appendFileSync(path.join(outputDir, "blind-package.md"), "\nchanged\n");
    assert.throws(
      () => revealAdjudicationRun({ outputDir, stageOnePath }),
      /no longer matches/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("two-stage flow separates blind preference from finding disposition", () => {
  const outputDir = tempDir("writer-adjudication-flow-");
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");
  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "20260612",
    });
    completeStageOne(stageOnePath);
    const reveal = revealAdjudicationRun({ outputDir, stageOnePath });
    assert.equal(reveal.status, "AWAITING_FINDING_ADJUDICATION");
    assert.equal(fs.existsSync(stageTwoPath), true);

    completeStageTwo(stageTwoPath);
    const metadataPath = path.join(outputDir, "run-metadata.json");
    const interruptedMetadata = readJson(metadataPath);
    delete interruptedMetadata.stage_1_sha256;
    interruptedMetadata.status = "AWAITING_BLIND_REVIEW";
    writeJson(metadataPath, interruptedMetadata);
    fs.rmSync(path.join(outputDir, "reveal-package.md"));
    const repeatedReveal = revealAdjudicationRun({
      outputDir,
      stageOnePath,
    });
    assert.equal(repeatedReveal.status, "AWAITING_FINDING_ADJUDICATION");
    assert.equal(readJson(stageTwoPath).status, "COMPLETE");
    assert.equal(
      fs.existsSync(path.join(outputDir, "reveal-package.md")),
      true,
    );
    const report = scoreAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoPath,
    });

    assert.equal(report.status, "COMPLETE");
    assert.equal(report.metrics.comparisons, 2);
    assert.equal(report.metrics.challenger_preferred, 1);
    assert.equal(report.metrics.baseline_preferred, 1);
    assert.equal(report.metrics.findings_accepted, 1);
    assert.equal(report.metrics.findings_rejected, 1);
    assert.equal(report.metrics.writer_rejected_finding_rate_percent, 50);
    assert.equal(report.metrics.preferred_variants_adopted, 1);
    assert.equal(report.metrics.writer_review_minutes, 10);
    assert.equal(report.metrics.critic_agent_calls, 5);
    assert.equal(report.metrics.variant_generation_agent_calls, 0);
    assert.equal(report.metrics.cross_scene_repetition_effect, "reduced");
    assert.deepEqual(report.comparisons[0].blind_reasons, [
      "clearer causal pressure",
    ]);
    assert.equal(
      report.comparisons[0].finding_rationale,
      "The added pressure earns the action.",
    );

    const metadata = readJson(metadataPath);
    assert.equal(metadata.human_evidence_recorded, true);
    assert.equal(fs.existsSync(path.join(outputDir, "adjudication-report.md")), true);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("score enforces stage ordering", () => {
  const outputDir = tempDir("writer-adjudication-order-");
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");
  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "20260612",
    });
    completeStageOne(stageOnePath);
    revealAdjudicationRun({ outputDir, stageOnePath });
    completeStageTwo(stageTwoPath);
    const stageTwo = readJson(stageTwoPath);
    stageTwo.reviewer.started_at = "2026-06-12T12:59:00Z";
    writeJson(stageTwoPath, stageTwo);

    assert.throws(
      () =>
        scoreAdjudicationRun({
          outputDir,
          stageOnePath,
          stageTwoPath,
        }),
      /must not precede Stage 1 completion/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("retained pilot is demonstrative and contains no human outcome", () => {
  const runRoot = new URL(
    "../benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/",
    import.meta.url,
  );
  const metadata = readJson(new URL("run-metadata.json", runRoot));
  const stageOne = readJson(new URL("stage-1-decisions.json", runRoot));

  assert.equal(metadata.status, "AWAITING_BLIND_REVIEW");
  assert.equal(metadata.human_evidence_recorded, false);
  assert.equal(stageOne.status, "AWAITING_WRITER");
  assert.equal(
    fs.existsSync(new URL("adjudication-report.json", runRoot)),
    false,
  );
});
