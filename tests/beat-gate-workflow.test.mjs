import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { applyBeatGateRules, validateLedger } from "../skills/story-beat-gate/scripts/beat-gate-rules.mjs";

function readFixture(name) {
  return JSON.parse(fs.readFileSync(new URL(`./fixtures/beat-gate/${name}`, import.meta.url), "utf8"));
}

test("normal workflow reaches one-summary one-decision contract state", () => {
  const input = readFixture("normal.json");
  const result = applyBeatGateRules(input);
  const ledger = {
    version: "1.0.0",
    beats: [
      {
        beat_ref: "1",
        status: "accepted",
        writer_decision: "accept",
        deferred_to_batch_boundary: false,
        patches: result.patches
      }
    ]
  };
  assert.deepEqual(validateLedger(ledger), []);
  assert.equal(result.review_items.length, 0);
  assert.equal(result.reject_items.length, 0);
});

test("protected-field workflow stays reject-only", () => {
  const input = readFixture("protected-field.json");
  const result = applyBeatGateRules(input);
  assert.equal(result.patches.length, 0);
  assert.ok(result.reject_items.some((item) => item.code === "protected_contract_overlap"));
});

test("non-convergent fixture escalates after diversity round", () => {
  const fixture = readFixture("non-convergent.json");
  const last = fixture.history.at(-1);
  assert.equal(fixture.current_round, 2);
  assert.equal(last.action, "diversity_required");
  assert.equal(fixture.next_expected, "upstream_or_human");
});

test("rolling window fixture writes only under rolling outputs", () => {
  const fixture = readFixture("rolling-window.json");
  assert.equal(fixture.advisory_only, true);
  assert.ok(fixture.expected_outputs.every((file) => file.includes("/audit/rolling/")));
});
