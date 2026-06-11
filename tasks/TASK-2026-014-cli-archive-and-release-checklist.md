---
id: TASK-2026-014
title: Expose archive export in CLI and document RC release path
status: done
priority: medium
owner: codex
created: 2026-06-09
updated: 2026-06-09
risk: low
approval_required: []
scope:
  allowed:
    - tasks/**
    - scripts/**
    - tests/**
    - docs/agent/**
    - package.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-013
---

# Goal

Expose local archive export through the main packaging CLI and update the release
checklist to reflect the RC packaging path now implemented in the repository.

# Context

- `scripts/mckee-skills.mjs`
- `docs/agent/release-checklist.md`
- `tasks/TASK-2026-013-local-archive-export.md`

# Inputs

- Existing archive builder and verifier
- Existing RC release workflow and RC directory outputs

# Constraints

- Keep the change dependency-free and documentation-accurate.
- Do not change package semantics or release policy.

# Deliverables

- CLI `archive` command
- CLI test coverage for archive export
- Release checklist updates for RC build/archive workflow

# Acceptance Criteria

- [x] `node scripts/mckee-skills.mjs archive` builds and verifies local archive assets.
- [x] CLI tests cover the new archive command.
- [x] Release checklist reflects RC directories, local tarball export, and hosted RC workflow evidence.

# Verification

```bash
node scripts/mckee-skills.mjs archive
npm run skills:verify:fast
npm run agents:test:contracts
npm run agents:lint
```

# Evidence

- CLI command output
- `docs/agent/release-checklist.md`

# Rollback

Revert the CLI/archive wiring and checklist updates without touching package generation logic.

# Handoff

Task complete. Archive export is reachable from the main CLI and release docs match current behavior.
