# Release Checklist

## Technical Gates

- [x] Canonical contracts validate.
- [x] Generated adapters are idempotent and drift-free.
- [x] Security and privacy tests pass.
- [x] Documentation and HTML checks pass.
- [x] Five harness smoke checks pass.
- [x] Five-harness native documentation and skill-change pilots pass or have
  approved capability exceptions.
- [x] Security approval-flow test passes.
- [x] At least three harnesses pass the synthetic story lifecycle pilot.
- [x] Clean-checkout verification passes.
- [x] Rollback point and recovery runbook exist.

## Human Gates

- [ ] Human literary quality review of a non-synthetic story lifecycle.
- [ ] Human operational usability review.
- [ ] Explicit stable-release approval.
- [ ] Explicit publication approval for any external target.

Execution protocol: `docs/agent/human-release-review.md`. Machine-readable
record: `reports/human-release-review.json`. Reviewer scorecard:
`docs/agent/human-review-scorecard.md`. Objective evidence:
`reports/human-review-objective-evidence.json`.

## Release Decision

`1.0.0-rc.1` is release-candidate eligible. Stable `1.0.0` remains blocked
until all human gates are completed by an authorized owner.
