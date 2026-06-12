# McKee Story Workflow

A McKee-native, hybrid Skill + Agent architecture for consistently and reliably producing great stories using Claude Code.

Built on Robert McKee's *Story* methodology. See `story-plan.md` for the full implementation design.

> **Note:** the repository slug is misspelled `McKee-stroy-workflow` (`stroy` → `story`). The remote URL still uses the typo; consider renaming the GitHub repo (and updating clones' remotes) when convenient. The skills themselves are unaffected — they install by their own names into `~/.claude/skills/`.

## Cross-platform note

The skills are authored for Claude Code (where critics run as parallel isolated agents). They also run on hosts without an agent-spawning tool — OpenCode, Pi, etc. — by degrading gracefully: the critic suite falls to native critic tools (where the host provides them, e.g. Pi's `cliche_hunt`/`subtext_check`) or to in-context sequential passes with a fresh-eyes reset between dimensions. See `/story-audit` Step 0 (capability ladder) and its Cross-Platform Critic Map. On non-Claude-Code hosts the skill body is typically pasted/loaded as a prompt; the capability ladder is what makes that portable.

`story-scene` now also uses an internal Beat Gate before full-scene critics: deterministic mechanical fixes when provably safe, blind Beat critique, one consolidated writer decision, resumable scene ledgers, and rolling reader/pacing checks every 2-3 committed scenes. Hosts without Node.js or command execution fall back to `detect-only` and never self-authorize `AUTO`.

---

## What This Is

A complete AI-agent workflow for story generation, organized into four layers:

```
skills/mck-*          McKee methodology skills (the how-tos)
skills/story-*        Workflow skills (the lifecycle entry points)
agents/               Generator + critic agents (bounded, isolated work)
templates/            Project scaffolding (lifecycle.json, state.json)
```

---

## Skills

### Methodology Skills (`/mck-*`)
Drop into `~/.claude/skills/` to make available globally in Claude Code.

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
| `story-scene` | Draft or revise a single scene with internal Beat Gate and rolling review |
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
| `story-stop-loss` | Stop-loss convergence protocol — iteration caps, Beat Gate diversity trigger at round 2, backtrack depth limit |
| `story-beat-gate` | Internal Beat-level scan, blind critique, AUTO/REVIEW/REJECT classification, resumable ledger |
| `story-writer-adjudication` | Two-stage blind A/B preference, reveal, and structured human finding decision |
| `story-persona` | Author Persona — FORGE / LOAD / APPLY modes; decision filter for all aesthetic choices |
| `story-tournament` | Tournament generation for high-stakes creative decisions (also listed under V3 methodology) |

---

## Agents

Drop into `.claude/agents/` in your project directory.

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
- `reader-simulator` — Blind read; FULL-draft and WINDOW rolling engagement reports *(V2)*
- `pacing-analyst` — Scene length, rhythm distribution, FULL-draft and WINDOW rolling pacing reports *(V2)*
- `blind-beat-critic` — Beat-level blind critique with bounded scene context *(new)*
- `batch-beat-pattern-auditor` — Prose-only cross-scene homogeneity audit before the writer decision *(new)*
- `diversity-challenger` — Mechanism-level alternatives when a Beat repeats or will not converge *(new)*
- `surprise-auditor` — Naive read + misdirection plan cross-reference; verifies dual-reading plants and re-read moment at Climax *(V3)*

### Specialist Agents
- `cast-balancer` — Cast pressure matrix
- `genre-cartographer` — Genre Contract
- `setting-surveyor` — Four-dimensional setting + world rules
- `wiki-librarian` — McKee wiki maintenance

---

## Installation

```bash
# Clone this repo
git clone https://github.com/Quentinbest/McKee-stroy-workflow.git

# Install skills globally
cp -r McKee-stroy-workflow/skills/* ~/.claude/skills/

# Install agents into your story project
cp -r McKee-stroy-workflow/agents/* your-story-project/.claude/agents/

# Optional: verify Beat Gate contracts and fixtures
node scripts/verify-beat-gate.mjs
node --test tests/*.test.mjs
node scripts/run-beat-gate-dry-run.mjs
node scripts/run-beat-gate-dogfood.mjs
node scripts/compare-beat-gate-critics.mjs \
  --output benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12
node scripts/run-writer-adjudication.mjs create \
  --input benchmarks/writer-adjudication/memory-tide-pilot.json \
  --output benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved \
  --seed 20260612

# Scaffold a new project
mkdir -p drafts/my-story/{characters,scenes,prose}
cp McKee-stroy-workflow/templates/lifecycle.json drafts/my-story/lifecycle.json
cp McKee-stroy-workflow/templates/state.json drafts/my-story/state.json
```

The dry run creates a synthetic story project under a temporary directory and
verifies deterministic cleanup, protected-field rejection, human decisions,
non-convergence escalation, and rolling review artifacts without using a real
manuscript.

The dogfood benchmark runs a four-scene synthetic Chinese story through the
same runner, ledger, critic-fallback, diversity, and human-boundary contracts.
The default fixture applies the writer's dated choice of ending `A`, commits
the accepted batch, and writes rolling reports. Add `--pending` to reproduce
the pre-decision `AWAITING_WRITER` boundary and verify that Premise, character
desire, and final aesthetic judgment are not silently automated.

The critic comparison replays the original 12 candidate Beats through isolated
scene critics and a separate prose-only batch pattern auditor. Its retained
evidence shows that isolation helps local independence, but cross-scene
homogeneity requires its own bounded audit before the writer decision.

The writer adjudication harness then separates blind prose preference from
post-reveal critic acceptance. It refuses incomplete stages and altered
packages, records explicit adoption intent, and never applies a preferred
variant automatically.

The retained Memory Tide pilot completed two comparisons: both challengers won
blind, both findings were accepted, and both revisions were adopted. Treat this
as narrow prospective evidence, not a general critic accuracy claim.

---

## Usage

Start a new story:
```
/story-new "I had a dream about a clockmaker who builds clocks that run backwards"
```

Work on a scene:
```
/story-scene 2.3
```

`/story-scene` now drafts candidate Beats, runs the internal Beat Gate, and asks for one consolidated Beat decision instead of one prompt per micro-patch.

Apply subtext discipline to dialogue:
```
/mck-subtext-5layer
```

Run the full critic suite:
```
/story-audit
```

---

## The Architecture Decision

**Skills are the spine; Agents are the bounded workers.**

- Skills run in main context — visible, iterative, composable, cheap
- Agents run in isolation — for parallel work, adversarial critics, and long tasks that would burn parent context

See `story-plan.md` for the full design rationale, V1/V2/V3 roadmap, and the five hard problems the system addresses.

---

## Based On

Robert McKee, *Story: Substance, Structure, Style and the Principles of Screenwriting* (1997).

The McKee wiki this system queries lives at [LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story).
