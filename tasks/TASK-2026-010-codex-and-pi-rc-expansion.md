---
id: TASK-2026-010
title: Expand pilot RC artifacts to Codex and Pi
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
    - package.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-009
---

# Goal

Extend the current pilot RC assembly from Claude/OpenCode to Codex and Pi using
the already-approved v1 packaging constraints for those hosts.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `tasks/TASK-2026-009-rc-artifact-assembly.md`

# Inputs

- Existing package model, pilot projection, policy, doctor, and RC helpers
- Host-specific constraints already approved for Codex and Pi

# Constraints

- Keep the pilot skill set unchanged.
- Codex ships Skills only in v1.
- Pi ships Skills plus role reference cards, not native extensions.
- Do not add Cursor artifacts in this phase.

# Deliverables

- Codex pilot projections and RC artifacts
- Pi pilot projections and RC artifacts
- Updated doctor, policy, CLI, and test coverage

# Acceptance Criteria

- [x] `dist/codex/<package>/` is generated for the core and workflow pilots.
- [x] `dist/pi/<package>/` is generated for the core and workflow pilots.
- [x] Codex workflow does not install native role adapters.
- [x] Pi workflow includes role reference cards for fallback.
- [x] `npm run skills:verify:fast` and `npm run agents:test:contracts` pass.

# Verification

```bash
node scripts/mckee-skills.mjs build --all
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `dist/codex/**`
- `dist/pi/**`
- `reports/package-pilots.json`
- `reports/package-doctor.json`
- `reports/rc-artifacts.json`

# Rollback

Revert the Codex/Pi adapter expansion, tests, and generated outputs without
touching canonical Skills, Roles, or distribution contracts.

# Handoff

Task complete. Next valid actions: Cursor host tightening, then optional
archive/export wrappers and release workflow automation.
