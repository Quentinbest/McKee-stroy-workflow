# Cross-Harness Migration Current State

Status date: 2026-06-06
Plan version: 1.0
Migration state: Phases 0-10 complete; authorized human review pending

## Authority

- The canonical execution plan is
  `mckee-story-workflow-cross-harness-agent-implementation-plan.md`.
- Canonical skills, roles, templates, and artifact contracts live in `src/`;
  legacy paths remain compatibility inputs only.
- The external McKee wiki is read-only to this repository and is located through
  `MCKEE_WIKI_ROOT`.
- Generated harness adapters are committed and must be changed only through
  canonical source plus `npm run agents:sync`.

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
| 3 | complete | Instructions and task contracts |
| 4 | complete | Skill, role, and artifact contracts |
| 5 | complete | Deterministic adapters and drift checks |
| 6 | complete | Enforced safety policy |
| 7 | complete | Full local and CI verification |
| 8 | complete | Resumable control plane |
| 9 | complete | Three native passes; Claude and Cursor capability exceptions approved |
| 10 | complete | Versioned governance baseline |

## Next Milestone

An authorized reviewer can now complete the literary and operational scorecard
using `docs/agent/human-review-scorecard.md` and
`reports/human-review-objective-evidence.json` before deciding whether to
promote `1.0.0-rc.1` to stable `1.0.0`.
