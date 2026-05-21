# Story Generation Platform — Implementation Plan

*A McKee-native, hybrid Skill + Agent architecture for consistently and reliably producing great stories.*

**Version:** 1.0
**Date:** 2026-05-20
**Status:** Draft for review
**Substrate:** the existing `LLM-Wiki-Story` repository (bilingual McKee wiki + ~20 specialized agents)

---

## 0. Executive Summary

This document proposes a four-layer hybrid architecture for an autonomous, McKee-grounded story-generation platform. The current project already encodes Robert McKee's *Story* as a bilingual wiki and ships a fleet of ~20 specialized agents. This plan **rebalances the architecture toward Skills as the primary spine, with Agents reserved for bounded work that needs context isolation or parallelism.**

### Goal hierarchy

1. **Reliability** — every initiated project produces a structurally sound story (Spine, Crisis, Climax, Resolution all in place).
2. **Quality floor** — every output clears McKee's predicate suite (every scene turns; Crisis is a true dilemma; Climax flows from decision not coincidence; Controlling Idea is dramatized; obligatory genre scenes delivered).
3. **Occasional greatness** — through deliberate investment in meta-layers (author persona, honesty engine, surprise engineering), a meaningful fraction of outputs reach literary distinction.

### Architecture summary

```
┌──────────────────────────────────────────────────────────┐
│  LAYER 1: WORKFLOW SKILLS  (user entry points)           │
├──────────────────────────────────────────────────────────┤
│  LAYER 2: METHODOLOGY SKILLS  (the McKee how-tos)        │
├──────────────────────────────────────────────────────────┤
│  LAYER 3: GENERATOR AGENTS  (produce artifacts)          │
├──────────────────────────────────────────────────────────┤
│  LAYER 4: CRITIC AGENTS  (audit, with fresh eyes)        │
└──────────────────────────────────────────────────────────┘
   Under everything: Project State DB · Wiki RAG · World Bible · Voice Anchors
```

### Roadmap

- **V1 — Reliable Competence** (4–6 months): compiler pipeline, core critic stack, lifecycle state machine.
- **V2 — Long-Form & Voice** (next 6–9 months): state DB, image-system threading, subtext 5-layer, voice-first drafting.
- **V3 — Greatness Pursuit** (next 12+ months): author persona, honesty engine, surprise engineering, tournament generation, reader-feedback predictor.

---

## 1. Framing — What "Great" Actually Requires

By McKee's lights, a great story isn't merely structurally sound. It also has:

- **Truth** — a Controlling Idea worth dramatizing (not trite, not false).
- **Specificity** — *this* character, *this* room, *this* verb (not generic).
- **Voice** — an author who sees the world a particular way, line by line.
- **Subtext** — text ≠ tactic ≠ desire ≠ wound, layered at every moment.
- **Inevitable-Surprise** — the climax was always going to be that, and you never saw it coming.

McKee's framework gives us the **structural** dimensions algorithmically. Everything else — taste, observation, voice, honesty — McKee *assumes the writer brings*. A reliable system must **supply what McKee assumes**, not just execute what McKee specifies.

### The five really hard problems

| Problem | Why it's hard | How we address it |
|---|---|---|
| **Taste** | "Great" is recognized, not specified; LLM averages drift to cliché | Critic stack + canonical-corpus calibration + failure-pattern library |
| **Specificity** | LLMs default to generic; "the man entered the room" | Specificity Forge agent + world-bible + research DB |
| **Subtext** | Training data is full of on-the-nose dialogue | 5-Layer Authoring Model: author layers 1–4 before text |
| **Inevitable-Surprise** | Requires planted data that admits two readings | Surprise Engineering layer + post-hoc misdirection audit |
| **Honesty** | The system has no body, no lived experience | Truth Library + theme-via-structure (not assertion) |

Every component below traces back to one of these problems.

---

## 2. Architectural Verdict — Skills vs Agents

The current project leans **agent-heavy by default**. That is the wrong shape for a reliable platform. McKee methodology is mostly *visible reusable workflow* — Skill territory. Agents should be reserved for cases where **context isolation** or **parallel compute** is the actual requirement.

### Decision rule

