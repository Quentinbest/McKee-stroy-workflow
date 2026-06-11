import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runBeatGateDryRun } from "../scripts/run-beat-gate-dry-run.mjs";

test("synthetic Beat Gate dry run writes a complete auditable project", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "beat-gate-e2e-"));

  try {
    const report = runBeatGateDryRun({ outputDir });

    assert.equal(report.status, "PASS");
    assert.deepEqual(report.checks, {
      deterministic_patch_applied: true,
      protected_field_rejected: true,
      human_decision_recorded: true,
      non_convergence_escalated: true,
      rolling_reviews_written: true,
      ledger_valid: true,
    });

    for (const artifact of report.artifacts) {
      assert.equal(
        fs.existsSync(path.join(outputDir, artifact)),
        true,
        `missing ${artifact}`,
      );
    }

    const ledger = JSON.parse(
      fs.readFileSync(
        path.join(
          outputDir,
          "drafts",
          "synthetic-beat-gate",
          "audit",
          "beat-gate",
          "1-1.json",
        ),
        "utf8",
      ),
    );
    const lifecycle = JSON.parse(
      fs.readFileSync(
        path.join(
          outputDir,
          "drafts",
          "synthetic-beat-gate",
          "lifecycle.json",
        ),
        "utf8",
      ),
    );

    assert.equal(lifecycle.slug, "synthetic-beat-gate");
    assert.equal(lifecycle.workflow_versions.beat_gate, "1.0.0");
    assert.equal(
      lifecycle.artifacts.beat_gate_audit_dir,
      "drafts/synthetic-beat-gate/audit/beat-gate/",
    );
    assert.deepEqual(ledger.stages_completed, [
      "scan",
      "critic",
      "writer_decision",
      "diversity",
      "escalation",
    ]);
    assert.equal(ledger.status, "upstream_blocked");
    assert.equal(ledger.beats[0].status, "accepted");
    assert.match(ledger.beats[0].clean_text, /Scene Card/);
    assert.equal(ledger.beats[1].status, "rejected");
    assert.equal(
      ledger.beats[1].reject_items[0].code,
      "protected_contract_overlap",
    );
    assert.equal(ledger.beats[2].status, "upstream_blocked");
    assert.equal(
      ledger.beats[2].escalation.required_action,
      "human_or_upstream_revision",
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
