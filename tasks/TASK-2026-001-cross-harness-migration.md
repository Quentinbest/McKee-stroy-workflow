---
id: TASK-2026-001
title: Implement the cross-harness agent framework
status: done
priority: critical
owner: codex
created: 2026-06-06
updated: 2026-06-07
risk: high
approval_required: []
scope:
  allowed:
    - AGENTS.md
    - CLAUDE.md
    - docs/**
    - src/**
    - schemas/**
    - scripts/**
    - tests/**
    - tasks/**
    - .agents/**
    - .claude/**
    - .cursor/**
    - .opencode/**
    - .codex/**
    - .pi/**
    - package.json
    - generated-manifest.json
    - opencode.jsonc
    - README.md
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on: []
---

# Goal

Implement every phase and acceptance gate in the canonical cross-harness plan.

# Context

- `mckee-story-workflow-cross-harness-agent-implementation-plan.md`
- `docs/agent/README.md`
- `docs/agent/decisions/ADR-0001-cross-harness-baseline.md`

# Inputs

- The 34 imported canonical skills, 27 roles, and 3 templates.
- Read-only wiki checkout at `/Users/quentin/Writing/LLM-Wiki-Story`.
- Node.js 20 or newer.

# Constraints

- Preserve unrelated worktree changes.
- Keep baseline tooling dependency-free and offline.
- Commit and verify each implementation phase.
- Do not modify the external wiki or private story data.

# Deliverables

- Canonical contracts, adapters, security controls, tests, CI, control plane,
  conformance evidence, and governance records.

# Acceptance Criteria

- [x] All Phase 0-10 deliverables and acceptance criteria pass.
- [x] Canonical and generated source is synchronized.
- [x] Full offline verification passes from a clean checkout.
- [x] Cross-harness exceptions and completed human evaluation are documented.
- [x] Final requirement-by-requirement evidence is recorded.

# Verification

```bash
npm run agents:verify
```

# Evidence

- Phase commits, `reports/completion-report.json`,
  `reports/conformance-pilots.json`, and `reports/acceptance-audit.json`.

# Rollback

Revert phase commits in reverse order or return to the
`cross-harness-pre-migration-20260606` tag without discarding unrelated work.

# Handoff

Operate stable `1.0.0` from `docs/agent/current-state.md` and the maintenance
calendar.
