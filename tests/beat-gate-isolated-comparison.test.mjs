import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { compareBeatGateCritics } from "../scripts/compare-beat-gate-critics.mjs";

test("isolated critic comparison preserves uncertainty and batch lift", () => {
  const comparison = compareBeatGateCritics();

  assert.equal(comparison.execution_mode, "parallel-isolated-agent");
  assert.equal(comparison.scene_critic.fallback_findings, 7);
  assert.equal(comparison.scene_critic.isolated_findings, 4);
  assert.equal(comparison.scene_critic.shared_flagged_beats, 3);
  assert.equal(comparison.scene_critic.fallback_only_flagged_beats, 4);
  assert.equal(comparison.scene_critic.isolated_novel_predicates, 1);
  assert.equal(comparison.scene_critic.confirmed_false_positives, 0);
  assert.equal(
    comparison.scene_critic.isolated_findings_requiring_fresh_human_review,
    2,
  );
  assert.equal(
    comparison.retrospective_human_alignment
      .fallback_flagged_beats_with_text_change,
    4,
  );
  assert.equal(
    comparison.retrospective_human_alignment
      .isolated_flagged_beats_with_text_change,
    1,
  );
  assert.equal(
    comparison.retrospective_human_alignment
      .isolated_human_changed_beat_recall_percent,
    25,
  );
  assert.deepEqual(
    comparison.retrospective_human_alignment
      .human_changed_beats_missed_by_isolated_scene_critics,
    ["1-2-3", "1-3-1", "1-4-3"],
  );
  assert.equal(comparison.batch_auditor.findings, 5);
  assert.equal(comparison.batch_auditor.high_severity_findings, 1);
  assert.equal(
    comparison.batch_auditor.findings_confirmed_by_prior_human_changes,
    2,
  );
});

test("batch auditor contract excludes mechanism labels and prior verdicts", () => {
  const contract = fs.readFileSync(
    new URL("../agents/batch-beat-pattern-auditor.md", import.meta.url),
    "utf8",
  );

  assert.match(contract, /mechanism labels/);
  assert.match(contract, /prior critic findings or verdicts/);
  assert.match(contract, /All findings are `REVIEW`/);
  assert.match(contract, /6 or more cleaned Beat texts/);
});
