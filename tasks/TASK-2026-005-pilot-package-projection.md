---
id: TASK-2026-005
title: Build Claude and OpenCode pilot package projections
status: done
priority: high
owner: codex
created: 2026-06-08
updated: 2026-06-08
risk: high
approval_required: []
scope:
  allowed:
    - tasks/**
    - scripts/**
    - tests/**
    - reports/**
    - package.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-004
---

# Goal

Project the first two pilot Skills into deterministic Claude Code and OpenCode
package previews without changing canonical Skill or Role source formats.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `docs/agent/decisions/ADR-0002-multi-agent-skill-packaging-v1.md`
- `tasks/TASK-2026-004-skill-packaging-foundation.md`

# Inputs

- `src/distribution/packages.json`
- Canonical Skills under `src/skills/`
- Canonical Roles under `src/roles/`
- Existing adapter projections in `scripts/lib/generator.mjs`

# Constraints

- Limit pilot Skills to `mck-gap-find` and `mck-setup-payoff`.
- Limit native host projections to Claude Code and OpenCode.
- Keep outputs under `reports/` for this phase; do not publish or install.
- Reuse existing adapter projection logic where possible.
- Do not modify generated adapters directly.

# Deliverables

- Host projection helper for pilot packages
- Deterministic report outputs for Claude and OpenCode pilot packages
- Focused pilot verification script and integration tests
- Updated package scripts that include pilot verification

# Acceptance Criteria

- [x] `mckee-story-core` pilot projects only `mck-gap-find`.
- [x] `mckee-story-workflow` pilot projects `mck-gap-find` and `mck-setup-payoff`.
- [x] Claude pilot output uses plugin-style `skills/` layout and includes Roles only for the workflow package.
- [x] OpenCode pilot output uses discoverable Skills plus native agent overlays for the workflow package.
- [x] Pilot projections are deterministic and include per-package file manifests.
- [x] `npm run skills:verify:fast` passes with the new pilot stage.

# Verification

```bash
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `reports/package-pilots.json`
- `reports/package-pilots/**`
- Command output from the verification commands

# Rollback

Revert the pilot projection scripts, tests, package script wiring, and generated
report outputs without touching canonical Skills, Roles, or existing adapters.

# Handoff

Task complete. Next valid actions: add capability/permission classification and
then move the pilot projections from report previews into installable RC
artifacts.
