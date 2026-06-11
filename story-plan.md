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
| `/story-scene` | Draft or revise a single scene; local Beat work now passes through an internal Beat Gate before full-scene critics |
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
| `reader-simulator`* | Reads blind; reports FULL-draft or WINDOW engagement findings |
| `tournament-judge`* | Blind ranking of N candidates against criteria |
| `specificity-auditor`* | Flags generic nouns / verbs that need forge invocation |
| `pacing-analyst`* | Scene length & rhythm distribution, including WINDOW checks |

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

### V1 — Reliable Competence (4–6 months) ✅ COMPLETE

**Goal**: produce structurally sound novellas reliably.

**Built**:
- Workflow skills: `/story-new` ✅ `/story-status` ✅ `/story-premise` ✅ `/story-spine` ✅ `/story-cast` ✅ `/story-scene` ✅ `/story-act` ✅ `/story-audit` ✅ `/story-revise` ✅ `/story-publish` ✅
- Methodology skills: `/mck-controlling-idea` ✅ `/mck-subtext-5layer` ✅ `/mck-beat-to-prose` ✅ `/mck-crisis-dilemma` ✅ `/mck-arc-walk` ✅ `/mck-gap-find` ✅
- Agent → Skill refactors (7/7): `arc-tracer` ✅ `act-designer` ✅ `exposition-smuggler` ✅ `key-image-curator` ✅ `composition-conductor` ✅ `controlling-idea-architect` ✅ `wiki-librarian` ✅
- New agents: `prose-drafter` ✅ `continuity-supervisor` ✅ `tournament-judge` ✅
- Project State DB schema + lifecycle template ✅
- Stop-loss convergence (`/story-stop-loss`) ✅

**Outcome**: novellas of 7K–40K words with sound McKee structure, honored genre conventions, no glaring continuity errors. Mid-tier prose. Validates the architecture.

### V2 — Long-Form & Voice (next 6–9 months) ✅ COMPLETE

**Goal**: novel-length output with coherent voice and threaded image system.

**Built**:
- Methodology skills: `/mck-specificity-forge` ✅ `/mck-image-thread` ✅ `/mck-setup-payoff` ✅ `/mck-voice-first` ✅ `/mck-exposition-ammo` ✅ `/mck-negation-of-negation` ✅
- New agents: `reader-simulator` ✅ `voice-drift-detector` ✅ `specificity-auditor` ✅ `pacing-analyst` ✅
- Bounded backtracking with invalidation cascade ✅ — Backtracking Protocol added to `story-scene` (Step B1–B3: diagnose upstream cause → propose mutation → invalidation cascade with depth limit 3)
- Image-system cadence tracking ✅ — `story-scene` Step 10A: motif scan, gap ≥4 alert, Key Image alert, new motif detection (in-context, no agent spawn)
- Setup-payoff auto-detection ✅ — `story-scene` Step 10B: dangling setup alert (past planned payoff scene), new setup detection (objects/facts/promises), groundless payoff check (in-context)

**Outcome**: novels of 40K–150K words with coherent voice, threaded image systems, dialogue with non-trivial subtext. Approaches "good."

### V3 — Greatness Pursuit (next 12+ months) 🟡 CORE COMPLETE; INFRASTRUCTURE PENDING

**Goal**: occasional literary distinction.

**Built**:
- Author Persona system ✅ — `/story-persona` (FORGE / LOAD / APPLY); `templates/persona.md`; wired into `story-new` (Step 3.5), `story-scene` (Step 2 load, Step 5 decision filter, Step 9 Voice Anchor auto-populate)
- Honesty Engine ✅ — `/mck-honesty` (TEST / STRESS / REPAIR); grounded-vs-asserted CI check; theme-via-structure test (3 sub-checks); Counter-Idea full-fight audit; wired into `controlling-idea-architect` FORGE handoff and `story-audit` Step 2
- Surprise Engineering ✅ — `/mck-surprise-plant` (DESIGN / PLANT / AUDIT); misdirection-plan.md template; `surprise-auditor` agent (naive read → misdirection integrity → dual-reading audit → reveal choreography); wired into `story-spine` Step 5.5 offer and `story-audit` Step 2
- Tournament generation ✅ — `/story-tournament` (CONTROLLING-IDEA / INCITING-INCIDENT / PROTAGONIST / CRISIS / CLIMAX); diversity enforcement (idealist/pessimist/ironic/interiority/behavioral slots); cross-tournament coherence check; tournament archive; wired into `story-audit` structural predicates