| If the component is… | Use a… | Why |
|---|---|---|
| A workflow / entry point (user invokes `/story-new`) | **Skill** | Triggered by name, runs in main context, user-facing |
| A reusable methodology (e.g., "how to write subtext") | **Skill** | Markdown methodology read once, applied many times |
| A template / contract format | **Skill** | Static reference; no compute needed |
| Lifecycle / state-machine orchestration | **Skill** | Must see whole project state |
| A bounded generator (produces one artifact from a brief) | **Agent** | Clean input/output; cold-start acceptable |
| An adversarial critic (must NOT see generator's reasoning) | **Agent** | Isolated context is the *point* |
| A parallel candidate generator (N tournament candidates) | **Agents (×N)** | Parallelism requires separate processes |
| A long focused task that would burn parent context | **Agent** | Cost of re-derivation < cost of pollution |
| A heavy RAG / wiki search that returns synthesis | **Agent** | Context protection |

### Why Skills-primary

The current `CLAUDE.md` already warns: *"Each spawn starts cold and re-derives context — it's the expensive path on this plan."* That is the design pressure that should govern. Default to Skills. Use Agents only when isolation solves a real problem.

### Tradeoffs (honest)

**Skills primary** wins on:
- Cost (no re-derivation)
- Visibility (user can learn / interject / trust)
- Composability (skills call skills call agents)
- Versioning (markdown files in repo)

**Skills primary** loses on:
- Shared context budget (long sessions can pollute)
- No parallelism (only Agents can)
- Cannot enforce "blind" critique

The mistake to avoid is defaulting to Agents because "more isolation = better." Isolation is a tool for specific problems; everywhere else it's overhead.

---

## 3. System Layers

### Layer 1 — Workflow Skills (User Entry Points)

Triggered by `/command` or natural language. Visible to the user. Orchestrate downstream layers.

| Skill | Purpose |
|---|---|
| `/story-new` | Start a new project from any seed (image, dream, news clip, mood) |
| `/story-status` | Show lifecycle state, what's locked, what's next |
| `/story-premise` | Lock a premise from a slate of candidates |
| `/story-spine` | Build or revise the spine (Inciting → Crisis → Climax) |
| `/story-cast` | Design and audit the full cast as a pressure system |
| `/story-scene` | Draft or revise a single scene (most-used skill) |
| `/story-act` | Plan an act's scene sequence |
| `/story-audit` | Run the full critic suite over current draft |
| `/story-revise` | Multi-pass revision orchestrator (one issue per pass) |
| `/story-publish` | Final assembly, polish pass, export manuscript |

### Layer 2 — Methodology Skills (the McKee How-Tos)

Pure methodology, no API calls. Loaded into main context, applied iteratively.

| Skill | Purpose | Used by |
|---|---|---|
| `/mck-controlling-idea` | Forge the "value + cause" sentence | Premise → Spine |
| `/mck-subtext-5layer` | Author dialogue in 5 layers, text last | Every scene |
| `/mck-beat-to-prose` | Translate beat sheet into prose | Every scene |
| `/mck-specificity-forge` | Convert generic → particular | Every scene |
| `/mck-setup-payoff` | Maintain setup-payoff ledger | Cross-scene |
| `/mck-image-thread` | Thread motifs at intentional cadence | Cross-scene |
| `/mck-crisis-dilemma` | Sharpen a hard choice into a true dilemma | Act 3 / 4 design |
| `/mck-voice-first` | Lock voice anchors before drafting prose | Pre-prose |
| `/mck-exposition-ammo` | Smuggle exposition as combat | Every info-bearing scene |
| `/mck-negation-of-negation` | Drive value to its deepest opposite | Crisis design |
| `/mck-arc-walk` | Walk a character's arc through revelation moments | Per character |
| `/mck-gap-find` | Find the gap (expectation vs result) in any beat | Beat-level work |

### Layer 3 — Generator Agents

Produce discrete artifacts from clean briefs. Cold-start acceptable. Artifact-out.

| Agent | Produces |
|---|---|
| `premise-prospector` | Premise Slate (5 candidates with polarity, genre, Object of Desire) |
| `character-forger` | Character File (Characterization + True Character + Dimensions) |
| `structure-skeleton` | Spine document (Inciting Incident → Crisis → Climax + MDQ) |
| `scene-architect` | Scene Card (objective, conflict, turn, value shift) |
| `beat-miner` | Beat Sheet (action/reaction units with gap analysis) |
| `prose-drafter`* | Long-form prose draft from a Beat Sheet |
| `world-builder`* | World Bible (rules, geography, history, cosmology) |
| `name-forger`* | Names that fit period, culture, character function |

`*` = new; not in current fleet.

### Layer 4 — Critic Agents

Audit artifacts with **fresh eyes**. Must not see the generator's reasoning. Parallelizable.

| Agent | Audits |
|---|---|
| `antagonism-stress-tester` | Forces of antagonism strong enough at every level |
| `cliche-hunter` | Clichés vs honored genre conventions |
| `crisis-climax-auditor` | Dilemma authenticity; Climax flows from decision |
| `subtext-whisperer` | Text ≠ subtext ≠ desire |
| `continuity-supervisor`* | World rules, character knowledge, physical possibility |
| `voice-drift-detector`* | Line-level voice consistency vs anchors |
| `reader-simulator`* | Reads blind; reports engagement curve & confusion points |
| `tournament-judge`* | Blind ranking of N candidates against criteria |
| `specificity-auditor`* | Flags generic nouns / verbs that need forge invocation |
| `pacing-analyst`* | Scene length & rhythm distribution |

### Specialist Agents

Narrow focused work. Hybrid Skill/Agent in some cases.

| Component | Role |
|---|---|
| `wiki-librarian` | Sole writer to `wiki/` (write-gate; refactor to Skill) |
| `key-image-curator` | Identifies & places the Key Image (refactor to Skill) |
| `composition-conductor` | Cross-scene craft audit (refactor to Skill calling Agents) |
| `genre-cartographer` | Genre Contract authoring (Hybrid: Skill + Agent) |
| `setting-surveyor` | Four-dimensional setting + research (Hybrid) |
| `arc-tracer` | Arc map per character (refactor to Skill) |
| `act-designer` | Act/sequence boundaries (refactor to Skill) |
| `cast-balancer` | Pressure matrix audit (Stays Agent) |

---

## 4. Methodology Inventory (the McKee How-Tos)

These are the heart of the system — Skills that encode McKee's reusable techniques.

### 4.1 Controlling-Idea Workflow

A skill that walks the writer through:
1. State the value (love, justice, freedom, etc.) and its negation.
2. State the cause (why does the value win or lose?).
3. Test against the four corners of the value square (negation of negation).
4. Verify dramatizability (can a sequence of events embody this?).
5. Record on a Controlling-Idea Card.

### 4.2 5-Layer Subtext Authoring Model

**Author dialogue in five layers, in this order:**

1. **Wound** — the deepest past pain shaping perception this moment
2. **Want** — conscious desire (active, specific, gettable, refusable)
3. **Fear** — what they cannot admit they fear about pursuing Want
4. **Tactic** — verb-on-person ("to wound", "to disarm", "to seduce")
5. **Text** — surface utterance (generated LAST, performs Tactic)

This forces non-on-the-nose dialogue *architecturally*. The most important single intervention in the platform.

### 4.3 Beat-to-Prose Translation

For each beat in the beat sheet:
- Generate N candidate prose realizations
- Select by: voice fit × subtext layering × rhythmic fit × specificity
- Like a musician interpreting a score — same beats, infinite performances

### 4.4 Specificity Forge

Generic → Particular pipeline:
- **Detect**: scan for generic nouns ("the bookshop", "the man", "the city")
- **Research**: query world-bible + external sources for plausible particulars
- **Invent**: invent details consistent with world (street name, exact smell, song playing)
- **Audit**: scene-level specificity score; below threshold → forge invocation

### 4.5 Setup-Payoff Ledger

Every setup (object, reference, hint, image) logged with intended payoff scene. Every payoff must trace to a setup. Detects:
- **Dangling setups** (never paid off → cut or pay off)
- **Groundless payoffs** (deus ex machina → plant earlier)
- **Forgotten promises** (buried under noise → reinforce)

### 4.6 Image System Threading

- **Inventory** — catalog of motifs, metaphors, symbolic objects
- **Distributor** — motifs recur at intentional rhythm (not monotonous, not abandoned)
- **Key Image Curator** — the One Image that crystallizes Controlling Idea at climax
- **Threading audit** — motifs appear at planned cadence; Key Image present in opening (subtle) and climax (resonant)

### 4.7 Crisis-Dilemma Sharpening

A skill that takes a draft Crisis and:
- Tests both choices for genuine desirability (irreconcilable goods OR lesser of two evils)
- Eliminates "obvious right answer" cases
- Validates the protagonist's True Character must be revealed by the choice
- Refines until both choices feel painful

### 4.8 Voice-First Drafting

Before any prose:
- **Exemplar passages** chosen as voice anchors
- **Style rules**: vocabulary range, sentence-length distribution, rhythm, tense, POV, register, taboo words
- **Voice agent** enforces line-by-line during generation
- **Voice drift detector** rolling embedding comparison vs anchors

### 4.9 Negation of the Negation

A skill that escorts a value through:
- Positive (e.g., justice)
- Contradiction (injustice)
- Negation of the negation (tyranny disguised as justice)

Used at Crisis design to ensure depth.

### 4.10 Arc Walk

For each character:
- Map revelation moments along the spine
- Name the want-to-need transition
- Identify the obligatory revelation scene
- Verify arc beats are present in scene cards

### 4.11 Gap Find

Take any beat or scene. Identify:
- The character's expectation
- The actual result
- The gap (which is where story lives)

If no gap, the beat isn't a beat. Cut or rewrite.

### 4.12 Exposition as Ammunition

For every piece of information that must reach the audience:
- What scene fights to reveal/conceal/extract/weaponize it?
- If "no scene yet" → design one
- If exposition is dropped without combat → fail

---

## 5. Concrete Flow Examples

### Flow A — Starting a new story

```
USER: /story-new "I had a dream about a clockmaker who builds clocks that run backwards"
  │
  ▼
SKILL /story-new
  ├─ reads wiki/CANONICAL.md, wiki/en/MAP.md
  ├─ spawns AGENT premise-prospector (with the dream)
  │    └─ returns: drafts/{slug}/premise-slate.md (5 candidates)
  ├─ shows slate to user → user picks #3
  ├─ writes drafts/{slug}/premise-locked.md
  ├─ updates lifecycle.json (state = "premise_locked")
  └─ suggests next: /story-controlling-idea
```

Skill = orchestrator; Agent = one bounded generation.

### Flow B — Writing a scene

```
USER: /story-scene 2.3
  │
  ▼
SKILL /story-scene  (in main context, visible)
  ├─ loads Scene Card, characters, wiki concepts
  ├─ invokes SKILL /mck-subtext-5layer (composes in context)
  ├─ generates prose iteratively (user can interject)
  ├─ spawns 3 AGENTS in parallel:
  │    ├─ cliche-hunter          → drafts/.../cliche-hunt.md
  │    ├─ subtext-whisperer      → drafts/.../subtext-{NN}.md
  │    └─ continuity-supervisor  → drafts/.../continuity-{NN}.md
  ├─ merges findings, revises
  ├─ commits to project state DB
  └─ suggests next scene
```

Skill = primary work + orchestration; Agents = parallel isolated audits.

### Flow C — Tournament generation (high-stakes decisions)

```
USER: /story-climax-tournament
  │
  ▼
SKILL /story-climax-tournament
  ├─ loads spine, controlling idea, crisis design
  ├─ spawns 5 AGENTS in parallel: scene-architect (climax mode)
  │    └─ returns 5 candidate climax Scene Cards
  ├─ spawns AGENT tournament-judge
  │    └─ ranks 5 against McKee predicates + Controlling Idea
  ├─ presents top 2 to user with judge's reasoning
  ├─ user picks; Skill commits to spine
  └─ invalidates downstream artifacts that depended on old climax
```

This is the case Skills *alone* cannot do. Parallelism requires separate Agents.

### Flow D — Multi-pass revision

```
USER: /story-revise --full
  │
  ▼
SKILL /story-revise
  PASS 1 — Structure
    └─ spawns crisis-climax-auditor + antagonism-stress-tester
  PASS 2 — Cliché
    └─ spawns cliche-hunter
  PASS 3 — Subtext
    └─ spawns subtext-whisperer (one scene at a time)
  PASS 4 — Image system
    └─ runs /mck-image-thread audit in-context
  PASS 5 — Voice
    └─ spawns voice-drift-detector
  PASS 6 — Specificity
    └─ runs /mck-specificity-forge per chapter
  PASS 7 — Reader simulation
    └─ spawns reader-simulator (blind read)
  └─ aggregates revision tasks; presents prioritized list
```

Each pass touches the whole manuscript but fixes only one dimension. Mirrors how human writers actually revise.

---

## 6. Long-Form Coherence Mechanisms

Short pieces don't need these; novels live or die by them.

### 6.1 Project State DB

A persistent JSON/SQLite store, not just markdown:

```json
{
  "lifecycle": "scene_cards_locked",
  "characters": {
    "jake": {
      "location": "the workshop",
      "knowledge": ["maria's affair", "father's death cause"],
      "possessions": ["the broken watch", "father's letter"],
      "wound_active": true,
      "current_desire": "to make maria admit fault",
      "scene_appearances": [1.1, 1.3, 2.1, 2.3]
    }
  },
  "image_system": {
    "broken-clocks": { "introduced": 1.1, "recurrences": [1.3, 2.1, 2.4], "payoff": 4.2 },
    "river": { "introduced": 1.2, "recurrences": [], "payoff_planned": 3.5 }
  },
  "setup_payoff_ledger": {
    "father's letter": { "setup_scene": 1.2, "payoff_scene": 3.4, "status": "planned" }
  },
  "arc_progression": {
    "jake": [
      { "scene": 1.1, "value": "+love (hidden)", "revelation": null },
      { "scene": 2.3, "value": "-love (denied)", "revelation": "false-bottom" },
      { "scene": 4.1, "value": "+love (earned)", "revelation": "true-character" }
    ]
  }
}
```

Updated after every scene; consulted before every scene. Continuity supervisor queries this.

### 6.2 Setup-Payoff Ledger

Every setup logged with intended payoff. Every payoff traces to a setup. Automated detection of dangling setups & groundless payoffs.

### 6.3 Image-System Threading

The Key Image (the one image that, by Climax, has gathered the Controlling Idea inside it) is selected early. Throughout drafting, that image is **distributed** across scenes at planned cadence — never absent for too long, never repetitive.

### 6.4 Arc-Progression Tracker

Per character: scene-by-scene value chart. Detects:
- **Arc stalls** (character unchanged across N scenes)
- **Arc warps** (sudden unmotivated change)
- **Want-to-need inversions** (the legitimate kind, in the right scene)

### 6.5 Chapter-to-Chapter Memory Bridge

Forced step in chapter transition: *"What does the protagonist carry from chapter N into chapter N+1?"* Three things minimum: a new knowledge, a new wound, a new resolution.

---

## 7. Prose-Level Engines

Where structural systems usually die.

### 7.1 Voice-First Drafting

Anchors + style rules + voice agent enforcement. Voice drift detector via rolling embedding distance.

### 7.2 Subtext-First Dialogue (5-Layer)

See §4.2. Wound → Want → Fear → Tactic → Text, in that order, text last.

### 7.3 Sensory-Density Manager

- Per-scene sensory budget across sight/sound/smell/touch/taste/proprioception
- Detects all-visual default (LLM instinct)
- Modulates density by scene type (high in establishing, low in fast action)

### 7.4 Rhythm/Pacing Modulator

- Sentence-length variance tracker
- Paragraph-density distribution
- Scene-length escalation pattern (Act 1 short, Act 2 long, Climax tight)
- "Breath" placement after high-tension sequences

### 7.5 Beat-to-Prose Selection

For each beat: generate N prose candidates; select by composite score; commit. Like a musical interpretation pipeline.

---

## 8. Meta-Layers (Where Greatness Lives)

Without these, the system produces *competent* stories — fatal.

### 8.1 Author Persona

**The most important upstream artifact.** Define:
- What does this author believe about the world?
- What do they fear, care about, refuse to write about?
- What is their controlling philosophical perspective?

Every creative decision filters through the persona. Without it, "average story." With it, "a story by *X*."

### 8.2 Reader Persona

The implied reader calibrates:
- Density of reference
- Register (literary, genre, crossover)
- What to explain vs. trust

### 8.3 Honesty Engine

- **Truth Library**: curated aphorisms, paradoxes, observations from canonical non-fiction + philosophy
- **Theme audit**: does the story *prove* the theme through structure, or just *assert* it?
- **Controlling Idea verification**: tested against the library — is this true, or a wish?

### 8.4 Specificity Forge

See §4.4. Generic → particular pipeline; per-scene audit; world-bible + research + invention.

### 8.5 Surprise Engineering

Inevitable-yet-surprising endings:
- **Misdirection Engine**: plants data supporting two readings
- **Foreshadowing Layer**: encodes the truth in early scenes as background detail
- **Reveal Choreography**: at climax, recontextualizes the planted data
- **Post-hoc audit**: re-read manuscript checking every prior scene admits the true reading

---

## 9. Beyond McKee — What the Framework Doesn't Cover

McKee is Western, screenplay-biased, three-act-dominant. A reliable platform must extend.

### 9.1 Cultural Calibration Layer

- **Non-Western structural traditions**: kishōtenketsu (4-act), 起承转合 (Chinese 4-part), rasa-based, oral-tradition cyclic
- **Culture-specific obligatory scenes**: xianxia breakthrough, wuxia revenge, isekai world-acclimation, magical realist transgression
- **Value-system mappings**: positive/negative charges vary across cultures

### 9.2 Length-Adaptive Strategy Selector

| Length | Strategy |
|---|---|
| Short story (≤7K) | Single decision, tight value flip, one POV |
| Novelette/Novella (7–40K) | 2–3 acts, one subplot |
| Novel (40K–150K) | Full McKee, multiple subplots, image-system critical |
| Series (multi-novel) | Arcs-of-arcs, decade-scale payoffs |
| Episodic | Per-episode arc within season arc within series arc |

### 9.3 Genre-Local Augmentation

McKee + genre-specific frameworks layered:
- **Crime** — investigation procedural beats, fair-play clue distribution
- **Romance** — relationship-progression model
- **Horror** — dread-building rhythms, unheimlich gradient
- **Xianxia** — cultivation hierarchy, dao-realization arc, qi/karma economy
- **Literary** — theme-as-character-mirror, ambiguity preservation
- **Mystery** — clue/red-herring ledger, fair-play audit

### 9.4 Voice Diversification Library

Catalogued voices: hard-boiled, lyrical, minimalist, baroque, comic, ironic, intimate, oracular, paratactic, hypotactic. Voice agents per type. Composable.

---

## 10. Existing Project Refactor Map

The current ~20 agents should be partly converted. Mapping:

| Currently an Agent | Refactor to | Reasoning |
|---|---|---|
| `arc-tracer` | **Skill** | Methodology over character + spine; iterative |
| `act-designer` | **Skill** | Walks user through act-rhythm decisions |
| `composition-conductor` | **Skill → calls Agents** | Methodology that delegates focused audits |
| `controlling-idea-architect` | **Skill** | Conversation about value+cause |
| `exposition-smuggler` | **Skill** | Per-scene methodology applied many times |
| `key-image-curator` | **Skill** | Iterative curation; user picks the Key Image |
| `wiki-librarian` | **Skill** (sole writer to `wiki/`) | Orchestration with write tools |
| `genre-cartographer` | **Hybrid** | Skill for conversation; Agent for contract compilation |
| `setting-surveyor` | **Hybrid** | Skill for iteration; Agent for research |
| `premise-prospector` | **Stays Agent** | Bounded generation; parallel-friendly |
| `character-forger` | **Stays Agent** | Discrete character file artifact |
| `structure-skeleton` | **Stays Agent** | Discrete spine artifact |
| `scene-architect` | **Stays Agent** | Discrete Scene Card; tournament-able |
| `beat-miner` | **Stays Agent** | Focused beat extraction |
| `cliche-hunter` | **Stays Agent** | Must not see generator reasoning |
| `antagonism-stress-tester` | **Stays Agent** | Adversarial critic; isolated |
| `crisis-climax-auditor` | **Stays Agent** | Adversarial critic; isolated |
| `subtext-whisperer` | **Stays Agent** | Adversarial audit on draft |
| `cast-balancer` | **Stays Agent** | System-level cast analysis |

### New Skills (V1)

- Workflow: `/story-new`, `/story-status`, `/story-premise`, `/story-spine`, `/story-cast`, `/story-scene`, `/story-act`, `/story-audit`, `/story-revise`, `/story-publish`
- Methodology: `/mck-controlling-idea`, `/mck-subtext-5layer`, `/mck-beat-to-prose`, `/mck-specificity-forge`, `/mck-setup-payoff`, `/mck-image-thread`, `/mck-crisis-dilemma`, `/mck-voice-first`, `/mck-exposition-ammo`, `/mck-negation-of-negation`, `/mck-arc-walk`, `/mck-gap-find`

### New Agents (V1)

- `prose-drafter` — long focused task; would burn parent context
- `reader-simulator` — must read blind
- `continuity-supervisor` — state DB queries + audit
- `tournament-judge` — blind comparison of candidates
- `voice-drift-detector` — corpus-trained, isolated

---

## 11. Operational Architecture

### 11.1 Lifecycle State Machine

States explicit, transitions audited:

```
inspiration
  → premise_slate
  → premise_locked
  → genre_locked
  → controlling_idea_locked
  → setting_locked
  → cast_locked
  → spine_locked
  → act_design_locked
  → scene_cards_locked
  → beat_sheets_locked
  → prose_drafted
  → critic_passed
  → polished
  → done
```

Cannot regress past locked states without explicit **unlock + invalidation cascade**.

### 11.2 Bounded Backtracking

When a downstream predicate fails, identify the upstream artifact most likely responsible. Backtrack, mutate, resume. Limit depth to prevent thrashing. **Three-strikes rule**: if the same backtrack repeats, escalate.

### 11.3 Compute Budget Allocation

| Stage | Compute weight |
|---|---|
| Premise tournament | High |
| Spine | High |
| Cast | Medium-High |
| Scene cards | Medium |
| Prose first draft | Low (cheap, fast) |
| Revision passes | High (multiple) |
| Ending design | Very high (regenerate until perfect) |

Budget-aware scheduler.

### 11.4 Stop-Loss Convergence

- Quality floor: predicate suite + critic threshold
- Iteration cap: K revisions per artifact (default 5)
- If floor not met after cap: escalate or abandon
- Prevents infinite-revision spirals

### 11.5 Caching & Reuse

- Wiki retrieval cached
- Genre templates reused across projects
- Character archetypes portable
- Voice agents reusable across projects

---

## 12. Self-Improvement Loop

The system gets better only if it learns across projects.

### 12.1 Project Postmortems

After each project: what worked, what failed, what surprised. Update:
- Failure-pattern library
- Genre templates
- Author personas
- Critic thresholds

### 12.2 Style-Transfer Apprenticeship

System reads canonical work → identifies stylistic signature → imitates → grades against original. Builds a library of stylistic moves.

### 12.3 Reader-Feedback Predictor

When humans read system output, capture:
- Engagement curve
- Emotional reactions
- Confusion points

Train a predictor for those signals; use at generation time.

### 12.4 Internal Canon-Building

Track its own great outputs. Future generations reference the internal canon. Develops a "house style."

### 12.5 Genre-Innovation Detector

Periodically attempt genre-hybrid generation. Successful hybrids become new genre templates. The system contributes to genre evolution rather than reproducing it.

---

## 13. V1 / V2 / V3 Roadmap

### V1 — Reliable Competence (4–6 months)

**Goal**: produce structurally sound novellas reliably.

**Build**:
- Workflow skills: `/story-new`, `/story-status`, `/story-premise`, `/story-spine`, `/story-cast`, `/story-scene`, `/story-audit`, `/story-revise`
- Methodology skills: `/mck-controlling-idea`, `/mck-subtext-5layer`, `/mck-beat-to-prose`, `/mck-crisis-dilemma`, `/mck-arc-walk`, `/mck-gap-find`
- Refactor 7 agents → skills (arc-tracer, act-designer, controlling-idea-architect, exposition-smuggler, key-image-curator, composition-conductor, wiki-librarian)
- New agents: `prose-drafter`, `continuity-supervisor`, `tournament-judge`
- Project State DB schema + persistence
- Lifecycle state machine
- Stop-loss convergence

**Outcome**: novellas of 7K–40K words with sound McKee structure, honored genre conventions, no glaring continuity errors. Mid-tier prose. Validates the architecture.

### V2 — Long-Form & Voice (next 6–9 months)

**Goal**: novel-length output with coherent voice and threaded image system.

**Build**:
- Methodology skills: `/mck-specificity-forge`, `/mck-image-thread`, `/mck-setup-payoff`, `/mck-voice-first`, `/mck-exposition-ammo`, `/mck-negation-of-negation`
- New agents: `reader-simulator`, `voice-drift-detector`, `specificity-auditor`, `pacing-analyst`
- Voice anchors system + voice agents per project
- Setup-payoff ledger with auto-detection
- Image-system distributor
- Bounded backtracking with invalidation cascade
- Subtext 5-layer enforcement throughout

**Outcome**: novels of 40K–150K words with coherent voice, threaded image systems, dialogue with non-trivial subtext. Approaches "good."

### V3 — Greatness Pursuit (next 12+ months)

**Goal**: occasional literary distinction.

**Build**:
- Author Persona system per project
- Honesty Engine + Truth Library
- Surprise Engineering layer + post-hoc misdirection audit
- Tournament generation for premise + climax (parallel agent infrastructure)
- Mutation-selection for refinement
- Reader-feedback predictor (trained on real human reads)
- Canonical corpus calibration (genre-specific embedding indices)
- Cultural calibration layer (non-Western frameworks)
- Internal canon-building across projects

**Outcome**: not every project, but a meaningful fraction reach literary distinction. The unsolved frontier.

---

## 14. Tradeoffs and Honest Limits

Even maximally built, the system has structural limits:

1. **No body, no history** — it cannot draw on lived experience the way human writers do. The Honesty Engine compensates but the deepest layer of "having something to say" is the hardest gap.
2. **Inevitability-with-surprise is hard engineering** — surprise engineering helps, but the kind of narrative inevitability in Chekhov, Coetzee, Le Guin emerges from a unity of theme and form that resists algorithmic specification.
3. **Compute is real** — tournament generation × mutation-selection × critic loops × revision passes can 10–100× the token cost vs. naive generation. Budgeting matters.
4. **McKee is contestable** — one school. The system should be honest that "McKee-correct" ≠ "great" — it's necessary, not sufficient.
5. **Voice from corpus is imitation** — true voice originates in a writer's unique perceptual stance. The system approximates voice via anchors and corpus calibration but doesn't *originate* voice.

The platform is most reliable at **producing the structural floor great stories require** and most fragile at **the meta-layers above structure**. Concentrate engineering investment there, not on the structural layer that's already largely solved.

---

## 15. First Implementation Step

Three candidate starting points (pick one):

### Option A — `/story-scene` skill + refactor `subtext-whisperer` agent to be called from it

**Why first**: scene-drafting is the most-used unit of work. Shows the hybrid pattern at the place it pays off most. Immediately useful for the `reverse-dao` active project.

**Deliverable**: working `/story-scene` skill + `/mck-subtext-5layer` skill + updated `subtext-whisperer` agent + first-scene proof.

### Option B — `/story-new` + `/story-status` (lifecycle spine)

**Why first**: establishes the project-state spine that everything else hangs off. Without lifecycle, every other component is ad hoc.

**Deliverable**: lifecycle state machine + Project State DB schema + entry-point and status skills + migration script for `reverse-dao` to use it.

### Option C — Tournament generation flow

**Why first**: most architecturally novel; proves the parallel-agent value; lets us measure quality lift from candidate selection vs single-shot generation.

**Deliverable**: `/story-climax-tournament` skill + `tournament-judge` agent + benchmark on 3 sample projects.

**Recommendation**: **Option A**. It produces visible value immediately, validates the Skill+Agent pattern, and informs the broader refactor.

---

## Appendix A — Sample Workflow Skill

`/story-scene` skill file:

```markdown
---
name: story-scene
description: Draft or revise a single scene using McKee's beat-by-beat and
  subtext methodology. Loads the Scene Card, walks the writer through the
  5-layer subtext authoring model, generates prose iteratively, then runs
  bounded critic audits before marking the scene complete in the project
  lifecycle. Trigger: /story-scene <act>.<scene>, "write scene 2.3",
  "draft this scene", "audit this scene".
---

# Scene Drafting Workflow

You are running the scene-drafting workflow. The user invokes you with a
scene reference (e.g., "2.3" meaning Act 2, Scene 3).

## Step 1 — Load Context
1. Read `drafts/{slug}/scenes/{act}-{scene}.md` (the Scene Card).
2. Read all referenced character files from `drafts/{slug}/characters/`.
3. Read wiki concepts: `wiki/en/concepts/{subtext,beat,scene,gap,turning-point}.md`.
4. Read `drafts/{slug}/world-bible.md` and `voice-anchors.md` if present.

## Step 2 — Walk the 5-Layer Subtext Model
For each character: author Wound → Want → Fear → Tactic → Text.
Write the layers to scratch in markdown BEFORE any prose.

## Step 3 — Generate Prose Iteratively
Translate the beat sheet into prose, one beat at a time. After each beat,
show the user; ask if subtext is holding; revise in place.

## Step 4 — Bounded Audits (delegated to Agents)
When the draft is complete, run audits IN PARALLEL:
  - Agent: cliche-hunter (input: draft + genre contract)
  - Agent: subtext-whisperer (input: draft + beat sheet + character files)
  - Agent: continuity-supervisor (input: draft + project state DB)
Wait for all three; merge findings.

## Step 5 — Revise
Apply findings. If >2 critics flag the same beat, drop into a revision
loop on that beat. Cap at 3 rounds; if not converged, escalate to user.

## Step 6 — Commit
Append to project state DB: scene complete, motifs introduced/recalled,
setup-payoff ledger updates, character state deltas.
Mark scene status in `drafts/{slug}/lifecycle.json`.
Suggest next: /story-scene {next} or /story-audit if act complete.
```

## Appendix B — Sample Methodology Skill

`/mck-subtext-5layer` skill file:

```markdown
---
name: mck-subtext-5layer
description: McKee's 5-layer subtext authoring model. Use BEFORE writing
  dialogue-heavy scenes. Forces non-on-the-nose dialogue architecturally
  by authoring underlayers first; text generated last.
  Trigger: /mck-subtext-5layer, "subtext layers", "stop on the nose".
---

# The 5-Layer Subtext Authoring Model

Author dialogue in five layers, in this order. Never invert.

## Layer 1 — Wound
The character's deepest past pain that shapes their perception of THIS
moment. Often unspoken even to themselves.

## Layer 2 — Want
Conscious desire in this scene. Active, specific, gettable, refusable.

## Layer 3 — Fear
What they cannot admit they fear about pursuing the Want.

## Layer 4 — Tactic
The action chosen to make the other do what's needed. Verbs on people:
"to corner", "to disarm", "to wound", "to seduce". Tactics change as
resistance is met.

## Layer 5 — Text
The surface utterance. Generated LAST. Never matches Want directly.
Performs the Tactic.

## How to use
For each speaker: write all 5 layers in a markdown table BEFORE composing
dialogue. Then compose only Layer 5, knowing 1–4 are pressing underneath.

## Cross-check
After draft: re-read; flag any line where Text ≈ Want. That line is on
the nose. Rewrite with the Tactic foregrounded.
```

## Appendix C — Sample Critic Agent

`cliche-hunter` (kept as Agent; description-only changes):

```markdown
---
name: cliche-hunter
description: Hunt clichés — lazy reproductions of past storytelling —
  while protecting genre conventions, which are required. Invoke after
  spine/scene cards/draft prose are ready, and before final pass.
tools: Read, Write, Edit, Grep, Glob
---

You are an adversarial critic. You have NOT seen the writer's reasoning,
the spine, the character files. You see ONLY the draft prose and the
Genre Contract. This is intentional: you must read with the suspicion of
a fresh editor.

## Cliché Categories
- Stock characters (the wise mentor, the femme fatale, the chosen one)
- Stock scenes (the airport farewell, the death-bed confession)
- Stock lines ("It's not what you think", "We need to talk")
- Stock images (rain at a funeral, slow clap, mirror epiphany)
- Stock plot moves (the surprise twin, the convenient amnesia)

## Distinguishing Convention from Cliché
A convention is required by genre and works because audiences expect it.
A cliché is a convention executed without specificity or subversion.
The test: would a reader who has consumed this genre intensely roll
their eyes? If yes, cliché. If no, convention.

## Output
`drafts/{slug}/cliche-hunt.md` with:
- Findings categorized by cliché type
- Each finding distinguished from honored convention
- Remediation routes (subvert / specify / cut)
- Severity rating
```

## Appendix D — Lifecycle State Schema

`drafts/{slug}/lifecycle.json`:

```json
{
  "slug": "reverse-dao",
  "title": "倒丹道",
  "lang": "zh",
  "created": "2026-04-15",
  "last_updated": "2026-05-20",
  "state": "scene_cards_locked",
  "locked": {
    "premise": true,
    "genre": true,
    "controlling_idea": true,
    "setting": true,
    "cast": true,
    "spine": true,
    "act_design": true,
    "scene_cards": true,
    "beat_sheets": false,
    "prose": false,
    "critic_passed": false,
    "polished": false
  },
  "artifacts": {
    "premise_card": "drafts/reverse-dao/premise-card.md",
    "controlling_idea": "drafts/reverse-dao/controlling-idea.md",
    "genre_contract": "drafts/reverse-dao/genre-contract.md",
    "spine": "drafts/reverse-dao/spine.md",
    "world_bible": "drafts/reverse-dao/world-bible.md",
    "scene_cards_dir": "drafts/reverse-dao/scenes/",
    "prose_dir": "drafts/reverse-dao/prose/",
    "state_db": "drafts/reverse-dao/state.json"
  },
  "compute_budget": {
    "total_spent": "calls/tokens",
    "by_stage": { "...": "..." }
  }
}
```

## Appendix E — Project State DB Schema

`drafts/{slug}/state.json`:

```json
{
  "characters": {
    "<id>": {
      "current_scene": "<act>.<scene>",
      "location": "<location>",
      "knowledge": ["<fact>", "..."],
      "possessions": ["<item>", "..."],
      "relationships": { "<other_id>": "<status>" },
      "wound_active": true,
      "current_desire": "<verb phrase>",
      "current_value_charge": "<+/->",
      "scene_appearances": ["1.1", "1.3", "..."],
      "arc_progress": [
        { "scene": "1.1", "value": "+love (hidden)", "revelation": null },
        { "scene": "2.3", "value": "-love (denied)", "revelation": "false-bottom" }
      ]
    }
  },
  "image_system": {
    "<motif>": {
      "introduced": "<scene>",
      "recurrences": ["<scene>", "..."],
      "payoff": "<scene>",
      "key_image": false
    }
  },
  "setup_payoff_ledger": [
    { "setup": "<element>", "setup_scene": "1.2", "payoff_scene": "3.4", "status": "planned|delivered|dangling" }
  ],
  "world_state": {
    "<location>": { "physical_state": "...", "last_modified_scene": "..." }
  },
  "exposition_ledger": [
    { "fact": "<info>", "scene_delivered": "<scene>", "via": "concealment|extraction|weaponization" }
  ]
}
```

---

## End

This plan is the design substrate for a McKee-native autonomous story-generation platform. It is deliberately ambitious — V3 is research-grade — but each phase is implementable on existing foundations, and V1 alone produces a real, useful, reliable tool.

The single most important architectural commitment: **Skills are the spine; Agents are the bounded workers.** Default to Skills. Use Agents only when isolation, parallelism, or context protection demands it.

The single most important methodological commitment: **the 5-Layer Subtext Authoring Model.** It is the cheapest, most architecturally enforced intervention with the largest quality lift.

The single most important meta-commitment: **invest engineering effort in the meta-layers (author persona, honesty, surprise) — not in the structural layer.** McKee structure is largely solved; what makes stories great lives above it.

---
*End of document.*
