---
id: TASK-2026-007
title: Add package doctor and edition conflict detection
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
  - TASK-2026-006
---

# Goal

Generate a deterministic doctor report that detects invalid `core` and
`workflow` coexistence and checks required host config fragments for the pilot
package set.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `src/distribution/packages.json`
- `tasks/TASK-2026-006-capability-and-permission-classification.md`

# Inputs

- `src/distribution/packages.json`
- Pilot package artifacts from `scripts/lib/package-adapters.mjs`

# Constraints

- Keep the doctor dependency-free and read-only.
- Emit user-visible recovery steps for every failing scope.
- Do not require native installation or host authentication in this phase.

# Deliverables

- A package doctor helper and report writer
- A doctor verification script
- Focused integration tests for conflict detection

# Acceptance Criteria

- [x] Doctor emits passing single-package scopes for the current pilot hosts.
- [x] Doctor emits failing `core + workflow` scopes with recovery guidance.
- [x] Doctor checks required host config fragments.
- [x] `npm run skills:verify:fast` and `npm run agents:test:contracts` pass.

# Verification

```bash
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `reports/package-doctor.json`
- Command output from the verification commands

# Rollback

Revert the doctor helper, verifier, tests, and generated reports without
touching canonical Skills, Roles, or distribution contracts.

# Handoff

Task complete. Next valid actions: unify build/inspect/verify/doctor behind a
single dependency-free CLI entrypoint, then assemble RC/installable artifacts.
