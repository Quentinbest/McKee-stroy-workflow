---
id: TASK-2026-019
title: License the repository and authorize the GitHub RC publication
status: done
priority: high
owner: codex
created: 2026-06-11
updated: 2026-06-11
risk: high
approval_required:
  - publication
scope:
  allowed:
    - LICENSE
    - .gitignore
    - .github/workflows/**
    - docs/agent/**
    - tasks/**
    - scripts/**
    - tests/**
    - reports/**
    - dist/**
    - release-assets/**
    - README.md
    - MANUAL-ZH.md
    - NOVEL-WRITING-TUTORIAL-ZH.md
    - NOVEL-WRITING-TUTORIAL-ZH.html
    - TODOS.md
    - mckee-story-workflow-multi-agent-skill-packaging-implementation-plan-zh.md
    - package.json
    - schemas/**
    - src/**
    - .agents/**
    - .claude/**
    - .cursor/**
    - .opencode/**
    - generated-manifest.json
  forbidden:
    - stories/private/**
    - drafts/**
    - /Users/quentin/Writing/LLM-Wiki-Story/**
depends_on:
  - TASK-2026-018
---

# Goal

Apply a permissive open-source license, record the user's explicit GitHub RC
publication approval, and submit the verified project state to GitHub.

# Context

- The repository has no top-level license.
- Publication preflight requires an exact approved source commit.
- A committed approval file cannot contain its own commit hash without a
  controlled approval-only carrier commit.
- The user explicitly approved publication on 2026-06-11.

# Inputs

- MIT License text identified by SPDX as `MIT`
- Release version `1.0.0`
- GitHub RC ref `v1.0.0-rc.1`
- GitHub remote `Quentinbest/McKee-stroy-workflow`
- Existing deterministic RC assets

# Constraints

- Do not include private stories, populated personas, credentials, or the
  external McKee Wiki checkout.
- The approved source commit must contain the complete release payload.
- A later approval carrier commit may change only
  `reports/publication-approval.json`.
- Do not force-push or rewrite published history.
- External release creation must remain gated by publication preflight.

# Deliverables

- Top-level MIT `LICENSE`
- Commit-bound publication approval record
- Approval-only carrier commit validation
- Updated release state and workflow notes
- Verified Git commits pushed to the configured GitHub remote

# Acceptance Criteria

- [x] The repository contains a valid MIT License.
- [x] RC artifacts include the real license rather than a review placeholder.
- [x] Publication approval references the exact approved source commit.
- [x] Approval carrier validation rejects any additional changed path.
- [x] Publication preflight passes for `github-release` and `v1.0.0-rc.1`.
- [x] Full packaging, contract, security, documentation, and drift checks pass.
- [x] The verified commits are pushed to GitHub without force.

# Verification

```bash
npm run skills:verify:fast
npm run agents:test:contracts
npm run agents:test:security
npm run agents:lint
npm run agents:check-drift
node scripts/verify-publication-readiness.mjs \
  --target github-release \
  --ref v1.0.0-rc.1
git diff --check
```

# Evidence

- `LICENSE`
- `reports/publication-approval.json`
- `release-assets/manifest.json`
- Git commits on `origin/codex/cross-harness-agent-framework`

# Rollback

Revert the licensing and publication commits without force-pushing. Do not
delete or rewrite an externally created tag or release without explicit
approval.

# Handoff

The MIT license applies to the repository software and documentation as
distributed. Future publication approvals remain target-, ref-, commit-, and
time-scoped.
