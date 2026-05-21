# McKee Story Workflow — User Manual

> 中文版：[MANUAL-ZH.md](MANUAL-ZH.md)

**Version**: 2.0 (V1 + V2 + V3 Core)
**Last updated**: 2026-05-21

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [The Five Hard Problems](#2-the-five-hard-problems)
3. [Installation](#3-installation)
4. [Architecture Overview](#4-architecture-overview)
5. [The Project Lifecycle](#5-the-project-lifecycle)
6. [Quickstart: Seed to First Scene](#6-quickstart-seed-to-first-scene)
7. [Workflow Skills Reference](#7-workflow-skills-reference)
8. [Methodology Skills Reference](#8-methodology-skills-reference)
9. [Infrastructure Skills Reference](#9-infrastructure-skills-reference)
10. [Agent Reference](#10-agent-reference)
11. [Templates Reference](#11-templates-reference)
12. [Full Workflow Walkthrough](#12-full-workflow-walkthrough)
13. [Advanced Features: V3](#13-advanced-features-v3)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. What This Is

This is a **McKee-native story generation platform** — a hybrid of Claude Code skills and specialized agents that takes a writer from a raw fragment of inspiration through to a structurally sound, polished prose draft.

The system is built on Robert McKee's *Story* (1997) — the most rigorous published framework for story structure, character, genre, and meaning. Everything the system produces is grounded in McKee's methodology: every scene must turn, every crisis must be a true dilemma, every controlling idea must be dramatized through structure rather than asserted through dialogue.

**What it is not**: a prompt-based story generator. The system runs iterative workflows, tracks project state, spawns critic agents with fresh eyes, and enforces convergence protocols. It is a *platform for serious craft*, not an autocomplete.

### What McKee's framework provides

McKee's framework specifies the **structural** dimensions of great storytelling algorithmically:
- Every scene has a value charge that shifts (the scene *turns*)
- Every story has a spine: Inciting Incident → Progressive Complications → Crisis → Climax → Resolution
- The Crisis is a true dilemma — irreconcilable goods or unavoidable evils
- The Climax flows causally from the Crisis decision, not from coincidence
- The Controlling Idea is the single sentence of "value + cause" that every scene serves

McKee *assumes* the writer brings the rest: taste, voice, truth, subtext, inevitable-surprise. This platform supplies what McKee assumes.

---

## 2. The Five Hard Problems

The system is designed around five dimensions that structural compliance alone cannot solve:

| Problem | Why it's hard | How this system addresses it |
|---|---|---|
| **Taste** | "Great" is recognized, not specified; AI defaults drift to the average | Critic stack + stop-loss convergence protocol |
| **Specificity** | AI defaults to generic language: "the man entered the room" | `/mck-specificity-forge` + world-bible + `specificity-auditor` agent |
| **Subtext** | Training data is saturated with on-the-nose dialogue | `/mck-subtext-5layer` authoring model: 5 layers before any text is written |
| **Inevitable-Surprise** | Requires planted data that admits two readings from the opening | `/mck-surprise-plant` + `surprise-auditor` agent |
| **Honesty** | The system has no lived experience | `/mck-honesty` Honesty Engine + Truth Library in Author Persona |

---

## 3. Installation

### Prerequisites

- Claude Code CLI installed (`claude` command available)
- Git
- A project directory for your story

### Install Skills Globally

Skills installed in `~/.claude/skills/` are available in every Claude Code session.

```bash
# Clone the repository
git clone https://github.com/Quentinbest/McKee-stroy-workflow.git

# Install all skills globally
cp -r McKee-stroy-workflow/skills/* ~/.claude/skills/
```

### Install Agents Into Your Story Project

Agents go into `.claude/agents/` inside your story project directory.

```bash
# In your story project directory:
mkdir -p .claude/agents/
cp -r McKee-stroy-workflow/agents/* .claude/agents/
```

### Scaffold a New Project

Use the provided templates to initialize a project:

```bash
# Create project structure
mkdir -p drafts/my-story/{characters,scenes,prose,01-act-1,02-act-2,03-act-3}

# Copy templates
cp McKee-stroy-workflow/templates/lifecycle.json drafts/my-story/lifecycle.json
cp McKee-stroy-workflow/templates/state.json drafts/my-story/state.json
```

Or simply start a Claude Code session in your story directory and run:

```
/story-new "your seed here"
```

The skill initializes the directory structure automatically.

### Verify Installation

In any Claude Code session:

```
/story-status
```

If the skill loads and reports (even "no project found"), installation succeeded.

---

## 4. Architecture Overview

The platform has four layers:

```
┌──────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — WORKFLOW SKILLS  (/story-*)                               │
│  User-facing entry points. Run in main context. Visible, iterative.  │
│  story-new · story-status · story-premise · story-spine · story-cast │
│  story-act · story-scene · story-audit · story-revise · story-publish│
├──────────────────────────────────────────────────────────────────────┤
│  LAYER 2 — METHODOLOGY SKILLS  (/mck-*)                              │
│  The McKee how-tos. Reusable, composable, invocable standalone.      │
│  V1: subtext-5layer · controlling-idea · beat-to-prose · crisis-     │
│      dilemma · arc-walk · gap-find                                   │
│  V2: image-thread · setup-payoff · specificity-forge · voice-first · │
│      exposition-ammo · negation-of-negation                          │
│  V3: honesty · surprise-plant                                        │
├──────────────────────────────────────────────────────────────────────┤
│  LAYER 3 — GENERATOR AGENTS  (produce artifacts)                     │
│  Bounded, isolated, cold-start. For complex generation tasks.        │
│  premise-prospector · character-forger · structure-skeleton ·        │
│  scene-architect · beat-miner · prose-drafter                        │
├──────────────────────────────────────────────────────────────────────┤
│  LAYER 4 — CRITIC AGENTS  (audit with fresh eyes)                    │
│  Read the draft blind, return findings. Adversarial by design.       │
│  cliche-hunter · antagonism-stress-tester · crisis-climax-auditor ·  │
│  subtext-whisperer · composition-conductor · continuity-supervisor · │
│  voice-drift-detector · specificity-auditor · reader-simulator ·     │
│  pacing-analyst · surprise-auditor · tournament-judge                │
└──────────────────────────────────────────────────────────────────────┘
    Under everything: lifecycle.json · state.json · world-bible ·
    persona.md · voice-anchors.md · misdirection-plan.md
```

### Why Skills, Not Agents, for Everything?

Agents start cold — they re-derive all context from scratch on every invocation. For iterative, conversational work (forging a Controlling Idea, walking a character arc, authoring subtext), that cold-start overhead is wasteful. Skills run in main context: the methodology is visible, the user can interject, and the session's already-loaded context is available.

Agents are reserved for three cases where cold-start is a feature:
1. **Context isolation** — critics must read the work without author bias
2. **Parallelism** — spawning 4 critics simultaneously
3. **Volume** — tasks that would fill the parent context window (e.g., prose-drafter for long scenes)

---

## 5. The Project Lifecycle

Every project moves through these states, tracked in `lifecycle.json`:

```
inspiration
    ↓  /story-new
premise_locked
    ↓  /mck-controlling-idea or /story-premise
genre_locked
    ↓  /genre-cartographer (agent) or manual
controlling_idea_locked
    ↓  /story-spine
setting_locked
    ↓  /story-cast
cast_locked
    ↓  /story-spine
spine_locked
    ↓  /story-act (repeat per act)
act_design_locked
    ↓  /story-scene (repeat per scene)
scene_cards_locked
    ↓  /story-scene (prose mode, repeat per scene)
prose_drafted
    ↓  /story-audit
critic_passed
    ↓  /story-revise
polished
    ↓  /story-publish
done
```

Each gate has **must-pass predicates**. The system will not advance a project past a gate if predicates fail — it surfaces the specific failures and offers repair paths.

**Lifecycle file**: `drafts/{slug}/lifecycle.json`
```json
{
  "slug": "my-story",
  "state": "spine_locked",
  "locked": {
    "premise": true,
    "genre": true,
    "controlling_idea": true,
    "spine": true,
    "cast": false
  }
}
```

---

## 6. Quickstart: Seed to First Scene

This walkthrough takes you from nothing to a drafted first scene in a single session.

### Step 1 — Start a new project

```
/story-new "a clockmaker who builds clocks that run backwards"
```

The skill:
- Asks "what about this won't let you go?" — the *haunt*
- Derives a slug (e.g., `clockmaker`)
- Initializes the directory structure
- Offers to forge an Author Persona (recommended)
- Spawns `premise-prospector` to generate 5 candidate premises

### Step 2 — Lock a premise

The agent returns 5 candidates. Review them. Pick one, or request a variant. The skill writes `premise-card.md` and advances the lifecycle.

### Step 3 — Forge the Controlling Idea

```
/controlling-idea-architect FORGE
```

Generates 3 candidates (idealist / pessimist / ironic). After you select one, the Honesty Engine runs automatically: is this CI grounded in something real, or is it a moral bumper sticker?

### Step 4 — Build the spine

```
/story-spine
```

Spawns `structure-skeleton` agent. The skill audits the returned spine against McKee predicates (Inciting Incident, Crisis dilemma, Climax causality) and iterates up to 3 rounds. After locking, offers to design the Inevitable-Surprise architecture.

### Step 5 — Design the cast

```
/story-cast
```

Spawns `character-forger` for the protagonist and core characters. Spawns `cast-balancer` to verify each character exerts unique pressure on the protagonist. No redundant roles.

### Step 6 — Plan Act 1

```
/story-act 1
```

Spawns `act-designer` and `scene-architect` for Act 1. Returns Scene Cards: one per scene, with objective, conflict, turning point, and value shift.

### Step 7 — Write Scene 1.1

```
/story-scene 1.1
```

Loads the Scene Card, character files, world-bible, and persona. Walks the 5-layer subtext model. Drafts beat by beat. Runs 3 critic agents in parallel (cliche-hunter, subtext-whisperer, continuity-supervisor). Applies revisions. Commits the prose.

That's it. From seed to prose in 7 steps.

---

## 7. Workflow Skills Reference

### `/story-new`

**Purpose**: Initialize a new story project from any seed.
**Trigger**: `/story-new`, "start a new story", "I have an idea", "new project"
**Input**: a seed (image, dream, news clipping, overheard line, mood, what-if)
**Output**: initialized project directory + premise-card.md + lifecycle.json

**What it does**:
1. Extracts the *haunt* — the emotional core that won't let the writer go
2. Derives a slug from the seed
3. Creates directory structure (`characters/`, `scenes/`, `prose/`, stubs)
4. Offers to forge an Author Persona (Step 3.5)
5. Spawns `premise-prospector` for a 5-candidate premise slate
6. Guides premise selection and locks it

**When to use**: always first. Every project starts here.

---

### `/story-status`

**Purpose**: Dashboard — current lifecycle state, locked gates, artifact inventory, next suggested action.
**Trigger**: `/story-status`, "where am I", "what's locked"
**Input**: none (reads lifecycle.json automatically)
**Output**: status report in the conversation

**What it shows**:
- Lifecycle gates with ✅/⬜ status
- Artifact counts (character files, scene cards, prose files)
- Suggested next action based on current state

**When to use**: at the start of any session to orient, or when unsure what comes next.

---

### `/story-premise`

**Purpose**: Generate and lock a Premise Card separately from story-new.
**Trigger**: `/story-premise`, "generate premises", "premise slate"
**Input**: haunt, genre preferences, any known constraints
**Output**: `drafts/{slug}/premise-card.md`

**When to use**: when starting a project without going through story-new, or when you want to regenerate the premise slate with new constraints.

---

### `/story-spine`

**Purpose**: Build the story's load-bearing skeleton — Inciting Incident through Crisis, Climax, and Resolution.
**Trigger**: `/story-spine`, "build the spine", "story structure", "map the plot"
**Input**: premise-card.md, controlling-idea.md (if locked), genre-contract.md (if locked)
**Output**: `drafts/{slug}/spine.md` with Mermaid timeline + MDQ statement

**Predicates checked**:
- Inciting Incident upsets the balance, raises the MDQ
- Each complication escalates; at least one inverts strategy; at least one is irreversible
- Crisis is a true dilemma (not a hard choice)
- Climax flows causally from the Crisis decision
- Resolution shows new equilibrium

**After locking**: offers `/mck-surprise-plant DESIGN` — design the Inevitable-Surprise architecture before writing Act 1.

**When to use**: after Controlling Idea is locked. The spine is the single most important structural artifact.

---

### `/story-cast`

**Purpose**: Design the full cast as a system of pressures on the protagonist.
**Trigger**: `/story-cast`, "design the cast", "character system"
**Input**: premise-card.md, spine.md, genre-contract.md
**Output**: character files in `drafts/{slug}/characters/` + cast-design.md

**What it produces per character**:
- Characterization (the surface — age, appearance, mannerism)
- True Character (revealed under maximum pressure — the wound, the want, the fear)
- Dimension (at least 3 contradictions)
- The unique pressure this character exerts on the protagonist

**Redundancy audit**: spawns `cast-balancer` to verify no two characters apply the same pressure. Recommends merges, cuts, or promotions.

**When to use**: after the spine is locked (or at least the protagonist is designed), before Act 1 scene planning begins.

---

### `/story-act`

**Purpose**: Plan a single act's scene sequence — objective, conflict, turning point, and value shift per scene.
**Trigger**: `/story-act 1`, `/story-act 2`, "plan act 1", "scene sequence"
**Input**: spine.md, act boundaries from act-designer, character files
**Output**: Scene Cards in `drafts/{slug}/scenes/{act}-{N}.md`

**What it does**:
1. Spawns `act-designer` to determine act structure and sequence rhythm
2. Spawns `scene-architect` to produce a Scene Card per scene
3. Audits each card: does the scene turn? Is the turning point caused by decision, not coincidence?

**When to use**: act by act, after the spine is locked. Do not plan all acts at once — Act 2 design should incorporate what Act 1 drafting reveals.

---

### `/story-scene`

**Purpose**: Draft or revise a single scene — the most-used skill in the platform.
**Trigger**: `/story-scene 1.1`, "write scene 2.3", "draft the next scene", "work on scene"
**Input**: Scene Card for the specified scene
**Output**: prose file at `drafts/{slug}/prose/{act}/{scene}.md`

**The workflow** (all in main context — visible and interruptible):

1. **Identify** — find or create the Scene Card
2. **Load Context** — Scene Card, character files, world-bible, voice anchors, preceding prose, persona working reference
3. **5-Layer Subtext Model** — for each character: Wound / Want / Fear / Tactic / Text Strategy (filled in *before* any prose is written; shown to user for confirmation)
4. **Gap Identification** — what does the POV character expect? What does the scene actually deliver?
5. **Draft Beat by Beat** — one beat at a time; each beat filtered through the persona Decision Protocol (Belief / Beauty / Refusal / Truth); shown to user beat by beat
6. **Turning Point Check** — value charge has begun to shift; turning point is in action, not speech
7. **Critic Audits** — 3 agents in parallel: `cliche-hunter` + `subtext-whisperer` + `continuity-supervisor`
8. **Revise** — apply findings; stop-loss enforces 3-round cap per beat
9. **Commit** — write prose file; update state.json; update Scene Card
10. **Post-Commit Coherence** — image-system cadence check (motif gaps, Key Image status, new motifs detected) + setup-payoff ledger check (dangling setups, new setup detection, groundless payoffs)

**Backtracking Protocol**: if a scene repeatedly fails a predicate, the skill diagnoses the upstream cause (Scene Card / character want-wound / spine event) and proposes a specific mutation. Maximum 3 backtrack levels.

**When to use**: the primary scene-writing entry point. Use it for every scene.

---

### `/story-audit`

**Purpose**: Run the full McKee critic suite over the draft — structural compliance, antagonism balance, cliché hunt, crisis/climax validity, subtext, composition, honesty, surprise.
**Trigger**: `/story-audit`, "audit the story", "run the critics", "what's wrong with this draft"
**Input**: all prose files + spine + CI + genre contract + character files
**Output**: `drafts/{slug}/audit-report.md` with ranked findings + structural predicates table

**Critics spawned in parallel**:
- `antagonism-stress-tester` — antagonism force balance
- `crisis-climax-auditor` — dilemma authenticity, Climax causality
- `cliche-hunter` — stock phrases, images, moves
- `subtext-whisperer` — on-the-nose dialogue and exposition
- `composition-conductor` — setups/payoffs, image system, pacing
- `surprise-auditor` — if misdirection-plan.md exists
- `/mck-honesty TEST` — in-context (needs persona Truth Library)

**When to use**: after prose drafting is complete for an act or the full story. Gating: `critic_passed` lifecycle state requires all structural predicates to pass.

---

### `/story-revise`

**Purpose**: Multi-pass revision orchestrator — one dimension at a time.
**Trigger**: `/story-revise`, "revise the draft", "revision pass", "improve the writing"
**Input**: audit-report.md + all prose + spine

**The Seven Passes**:

| Pass | Fix | What not to touch |
|---|---|---|
| 1 — Structure | Scenes that don't turn; soft act endings | Prose style |
| 2 — Cliché | Stock phrases, images, moves | Subtext, structure |
| 3 — Subtext | On-the-nose dialogue and exposition | Voice, specificity |
| 4 — Image System | Dropped motifs, Key Image cadence, setup-payoff | Prose rhythm |
| 5 — Voice | Drift, register inconsistency, era-wrong vocabulary | Content |
| 6 — Specificity | Generic nouns and verbs | Whole paragraphs |
| 7 — Reader Simulation | Pacing drops, engagement gaps, confusion | (qualitative only) |

Each pass writes to `revision-log.md`. Stop-loss applies: same scene, same predicate, 3 consecutive rounds → immediate escalation.

**When to use**: after `/story-audit` returns findings. Run the passes in order unless the audit recommends otherwise.

---

### `/story-publish`

**Purpose**: Assemble the final manuscript from all committed prose files.
**Trigger**: `/story-publish`, "assemble the manuscript", "export the story"
**Input**: all prose files in `drafts/{slug}/prose/`
**Output**: `drafts/{slug}/manuscript.md` (or split files for book-length work)

**What it does**: assembles prose files in scene order, applies consistent formatting, strips author notes and scene-card headers, and writes a clean manuscript file.

**When to use**: after `polished` lifecycle state is set.

---

## 8. Methodology Skills Reference

These skills can be invoked standalone or are called internally by workflow skills. They encode specific McKee techniques.

---

### `/mck-subtext-5layer`

**Purpose**: Author dialogue and action in 5 layers — the most important single skill in the platform.
**Trigger**: `/mck-subtext-5layer`, "apply subtext", "the characters are too on the nose"

**The 5 layers (filled before any text is written)**:

| Layer | Question | Note |
|---|---|---|
| 1. Wound | What damage is active in this character right now? | The injury that hasn't healed |
| 2. Want | What does this character want in this scene? (active verb) | Conscious; can be wrong |
| 3. Fear | What are they afraid to admit? | Never spoken aloud |
| 4. Tactic | What verb are they performing on the other person? | How they're trying to get the want |
| 5. Text Strategy | How will they speak? | The disguise — not what they mean |

The **dialogue** lives at Layer 5. Layers 1–4 are the authoring work done before writing a word. Text ≈ want = on-the-nose. Text ≠ want ≠ fear = subtext.

**When to use**: before writing any dialogue-heavy scene; during `/story-scene` Step 3 (automatic); when any scene reads "flat" despite correct structure.

---

### `/mck-controlling-idea`

**Purpose**: Forge the story's "value + cause" sentence — the single sentence every scene must ultimately serve.
**Trigger**: `/mck-controlling-idea`, "what's the theme", "controlling idea"

**Format**: "**[Value end-state]** because **[cause through action]**."

Examples:
- "Love endures because it demands nothing in return."
- "Justice corrupts when the judge has forgotten what it feels like to be wrong."
- "Freedom destroys those who cannot bear what freedom reveals about themselves."

**When to use**: early, before the spine. A weak CI produces structural compliance with nothing to say.

---

### `/mck-beat-to-prose`

**Purpose**: Translate a beat sheet into polished prose — one beat at a time, with subtext and specificity applied.
**Trigger**: `/mck-beat-to-prose`, "write the prose from this beat sheet"
**Input**: a beat sheet (from `beat-miner` agent or written by the user)
**Output**: a prose draft of the scene

**When to use**: standalone alternative to `/story-scene` when you already have a beat sheet. Or for very short scenes where the full `/story-scene` workflow is over-specified.

---

### `/mck-crisis-dilemma`

**Purpose**: Sharpen a hard choice into a true dilemma.
**Trigger**: `/mck-crisis-dilemma`, "sharpen the crisis", "the crisis isn't a real dilemma"

**The distinction**:
- **Hard choice**: one option is clearly better; the protagonist hesitates but the right answer is visible
- **True dilemma**: both options cost something irreplaceable; the protagonist cannot have both; the choice reveals True Character

**The four dilemma structures**:
- Good vs. Good (two goods that cannot coexist)
- Bad vs. Bad (necessary evil — which harm can you live with?)
- Self vs. Other (your survival at their cost, or vice versa)
- Want vs. Need (conscious desire vs. genuine need)

**When to use**: when designing the Crisis; when `/story-audit` flags "Crisis is a hard choice, not a dilemma."

---

### `/mck-arc-walk`

**Purpose**: Map a character's arc — the trajectory of inner change or refusal to change — across the spine's events.
**Trigger**: `/mck-arc-walk`, "map the character arc", "how does [character] change"
**Input**: character file + spine.md
**Output**: beat-by-beat arc table with revelation pins and value-progression chart

**When to use**: after character files and spine are locked. Invoke before act planning to ensure the arc's turning points are placed in the right act positions.

---

### `/mck-gap-find`

**Purpose**: Find the Gap (expectation vs. result) in any beat, scene, or sequence.
**Trigger**: `/mck-gap-find`, "find the gap", "where's the gap in this scene"

**What the Gap is**: the space between what a character expects to happen (their action) and what actually happens (the world's response). Every beat, scene, and sequence must have a Gap. No Gap = no story; the world is doing what the character expects.

**When to use**: when any beat or scene feels inert, unsurprising, or narratively flat.

---

### `/mck-image-thread`

**Purpose**: Inventory motifs, audit cadence, verify Key Image placement, and prescribe additions.
**Trigger**: `/mck-image-thread`, "image system", "what's the motif", "thread the image"
**Input**: all prose files + state.json (image_system block)
**Output**: motif inventory + cadence chart + Key Image audit + prescribed additions

**Key concepts**:
- **Image system**: the vocabulary of concrete objects, actions, or qualities that recur and accumulate meaning
- **Key Image**: the single recurring image that, by the Climax, has gathered the Controlling Idea inside it
- **Cadence**: motifs should recur at regular intervals (not appear in Act 1, disappear, then return at Climax)

**When to use**: during `/story-revise` Pass 4 (Image System); when a draft feels thematically diffuse.

---

### `/mck-setup-payoff`

**Purpose**: Build the setup-payoff ledger; detect dangling setups and groundless payoffs.
**Trigger**: `/mck-setup-payoff`, "setup payoff", "what setups are dangling"
**Input**: all prose files + state.json (setup_payoff_ledger block)
**Output**: full ledger with status per element (planned / delivered / dangling / groundless)

**Dangling setup**: planted in an early scene, never paid off.
**Groundless payoff**: paid off at Climax, never planted.

Both feel like cheating to the reader. Dangling setups feel like broken promises; groundless payoffs feel like deus ex machina.

**When to use**: during `/story-revise` Pass 4; when the ending feels unearned; when an early detail has been forgotten.

---

### `/mck-specificity-forge`

**Purpose**: Scan for generic language and forge concrete particulars from the world bible.
**Trigger**: `/mck-specificity-forge`, "make this more specific", "replace the generic words"
**Input**: prose draft + world-bible.md
**Output**: ranked specificity ledger (CRITICAL / MAJOR / MINOR) + specific replacements

**What it flags**: "a man", "a room", "walked", "said quietly", "looked sad" — words that describe a category instead of a particular. The replacement must be consistent with the world and the character's POV.

**When to use**: during `/story-revise` Pass 6 (Specificity); when any passage reads as generic.

---

### `/mck-voice-first`

**Purpose**: Lock voice anchors before drafting — the specific vocabulary range, rhythm, register, and syntactic habits that define this story's prose voice.
**Trigger**: `/mck-voice-first`, "lock the voice", "voice anchors"
**Input**: any seed prose, the persona, the genre contract
**Output**: `drafts/{slug}/voice-anchors.md` — a calibration document for all subsequent prose

**What it locks**:
- Sentence length distribution (short/long ratio, fragment usage)
- Vocabulary register (period-specific, world-specific exclusions)
- Interiority style (close third / free indirect / first person)
- Dialogue register (spare / voluble / ritual)
- Specific sentences that exemplify the voice

**When to use**: before the first prose scene is written; or when voice drift is detected in a multi-session project.

---

### `/mck-exposition-ammo`

**Purpose**: Convert backstory and information dumps into "exposition as ammunition" — every fact fired in a scene where someone is fighting to reveal it, conceal it, or weaponize it.
**Trigger**: `/mck-exposition-ammo`, "exposition dump", "info dump", "backstory scene"
**Input**: prose with exposition + scene card

**The principle**: exposition is not delivered — it is fought over. Every piece of information the audience needs is placed in a scene where a character has something at stake in the revealing, concealing, or distorting of that information.

**When to use**: when any scene consists primarily of characters explaining things to each other; when backstory is delivered as narration.

---

### `/mck-negation-of-negation`

**Purpose**: Drive the central value to Corner 4 — the corruption of the positive — to test whether the Crisis has true depth.
**Trigger**: `/mck-negation-of-negation`, "negation of the negation", "deepen the crisis"

**The four corners**:
- Corner 1: Positive value (love, justice, freedom)
- Corner 2: Contrary (indifference, injustice, confinement)
- Corner 3: Negation (hatred, corruption, slavery)
- Corner 4: Negation of the Negation (love that destroys, justice that is unjust, freedom that enslaves)

A Crisis at Corner 4 is far more expensive — and far more truthful — than a Crisis at Corner 3.

**When to use**: when the Crisis feels too easy; when the antagonist feels like a villain rather than an argument.

---

## 9. Infrastructure Skills Reference

These skills operate on the platform itself rather than on the story's content.

---

### `/story-persona`

**Purpose**: Forge, load, or apply the Author Persona — the specific fictional author consciousness who "wrote" this story.
**Trigger**: `/story-persona`, "author persona", "forge a persona", "who wrote this"
**Output**: `drafts/{slug}/persona.md`

**Three modes**:

**FORGE**: Asks 5 questions and derives the persona:
1. *Wound-knowledge* — the emotional territory this author inhabits without faking
2. *Animating Belief* — one sentence about human nature that is true and uncomfortable
3. *Beauty* — what specific quality of scene or sentence makes this author lean forward
4. *Refusal* — what this author will never write for aesthetic reasons (not moral ones)
5. *Dark handling* — how this author approaches violence, grief, shame: unflinching? oblique? tender?

From the answers, derives: Truth Library (3–5 specific observations about human behavior), Formal Habits (sentence length / interiority style / dialogue / time / verb orientation), Voice Anchors (populated from committed prose).

**LOAD**: Reads persona.md and compresses it to a 5-bullet working reference for the current session. Auto-populates Voice Anchors from committed prose if stubs.

**APPLY**: Filters a specific aesthetic decision through the 4-point Decision Protocol:
1. Belief test — does this choice dramatize the Animating Belief?
2. Beauty test — does this move toward what this author finds beautiful?
3. Refusal test — does this cross an aesthetic bright line?
4. Truth test — is this sourced in a Truth Library item or a cliché?

**When to use**: FORGE at project start (offered automatically by `/story-new`). LOAD automatically by `/story-scene` Step 2. APPLY whenever an aesthetic decision is unclear.

---

### `/story-stop-loss`

**Purpose**: Convergence protocol — prevents infinite revision spirals by enforcing iteration caps, escalation paths, and backtrack depth limits.
**Trigger**: internal (called by other workflow skills); `/story-stop-loss` to view the protocol

**The caps**:
- Repair loop (artifact fails predicates): **5 rounds**
- Quality elevation (artifact passes predicates): **3 rounds**
- Single-beat revision: **3 rounds**
- Critic disagreement: **2 rounds**

**Three-strikes rule**: same predicate fails on same artifact 3 consecutive rounds → stop immediately, surface to user with alternatives.

**Three escape paths** when cap is reached:
- A — Manual edit (user fixes the specific failure point)
- B — Upstream mutation (backtrack to Scene Card / character / spine event)
- C — Abandon and restart with a different seed

**When to use**: it's applied automatically. Understanding it helps when the system escalates — it means the current approach has exhausted its revision budget and needs a different strategy.

---

### `/story-tournament`

**Purpose**: Tournament generation for high-stakes creative decisions — N diverse candidates in parallel, judged blind, winner selected.
**Trigger**: `/story-tournament`, "run a tournament", "give me options", "competing climax designs"

**Five tournaments available**:

| Tournament | Candidates | Diversity slots |
|---|---|---|
| CONTROLLING-IDEA | 3 | Idealist / Pessimist / Ironic |
| INCITING-INCIDENT | 3 | External / Self-initiated / Delayed recognition |
| PROTAGONIST | 3 | Maximal contradiction / Hidden complicity / Inverted wound |
| CRISIS | 5 | Good vs. Good / Bad vs. Bad / Self vs. Other / Want vs. Need / Value vs. Value |
| CLIMAX | 5 | Positive / Negative / Ironic / Interiority-maximal / Behavioral |

**After tournament**: Cross-tournament coherence check — do the independently-selected artifacts work together? (CI ↔ Protagonist / Inciting Incident ↔ Crisis / Crisis ↔ Climax)

**Runner-up archive**: losing candidates stored in `drafts/{slug}/tournament-archive/` — available if the winner is later revised.

**When to use**: when the default answer to a high-stakes decision feels like the obvious choice. The obvious choice is usually not the best one.

---

### `/mck-honesty`

**Purpose**: Test, stress, and repair a Controlling Idea against the Honesty Engine — separates grounded ideas from moral bumper stickers.
**Trigger**: `/mck-honesty`, "test the controlling idea", "is this theme true", "honesty check"

**Three modes**:

**TEST**: Three-check suite:
1. *Belief check* — does the author have evidence (from the Truth Library) that this claim is true? Scoring: GROUNDED / PLAUSIBLE / ASSERTED
2. *Structure check* — three sub-tests: strip-dialogue test (does the CI emerge from events alone?), belief-reversal test (does the CI survive replacing the protagonist's stated beliefs with their opposite?), antagonist-as-counter test (does the antagonist embody the Counter-Idea in action?)
3. *Counter check* — does the Counter-Idea get a full fight, not a straw man?

**STRESS**: Generates the strongest possible steel-man against the CI. Identifies the gap between the steel-man and the story's antagonist design.

**REPAIR**: Diagnoses which check failed and proposes two grounded alternatives with specific spine or antagonist revisions.

**When to use**: after CI FORGE (automatic offer); before `/story-spine` begins; in `/story-audit` Pass 1 (automatic).

---

### `/mck-surprise-plant`

**Purpose**: Design and audit the Inevitable-Surprise architecture — the dual-reading system that makes the Climax feel both surprising and inevitable.
**Trigger**: `/mck-surprise-plant`, "inevitable surprise", "plant the foreshadowing", "misdirection plan"

**The dual-reading rule**: every planted item must pass both tests simultaneously:
- *Surface test* (first read): supports the misdirected expectation given what the audience knows at that moment
- *True-reading test* (re-read): clearly signals the actual outcome, but unnoticed under the misdirection

**Three modes**:

**DESIGN**: Works from the locked Climax backward. Defines misdirected expectation vs. true resolution. Inventories 6–10 dual-reading candidates. Selects 4–6 and writes `misdirection-plan.md`. Must be done before Act 1 is written — cannot be retrofitted.

**PLANT**: Assigns each item to a specific scene card. Specifies the exact planting action and why a reader won't detect it. Verifies Act 1–2 span.

**AUDIT**: Spawns `surprise-auditor` agent for blind read + cross-reference. Returns `surprise-audit.md` with PASSES / NEEDS REPAIR / STRUCTURAL FAILURE verdict.

**When to use**: DESIGN offered automatically by `/story-spine` after locking. PLANT during act planning. AUDIT after full prose draft.

---

## 10. Agent Reference

Agents are spawned by skills (usually internally) for bounded tasks requiring context isolation or parallelism. You can also invoke them directly via the `Agent` tool in conversation.

### Generator Agents

These agents produce artifacts.

| Agent | Input | Output | Spawned by |
|---|---|---|---|
| `premise-prospector` | haunt + constraints | 5-candidate premise slate | `/story-new` |
| `character-forger` | premise + genre + setting | Character File (Characterization, True Character, Dimensions, biography) | `/story-cast` |
| `structure-skeleton` | premise + CI + genre + characters | Spine document with Mermaid timeline | `/story-spine` |
| `scene-architect` | spine + act sequence + characters | Scene Cards per scene | `/story-act` |
| `beat-miner` | Scene Card | Beat sheet (numbered action/reaction units, Gap analysis, turning point) | `/story-scene` (when no beat sheet exists) |
| `prose-drafter` | beat sheet + character files + voice anchors | Full prose draft of the scene | Optional alternative to in-context drafting |

### Critic Agents

These agents read the draft blind and return findings. Their cold-start is a feature — they have no author bias.

| Agent | What it audits | Spawned by |
|---|---|---|
| `antagonism-stress-tester` | Force balance: is the antagonism at inner / personal / extra-personal levels adequate to make victory expensive? | `/story-audit` |
| `crisis-climax-auditor` | Crisis dilemma authenticity; Climax causality; MDQ answered; Controlling Idea dramatized at value flip | `/story-audit`, `/story-spine` |
| `cliche-hunter` | Stock phrases, images, characters, moves; distinguishes from honored genre conventions | `/story-audit`, `/story-scene` |
| `subtext-whisperer` | Text ≈ want (on-the-nose); characters saying what they mean | `/story-audit`, `/story-scene` |
| `composition-conductor` | Setup-payoff ledger; image system cadence; pacing and rhythm distribution; transitions | `/story-audit` |
| `continuity-supervisor` | World-rule violations; character knowledge anachronisms; physical impossibilities; timeline errors | `/story-scene` |
| `voice-drift-detector` | Voice inconsistencies against voice-anchors.md; wrong-era vocabulary; register drift | `/story-revise` Pass 5 |
| `specificity-auditor` | Generic nouns and verbs; ranked ledger (CRITICAL / MAJOR / MINOR); world-bible-aware replacements | `/story-revise` Pass 6 |
| `reader-simulator` | Blind read: engagement curve, confusion points, where interest drops | `/story-revise` Pass 7 |
| `pacing-analyst` | Scene length distribution; rhythm variation; Law of Diminishing Returns violations | `/story-revise` Pass 7 |
| `surprise-auditor` | Misdirection integrity; dual-reading availability per plant; reveal choreography at Climax | `/mck-surprise-plant AUDIT`, `/story-audit` |
| `tournament-judge` | Blind ranking of N candidates against McKee criteria; returns ranked list + rationale + winner | `/story-tournament`, various |

### Specialist Agents

| Agent | Purpose | Spawned by |
|---|---|---|
| `cast-balancer` | Full cast pressure matrix; redundancy diagnosis; merge/cut/promote recommendations | `/story-cast` |
| `genre-cartographer` | Identifies genre + sub-genres; produces Genre Contract (conventions, obligatory scenes, exemplars) | `/story-new` (optional) |
| `setting-surveyor` | Four-dimensional setting (period / duration / location / level of conflict); world rules; research targets | `/story-new` (optional) |
| `act-designer` | Act structure, sequence rhythm, act-ending turning points | `/story-act` |
| `arc-tracer` | Character arc across spine — revelation pins, value-progression chart, obligatory revelation scene | standalone or `/story-cast` |
| `exposition-smuggler` | Converts exposition dumps into "exposition as ammunition" scene rewrites | standalone |
| `key-image-curator` | Identifies Key Image candidates; image-system rules; placement plan for Act 1 (subtle) + Climax (resonant) | standalone |
| `controlling-idea-architect` | (Retained as agent for backwards-compatibility; the skill version is primary) | — |
| `wiki-librarian` | (Retained as agent; the skill version is primary for McKee wiki maintenance) | — |

---

## 11. Templates Reference

### `lifecycle.json`

Tracks project state. Updated by workflow skills after each lifecycle gate.

Key fields:
- `slug` — project identifier, used in all file paths
- `state` — current lifecycle stage (see §5)
- `locked` — boolean map of completed gates
- `artifacts` — paths to key files (CI, spine, persona, misdirection plan, etc.)

### `state.json`

Tracks scene-level continuity state. Updated by `/story-scene` Step 9 after each committed scene. Queried by `continuity-supervisor` before each scene draft.

Key blocks:
- `characters` — per character: location, knowledge facts, possessions, relationships, wound status, current desire, value charge, arc progress
- `image_system` — per motif: introduction scene, recurrences, payoff planned/delivered, key_image flag
- `setup_payoff_ledger` — per element: setup scene, planned payoff scene, delivered status
- `world_state` — per location: physical state, last modified scene
- `exposition_ledger` — per fact: delivery mode (concealment / extraction / weaponization / forced revelation), planned scene, delivered status
- `timeline` — story start date, scene timestamps

### `persona.md`

The Author Persona document. Written by `/story-persona FORGE`.

Key sections:
- The Author's Name
- What This Author Knows Firsthand (wound-knowledge)
- The Author's Animating Belief
- What This Author Finds Beautiful
- What This Author Refuses (aesthetic bright lines)
- Formal Habits (5 axis choices)
- How This Author Handles the Dark
- The Author's Relationship to Genre
- Truth Library (3–5 specific human-behavior observations)
- Voice Anchors (populated from committed prose)
- Decision Protocol (4-filter: Belief / Beauty / Refusal / Truth)

---

## 12. Full Workflow Walkthrough

A complete example from seed to locked spine, showing the skill invocations and what they produce.

**Seed**: "A sect elder's failed disciple returns after years away, now stronger by a method the sect considers heretical."

---

### Session 1 — Foundation

```
/story-new "A sect elder's failed disciple returns after years away, now stronger by a method the sect considers heretical."
```

*The skill asks: "What about this won't let you go?"*

You answer: "The question of whether being right about something justifies the cost of how you proved it."

*The skill extracts the haunt:* "A person who won the argument by becoming what the argument was against."

*Slug generated:* `reverse-dao` (or similar)

*Story-new offers the Persona Forge:*

```
/story-persona FORGE
```

You answer the 5 questions. The skill synthesizes: Animating Belief: "Proof of principle and the principle itself are the same thing — you cannot demonstrate a truth by violating it." Truth Library: 3 specific observations. Formal Habits locked.

*Premise slate generated (5 candidates). You select Candidate 2.*

```
lifecycle.json → state: "premise_locked"
```

---

### Session 2 — Controlling Idea + Spine

```
/controlling-idea-architect FORGE
```

Three candidates generated (idealist / pessimist / ironic). You select the ironic: "Mastery destroys its vessel because the vessel chose mastery over everything that made it worth mastering."

*Honesty Engine runs automatically:* Belief check (GROUNDED — maps to Truth Library: "People who dedicate themselves to an ideal tend to replace the ideal with their dedication to it"). Structure check: Counter-Idea (the sect's position: discipline earns legitimacy) is a full fight. PASSES.

```
controlling-idea.md written
lifecycle.json → state: "controlling_idea_locked"
```

```
/story-spine
```

`structure-skeleton` agent returns a spine. Audit finds: Crisis is a hard choice (protagonist must reveal the method or protect the sect). `/mck-crisis-dilemma` runs to sharpen it. New Crisis: protagonist must either destroy the evidence of the method (preserving the sect's legitimacy but making the discovery disappear) or publish it (validating heresy, destroying the sect's authority, and proving the sect was wrong — which is what the protagonist wanted — at the cost of the protagonist's own standing as a disciple).

*This is a Want vs. Need dilemma.* Spine passes all predicates.

*Surprise architecture offered:*

```
/mck-surprise-plant DESIGN
```

Misdirected expectation: audience expects protagonist will be reconciled with the sect. True resolution: protagonist achieves the reconciliation and discovers it costs more than the exile did. 6 dual-reading items planted across Acts 1–2.

```
lifecycle.json → state: "spine_locked"
```

---

### Session 3 — Cast + Act 1

```
/story-cast
```

`character-forger` produces files for: protagonist, elder, junior ghost (the sect member who stayed), sister. `cast-balancer` finds junior ghost and protagonist have overlapping pressure (both are "what loyalty costs") — recommends distinguishing: junior ghost represents loyalty that was rewarded; protagonist represents loyalty that was punished. Pressure now distinct.

```
/story-act 1
```

`act-designer` + `scene-architect` produce 4 Scene Cards for Act 1. All pass the "scene turns" predicate.

---

### Session 4 — First Scene

```
/story-scene 1.1
```

Loads Scene Card (protagonist arrives at sect gates after 7 years). Character files loaded. Persona working reference loaded (5 bullets). Preceding prose: none (first scene).

5-Layer Subtext Model:

| Layer | Protagonist | Gate Elder |
|---|---|---|
| Wound | Expelled without hearing | Ordered to expel without understanding |
| Want | To be let through without explaining | To do his duty without incident |
| Fear | That his return means nothing | That the thing he expelled was right |
| Tactic | Diminish (make the return look routine) | Delay (make the return someone else's problem) |
| Text Strategy | Speaks as if returning from a short trip | Speaks in procedural language |

Gap: protagonist expects to be refused entry (preparing a fight). Gate elder opens the gate without comment and walks away. The gap: *no resistance*. The scene turns from tension to dread.

Critic audits: `cliche-hunter` flags "The gate elder's silence spoke volumes" — replaced with specific behavioral detail. `subtext-whisperer` finds one line where protagonist says what they actually want — rewritten. `continuity-supervisor`: no state violations.

Post-commit: image_system updated (first appearance of "stone threshold" motif). Setup-payoff ledger: new setup registered ("gate elder's specific hand gesture on opening").

---

## 13. Advanced Features: V3

V3 features are available for any project. They require a persona to be forged (`persona.md` must exist for the Honesty Engine and persona-filtered tournament).

### Author Persona as Decision Filter

Every beat in `/story-scene` Step 5 is filtered through the persona Decision Protocol (silently). Only failures surface. Example:

*The beat:* protagonist enters the elder's study; the elder does not look up from his writing.

*Persona filter runs:*
- Belief test: does this choice dramatize "Proof of principle and the principle itself are the same thing"? The elder's non-acknowledgment is the elder treating the protagonist as still unproven. ✅
- Beauty test: does this move toward "the moment before the generous gesture"? No — this is the refusal of the gesture. The author's Beauty orientation is toward the gesture withheld, not the gesture — this is exactly right. ✅
- Refusal test: does this cross any aesthetic bright line? No. ✅
- Truth test: maps to Truth Library: "People who are most certain of their position are usually most afraid of being asked to defend it." The elder's silence is certainty-as-armor. ✅

Beat passes. Shown to user.

### Tournament for Climax Design

```
/story-tournament CLIMAX
```

Generates 5 climax designs across: positive / negative / ironic / interiority-maximal / behavioral. `crisis-climax-auditor` runs on each. `tournament-judge` ranks blind. Cross-tournament coherence check: does the selected Climax flow from the previously selected Crisis?

### Surprise Architecture Mid-Project

If you didn't run `/mck-surprise-plant DESIGN` at spine-lock, you can still run it before Act 1 prose is written (DESIGN mode). If prose already exists: run PLANT on scene cards not yet drafted, and AUDIT on existing prose to find leaks.

---

## 14. Troubleshooting

### "The scene won't pass the subtext predicate after 3 rounds"

Stop-loss has triggered its three-strikes escalation. The cause is almost always upstream:

1. Check the 5-Layer Subtext table — is the character's *Tactic* actually a verb-on-person, or is it a mood/state? ("feels conflicted" is not a tactic; "humiliates" is.)
2. Check the character's Want — is it too general? ("to be understood" is not actable; "to extract an apology" is.)
3. If both look right: the Scene Card's objective may be misaligned with the character's want. The scene has two agendas fighting each other.

Run `/story-scene` Backtracking Protocol: name the specific upstream field to mutate, get confirmation, apply the change, restart.

### "The crisis-climax-auditor keeps failing the Climax"

The Climax flows causally from the Crisis decision — if it keeps failing, the Climax may not be caused by the decision. Test: if the protagonist had made the *opposite* Crisis decision, would the Climax have been different? If not: the Climax is not the consequence of the decision — it's a separate event.

Repair: trace what the opposite decision would produce, and make sure the chosen decision leads to a clearly different outcome.

### "The premise slate feels generic — all 5 options are variations of the same story"

The `premise-prospector` agent generates from the haunt. If the haunt was stated too abstractly ("a story about redemption"), the candidates will all be abstract. Restate the haunt with a specific image, relationship, or situation: "a person who finds the letter they wrote but never sent, now in someone else's hands."

### "story-audit passes but the story feels hollow"

All structural predicates passing doesn't guarantee quality — it guarantees structural soundness. The hollow feeling is a V3 problem:

1. Run `/mck-honesty TEST` — the CI may be passing the 7-point audit but failing the grounding check. If it's ASSERTED: the story has been built around a bumper sticker.
2. Check the Truth Library in persona.md — are the scenes drawing on specific truths, or on genre templates?
3. Run `/mck-specificity-forge` — generic language makes emotional content invisible.

### "The persona feels forced — beats that pass the Decision Protocol still feel wrong"

The persona's Animating Belief may be too general. "People destroy what they love" is true but wide; "People who most need forgiveness are the least able to ask for it" is specific enough to make a story-level decision.

Run `/story-persona FORGE` again. Answer the Belief question more specifically. A belief narrow enough to be falsifiable by a specific sequence of events is narrow enough to filter real aesthetic decisions.

### "The surprise architecture feels like a trick rather than Inevitable-Surprise"

The `surprise-auditor` agent distinguishes between *retroactive cheat* and *dual-reading available*. A retroactive cheat is an item that only works as foreshadowing after the Climax names it as significant. Dual-reading is an item the audience can see the true meaning of on re-read, without the narrative pointing at it.

Audit your planted items: does each one support the surface reading *actively* on first pass? If an item requires the reader to be incurious or careless to miss the true reading: it's a cheat. Either make the surface reading more convincing, or replace the item with one that genuinely admits two readings.

---

## Appendix: Complete Skill Index

| Skill | Tier | Type | Primary output |
|---|---|---|---|
| `/story-new` | V1 | Workflow | premise-card.md + project scaffold |
| `/story-status` | V1 | Workflow | status report |
| `/story-premise` | V1 | Workflow | premise-card.md |
| `/story-spine` | V1 | Workflow | spine.md |
| `/story-cast` | V1 | Workflow | character files + cast-design.md |
| `/story-act` | V1 | Workflow | scene cards |
| `/story-scene` | V1 | Workflow | prose file |
| `/story-audit` | V1 | Workflow | audit-report.md |
| `/story-revise` | V1 | Workflow | revised prose files + revision-log.md |
| `/story-publish` | V1 | Workflow | manuscript.md |
| `/mck-subtext-5layer` | V1 | Methodology | 5-layer table + rewritten beats |
| `/mck-controlling-idea` | V1 | Methodology | CI candidates |
| `/mck-beat-to-prose` | V1 | Methodology | prose draft from beat sheet |
| `/mck-crisis-dilemma` | V1 | Methodology | sharpened crisis design |
| `/mck-arc-walk` | V1 | Methodology | arc table + revelation pins |
| `/mck-gap-find` | V1 | Methodology | gap analysis per beat/scene |
| `/mck-image-thread` | V2 | Methodology | motif inventory + cadence chart |
| `/mck-setup-payoff` | V2 | Methodology | setup-payoff ledger |
| `/mck-specificity-forge` | V2 | Methodology | specificity ledger + replacements |
| `/mck-voice-first` | V2 | Methodology | voice-anchors.md |
| `/mck-exposition-ammo` | V2 | Methodology | exposition-as-ammunition rewrites |
| `/mck-negation-of-negation` | V2 | Methodology | Corner 4 analysis |
| `/mck-honesty` | V3 | Methodology | CI grounding verdict + repair options |
| `/mck-surprise-plant` | V3 | Methodology | misdirection-plan.md + scene card plants |
| `/story-persona` | V3 | Infrastructure | persona.md |
| `/story-tournament` | V3 | Infrastructure | ranked candidates + winner |
| `/story-stop-loss` | V1 | Infrastructure | convergence protocol (internal) |
| `/controlling-idea-architect` | V1 | Refactored | controlling-idea.md |
| `/arc-tracer` | V1 | Refactored | character arc document |
| `/act-designer` | V1 | Refactored | act structure document |
| `/exposition-smuggler` | V2 | Refactored | exposition-ledger.md + rewrites |
| `/key-image-curator` | V2 | Refactored | key-image.md |
| `/composition-conductor` | V2 | Refactored | composition-audit.md |
| `/wiki-librarian` | V1 | Refactored | wiki pages (INGEST/LINT/MIGRATE/REGEN) |
