---
id: TASK-2026-015
title: Harden deterministic archive and release provenance
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
    - reports/**
    - release-assets/**
    - dist/**
    - .github/workflows/**
    - docs/agent/**
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-014
---

# Goal

Make RC archives byte-deterministic, inspect archive entries for unsafe paths,
and ensure release provenance accurately reports Git and license state.

# Context

- `scripts/lib/archive-artifacts.mjs`
- `scripts/lib/release-artifacts.mjs`
- `.github/workflows/skills-rc.yml`
- `docs/agent/release-checklist.md`

# Inputs

- Existing RC directories and package reports
- Current Git checkout
- Current repository license state

# Constraints

- Keep the implementation dependency-free.
- Do not weaken publication or license approval gates.
- Use the same archive implementation locally and in GitHub Actions.

# Deliverables

- Deterministic tar/gzip writer
- Archive entry and checksum inspection
- Worktree-safe Git provenance
- Explicit license-review provenance
- Updated RC workflow and tests

# Acceptance Criteria

- [x] Repeated archive builds produce identical SHA-256 hashes.
- [x] Archive verification rejects absolute paths, traversal paths, malformed headers, and unexpected entries.
- [x] Provenance records the current Git commit in normal checkouts and worktrees.
- [x] Missing repository license is represented as `review-required`.
- [x] GitHub RC workflow uses the repository archive command.
- [x] Packaging, contract, documentation, and formatting checks pass.

# Verification

```bash
node scripts/mckee-skills.mjs archive
npm run skills:verify:fast
npm run agents:test:contracts
npm run agents:lint
git diff --check
```

# Evidence

- `release-assets/manifest.json`
- `reports/archive-artifacts.json`
- `dist/**/provenance.json`

# Rollback

Revert the archive, provenance, workflow, test, and documentation changes
without touching canonical Skills, Roles, or distribution contracts.

# Handoff

External publication remains blocked until license review and hosted workflow
evidence are complete.
