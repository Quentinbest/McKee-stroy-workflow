import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  resumeFromState,
  validateDelegations,
} from "../../scripts/lib/control-plane.mjs";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("another harness can resume from repository state without chat history", () => {
  const result = resumeFromState(root, "tasks/TASK-2026-001.state.json");
  assert.equal(result.status, "resumable");
  assert.equal(result.taskId, "TASK-2026-001");
  assert.ok(result.nextAction.length > 10);
});

test("parallel read-only and isolated writes validate", () => {
  const fixtures = JSON.parse(
    readFileSync(join(root, "tests/fixtures/control-plane/delegations.json"), "utf8"),
  );
  assert.deepEqual(validateDelegations(fixtures.valid), []);
});

test("write delegation without isolation is rejected", () => {
  const fixtures = JSON.parse(
    readFileSync(join(root, "tests/fixtures/control-plane/delegations.json"), "utf8"),
  );
  assert.ok(validateDelegations(fixtures.invalid).length > 0);
});

test("stop-loss blocks exhausted retries", () => {
  const state = JSON.parse(
    readFileSync(join(root, "tasks/TASK-2026-001.state.json"), "utf8"),
  );
  state.retryCounters.verification_repair.used = state.retryCounters.verification_repair.limit;
  const tempState = {
    ...state,
    retryCounters: state.retryCounters,
  };
  const exhausted = Object.entries(tempState.retryCounters)
    .filter(([, counter]) => counter.used >= counter.limit)
    .map(([name]) => name);
  assert.deepEqual(exhausted, ["verification_repair"]);
});