**Remaining (infrastructure-dependent — beyond skill files)**:
- Mutation-selection for refinement — generation-over-generation evolution; requires fitness function scoring and crossover operator; `/story-tournament` documents the framework but cannot execute it without embedding infrastructure
- Canonical corpus calibration — genre-specific embedding indices; critic calibrated against exemplars rather than internal standards; requires corpus directory + embedding tooling
- Cultural calibration layer (xianxia-specific structures, non-Western frameworks)
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

## 16. V3 Detailed Design — Greatness Pursuit

V1 solves structure. V2 solves voice and coherence. V3 attacks the five residual problems from §1: taste, specificity at the literary level, genuine subtext, inevitable-surprise, and honesty. These are the problems McKee *assumes* the writer brings. V3 supplies them.

### What V3 is not

V3 is not "more passes" or "more critics." It is a qualitative shift in the source of creative decisions. In V1–V2, the system executes a specified methodology. In V3, the system has:

- A **point of view** (Author Persona) that inflects every decision
- A **truth-test** (Honesty Engine) that audits whether what it's saying is true
- A **surprise architecture** (Surprise Engineering) that plants two readings simultaneously
- A **taste calibration** (Corpus Engine) anchored to canonical work, not average output
- A **mutation-selection loop** that searches the solution space rather than committing to the first adequate option

The structural predicate suite from V1 becomes a *floor*, not a ceiling.

---

## 17. Author Persona System

### 17.1 The problem it solves

Without an author persona, every creative decision resolves to "what McKee recommends plus what the training corpus considers average." That produces structurally sound, voiceless work. An author persona is a stable philosophical stance that makes decisions *differently* than the average — and consistently so.

A persona is not a style. Style is surface (vocabulary, rhythm, sentence length). A persona is a worldview: what the author believes about power, love, time, loss, complicity, change. Every scene decision follows from it.

### 17.2 Persona Card format

```yaml
---
name: persona-{slug}
type: author-persona
---

# Author Persona — {name}

## Core Belief
One sentence: what this author believes about how the world works.
Must be contestable (not "love conquers all" but something that admits a counter-argument).
Example: "Power doesn't corrupt; it reveals what was already there."

## What this author sees that others miss
The specific perceptual habit — what they notice in a room, a conversation, a landscape — that shapes their rendering of reality.

## Refusals
What this author will NOT do, even when structurally convenient:
- (e.g., redemption arcs that cost nothing)
- (e.g., irony used as a shield against commitment)
- (e.g., violence as spectacle without consequence)

## Controlling-Idea bias
Which pole of the value square this author is drawn to, and why.
Does the story tend toward positive resolution, ironic, tragic, or satiric?

## Truth claims this author is willing to make
Specific propositions they will build a story around. Derived from the Truth Library.

## Voice signature
Not style rules — the *perceptual* signature: what the camera lingers on, what it cuts away from.

## Exemplar texts
2–3 external works this persona would recognize as kin.
```

### 17.3 How the persona filters decisions

The persona is loaded at project initialization and consulted at every branching creative decision:

| Decision point | How persona applies |
|---|---|
| Which of 5 premises to develop | Which premise most directly tests the Core Belief |
| Controlling Idea direction | Positive, ironic, tragic, satiric — based on Bias field |
| Protagonist's True Character | Must embody or oppose the Core Belief under pressure |
| Crisis design | Both dilemma horns must be believable to an author with this worldview |
| Scene framing | Camera lingers on what the Voice Signature says to linger on |
| What to cut | Anything that violates the Refusals |

