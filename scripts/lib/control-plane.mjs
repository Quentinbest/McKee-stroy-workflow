import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function validateControlState(root, state) {
  const errors = [];
  const required = [
    "schemaVersion",
    "taskId",
    "revision",
    "status",
    "currentPhase",
    "lastCheckpoint",
    "nextAction",
    "retryCounters",
    "artifactLedger",
    "decisionLedger",
    "handoff",
  ];
  for (const field of required) if (!(field in state)) errors.push(`missing ${field}`);
  for (const [name, counter] of Object.entries(state.retryCounters ?? {})) {
    if (counter.used > counter.limit) errors.push(`${name} exceeds retry limit`);
  }
  for (const path of [state.artifactLedger, state.decisionLedger, state.handoff].filter(Boolean)) {
    if (!existsSync(join(root, path))) errors.push(`missing referenced state: ${path}`);
  }
  return errors;
}

export function resumeFromState(root, statePath) {
  const state = JSON.parse(readFileSync(join(root, statePath), "utf8"));
  const errors = validateControlState(root, state);
  if (errors.length) return { status: "blocked", errors };
  const exhausted = Object.entries(state.retryCounters)
    .filter(([, counter]) => counter.used >= counter.limit)
    .map(([name]) => name);
  if (exhausted.length) {
    return { status: "blocked", errors: [`retry limit reached: ${exhausted.join(", ")}`] };
  }
  return {
    status: "resumable",
    taskId: state.taskId,
    currentPhase: state.currentPhase,
    checkpoint: state.lastCheckpoint,
    nextAction: state.nextAction,
  };
}

export function validateDelegations(envelopes) {
  const errors = [];
  for (const envelope of envelopes) {
    if (envelope.mode === "scoped_write" && !envelope.worktree) {
      errors.push(`${envelope.id}: scoped writes require a worktree`);
    }
    if (envelope.mode === "read_only" && envelope.worktree) {
      errors.push(`${envelope.id}: read-only work should not require a worktree`);
    }
  }
  const writes = envelopes.filter((envelope) => envelope.mode === "scoped_write");
  for (let left = 0; left < writes.length; left += 1) {
    for (let right = left + 1; right < writes.length; right += 1) {
      const overlap = writes[left].allowedPaths.some((path) => writes[right].allowedPaths.includes(path));
      if (overlap && writes[left].worktree === writes[right].worktree) {
        errors.push(`${writes[left].id}/${writes[right].id}: overlapping writes share a worktree`);
      }
    }
  }
  return errors;
}
