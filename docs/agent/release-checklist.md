# Release Checklist

## Technical Gates

- [x] Canonical contracts validate.
- [x] Generated adapters are idempotent and drift-free.
- [x] Package RC directories build deterministically for the current supported hosts.
- [x] All three editions generate across all five supported hosts.
- [x] All 15 projections pass isolated install, discovery, and uninstall smoke checks.
- [x] Codex projections form a valid local marketplace bundle.
- [x] Pi projections declare the documented `pi.skills` package metadata.
- [x] Workflow RCs exclude Wiki-maintenance authority.
- [x] Wiki-maintainer RCs contain only the Wiki Librarian capability.
- [x] Local RC tarball export (`release-assets/`) builds and verifies.
- [x] Repeated local archive builds produce identical SHA-256 hashes.
- [x] Archive inspection rejects unsafe or unexpected entries.
- [ ] Hosted RC workflow (`skills-rc.yml`) has at least one successful execution record.
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
- [x] Explicit publication approval for GitHub RC `v1.0.0-rc.2`.
- [x] Top-level repository license review is complete: MIT.
- [x] External release commands fail closed without both gates.

Execution protocol: `docs/agent/human-release-review.md`. Machine-readable
record: `reports/human-release-review.json`. Reviewer scorecard:
`docs/agent/human-review-scorecard.md`. Objective evidence:
`reports/human-review-objective-evidence.json`.

## Release Decision

Stable `1.0.0` is approved. GitHub RC `v1.0.0-rc.2` is separately authorized
through a commit-bound approval record. Any other target, ref, source commit,
or publication window requires a new approval.

## RC Packaging Notes

- Installable RC directories are generated under `dist/`.
- Codex RCs are nested under `dist/codex/plugins/` and indexed by
  `dist/codex/.agents/plugins/marketplace.json`.
- Full package projections are generated under `reports/package-artifacts/`;
  the approved two-Skill pilot remains under `reports/package-pilots/`.
- Portable local RC tarballs are generated under `release-assets/`.
- The canonical local command path is:

```bash
node scripts/mckee-skills.mjs build --all
node scripts/mckee-skills.mjs archive
npm run skills:test:install
```

- The hosted RC workflow is `.github/workflows/skills-rc.yml`.
- Publication approval requirements are defined in
  `docs/agent/publication-approval.md`.
- RC directories contain the reviewed top-level MIT `LICENSE` and provenance
  reports `licenseStatus: included`.
- Host installation commands mutate host or project configuration and are not
  run by baseline verification. The deterministic smoke runner uses temporary
  directories only; see `reports/package-install-smoke.json`.