### 17.4 Persona conflicts

When a structurally correct choice violates the persona's Core Belief or Refusals:

1. Flag the conflict.
2. Offer a persona-consistent alternative.
3. If the alternative is structurally weaker: escalate to user with explicit trade-off statement.

The system must not silently override the persona for structural convenience. The persona is upstream of structure.

### 17.5 Project-level vs session-level persona

- **Project-level**: locked at project creation; stable across all scenes.
- **Session-level**: a temporary lens for one scene (e.g., "write this scene as if the author distrusts the protagonist"). Must not contaminate the project-level persona.

---

## 18. Honesty Engine

### 18.1 The problem it solves

Stories assert things. "Love conquers all" is an assertion. "Power corrupts" is an assertion. The system can generate a story that *says* "love conquers all" by having a protagonist overcome obstacles via love — but this is mere structural compliance. The Honesty Engine asks: is this true? Not "is it dramatizable" but "does the author actually believe this, and if so, what's the hardest case against it?"

Without the Honesty Engine, every Controlling Idea is a moral bumper sticker. With it, every Controlling Idea is tested against lived reality.

### 18.2 Truth Library

A curated repository of claims about human nature, organized by theme-domain:

```
truth-library/
  power.md       — claims about power, authority, corruption, legitimacy
  love.md        — claims about attachment, sacrifice, possession, distance
  time.md        — claims about memory, regret, irreversibility, repetition
  violence.md    — claims about harm, intention, consequence, necessity
  identity.md    — claims about selfhood, change, continuity, performance
  knowledge.md   — claims about certainty, blindness, revelation, cost
  complicity.md  — claims about participation in wrong, silence, benefit
  ...
```

Each entry:
```yaml
claim: "Power doesn't corrupt; it reveals."
source: "Observation / [author] / [text]"
hardest_counter: "Power creates incentives that even honest people can't resist."
stories_that_test_it: ["All the President's Men", "Breaking Bad"]
stories_that_contradict_it: ["Lord of the Rings (Tolkien's view: it corrupts anyone)"]
verdict: contested  # | supported | refuted | domain-specific
```

The library is not a truth oracle. It is a *resistance catalog*: for any claim the system is about to build a story around, here is the hardest case against it.

### 18.3 Theme-via-structure test

A story *proves* its Controlling Idea only if the proof is structural — emergent from events — not asserted via dialogue, narration, or authorial statement.

Test:
1. Strip all dialogue from the story. Does the Controlling Idea still emerge from events alone?
2. Replace the protagonist's stated beliefs with their opposite. Does the story still arrive at the same Controlling Idea? If yes: the structure doesn't support the idea — only the dialogue does.
3. Does the antagonist represent the Counter-Idea in action (not just in speech)?

Failure on any of these: the story asserts rather than proves.

### 18.4 Controlling Idea verification

Before committing to a Controlling Idea:

1. Look it up in the Truth Library.
2. Find the hardest counter.
3. Design the story so that the counter is *represented* — the antagonist or a subplot embodies the counter fully and compellingly.
4. Verify the story earns its verdict: the Counter-Idea should lose because it is *shown to fail* in specific circumstances, not because it is weak.

A Controlling Idea that never faces its hardest counter is a wish, not a truth.

---

## 19. Surprise Engineering Layer

### 19.1 The problem it solves

McKee's Inevitable-Surprise is the hardest structural achievement: at the Climax, the audience feels "of course — it was always going to be this, and I never saw it coming." This requires planting data that admits two readings simultaneously from the opening. It cannot be added in revision; it must be designed from the first scene.

### 19.2 The dual-reading architecture

Every piece of planted data must support:

- **Surface reading** (available on first read): leads audience toward the misdirected conclusion
- **True reading** (visible on re-read): signals the actual outcome, but unnoticed under the misdirection

