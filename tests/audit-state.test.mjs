import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateAuditState,
  invalidateAuditRecords,
} from "../skills/story-audit/scripts/audit-state.mjs";

const requiredDimensions = ["structure", "climax", "cliche", "subtext"];
const targetScope = {
  type: "full_story",
  scenes: ["1-1", "2-1", "3-1"],
  planned_complete: true,
};
const currentSnapshot = {
  files: [
    { path: "prose/1-1.md", kind: "prose", sha256: "a" },
    { path: "cast-roster.md", kind: "constraint", sha256: "b" },
  ],
};
const lifecycle = { state: "prose_drafted", locked: { critic_passed: false } };

function fullPass(overrides = {}) {
  return {
    audit_id: "audit-1",
    scope: targetScope,
    dimensions_completed: requiredDimensions,
    dimensions_required: requiredDimensions,
    input_snapshot: currentSnapshot,
    workflow_version: "1.1.0",
    execution_mode: "in-context-sequential",
    result: "PASS",
    invalidation_reasons: [],
    ...overrides,
  };
}

test("only one act or one critic cannot satisfy the global gate", () => {
  const actOnly = fullPass({
    scope: { type: "act", scenes: ["1-1"], planned_complete: false },
  });
  const criticOnly = fullPass({ dimensions_completed: ["structure"] });
  for (const record of [actOnly, criticOnly]) {
    const result = evaluateAuditState({
      lifecycle,
      audit_records: [record],
      current_snapshot: currentSnapshot,
      target_scope: targetScope,
      required_dimensions: requiredDimensions,
    });
    assert.equal(result.global_critic_passed, false);
  }
});

test("a complete current full-story audit satisfies the global gate", () => {
  const result = evaluateAuditState({
    lifecycle,
    audit_records: [fullPass()],
    current_snapshot: currentSnapshot,
    target_scope: targetScope,
    required_dimensions: requiredDimensions,
  });
  assert.equal(result.global_critic_passed, true);
  assert.equal(result.supporting_audit_id, "audit-1");
});

test("prose or constraint changes make an earlier audit stale", () => {
  for (const changedFile of [
    { path: "prose/1-1.md", kind: "prose", sha256: "changed" },
    { path: "cast-roster.md", kind: "constraint", sha256: "changed" },
  ]) {
    const snapshot = structuredClone(currentSnapshot);
    snapshot.files = snapshot.files.map((file) =>
      file.path === changedFile.path ? changedFile : file,
    );
    const result = evaluateAuditState({
      lifecycle,
      audit_records: [fullPass()],
      current_snapshot: snapshot,
      target_scope: targetScope,
      required_dimensions: requiredDimensions,
    });
    assert.equal(result.global_critic_passed, false);
    assert.match(result.records[0].reasons.join(" "), /snapshot changed/);
  }
});

test("legacy metadata and contradictory lifecycle state fail closed", () => {
  const legacyResult = evaluateAuditState({
    lifecycle,
    audit_records: [{ result: "PASS" }],
    current_snapshot: currentSnapshot,
    target_scope: targetScope,
    required_dimensions: requiredDimensions,
  });
  assert.equal(legacyResult.global_critic_passed, false);
  assert.match(legacyResult.records[0].reasons.join(" "), /missing workflow_version/);

  const conflictResult = evaluateAuditState({
    lifecycle: { state: "critic_passed", locked: { critic_passed: false } },
    audit_records: [fullPass()],
    current_snapshot: currentSnapshot,
    target_scope: targetScope,
    required_dimensions: requiredDimensions,
  });
  assert.equal(conflictResult.global_critic_passed, false);
  assert.equal(conflictResult.next_action, "resolve_lifecycle_conflict");

  const polishedConflict = evaluateAuditState({
    lifecycle: {
      state: "polished",
      locked: { critic_passed: true, polished: false },
    },
    audit_records: [fullPass()],
    current_snapshot: currentSnapshot,
    target_scope: targetScope,
    required_dimensions: requiredDimensions,
  });
  assert.equal(polishedConflict.global_critic_passed, false);
  assert.match(polishedConflict.lifecycle_conflicts.join(" "), /locked\.polished/);
});

test("explicit invalidation prevents report-file existence from skipping work", () => {
  const [invalidated] = invalidateAuditRecords([fullPass()], {
    reason: "approved prose revision",
    changed_paths: ["prose/1-1.md"],
    invalidated_at: "2026-09-10T12:00:00Z",
  });
  const result = evaluateAuditState({
    lifecycle,
    audit_records: [invalidated],
    current_snapshot: currentSnapshot,
    target_scope: targetScope,
    required_dimensions: requiredDimensions,
  });
  assert.equal(result.global_critic_passed, false);
  assert.match(result.records[0].reasons.join(" "), /invalidated/);
});
