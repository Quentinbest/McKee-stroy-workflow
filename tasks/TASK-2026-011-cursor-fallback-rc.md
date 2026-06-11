---
id: TASK-2026-011
title: Add Cursor fallback RC artifacts with documented schema exception
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
    - reports/**
    - dist/**
    - docs/agent/**
    - package.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-010
---

# Goal

Add Cursor RC artifacts using only verified manual fallback surfaces and record
the current plugin-schema compatibility exception explicitly.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `docs/agent/compatibility-ledger.md`
- `tasks/TASK-2026-010-codex-and-pi-rc-expansion.md`

# Inputs

- Existing package model, pilot projection, doctor, policy, and RC helpers
- Current official Cursor rules/skills/plugin documentation review

# Constraints

- Do not invent Cursor plugin manifest fields that are not verified from current official docs.
- Use `.cursor/skills/` and `rules/` manual fallback surfaces only.
- Keep native role installation disabled for Cursor in this phase.

# Deliverables

- Cursor pilot projections and RC artifacts
- Compatibility-ledger update documenting the plugin-schema exception
- Updated doctor, policy, CLI, and test coverage

# Acceptance Criteria

- [x] `dist/cursor/<package>/` is generated for the core and workflow pilots.
- [x] Cursor RC artifacts use `.cursor/skills/` and `rules/` without a fabricated plugin manifest.
- [x] Cursor workflow does not install native role adapters.
- [x] Compatibility docs record the manual fallback and plugin-schema exception.
- [x] `npm run skills:verify:fast` and `npm run agents:test:contracts` pass.

# Verification

```bash
node scripts/mckee-skills.mjs build --all
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `dist/cursor/**`
- `reports/package-doctor.json`
- `reports/rc-artifacts.json`
- `docs/agent/compatibility-ledger.md`

# Rollback

Revert the Cursor fallback artifacts, docs, tests, and generated outputs without
touching canonical Skills, Roles, or distribution contracts.

# Handoff

Task complete. Next valid actions: archive/export wrappers and release
automation, or later replacement of the fallback path once Cursor publishes a
stable plugin schema.
