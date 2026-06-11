---
id: TASK-2026-016
title: Enforce license and publication approval preflight
status: done
priority: high
owner: codex
created: 2026-06-11
updated: 2026-06-11
risk: high
approval_required: []
scope:
  allowed:
    - tasks/**
    - scripts/**
    - tests/**
    - schemas/**
    - docs/agent/**
    - .github/workflows/**
    - package.json
    - dist/**
    - reports/**
    - release-assets/**
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-015
---

# Goal

Fail closed before any RC asset is uploaded to an external release target unless
the repository has a real top-level license and a current, target-scoped human
publication approval.

# Context

- `.github/workflows/skills-rc.yml`
- `reports/human-release-review.json`
- `docs/agent/safety-and-permissions.md`
- `docs/agent/release-checklist.md`

# Inputs

- Current Git commit and release ref
- Top-level repository license
- Target-specific publication approval record

# Constraints

- Stable-release approval must not imply publication approval.
- Internal RC directory and archive builds must remain available.
- Missing, expired, mismatched, or malformed approvals must fail closed.
- Do not create or infer a license or publication approval.

# Deliverables

- Publication approval schema
- Dependency-free publication preflight
- Focused positive and negative tests
- GitHub draft-release gate
- Accurate license-review notice in internal RC artifacts
- Updated release documentation

# Acceptance Criteria

- [x] Preflight rejects a missing or placeholder top-level license.
- [x] Preflight rejects missing, expired, wrong-target, wrong-ref, and wrong-commit approvals.
- [x] Preflight accepts a complete approval scoped to the expected release assets.
- [x] Internal RC artifacts use a review notice rather than a misleading `LICENSE` filename when no license exists.
- [x] GitHub draft release runs only after the preflight passes.
- [x] Packaging, contract, documentation, and formatting checks pass.

# Verification

```bash
node --test tests/integration/publication-readiness.test.mjs
npm run skills:verify:fast
npm run agents:test:contracts
npm run agents:lint
git diff --check
```

# Evidence

- `schemas/publication-approval.schema.json`
- `scripts/verify-publication-readiness.mjs`
- `tests/integration/publication-readiness.test.mjs`
- `.github/workflows/skills-rc.yml`

# Rollback

Revert the publication-preflight changes without altering canonical Skills,
Roles, package classification, or existing human review evidence.

# Handoff

The repository owner must choose a license and create an explicit publication
approval record before the GitHub draft-release job can pass.
