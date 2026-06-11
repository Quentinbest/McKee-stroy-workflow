---
id: TASK-2026-008
title: Add dependency-free mckee-skills CLI entrypoint
status: done
priority: high
owner: codex
created: 2026-06-08
updated: 2026-06-08
risk: medium
approval_required: []
scope:
  allowed:
    - tasks/**
    - scripts/**
    - tests/**
    - package.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-007
---

# Goal

Expose the current packaging build, inspect, verify, and doctor capabilities
through a single dependency-free CLI entrypoint.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `tasks/TASK-2026-007-package-doctor-and-conflict-detection.md`

# Inputs

- Current package model, pilot package, and doctor helpers
- Existing deterministic build and verification scripts

# Constraints

- Keep the CLI dependency-free.
- Use current helper/report surfaces; do not invent unreconciled package state.
- Keep scope to the currently implemented Claude/OpenCode pilot.

# Deliverables

- `scripts/mckee-skills.mjs`
- Focused CLI smoke tests
- Package script wiring for direct CLI access

# Acceptance Criteria

- [x] `build` regenerates package model, pilot, and doctor reports.
- [x] `inspect` returns filtered package metadata for the current pilot hosts.
- [x] `verify` fails on bad filters and passes on the current repository state.
- [x] `doctor` emits the doctor report in JSON.

# Verification

```bash
node scripts/mckee-skills.mjs build --all
node scripts/mckee-skills.mjs inspect --target opencode --edition workflow
node scripts/mckee-skills.mjs verify --target claude --edition core
node scripts/mckee-skills.mjs doctor --scope project
npm run skills:verify:fast
```

# Evidence

- CLI command output from the verification commands

# Rollback

Revert the CLI entrypoint, tests, and package script wiring without touching the
underlying package helper modules.

# Handoff

Task complete. Next valid actions: RC/installable artifact assembly and
host-specific schema tightening beyond the current pilot.
