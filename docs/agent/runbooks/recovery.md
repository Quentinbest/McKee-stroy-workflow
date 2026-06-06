# Runbook: Framework Recovery

Owner: framework
Last verified: 2026-06-06

## Trigger

Generated drift, broken contracts, failed migration, interrupted control-plane
state, or a corrupted adapter prevents normal execution.

## Procedure

1. Preserve Git status and identify unrelated user changes.
2. Run focused contract, drift, and security diagnostics.
3. Repair canonical source, never generated output directly.
4. Regenerate adapters and rerun the focused failure.
5. Run the full verification suite before resuming the task.

## Stop Conditions

Stop when repair would require destructive Git operations, private-data access,
network access, or scope beyond the active task.

## Rollback

Revert the affected phase commit or restore from
`cross-harness-pre-migration-20260606` in a new branch/worktree. Preserve user
changes.

## Evidence

Record root cause, files repaired, commands, generated diff, and residual risk.
