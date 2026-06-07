# McKee Story Workflow

A stable, McKee-native Skill + Role framework for planning, drafting, auditing,
revising, and exporting stories across Claude Code, Cursor, Pi, OpenCode, and
Codex.

Current release: **1.0.0** (`v1.0.0`).

> **Note:** the repository slug is misspelled `McKee-stroy-workflow`
> (`stroy` -> `story`). The remote URL still uses the typo; consider renaming
> the GitHub repository and updating clone remotes when convenient.

Built on Robert McKee's *Story* methodology. The canonical implementation plan
is `mckee-story-workflow-cross-harness-agent-implementation-plan.md`.

## Release Status

- Phases 0-10 of the cross-harness implementation plan are complete.
- All 34 skills, 27 roles, and 15 story artifact contracts validate.
- All 25 deterministic harness/scenario pilots pass.
- Native Pi, OpenCode, and Codex pilots pass; Claude Code and Cursor use
  approved capability exceptions documented in the repository.
- Security, drift, clean-checkout, lifecycle, and release-governance checks
  pass.
- Authorized literary and operational review is approved.
- External publication remains separately approval-gated.

Machine-readable evidence lives in `reports/acceptance-audit.json`,
`reports/release-evidence.json`, and `reports/human-release-review.json`.

## Architecture

Canonical skills and roles live under `src/`. Harness discovery files are
generated into `.agents/`, `.claude/`, `.cursor/`, and `.opencode/`; do not edit
those outputs manually. The baseline is single-agent and offline. Native
subagents, critics, hooks, extensions, and plugins are optional accelerators.

```text
AGENTS.md              Universal execution and safety rules
src/skills/            Canonical methodology and lifecycle skills
src/roles/             Canonical bounded specialist roles
src/artifacts/         Versioned story artifact contracts
src/control-plane/     Lifecycle and orchestration contracts
src/templates/         Canonical story project scaffolding
.agents/               Shared adapters used by Cursor, Pi, and Codex
.claude/               Claude Code skills, roles, and scoped rules
.cursor/               Cursor project rules
.opencode/             OpenCode role adapters
scripts/               Generation, verification, evidence, and release tooling
tests/                 Contract, integration, E2E, and security tests
```

Read `AGENTS.md` and `docs/agent/README.md` before changing the framework.
Canonical files must be changed first, followed by `npm run agents:sync`; direct
edits to generated adapters fail drift verification.

## Quick Start

Requirements:

- Git
- Node.js 20 or newer
- A local checkout of
  [LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story)

```bash
git clone https://github.com/Quentinbest/McKee-stroy-workflow.git
cd McKee-stroy-workflow

export MCKEE_WIKI_ROOT=/absolute/path/to/LLM-Wiki-Story
npm run agents:verify
```

The baseline tooling has no third-party runtime dependencies; no package install
step is required.

To start a story, ask the active harness to use `story-new` with a seed:

```text
Use story-new with this seed:
"A clockmaker builds clocks that run backward."
```

Then continue through `story-premise`, `story-spine`, `story-cast`,
`story-act`, `story-scene`, `story-audit`, `story-revise`, and
`story-publish`. Use `story-status` at any point to inspect the lifecycle state.

## Harness Support

| Harness | Root guidance | Skills | Native roles |
|---|---|---|---|
| Claude Code | `CLAUDE.md` -> `AGENTS.md` | `.claude/skills/` | `.claude/agents/` |
| Cursor | `AGENTS.md`, `.cursor/rules/` | `.agents/skills/` | Single-agent fallback |
| Pi | `AGENTS.md` | `.agents/skills/` | Single-agent fallback |
| OpenCode | `AGENTS.md`, `opencode.jsonc` | `.agents/skills/` | `.opencode/agents/` |
| Codex | `AGENTS.md`, `.codex/config.toml` | `.agents/skills/` | Single-agent fallback |

Equivalent support means the same goal, canonical inputs, artifacts, acceptance
criteria, safety boundaries, and comparable evidence. It does not require each
harness to expose identical optional delegation features.

---

## Skills

