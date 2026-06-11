---
id: TASK-2026-020
title: Repair clean-checkout RC generation and publish RC 2
status: done
priority: high
owner: codex
created: 2026-06-11
updated: 2026-06-11
risk: high
approval_required:
  - publication
scope:
  allowed:
    - .github/workflows/**
    - docs/agent/**
    - tasks/**
    - scripts/**
    - tests/**
    - reports/publication-approval.json
  forbidden:
    - src/skills/**
    - src/roles/**
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-019
---

# Goal

Fix the clean-checkout RC workflow failure without rewriting the published
`v1.0.0-rc.1` tag, then publish a verified replacement RC tag.

# Context

- GitHub run `27319586383` failed because archive generation assumed generated
  package report files already existed.
- Local verification passed only because those ignored reports were present
  from earlier commands.
- Publication carrier validation requires the approved source parent commit,
  while `actions/checkout` defaults to a one-commit shallow checkout.

# Inputs

- GitHub Actions failure logs
- Package model, pilot, doctor, RC, smoke, and archive writers
- Existing approval-only carrier validation

# Constraints

- Do not move or delete `v1.0.0-rc.1`.
- Archive generation must work from a clean checkout.
- Keep the baseline dependency-free and deterministic.
- The replacement approval must name the new source commit and `v1.0.0-rc.2`.

# Deliverables

- Self-contained archive report generation
- Clean generated-state regression test
- Sufficient checkout history for approval carrier validation
- Commit-bound RC 2 approval and GitHub tag

# Acceptance Criteria

- [x] Archive generation recreates every required report from source.
- [x] A regression test removes generated report inputs before building.
- [x] GitHub draft-release checkout includes the approved parent commit.
- [x] Local full verification and RC 2 publication preflight pass.
- [x] `v1.0.0-rc.2` is pushed without rewriting RC 1.

# Verification

```bash
npm run skills:verify:fast
npm run agents:test:contracts
npm run agents:test:security
npm run agents:lint
node scripts/verify-publication-readiness.mjs \
  --target github-release \
  --ref v1.0.0-rc.2
git diff --check
```

# Evidence

- `scripts/lib/archive-artifacts.mjs`
- `tests/integration/archive-artifacts.test.mjs`
- `.github/workflows/skills-rc.yml`
- GitHub Actions run for `v1.0.0-rc.2`

# Rollback

Revert the RC 2 commits without changing the immutable RC 1 tag or release
history.

# Handoff

Treat clean-checkout CI as authoritative for generated release artifacts.
