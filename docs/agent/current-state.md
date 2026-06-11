# Cross-Harness Migration Current State

Status date: 2026-06-11
Plan version: 1.0
Migration state: Phases 0-10 complete; stable 1.0.0 approved; packaging RC extension implemented

## Authority

- The canonical execution plan is
  `mckee-story-workflow-cross-harness-agent-implementation-plan.md`.
- Canonical skills, roles, templates, and artifact contracts live in `src/`;
  legacy paths remain compatibility inputs only.
- The external McKee wiki is read-only to this repository and is located through
  `MCKEE_WIKI_ROOT`.
- Generated harness adapters are committed and must be changed only through
  canonical source plus `npm run agents:sync`.
- Package projections, RC directories, and archive exports are generated from
  canonical source plus `node scripts/mckee-skills.mjs build --all`.

## Baseline

| Area | Count | Current disposition |
|---|---:|---|
| Skills | 34 | Migrate to `src/skills/` |
| Agent role prompts | 27 | Migrate to `src/roles/` |
| Templates | 3 | Migrate to `src/templates/` |
| Wiki files | 461 | External, read-only dependency |
| Harnesses | 5 | Claude, Cursor, Pi, OpenCode, Codex |
| Package editions | 3 | `core`, `workflow`, `wiki-maintainer` |
| Full package projections | 15 | 3 editions across 5 supported hosts |
| RC hosts implemented | 5 | Claude, Cursor fallback, Pi, OpenCode, Codex |

The migration rollback point is the Git tag
`cross-harness-pre-migration-20260606`.

## Known Debt

- Seven legacy role prompts have same-named skill replacements.
- Wiki references assume a sibling repository or story-project-local `wiki/`.
- Several referenced wiki paths are optional, historical aliases, globs, or
  output templates rather than guaranteed files.
- Existing frontmatter is Claude-oriented and does not yet express the full
  long-term cross-host package contract directly in source; projection still
  happens at generation time.
- Cursor native plugin schema is still treated as a compatibility exception; the
  current RC path uses `.cursor/skills/` plus `.cursor/rules/` fallback rather than a
  generated plugin manifest.
- GitHub RC automation is defined but still needs a real hosted run for
  execution evidence.
- The repository uses the MIT License. GitHub RC publication remains
  mechanically scoped to the approved ref, source commit, assets, and approval
  validity window recorded in `reports/publication-approval.json`.

## Package State

- The two-Skill pilot remains under `reports/package-pilots/` for focused
  regression evidence.
- Full RC projections are generated under `reports/package-artifacts/` and
  `dist/`.
- `core` contains 20 Skills.
- `workflow` contains 33 Skills and excludes Wiki-maintenance authority.
- `wiki-maintainer` contains only `wiki-librarian`; external Wiki writes remain
  default-deny and require explicit runtime authorization.

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

Push the verified RC source and approval carrier commit, then collect hosted CI
evidence for the GitHub draft release. Future external publication still
requires separate target-specific approval.