The Climax recontextualizes the planted data. After the Climax, re-reading reveals that every planted item *always pointed here*.

### 19.3 Misdirection Engine

```
misdirection-plan/
  {slug}-misdirection.md
```

Format:
```
## Misdirection Target
What the audience is led to expect: [outcome A]

## True Resolution
What actually happens: [outcome B]

## Planted Data Table
| Scene | Item planted | Surface reading | True reading |
|---|---|---|---|
| 1.2 | [item] | [what it appears to mean] | [what it actually signals] |
| 2.1 | [item] | ... | ... |

## Misdirection reinforcement points
Scenes where the false reading is reinforced (and why it doesn't feel cheap after reveal)

## True-reading reinforcement points
Scenes where the true reading is available but submerged (and why it won't be noticed on first pass)
```

### 19.4 Foreshadowing layer

A separate pass over all Act 1–2 scenes after Climax is designed:

For each planted item in the Misdirection Plan:
1. Verify it appears in a scene the audience has already seen.
2. Verify it reads plausibly as surface reading in context.
3. Verify it reads as true reading in retrospect.
4. Verify it isn't a cheat: the true reading must be *available*, not just retroactively asserted.

### 19.5 Reveal choreography

The Climax must:
1. Deliver the event that resolves the true reading.
2. Within the same sequence (not afterward), present at least one planted item that the audience can *now* re-read correctly.
3. Create the "of course" experience before the audience has time to leave the story.

The re-read marker — the moment where the audience sees the true reading in a prior planted item — must be embedded in the Climax scene itself, not in an epilogue.

### 19.6 Post-hoc audit (Agent: `surprise-auditor`)

After full prose draft, spawn `surprise-auditor` with:
- Full prose
- Misdirection plan
- List of planted items

Agent reads the story *as a naive reader* and reports:
- Does the surface reading hold across Act 1–2? (If no: misdirection is leaking — patch)
- Is the true reading available but suppressed? (If no: the Climax will feel arbitrary)
- Does the Climax produce the re-read experience? (If no: choreography needs the anchor moment)

---

## 20. Tournament Generation at Scale

V1 introduces tournament generation for climax design (§5 Flow C). V3 extends tournaments to every high-stakes creative decision.

### 20.1 Tournament-eligible decisions

| Decision | Tournament size | Judge |
|---|---|---|
| Premise selection | 5 candidates | `tournament-judge` + author persona filter |
| Controlling Idea | 3 candidates | `tournament-judge` + Honesty Engine test |
| Protagonist's True Character | 3 variants | `antagonism-stress-tester` + `cast-balancer` |
| Inciting Incident | 3 variants | `crisis-climax-auditor` (forward-projection) |
| Crisis design | 5 candidates | `crisis-climax-auditor` + persona filter |
| Climax design | 5 candidates | `crisis-climax-auditor` + `tournament-judge` |

### 20.2 Candidate diversity enforcement

Tournament candidates must differ in kind, not just in surface detail. The system enforces:

- At least one candidate that takes the *positive* Controlling Idea direction
- At least one that takes the *ironic* direction
- At least one that maximizes the protagonist's interiority at the deciding moment
- At least one that minimizes interiority (behavioral climax only)

Generating N similar candidates is not a tournament. The judge is briefed to penalize candidates that are paraphrases of each other.

### 20.3 Calibrated judge

The `tournament-judge` agent in V3 is calibrated against the canonical corpus (§22). It does not compare candidates against each other in isolation — it compares them against exemplar Climax scenes from the genre corpus. A candidate that is "best of the five" but still below corpus quality should be flagged, not declared winner.

### 20.4 Cross-tournament coherence

When multiple components have been tournament-selected independently, a coherence pass is required:

- Does the selected Controlling Idea support the selected Protagonist True Character?
- Does the selected Inciting Incident create pressure that the selected Crisis forces to a decision point?
- Does the selected Climax flow from the selected Crisis?

