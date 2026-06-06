# Release Checklist

## Technical Gates

- [x] Canonical contracts validate.
- [x] Generated adapters are idempotent and drift-free.
- [x] Security and privacy tests pass.
- [x] Documentation and HTML checks pass.
- [x] Five harness smoke checks pass.
- [x] Five-harness documentation and skill-change pilots pass.
- [x] Security approval-flow test passes.
- [x] At least three harnesses pass the synthetic story lifecycle pilot.
- [x] Clean-checkout verification passes.
- [x] Rollback point and recovery runbook exist.

## Human Gates

- [ ] Human literary quality review of a non-synthetic story lifecycle.
- [ ] Human operational usability review.
- [ ] Explicit stable-release approval.
- [ ] Explicit publication approval for any external target.

## Release Decision

`1.0.0-rc.1` is eligible. Stable `1.0.0` is not eligible until all human gates
are checked by an authorized owner.
