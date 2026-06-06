# Repository Inventory

Inventory date: 2026-06-06

## Source Classification

| Path | Classification | Owner | Migration disposition |
|---|---|---|---|
| `skills/*/SKILL.md` | legacy canonical candidate | domain | import to `src/skills/` |
| `agents/*.md` | legacy role source | domain | import to `src/roles/` |
| `templates/*` | legacy template source | framework | import to `src/templates/` |
| `README.md`, `MANUAL*.md`, `story-plan.md` | published documentation | maintainers | retain and update |
| `mckee-story-workflow-cross-harness-agent-implementation-plan.md` | canonical migration plan | framework | retain |
| `docs/agent/**` | canonical agent context | framework | create and maintain |
| `.agents/**`, `.claude/**`, `.cursor/**`, `.opencode/**` | generated adapters | generator | regenerate only |
| `.codex/**`, `.pi/**`, `opencode.jsonc` | runtime adapters | framework/security | reviewed, minimal |
| `/Users/quentin/Writing/LLM-Wiki-Story/wiki/**` | external read-only domain source | wiki repository | resolve through `MCKEE_WIKI_ROOT` |
| `drafts/**`, `stories/private/**`, persona files | private runtime data | story owner | excluded by default |

## Skills

The 34 legacy skill IDs are:

`act-designer`, `arc-tracer`, `composition-conductor`,
`controlling-idea-architect`, `exposition-smuggler`, `key-image-curator`,
`mck-arc-walk`, `mck-beat-to-prose`, `mck-controlling-idea`,
`mck-crisis-dilemma`, `mck-exposition-ammo`, `mck-gap-find`, `mck-honesty`,
`mck-image-thread`, `mck-negation-of-negation`, `mck-setup-payoff`,
`mck-specificity-forge`, `mck-subtext-5layer`, `mck-surprise-plant`,
`mck-voice-first`, `story-act`, `story-audit`, `story-cast`, `story-new`,
`story-persona`, `story-premise`, `story-publish`, `story-revise`,
`story-scene`, `story-spine`, `story-status`, `story-stop-loss`,
`story-tournament`, and `wiki-librarian`.

All are active and will migrate. None is classified as private.

## Roles

The 27 legacy role IDs are:

`act-designer`, `antagonism-stress-tester`, `arc-tracer`, `beat-miner`,
`cast-balancer`, `character-forger`, `cliche-hunter`,
`composition-conductor`, `continuity-supervisor`,
`controlling-idea-architect`, `crisis-climax-auditor`,
`exposition-smuggler`, `genre-cartographer`, `key-image-curator`,
`pacing-analyst`, `premise-prospector`, `prose-drafter`,
`reader-simulator`, `scene-architect`, `setting-surveyor`,
`specificity-auditor`, `structure-skeleton`, `subtext-whisperer`,
`surprise-auditor`, `tournament-judge`, `voice-drift-detector`, and
`wiki-librarian`.

Seven are compatibility wrappers for same-named skills. They remain role
adapters during migration so existing callers do not break.

## Templates

- `templates/lifecycle.json`
- `templates/persona.md`
- `templates/state.json`

All three migrate to `src/templates/`.

## External Wiki

The wiki repository contains 461 files under `wiki/`. Canonical roots are
`wiki/CANONICAL.md`, `wiki/en/MAP.md`, and `wiki/zh/MAP.md`.

The source scan found 120 distinct inline wiki path expressions. Missing
expressions currently fall into these categories:

- Historical aliases: `concepts/convention-vs-cliche.md`,
  `concepts/subtext.md`.
- Optional/glob references: `quotes/*.md`.
- Language placeholders: `wiki/{en,zh}/...`.
- Output templates containing `{slug}`, `{title}`, or `{name}`.

Phase 4 dependency validation must distinguish required input files from
optional, glob, alias, and output-template references.