If not: one of the selected items must be re-run with the others as constraints.

---

## 21. Mutation-Selection Framework

### 21.1 The problem it solves

Tournament generation produces the best of N random candidates. Mutation-selection produces the best of N evolved candidates — each generation is informed by the failures of the last.

### 21.2 Mutation operators

| Operator | What it changes | When to use |
|---|---|---|
| **Polarity flip** | Invert the Controlling Idea direction | When tone feels wrong |
| **Character swap** | Swap protagonist and antagonist roles | When conflict feels external |
| **Genre hybridize** | Cross primary genre with a secondary | When story feels narrow |
| **Time compress** | Collapse story duration by half | When Act 2 reads slow |
| **Subtext invert** | Reverse what characters want vs. what they say | When dialogue reads on-the-nose |
| **Setting transplant** | Move story to a different location/period | When world feels generic |
| **Crisis sharpening** | Reduce Crisis to one irreconcilable pair | When dilemma reads false |
| **Key Image replace** | Swap the Key Image with a different object | When motif system feels arbitrary |

### 21.3 Fitness function

A story candidate's fitness is a composite of:

1. **Structural predicates** (pass/fail): every scene turns; Crisis is a dilemma; Climax flows from decision; MDQ answered; obligatory scene delivered.
2. **Corpus distance** (score): embedding distance from low-quality vs. high-quality genre exemplars.
3. **Persona alignment** (score): degree to which creative decisions follow from the Author Persona.
4. **Honesty Engine score**: Controlling Idea is dramatized structurally, not just asserted.
5. **Surprise score**: Misdirection plan is coherent; planted data admits dual reading.

Weights are genre-dependent. Structural predicates are always pass/fail gates; the rest are gradient scores.

### 21.4 Selection and reproduction

- **Tournament selection**: among candidates that pass structural gates, select top 2 by composite score.
- **Crossover**: extract high-scoring components from each parent and combine into a new candidate (e.g., Crisis design from Parent A, Protagonist True Character from Parent B).
- **Mutation**: apply one mutation operator to the crossover result.
- **Generation limit**: 5 generations maximum. If structural predicates not passing after 3 generations: escalate to user.

---

## 22. Canonical Corpus Calibration

### 22.1 The problem it solves

Without a reference corpus, "good" is defined relative to the system's own output. That is tautological. Canonical corpus calibration grounds the system's quality judgment in exemplary external work.

### 22.2 Corpus structure

```
corpus/
  {genre}/
    exemplars.md       — titles + authors + why selected
    passages/          — 50–200 word passages per exemplar (key scenes)
    anti-exemplars.md  — titles + why they fail (not just "bad" but specifically how)
    quality-markers.md — extracted stylistic/structural properties from exemplars
```

Selection criteria for exemplars:
- Recognized as genre-best by multiple critics (not just popular)
- Demonstrates specific McKee predicates passing
- Demonstrates non-trivial subtext
- Has a Key Image that lands

Anti-exemplars are as important as exemplars. The system needs to know *how* stories fail, not just what good looks like.

### 22.3 Embedding index

Corpus passages are embedded and stored. At generation time:

- Generated prose is embedded and compared to the exemplar/anti-exemplar distributions.
- Distance from exemplar distribution: higher is worse.
- Distance from anti-exemplar distribution: lower is worse.
- A combined corpus score is reported per scene and per pass.

### 22.4 Style-transfer apprenticeship

For each new project:

1. System reads 3 exemplar passages from the relevant genre.
2. Extracts stylistic markers: sentence-length distribution, verb-to-noun ratio, abstraction level, sensory modality distribution, subordinate clause frequency.
3. Generates a "style fingerprint" for the corpus subset.
4. Voice anchors for the project are seeded from the fingerprint, then customized via author persona.

The system learns *from* the corpus but is not confined to imitation — the Author Persona provides the deviation point.

### 22.5 Genre-innovation detector

