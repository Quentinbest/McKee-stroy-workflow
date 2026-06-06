# Cross-Harness Migration Current State

Status date: 2026-06-06
Plan version: 1.0
Migration state: Phase 2 complete; Phase 3 next

## Authority

- The canonical execution plan is
  `mckee-story-workflow-cross-harness-agent-implementation-plan.md`.
- Existing `skills/`, `agents/`, and `templates/` content is legacy source until
  it is imported into `src/`.
- The external McKee wiki is read-only to this repository and is located through
  `MCKEE_WIKI_ROOT`.
- Generated harness adapters do not yet exist and must not be authored manually.

## Baseline

| Area | Count | Current disposition |
|---|---:|---|
| Skills | 34 | Migrate to `src/skills/` |
| Agent role prompts | 27 | Migrate to `src/roles/` |
| Templates | 3 | Migrate to `src/templates/` |
| Wiki files | 461 | External, read-only dependency |
| Harnesses | 5 | Claude, Cursor, Pi, OpenCode, Codex |

The migration rollback point is the Git tag
`cross-harness-pre-migration-20260606`.

## Known Debt

- Seven legacy role prompts have same-named skill replacements.
- Wiki references assume a sibling repository or story-project-local `wiki/`.
- Several referenced wiki paths are optional, historical aliases, globs, or
  output templates rather than guaranteed files.
- Existing frontmatter is Claude-oriented and does not express the complete
  canonical skill or role contract.
- The repository has no package scripts, schemas, deterministic generator, CI,
  or cross-harness smoke tests.
- Cursor CLI is not installed in the current verification environment.

## Migration Dashboard

| Phase | State | Exit evidence |
|---:|---|---|
| 0 | complete | Inventory, mappings, compatibility baseline, ADR |
| 1 | complete | Canonical source and provenance |
| 2 | complete | Complete `docs/agent/` context |
| 3 | pending | Instructions and task contracts |
| 4 | pending | Skill, role, and artifact contracts |
| 5 | pending | Deterministic adapters and drift checks |
| 6 | pending | Enforced safety policy |
| 7 | pending | Full local and CI verification |
| 8 | pending | Resumable control plane |
| 9 | pending | Cross-harness conformance evidence |
| 10 | pending | Versioned governance baseline |

## Next Milestone

Complete Phase 0, then import legacy source without changing its creative
semantics.
