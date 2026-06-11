---
id: TASK-2026-017
title: Expand RCs to full package projections and isolate Wiki authority
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
    - docs/agent/**
    - package.json
    - dist/**
    - reports/**
    - release-assets/**
  forbidden:
    - src/skills/**
    - src/roles/**
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-016
---

# Goal

Generate complete RC packages for all three editions and all five supported
hosts while retaining the two-Skill pilot evidence and preventing ordinary
packages from carrying Wiki-maintenance authority.

# Context

- `src/distribution/packages.json`
- `scripts/lib/package-adapters.mjs`
- `scripts/lib/release-artifacts.mjs`
- `scripts/lib/package-doctor.mjs`

# Inputs

- 34 classified canonical Skills
- 27 canonical Roles
- Three package models
- Five host adapter strategies

# Constraints

- Keep pilot evidence available as a separate test projection.
- Do not modify canonical Skill or Role content.
- `workflow` must exclude the `wiki-librarian` Role.
- `wiki-maintainer` must contain only the `wiki-librarian` Skill and Role
  capability.
- Preserve Codex and Cursor in-context/manual Role fallback decisions.

# Deliverables

- Full 15-projection package artifact builder
- Full package reports and RC directories
- Wiki-authority isolation tests
- Updated doctor, archive, CLI, and documentation

# Acceptance Criteria

- [x] Full projections produce 15 target × edition artifacts.
- [x] Core contains 20 Skills, workflow 33 Skills, and wiki-maintainer 1 Skill.
- [x] Workflow packages do not contain the `wiki-librarian` Role.
- [x] Wiki-maintainer packages do not contain ordinary workflow Roles or Skills.
- [x] Pilot reports remain deterministic and limited to the approved two Skills.
- [x] RC, doctor, archive, contract, security, documentation, and formatting checks pass.

# Verification

```bash
npm run skills:verify:fast
npm run agents:test:contracts
npm run agents:test:security
npm run agents:lint
git diff --check
```

# Evidence

- `reports/package-artifacts.json`
- `reports/package-pilots.json`
- `reports/rc-artifacts.json`
- `dist/`

# Rollback

Revert the full-projection builder and restore pilot-only RC generation without
changing canonical Skills, Roles, or package classification.

# Handoff

Use the full RC matrix for native installation checks. Keep external
publication blocked until license, target-specific approval, and hosted
workflow evidence are complete.