Periodically (every 5 projects in the same genre): the system compares its output corpus to the external exemplar corpus. Where the system is consistently generating in *the same structural position* as all exemplars, it attempts a genre-boundary move:

- Hybridize with adjacent genre
- Invert the obligatory scene (deliver it in unexpected form)
- Displace the typical POV (who is telling this story and why)

Successful hybrid outputs are added to the internal exemplar corpus for future use.

---

## 23. Cultural Calibration Layer

### 23.1 Non-Western structural frameworks

McKee's framework is Western, screenplay-biased, and three-act-dominant. The platform extends:

| Framework | Origin | Structure | Best for |
|---|---|---|---|
| Kishōtenketsu (起承転結) | East Asian | 4-part: introduce → develop → twist → reconcile | Short fiction without conflict as driver |
| 起承转合 (Qǐ-chéng-zhuǎn-hé) | Chinese classical | 4-part parallel; 转 is tonal, not structural | Poetry, lyric prose, tone-shift narrative |
| Rasa-based | Indian classical | 8 permanent emotions + 33 transient; dramatic arc is emotional state sequence | High emotional register narrative |
| Oral tradition cyclic | Various | Recursive episodic; protagonist returns changed but world recurs | Long-form mythic, generational narrative |
| In-medias-res compression | Classical Western | Begin at crisis; backstory as ammunition | Short story, noir, thriller opening |

The system selects a structural framework based on:
1. Genre contract (primary determinant)
2. Cultural calibration setting (project-level flag)
3. Author Persona bias (some personas reject three-act as a Western imposition)

### 23.2 Xianxia augmentation

Xianxia is the test genre for non-Western framework integration (given the active `reverse-dao` project). Additional obligatory scene types beyond McKee:

| Scene type | Function | McKee analog |
|---|---|---|
| Breakthrough (突破) | Protagonist's cultivation tier advance under pressure | Revelation + value shift |
| Dao-realization (悟道) | Single-sentence insight that restructures the protagonist's understanding | Revelation of True Character |
| Qi-reckoning | Cost accounting: what has the protagonist's power path cost in human terms? | Antagonism escalation |
| Karma ledger | Explicit or implied accounting of moral debts | Setup-payoff for ethical choices |
| Sect confrontation | Protagonist's standing against a collective hierarchy | Personal antagonism played at social level |

These augment the McKee obligatory scenes — they do not replace them. A xianxia story still requires a Crisis dilemma, a Climax that flows from decision, and a Controlling Idea that is dramatized structurally.

### 23.3 Value-system mappings

McKee's value charges (positive/negative) are culturally encoded. The platform must map:

| Universal value | Western default charge | Cultural variation |
|---|---|---|
| Individual autonomy | Positive | In Confucian-inflected settings: ambivalent (vs. relational duty) |
| Sacrifice | Positive (heroic) | In some traditions: contaminating (survivor's guilt as permanent debt) |
| Winning vs. losing face | Secondary | In xianxia: primary — maps directly to positive/negative value pole |
| Filial obligation | Neutral-positive | In xianxia: can be the Crisis horn that opposes individual desire |

The `controlling-idea` methodology skill checks value charges against the cultural calibration setting before locking.

---

## 24. V3 Success Criteria and Evaluation

### 24.1 The structural floor (inherited from V1/V2)

Before V3 quality can be measured, V1/V2 predicates must be passing:
- Every scene turns (value charges verified)
- Crisis is a true dilemma (both horns are desirable/necessary)
- Climax flows from decision (no coincidence)
- MDQ answered
- Controlling Idea dramatized structurally
- Genre obligatory scenes delivered
- Voice consistent across full draft
- Image system threaded at cadence
- Setup-payoff ledger clean

### 24.2 V3-specific quality predicates

| Predicate | Test |
|---|---|
| **Author Persona coherent** | All creative decisions trace back to Persona Core Belief or Refusals |
| **Controlling Idea earns verdict** | Antagonist embodies Counter-Idea fully; Counter-Idea loses for structural reasons, not weakness |
| **Dual-reading architecture intact** | On first read: surface reading holds. On re-read: true reading visible in all planted items |
| **Climax has re-read marker** | Within Climax scene: at least one prior planted item is explicitly re-contextualized |
| **Corpus distance** | Generated prose embedding within 1σ of exemplar distribution, >1σ from anti-exemplar |
| **Surprise score** | `surprise-auditor` reports: misdirection holds; true reading available but suppressed |
| **Honesty Engine** | Controlling Idea survives hardest counter from Truth Library |

### 24.3 The honest upper bound

Even a fully built V3 cannot guarantee literary distinction. The upper bound is constrained by:

1. **No lived experience** — the Honesty Engine tests claims against a library, not a body. Coetzee or Le Guin draw on perceptual habits formed over decades of specific, unrepeatable experience.
2. **Surprise is teachable, not original** — the system can execute Inevitable-Surprise as a technique; it cannot *invent* a new form of surprise that no author has attempted.
3. **Persona is configured, not inhabited** — the Author Persona is a filter on decisions; it is not a consciousness with stakes. The difference shows in the long game (across 40K+ words) when persona-consistent decisions accumulate into something the author would *recognize*, vs. something they might choose.

The platform's honest value proposition: **reliably reaching the ceiling of structural competence, with a meaningful fraction of outputs ascending above it through deliberate investment in the meta-layers.** Not every project; but enough to justify the architecture.

---

## Appendix F — Author Persona Card (Sample)

`drafts/{slug}/persona.md`:

```markdown
---
name: persona-reverse-dao
type: author-persona
lang: zh
project: reverse-dao
---

# Author Persona — 《废徒倒丹》

## Core Belief
Recognition cannot be given. It can only be withheld — or not withheld. The moment it is given, it has already changed into something else.

## What this author sees that others miss
The gesture that costs nothing but is never made. The word that would settle everything, said by no one, to no one.

## Refusals
- No redemption arc that costs the redeemer nothing.
- No reconciliation scene. The separation stands. Its standing is the statement.
- No earned catharsis for the audience at the cost of the story's logic.
- No final word from the master that clarifies his intention.

## Controlling-Idea bias
Ironic. The value the protagonist pursues is unverifiable by the story's end — not because he failed, but because verification requires a witness who is no longer present.

## Truth claims this author is willing to make
- "The act of recognition performed in private, without witness, does not confer what recognition requires."
- "A person can make the correct decision and remain unrecognized by their own action."
- "Inheritance requires a ceremony. Without ceremony, the inheritor inherits nothing they can show."

## Voice signature
The camera holds on the physical object after the person has moved. It cuts before the expected emotional resolution. It never explains what the silence meant.

## Exemplar texts
- Cormac McCarthy, *The Road* (ironic value; action-is-love without naming)
- 残雪, 《黄泥街》 (camera on detail that defies interpretation)
- 鲁迅, 《孤独者》 (ironic Controlling Idea; recognition withheld to the end)
```

---

## Appendix G — Truth Library Entry (Sample)

`corpus/truth-library/recognition.md`:

```markdown
# Truth Library — Recognition (承认)

## Claim 1
**"Recognition given by authority only counts as recognition while the authority's legitimacy holds."**

Source: Observed structural pattern across *Hamlet*, *Crime and Punishment*, xianxia sect-hierarchy fiction.

Hardest counter: "Recognition from illegitimate authority is still recognition — it changes the recognized person's social reality even if the source is corrupt."

Stories that test it: *A Doll's House* (Nora's rejection of Helmer's recognition); *Hamlet* (Claudius's court recognizes Hamlet as prince; Hamlet refuses the recognition).

Stories that contradict it: *Breaking Bad* (Walter accepts Gus's recognition of his craft even though Gus is criminal; the recognition operates independently of moral legitimacy).

Verdict: **domain-specific** — in settings where authority *is* the legitimacy (xianxia sect hierarchies), the claim holds strongly. In settings where authority and legitimacy are severed, the claim weakens.

## Claim 2
**"Self-recognition without external witness is indistinguishable from self-delusion."**

Source: Observed in *Notes from Underground*, 阿Q正传, *The Remains of the Day*.

Hardest counter: "The only recognition that matters is the one you can live inside of — external recognition is performance, not substance."

Stories that test it: *The Remains of the Day* (Stevens recognizes his own compromise too late and in private; the reader cannot determine if this is genuine recognition or another form of self-management).

Verdict: **contested** — the hardest cases are the ones that refuse to resolve this.

## Application to 《废徒倒丹》
The protagonist's entire arc is built on Claim 2's hardest case. He performs a recognition ritual (the ruler, raised but never fallen) that has no witness capable of verifying it. The story refuses to adjudicate. The Controlling Idea is:

> 承认以行动为证，但行动无法自证。
> (Recognition is proven by action, but action cannot prove itself.)

This survives the Honesty Engine test: the hardest counter (witness not required) is represented by the master's self-sufficient stance throughout the story, and loses at the Climax not because it is wrong, but because the master's death forecloses the possibility of adjudication.
```

---

## Appendix H — Mutation-Selection Run (Sample)

`drafts/{slug}/mutation-log.md`:

```markdown
# Mutation Log — {slug}

## Generation 0 — Seed

**Candidates**: 3 (tournament-generated Crisis designs)
**Selected**: Candidate 2
**Fitness**: Structural 3/5 predicates pass; Persona alignment 0.71; Corpus distance 1.2σ from exemplar
**Problem**: Crisis dilemma horn 2 ("refuse and become permanent slave to debt") fails the true-dilemma test — it is clearly worse. Not irreconcilable.

## Generation 1 — Mutation: Crisis Sharpening

**Operator applied**: Crisis sharpening (reduce to one irreconcilable pair)
**Mutation**: Horn 2 rewritten — "refuse and allow sister to enter the furnace as core" — making refusal cost the thing the protagonist least wants to cost.
**New fitness**: Structural 5/5 pass; Persona alignment 0.84; Corpus distance 0.6σ
**Selected**: Yes

## Generation 2 — Crossover: Character × Crisis

**Parents**: Gen 1 Crisis design + Tournament Protagonist True Character (alt candidate)
**Crossover**: Combined Gen 1's dilemma structure with alt character's "承认仪式 as incomplete gesture" True Character
**Mutation applied**: Polarity flip on resolution — from tragic (death) to ironic (survival without verification)
**New fitness**: All structural predicates pass; Persona alignment 0.92; Corpus distance 0.4σ; Surprise score: dual reading confirmed
**Selected**: Yes — locked

## Note
Generation 2 result is the design locked in current draft. The ironic resolution (举着未落) emerged from the polarity flip in Gen 2, not the seed. The mutation-selection loop produced the Climax's central image.
```

---

## End

This plan is the design substrate for a McKee-native autonomous story-generation platform. It is deliberately ambitious — V3 is research-grade — but each phase is implementable on existing foundations, and V1 alone produces a real, useful, reliable tool.

The single most important architectural commitment: **Skills are the spine; Agents are the bounded workers.** Default to Skills. Use Agents only when isolation, parallelism, or context protection demands it.

The single most important methodological commitment: **the 5-Layer Subtext Authoring Model.** It is the cheapest, most architecturally enforced intervention with the largest quality lift.

The single most important meta-commitment: **invest engineering effort in the meta-layers (author persona, honesty, surprise) — not in the structural layer.** McKee structure is largely solved; what makes stories great lives above it.

The single most important V3 commitment: **the Author Persona is upstream of everything.** A story without a persona produces competent work. A story with a persona that has a genuine Core Belief, specific Refusals, and a Truth Library entry it is willing to build toward — that story has a chance at something more.

---
*End of document.*
