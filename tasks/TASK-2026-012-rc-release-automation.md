---
id: TASK-2026-012
title: Add RC release workflow automation for skill packages
status: done
priority: medium
owner: codex
created: 2026-06-08
updated: 2026-06-08
risk: medium
approval_required: []
scope:
  allowed:
    - tasks/**
    - .github/workflows/**
    - docs/agent/**
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-011
---

# Goal

Automate RC build/export for the generated skill package artifacts without
changing the repository’s deterministic package semantics.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- existing `.github/workflows/agent-framework.yml`
- `tasks/TASK-2026-011-cursor-fallback-rc.md`

# Inputs

- Verified `node scripts/mckee-skills.mjs build --all`
- Generated `dist/` and `reports/` outputs

# Constraints

- Reuse the repository’s existing deterministic build and verification commands.
- Do not publish stable releases automatically.
- Restrict release creation to RC tags and draft mode.

# Deliverables

- A GitHub Actions RC workflow
- Artifact upload for `dist/` and package reports
- Draft release creation for RC tags

# Acceptance Criteria

- [x] Workflow runs package verification and RC build on demand.
- [x] Workflow uploads `dist/` and package report artifacts.
- [x] RC tag builds create a draft GitHub release with tarball assets.

# Verification

- Workflow YAML review
- Existing local commands remain green:

```bash
node scripts/mckee-skills.mjs build --all
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `.github/workflows/skills-rc.yml`

# Rollback

Revert the RC workflow file without touching package generation logic.

# Handoff

Task complete. Next valid actions: optional local archive helper scripts or
stable-release promotion rules after human approval.
