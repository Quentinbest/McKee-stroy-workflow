import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resumeFromState,
  validateControlState,
  validateDelegations,
} from "./lib/control-plane.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const statePath = "tasks/TASK-2026-001.state.json";
const state = JSON.parse(readFileSync(join(root, statePath), "utf8"));
const failures = validateControlState(root, state);
const resume = resumeFromState(root, statePath);
if (resume.status !== "resumable") failures.push(...resume.errors);

const fixtures = JSON.parse(
  readFileSync(join(root, "tests/fixtures/control-plane/delegations.json"), "utf8"),
);
failures.push(...validateDelegations(fixtures.valid));
if (validateDelegations(fixtures.invalid).length === 0) {
  failures.push("invalid delegation fixture unexpectedly passed");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Control plane: PASS (${resume.taskId}, ${resume.currentPhase})`);