### Methodology Skills (`/mck-*`)
Generated adapters make these discoverable in each supported harness.

**V1 — Core**

| Skill | Purpose |
|---|---|
| `mck-subtext-5layer` | Author dialogue in 5 layers (Wound → Want → Fear → Tactic → Text). The most important single skill. |
| `mck-controlling-idea` | Forge the story's "value + cause" sentence |
| `mck-beat-to-prose` | Translate a beat sheet into polished prose |
| `mck-crisis-dilemma` | Sharpen a hard choice into a true dilemma |
| `mck-arc-walk` | Map a character's arc across the spine |
| `mck-gap-find` | Find the Gap (expectation vs. result) in any beat or scene |

**V2 — Long-Form & Polish**

| Skill | Purpose |
|---|---|
| `mck-image-thread` | Inventory motifs, audit cadence, verify Key Image placement, plant additions |
| `mck-setup-payoff` | Build the setup-payoff ledger; detect dangling setups and groundless payoffs |
| `mck-specificity-forge` | Scan for generic language; forge concrete particulars from world bible |
| `mck-voice-first` | Lock voice anchors before drafting; produce voice-anchors.md |
| `mck-exposition-ammo` | Convert info dumps into "exposition as ammunition" — every fact fired in combat |
| `mck-negation-of-negation` | Drive the central value to Corner 4 (corruption of the positive); test Crisis depth |

**V3 — Greatness Pursuit**

| Skill | Purpose |
|---|---|
| `mck-honesty` | Honesty Engine — TEST / STRESS / REPAIR the CI against the author's Truth Library; separates grounded ideas from bumper stickers |
| `mck-surprise-plant` | Surprise architecture — DESIGN (misdirection plan), PLANT (dual-reading item placements), AUDIT (spawn `surprise-auditor`) |
| `story-tournament` | Tournament generation — CONTROLLING-IDEA / INCITING-INCIDENT / PROTAGONIST / CRISIS / CLIMAX; enforces diversity, judges blind |

### Workflow Skills (`/story-*`)
Full lifecycle from seed to manuscript.

| Skill | Purpose |
|---|---|
| `story-new` | Start a new project from any seed (dream, image, news, mood) |
| `story-status` | Dashboard — what's locked, what's next |
| `story-premise` | Generate and lock a Premise Card |
| `story-spine` | Build the story skeleton (Inciting Incident → Crisis → Climax) |
| `story-cast` | Design the full cast as a system of pressures |
| `story-act` | Plan an act's scene sequence |
| `story-scene` | Draft or revise a single scene (most-used skill) |
| `story-audit` | Run the full McKee critic suite |
| `story-revise` | Multi-pass revision orchestrator |
| `story-publish` | Final assembly and manuscript export |

### Refactored Skills (formerly agents)
| Skill | Purpose |
|---|---|
| `arc-tracer` | Plot a character arc (iterative, in main context) |
| `act-designer` | Design act structure and rhythm |
| `exposition-smuggler` | Convert info dumps into "exposition as ammunition" |
| `key-image-curator` | Identify and thread the Key Image across the story |
| `composition-conductor` | Cross-scene craft audit (pacing, setups, image threading) |
| `controlling-idea-architect` | Forge or audit the CI — FORGE / STRESS-TEST / TRACE / REPAIR modes |
| `wiki-librarian` | McKee wiki INGEST / LINT / MIGRATE / REGEN (runs in main context; bilingual) |

### Infrastructure Skills
| Skill | Purpose |
|---|---|
| `story-stop-loss` | Stop-loss convergence protocol — iteration caps, three-strikes escalation, backtrack depth limit |
| `story-persona` | Author Persona — FORGE / LOAD / APPLY modes; decision filter for all aesthetic choices |
| `story-tournament` | Tournament generation for high-stakes creative decisions (also listed under V3 methodology) |

---

## Roles

Canonical role contracts generate Claude and OpenCode native role adapters.
All roles also work through the single-agent fallback.

