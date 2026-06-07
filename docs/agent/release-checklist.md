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

- [x] Human literary quality review of a non-synthetic story lifecycle.
- [x] Human operational usability review.
- [x] Explicit stable-release approval.
- [ ] Explicit publication approval for any external target.

Execution protocol: `docs/agent/human-release-review.md`. Machine-readable
record: `reports/human-release-review.json`. Reviewer scorecard:
`docs/agent/human-review-scorecard.md`. Objective evidence:
`reports/human-review-objective-evidence.json`.

## Release Decision

Stable `1.0.0` is approved. External publication remains blocked until a
separate target-specific approval is recorded.
