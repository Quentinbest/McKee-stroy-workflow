---
id: TASK-2026-002
title: Run native cross-harness conformance pilots
status: done
priority: critical
owner: codex
created: 2026-06-06
updated: 2026-06-06
risk: high
approval_required: []
scope:
  allowed:
    - native-pilot/**
    - src/skills/mck-gap-find/SKILL.md
    - .agents/skills/mck-gap-find/SKILL.md
    - .claude/skills/mck-gap-find/SKILL.md
    - generated-manifest.json
    - reports/compatibility-report.json
  forbidden:
    - drafts/**
    - stories/private/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-001
---

# Goal

Prove actual native harness behavior for the five Phase 9 pilot scenarios.

# Context

- `mckee-story-workflow-cross-harness-agent-implementation-plan.md`
- `docs/agent/harness-compatibility.md`
- `config/security-policy.json`

# Inputs

- A detached clean worktree for each harness.
- `tests/fixtures/story/minimal-lifecycle.json`.
- Canonical skill `src/skills/mck-gap-find/SKILL.md`.

# Constraints

- Each harness runs in a separate disposable worktree.
- Do not read or modify forbidden paths.
- Do not publish, install dependencies, add plugins, or use destructive Git.
- Native outputs must be verified externally before acceptance.
- Cursor may use a documented capability exception because its CLI is absent.

# Deliverables

- Per-harness documentation discovery evidence.
- A canonical skill edit with synchronized adapters.
- A security refusal record.
- A read-only audit report.
- A complete seed-to-revision artifact chain.
- Native CLI logs, timing, exit status, and externally verified results.

# Acceptance Criteria

- [x] Claude, Pi, OpenCode, and Codex pass all five native pilot scenarios or
  have an approved capability exception.
- [x] Cursor has a documented capability exception with deterministic fallback.
- [x] At least three native harnesses complete the full story lifecycle.
- [x] At least one lifecycle uses the single-agent-only baseline.
- [x] No passing harness reads forbidden data or leaves unapproved changes.
- [x] Native pilot evidence replaces the prior simulation-only completion claim.

# Verification

```bash
node scripts/verify-native-pilot.mjs <worktree> <harness>
```

# Evidence

- `reports/native-conformance-pilots.json`
- Redacted per-harness CLI logs under `reports/native-pilots/`.

Claude returned HTTP 401 despite reporting an active Pro login. On 2026-06-06,
the project owner explicitly approved ignoring the Claude subscription
configuration. Deterministic Claude checks remain the accepted fallback.

# Rollback

Remove disposable worktrees and revert only the native-pilot evidence commit.

# Handoff

Update the Phase 9 and release audits from externally verified native results.
