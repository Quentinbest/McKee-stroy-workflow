---
id: TASK-2026-006
title: Add capability and permission classification to pilot packages
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
    - docs/agent/**
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-005
---

# Goal

Project explicit capability and permission metadata into the Claude and OpenCode
pilot packages so each preview states which controls are native, runtime, or
advisory.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `config/security-policy.json`
- `docs/agent/safety-and-permissions.md`
- `tasks/TASK-2026-005-pilot-package-projection.md`

# Inputs

- `config/security-policy.json`
- Existing pilot package projection helpers under `scripts/lib/`
- Official Claude Code and OpenCode packaging constraints already reflected in the plan

# Constraints

- Keep the implementation dependency-free and deterministic.
- Limit host-native permission materialization to hosts with a documented config surface.
- Do not claim native enforcement where the host cannot actually provide it.
- Continue writing only preview artifacts under `reports/`.

# Deliverables

- A package policy helper that classifies capabilities and permissions
- Manifest metadata for native/runtime/advisory controls
- OpenCode permission fragment previews for pilot packages
- Focused tests for capability/permission projection

# Acceptance Criteria

- [x] Every pilot package manifest includes capability and permission metadata.
- [x] Every permission entry declares `native`, `runtime`, or `advisory`.
- [x] OpenCode pilot outputs include a reviewable `opencode.fragment.json`.
- [x] Claude pilot outputs do not claim unsupported native permission enforcement.
- [x] `npm run skills:verify:fast` and `npm run agents:test:contracts` pass.

# Verification

```bash
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `reports/package-pilots.json`
- `reports/package-pilots/**/package-manifest.json`
- `reports/package-pilots/opencode/**/opencode.fragment.json`

# Rollback

Revert the policy helper, manifest changes, test updates, and generated report
artifacts without touching canonical Skills, Roles, or distribution contracts.

# Handoff

Task complete. Next valid actions: package doctor/conflict detection, then
RC/installable artifact assembly.
