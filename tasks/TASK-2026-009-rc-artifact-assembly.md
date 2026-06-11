---
id: TASK-2026-009
title: Assemble installable RC artifacts for Claude and OpenCode pilots
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
  - TASK-2026-008
---

# Goal

Assemble deterministic installable RC directory artifacts for the Claude and
OpenCode pilot packages, with checksums and provenance metadata.

# Context

- `mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md`
- `tasks/TASK-2026-008-mckee-skills-cli.md`

# Inputs

- Pilot package artifacts under `scripts/lib/package-adapters.mjs`
- Package doctor and policy metadata
- Current repository Git commit

# Constraints

- Keep the artifact format dependency-free and offline-verifiable.
- Use host-native directory layouts under `dist/`.
- Include checksums and provenance for every distributed file.
- Do not add install-time lifecycle scripts or executable blobs.

# Deliverables

- RC artifact assembler
- RC verification script
- Dist outputs for Claude and OpenCode pilots
- Focused integration tests

# Acceptance Criteria

- [x] `dist/claude/<package>/` and `dist/opencode/<package>/` are generated.
- [x] Every RC artifact includes `package-manifest.json`, `checksums.txt`,
  `provenance.json`, `README.md`, and either the repository `LICENSE` or an
  explicit `LICENSE-REVIEW-REQUIRED.txt` internal-RC notice.
- [x] RC verification rejects missing checksum coverage.
- [x] `npm run skills:verify:fast` and `npm run agents:test:contracts` pass.

# Verification

```bash
node scripts/mckee-skills.mjs build --all
npm run skills:verify:fast
npm run agents:test:contracts
```

# Evidence

- `dist/claude/**`
- `dist/opencode/**`
- `reports/rc-artifacts.json`

# Rollback

Revert the RC assembler, verifier, tests, and generated `dist/` outputs without
touching canonical Skills, Roles, or distribution contracts.

# Handoff

Task complete. Next valid actions: host-specific schema tightening and, if
approved later, archive/export wrapping around these installable RC directories.
