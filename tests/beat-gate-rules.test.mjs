import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  applyBeatGateRules,
  validateLedger,
  validatePolicy
} from "../skills/story-beat-gate/scripts/beat-gate-rules.mjs";

function readFixture(name) {
  return JSON.parse(fs.readFileSync(new URL(`./fixtures/beat-gate/${name}`, import.meta.url), "utf8"));
}

test("normal fixture applies deterministic AUTO patches", () => {
  const fixture = readFixture("normal.json");
  const result = applyBeatGateRules(fixture);
  assert.equal(result.review_items.length, 0);
  assert.equal(result.reject_items.length, 0);
  assert.deepEqual(
    result.patches.map((patch) => patch.rule_id),
    ["strip_authoring_comment", "locked_term_alias", "normalize_blank_lines"]
  );
  assert.equal(result.output_text, "He read the Scene Card twice.\n\nThen he opened the door.\n");
});

test("same input produces identical output", () => {
  const fixture = readFixture("normal.json");
  const first = applyBeatGateRules(fixture);
  const second = applyBeatGateRules(fixture);
  assert.deepEqual(second, first);
});

test("ambiguous mappings and malformed comments are reported without mutation", () => {
  const fixture = readFixture("ambiguous.json");
  const result = applyBeatGateRules(fixture);
  assert.equal(result.patches.length, 0);
  assert.ok(result.review_items.some((item) => item.code === "ambiguous_term_mapping"));
  assert.ok(result.review_items.some((item) => item.code === "malformed_authoring_comment"));
  assert.equal(result.output_text, fixture.candidate_text);
});

test("policy validation flags unknown AUTO rules without crashing", () => {
  const fixture = readFixture("ambiguous.json");
  const validation = validatePolicy(fixture.policy);
  assert.equal(validation.errors.length, 0);
  assert.ok(validation.warnings.some((item) => item.code === "unknown_rule"));
});

test("protected mappings are rejected before local AUTO application", () => {
  const fixture = readFixture("protected-field.json");
  const result = applyBeatGateRules(fixture);
  assert.equal(result.patches.length, 0);
  assert.ok(result.reject_items.some((item) => item.code === "protected_contract_overlap"));
});

test("protected fields cannot be silently accepted in the ledger", () => {
  const ledger = {
    version: "1.0.0",
    beats: [
      {
        beat_ref: "1",
        status: "accepted",
        writer_decision: null,
        deferred_to_batch_boundary: false,
        patches: [
          {
            rule_id: "locked_term_alias",
            original_text: "hide the wound",
            replacement_text: "ask for help",
            affected_dimensions: ["character_desire"]
          }
        ]
      }
    ]
  };
  const errors = validateLedger(ledger);
  assert.ok(errors.some((message) => message.includes("cannot be accepted without a writer decision")));
});

test("ledger allows explicit batch deferral", () => {
  const ledger = {
    version: "1.0.0",
    beats: [
      {
        beat_ref: "2",
        status: "accepted",
        writer_decision: "deferred_to_batch_boundary",
        deferred_to_batch_boundary: true,
        patches: []
      }
    ]
  };
  assert.deepEqual(validateLedger(ledger), []);
});