### Generator Agents (produce artifacts)
- `premise-prospector` — 5-candidate premise slate
- `character-forger` — Character File with True Character + Dimensions
- `structure-skeleton` — Spine document
- `scene-architect` — Scene Cards
- `beat-miner` — Beat Sheets
- `prose-drafter` — Long-form prose from beat sheets *(new)*

### Critic Agents (audit, with fresh eyes)
- `cliche-hunter` — Clichés vs. honored conventions
- `antagonism-stress-tester` — Antagonism force balance
- `crisis-climax-auditor` — Dilemma authenticity, climax causality
- `subtext-whisperer` — Text ≠ subtext ≠ desire audit
- `continuity-supervisor` — World rules, character knowledge, physics *(new)*
- `tournament-judge` — Blind ranking of N candidates *(new)*
- `voice-drift-detector` — Line-level voice consistency vs. anchors *(V2)*
- `specificity-auditor` — Flags generic nouns/verbs; world-bible-aware *(V2)*
- `reader-simulator` — Blind read; engagement curve and confusion points *(V2)*
- `pacing-analyst` — Scene length, rhythm distribution, Law of Diminishing Returns *(V2)*
- `surprise-auditor` — Naive read + misdirection plan cross-reference; verifies dual-reading plants and re-read moment at Climax *(V3)*

### Specialist Agents
- `cast-balancer` — Cast pressure matrix
- `genre-cartographer` — Genre Contract
- `setting-surveyor` — Four-dimensional setting + world rules
- `wiki-librarian` — McKee wiki maintenance

---

## Usage

Start or resume a story:

```text
Use story-new with: "I dreamed about a clockmaker whose clocks run backward."
Use story-status for the current project.
```

Work on a scene:

```text
Use story-scene to draft scene 2.3 from its locked scene card and beat sheet.
```

Apply subtext discipline to dialogue:

```text
Use mck-subtext-5layer on the confrontation in scene 2.3.
```

Run the full critic suite:

```text
Use story-audit on the current complete draft.
```

Harnesses that expose slash-command invocation may also accept forms such as
`/story-new` or `/story-audit`; natural-language skill selection is the
portable cross-harness form.

## Development and Verification

Common commands:

```bash
# Regenerate all committed harness adapters.
npm run agents:sync

# Fail if generated files differ from canonical sources.
npm run agents:check-drift

# Run contract, security, conformance, lifecycle, human-review, and release checks.
MCKEE_WIKI_ROOT=/absolute/path/to/LLM-Wiki-Story npm run agents:verify

# Run one harness discovery smoke check.
npm run agents:smoke:codex
```

The repository is designed for offline deterministic verification. Native model
execution is separate evidence and is never silently substituted for the
deterministic baseline.

## Safety Boundaries

- The external wiki is read-only and resolved through `MCKEE_WIKI_ROOT`.
- Private manuscripts, credentials, and unpublished personas are denied unless
  explicitly scoped.
- Destructive operations, permission escalation, and external disclosure require
  explicit approval.
- Story publication is distinct from framework release approval.
- Existing user changes in dirty worktrees must be preserved.

See `docs/agent/safety-and-permissions.md` and
`config/security-policy.json`.

## The Architecture Decision

**Skills are the spine; Agents are the bounded workers.**

- Skills run in the main context: visible, iterative, composable, and portable.
- Roles are bounded workers for isolated generation, adversarial review, or
  read-heavy specialist analysis.
- Every role has a single-agent sequential fallback.

See `docs/agent/architecture.md` for the implemented architecture and the
canonical implementation plan for the complete rationale and acceptance model.

## Documentation

- `AGENTS.md`: universal agent policy
- `docs/agent/README.md`: canonical context index
- `docs/agent/repository-map.md`: path ownership
- `docs/agent/development-workflow.md`: contribution workflow
- `docs/agent/testing-and-verification.md`: test strategy
- `docs/agent/harness-compatibility.md`: harness capabilities
- `docs/agent/current-state.md`: current release state
- `CHANGELOG.md`: release history

---

## Based On

Robert McKee, *Story: Substance, Structure, Style and the Principles of Screenwriting* (1997).

The McKee wiki this system queries lives at [LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story).
