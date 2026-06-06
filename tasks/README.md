# Task Contracts

Active tasks use `TASK-YYYY-NNN-title.md`. Completed and cancelled tasks move to
`archive/`. IDs never change or repeat.

## State Rules

- `proposed`: incomplete draft; not executable.
- `ready`: all required fields, scope, acceptance, verification, and rollback.
- `in_progress`: an owner has started work.
- `verification`: implementation is complete and checks are running.
- `review`: automated gates passed; awaiting review.
- `blocked`: evidence and smallest required decision are recorded.
- `done`: acceptance and evidence are complete.
- `cancelled`: reason and containment are recorded.
- `stale`: inputs or assumptions require revalidation.

Only legal transitions described in `docs/agent/task-contract.md` are allowed.

## Change and Approval Thresholds

| Change | Threshold | Requirement |
|---|---|---|
| Low | docs or <= 5 files, no contract/runtime change | normal review |
| Medium | 6-30 files, schema, generator, or compatibility change | rollback plus focused regression |
| High | > 30 files, permissions, broad migration, control plane | explicit phase plan and full verification |
| Critical | privacy, publication, destructive, external disclosure | explicit one-time human approval |

Network, dependency installation, extension/plugin execution, permission
changes, private-data access, deletion, and publication always require the
policy-defined approval regardless of file count.

Run `node scripts/verify-task-contracts.mjs` to validate active tasks and
fixtures.
