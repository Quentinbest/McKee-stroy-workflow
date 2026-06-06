# Runbook: Resume an Interrupted Task

Owner: framework
Last verified: 2026-06-06

## Procedure

1. Read root/scoped instructions and the active task Markdown.
2. Read the matching `tasks/TASK-*.state.json`.
3. Verify referenced artifact, decision, and handoff ledgers exist.
4. Inspect Git status and the last checkpoint evidence.
5. Confirm no retry counter has reached its limit.
6. Execute `nextAction`; do not infer hidden chat context.
7. Increment revision and update checkpoint, evidence, handoff, and ledgers.

## Stop Conditions

Declare blocked when a referenced artifact is missing, a retry limit is
reached, the worktree contradicts the checkpoint, or required approval is
absent.
