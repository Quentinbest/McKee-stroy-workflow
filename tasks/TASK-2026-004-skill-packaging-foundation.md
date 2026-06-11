---
id: TASK-2026-004
title: Establish the multi-agent skill packaging foundation
status: done
priority: high
owner: codex
created: 2026-06-08
updated: 2026-06-08
risk: high
approval_required: []
scope:
  allowed:
    - docs/agent/**
    - tasks/**
    - schemas/**
    - scripts/**
    - src/distribution/**
    - package.json
    - tests/**
    - reports/**
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-001
---

# Goal

Create the first canonical packaging contract for multi-agent Skills so the repository can
build and validate package models before host-specific package generation begins.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `docs/agent/architecture.md`
- `docs/agent/repository-map.md`
- `docs/agent/decisions/ADR-0001-cross-harness-baseline.md`

# Inputs

- Canonical Skills under `src/skills/`
- Canonical Roles under `src/roles/`
- Existing dependency graph at `src/dependency-graph.json`
- Existing security policy at `config/security-policy.json`
- Existing deterministic generator at `scripts/lib/generator.mjs`

# Constraints

- Preserve existing canonical Skill and Role formats.
- Do not implement a cross-host installer in this phase.
- Keep the new distribution contract dependency-free and offline-verifiable.
- Do not modify generated adapters directly.

# Deliverables

- A durable ADR for v1 package-model decisions
- Canonical `src/distribution/packages.json`
- A matching schema and verification script
- A minimal package-model build script and focused tests
- Updated repository docs that recognize `src/distribution/`

# Acceptance Criteria

- [x] `ADR-0002` records the v1 packaging scope approved by engineering review.
- [x] `src/distribution/packages.json` classifies every canonical Skill exactly once.
- [x] Package verification rejects duplicate Skill IDs, missing canonical Skills, invalid conflicts, and invalid editions.
- [x] A build script materializes a deterministic package-model preview under `reports/`.
- [x] Repository contract checks include the new package distribution verification.

# Verification

```bash
npm run agents:test:contracts
npm run skills:verify:fast
```

# Evidence

- `docs/agent/decisions/ADR-0002-multi-agent-skill-packaging-v1.md`
- `src/distribution/packages.json`
- `reports/package-models.json`
- Command output from the verification commands

# Rollback

Revert the task files, ADR, package distribution contract, and related verification wiring in
one commit without touching canonical Skills or generated adapters.

# Handoff

Task complete. The next valid action is `TASK-2026-005`: implement pilot
package projection for `mck-gap-find` and `mck-setup-payoff` against Claude
Code and OpenCode.
