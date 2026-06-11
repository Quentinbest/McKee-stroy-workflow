---
id: TASK-2026-013
title: Add local archive export wrappers for RC artifacts
status: done
priority: medium
owner: codex
created: 2026-06-09
updated: 2026-06-09
risk: medium
approval_required: []
scope:
  allowed:
    - tasks/**
    - scripts/**
    - tests/**
    - reports/**
    - release-assets/**
    - package.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-012
---

# Goal

Provide deterministic local tarball export wrappers for the generated RC
artifacts so local release preparation matches the GitHub RC workflow layout.

# Context

- `.github/workflows/skills-rc.yml`
- `tasks/TASK-2026-012-rc-release-automation.md`

# Inputs

- Verified `dist/` outputs from `node scripts/mckee-skills.mjs build --all`
- package reports under `reports/`

# Constraints

- Keep the export helper dependency-free.
- Reuse the same asset split as the RC workflow: one tarball for `dist/`, one
  tarball for package reports.
- Include archive checksums and a manifest.

# Deliverables

- Local archive builder and verifier
- Archive manifest and checksums
- Focused integration tests

# Acceptance Criteria

- [x] Local export writes `release-assets/dist.tar.gz` and `release-assets/reports.tar.gz`.
- [x] Export writes an archive manifest with SHA-256 hashes.
- [x] Archive verification rejects missing assets or missing checksum metadata.
- [x] `npm run skills:verify:fast` and `npm run agents:test:contracts` pass.

# Verification

```bash
node scripts/build-archive-artifacts.mjs
node scripts/verify-archive-artifacts.mjs
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `release-assets/dist.tar.gz`
- `release-assets/reports.tar.gz`
- `reports/archive-artifacts.json`

# Rollback

Revert the local archive helper, tests, and generated release assets without
touching RC directory assembly or workflow automation.

# Handoff

Task complete. The local export wrappers now match the RC workflow asset shape.
