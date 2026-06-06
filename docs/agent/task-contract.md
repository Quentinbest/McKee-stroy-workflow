# Task Contract

Task files under `tasks/` are temporary, auditable execution state.

## States

`proposed -> ready -> in_progress -> verification -> review -> done`

Additional terminal or recovery states are `blocked`, `cancelled`, and `stale`.
Blocked work records evidence and the smallest required decision. Cancelled
work records the reason and containment. Stale tasks require revalidation before
resumption.

## Required Fields

- Stable ID, title, status, owner, dates, priority, and risk.
- Allowed and forbidden scope.
- Required approvals and dependencies.
- One measurable goal.
- Inputs, constraints, deliverables, acceptance criteria, and verification.
- Evidence, rollback, and handoff.

## Authority

A task may narrow repository permissions but cannot expand them. Conflicts with
`AGENTS.md`, schemas, or safety policy stop execution.

## Archival

Done and cancelled tasks move to `tasks/archive/` with final evidence. Active
task IDs are unique and immutable.
