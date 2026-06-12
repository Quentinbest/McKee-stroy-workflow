import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runBeatGateDogfood } from "../scripts/run-beat-gate-dogfood.mjs";

test("dogfood benchmark reaches one honest human decision boundary", () => {
  const outputDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "beat-gate-dogfood-test-"),
  );

  try {
    const report = runBeatGateDogfood({
      outputDir,
      applyDecision: false,
    });

    assert.equal(report.status, "AWAITING_WRITER");
    assert.equal(report.execution_mode, "in-context-fallback");
    assert.equal(report.metrics.scenes_attempted, 4);
    assert.equal(report.metrics.beats_attempted, 12);
    assert.equal(report.metrics.auto_output_leaks, 0);
    assert.equal(report.metrics.protected_probe_rejects, 1);
    assert.equal(report.metrics.beats_awaiting_writer, 1);
    assert.equal(report.metrics.beats_accepted, 0);
    assert.equal(report.metrics.human_decisions_recorded, 0);
    assert.equal(report.metrics.human_decision_points, 1);
    assert.equal(report.metrics.mechanism_categories_covered, 4);
    assert.equal(report.metrics.diversity_alternative_mechanisms, 3);
    assert.equal(report.metrics.initial_batch_risk_flags, 3);
    assert.equal(report.metrics.post_commit_residual_risks, null);
    assert.equal(report.compute.isolated_critic_calls, 0);
    assert.equal(report.compute.rolling_review_passes, 0);
    assert.equal(fs.existsSync(report.writer_review_path), true);

    const reviewPackage = fs.readFileSync(
      report.writer_review_path,
      "utf8",
    );
    assert.match(reviewPackage, /Final aesthetic judgment: pending human/);
    assert.match(reviewPackage, /Diversity Alternatives for 1-4-3/);
    assert.match(reviewPackage, /cross_scene_homogeneity/);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("recorded writer choice commits the batch and triggers rolling review", () => {
  const outputDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "beat-gate-dogfood-committed-"),
  );

  try {
    const report = runBeatGateDogfood({ outputDir });

    assert.equal(report.status, "COMMITTED");
    assert.equal(report.decision.selected_ending, "A");
    assert.equal(report.metrics.beats_deferred_to_batch_boundary, 0);
    assert.equal(report.metrics.beats_awaiting_writer, 0);
    assert.equal(report.metrics.beats_accepted, 12);
    assert.equal(report.metrics.review_findings_resolved, 7);
    assert.equal(report.metrics.human_decisions_recorded, 1);
    assert.equal(report.metrics.initial_batch_risk_flags, 3);
    assert.equal(report.metrics.post_commit_residual_risks, 2);
    assert.equal(report.metrics.post_commit_resolved_risks, 1);
    assert.equal(report.compute.rolling_review_passes, 2);

    const projectRoot = path.join(
      outputDir,
      "drafts",
      "memory-tide",
    );
    const finalScene = fs.readFileSync(
      path.join(projectRoot, "prose", "1-4.md"),
      "utf8",
    );
    assert.match(finalScene, /档案员指环/);
    assert.match(finalScene, /再也弹不回来/);
    assert.equal(
      fs.existsSync(
        path.join(projectRoot, "audit", "rolling", "1-4-reader.md"),
      ),
      true,
    );
    assert.equal(
      fs.existsSync(
        path.join(projectRoot, "audit", "rolling", "1-4-pacing.md"),
      ),
      true,
    );

    const finalLedger = JSON.parse(
      fs.readFileSync(
        path.join(projectRoot, "audit", "beat-gate", "1-4.json"),
        "utf8",
      ),
    );
    assert.equal(finalLedger.status, "accepted");
    assert.equal(finalLedger.writer_decision, "accept");
    assert.ok(finalLedger.stages_completed.includes("rolling_review"));
    assert.ok(
      finalLedger.beats.every(
        (beat) =>
          beat.status === "accepted" &&
          beat.writer_decision === "accept" &&
          beat.deferred_to_batch_boundary === false,
      ),
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
