---
id: TASK-2026-018
title: Validate host-native package installation in offline sandboxes
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
    - src/roles/**
    - scripts/**
    - tests/**
    - docs/agent/**
    - package.json
    - dist/**
    - reports/**
    - release-assets/**
    - .agents/**
    - .claude/**
    - .opencode/**
    - generated-manifest.json
  forbidden:
    - src/skills/**
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-017
---

# Goal

Prove that every generated edition can be installed, discovered, and removed
using the documented filesystem contract for Claude Code, Codex, Cursor, Pi,
and OpenCode without changing user configuration or using the network.

# Context

- `scripts/lib/package-adapters.mjs`
- `scripts/lib/release-artifacts.mjs`
- `dist/`
- Official host packaging and Skill discovery documentation reviewed on
  2026-06-11

# Inputs

- Three package edition definitions
- Five host projection strategies
- Fifteen generated RC artifacts
- Current official host packaging and discovery documentation

# Constraints

- Run installation simulations only in temporary directories.
- Do not invoke persistent host install commands or mutate user configuration.
- Use Node.js standard library only.
- Keep Codex packages inside a valid local marketplace root.
- Keep Pi package metadata aligned with the documented `pi.skills` contract.
- Repair canonical Role frontmatter only where required for native validation.

# Deliverables

- Offline install/discovery/uninstall smoke runner for all 15 projections
- Codex local marketplace RC layout
- Standards-compliant Pi package metadata
- Native frontmatter regression coverage
- Updated release documentation and generated evidence

# Acceptance Criteria

- [x] All 15 RC projections pass install, discovery, and uninstall checks.
- [x] Codex RCs are addressable from a local marketplace manifest.
- [x] Pi RCs declare `pi-package` and `pi.skills`.
- [x] All Claude RC plugins pass strict native validation when the local CLI is
      available.
- [x] Path traversal fixtures fail closed.
- [x] Full packaging, contract, security, documentation, and formatting checks
      pass.

# Verification

```bash
npm run skills:verify:fast
npm run skills:test:install
npm run agents:test:contracts
npm run agents:test:security
npm run agents:lint
claude plugin validate --strict dist/claude/mckee-story-core
claude plugin validate --strict dist/claude/mckee-story-workflow
claude plugin validate --strict dist/claude/mckee-story-wiki-maintainer
git diff --check
```

# Evidence

- `reports/package-install-smoke.json`
- `reports/rc-artifacts.json`
- `dist/codex/.agents/plugins/marketplace.json`

# Rollback

Remove the smoke runner and restore the previous per-package Codex directory
layout and Pi manifest fields. Revert only the frontmatter serialization change,
not the Role's semantic content.

# Handoff

Use `docs/agent/package-installation.md` and the generated package README files
for approved local installation. Keep persistent host installation and external
publication as explicit user-approved actions.
