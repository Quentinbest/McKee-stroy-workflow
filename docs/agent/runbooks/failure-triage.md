# Runbook: Verification Failure Triage

Owner: framework
Last verified: 2026-06-06

## Trigger

Any `agents:*` command exits nonzero.

## Procedure

1. Identify the first failing gate and preserve its exact output.
2. Re-run the narrow command directly.
3. Classify the root cause as instruction, contract, generation, security,
   compatibility, documentation, test fixture, or environment.
4. Repair canonical source or test logic. Never patch generated output directly.
5. Run the narrow check, then `npm run agents:verify`.
6. Record the root cause and regression evidence in the active task.

## Stop Conditions

Stop when the repair requires missing authorization, private data, network,
destructive actions, or an unavailable required service.

## Rollback

Revert only the failing phase commit or use the recovery runbook.
