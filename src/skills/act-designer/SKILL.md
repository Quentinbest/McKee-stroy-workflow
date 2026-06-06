---
id: act-designer
version: 1.0.0
contract-version: 1
name: act-designer
description: |
  Slice the spine into acts and sequences — choosing how many acts the story
  needs, where each act ends with an irreversible turning point, where any False
  Ending sits, and how the act rhythm escalates. Runs in main context for
  collaborative design. Use after structure-skeleton has locked the spine,
  before scene-architect begins building scenes.
  Trigger: /act-designer, "design the acts", "how many acts", "act structure",
  "act rhythm", "where does act 1 end", "False Ending", "act design".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - design the acts
  - how many acts
  - act structure
  - act rhythm
  - where does act 1 end
  - false ending
  - act design
contract: {"purpose":"Slice the spine into acts and sequences — choosing how many acts the story needs, where each act ends with an irreversible turning point, where any False Ending sits, and how the act rhythm escalates. Runs in main context for collaborative design. Use after structure-skeleton has locked the spine, before scene-architect begins building scenes. Trigger: /act-designer, \"design the acts\", \"how many acts\", \"act structure\", \"act rhythm\", \"where does act 1 end\", \"False Ending\", \"act design\".","trigger":["/act-designer","act designer"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/spine.md","drafts/{slug}/genre-contract.md","drafts/{slug}/controlling-idea.md","drafts/{slug}/act-design.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["story-act","story-audit"],"fixtures":{"positive":"act-designer:positive","negative":"act-designer:missing-trigger"}}
---

# Act Designer — Act/Sequence Planning Skill

Runs in main context. Use this for collaborative act design where the writer wants to see the choices and reasoning. For a batch-produced act-design document, use the `act-designer` agent.

## What You Need

- `drafts/{slug}/spine.md` (locked spine)
- `drafts/{slug}/genre-contract.md` (genre conventions, especially the False Ending pattern if genre demands one)
- `drafts/{slug}/controlling-idea.md` (the value arc)

## Step 1 — Determine Act Count

Based on the story's length and spine density, propose an act structure:

| Length | Typical Act Count | Notes |
|---|---|---|
| Short story (≤7K) | No formal acts; 2–3 sequences | |
| Novella (7–40K) | 3 acts | Classic: setup / confrontation / resolution |
| Novel (40K–100K) | 3–4 acts | Often splits Act 2 into 2a and 2b at midpoint |
| Long novel (100K+) | 4–5 acts | |

Discuss with user — their genre, tone, and complexity override the defaults.

**Capture the target total length now** (words, or CJK characters for Chinese). This is the number the whole pipeline budgets against. Record it in the act-design doc as `target_total`. Without it, nothing downstream can detect an under-built draft — the single most common silent failure (a draft that lands at a fraction of its intended size, unnoticed until publish).

## Step 2 — Place the Act-Ending Turning Points

For each act, identify the spine event that makes a good act-ending turning point. Act-ending events must be:
- **Irreversible** — the protagonist cannot go back to the prior condition
- **Value-charge flipping** — the primary value's charge shifts at this boundary
- **Escalating** — each act's ending is "worse" (or the crisis deepens) compared to the prior one

Map each spine event to an act:

```
Act 1 ends at: [spine event] — why irreversible, what charge flips
Act 2 ends at: [spine event] — same
Act 3 (if 4-act): [spine event]
Final act ends at: Crisis → Climax → Resolution
```

## Step 3 — Identify False Ending (if genre requires)

Some genres (thriller, horror, romance, certain tragedies) have a **False Ending** — a moment where the protagonist appears to have won or lost, followed by a reversal that reveals the real climax.

Ask: does the genre contract require a False Ending? If yes, which spine event serves as the false resolution, and what re-complicates it?

## Step 4 — Rhythm Chart & Length Budget

Verify the act rhythm escalates, and assign each act a **length budget** as a share of `target_total`:

| Act | Opening Value | Closing Value | Intensity Level | Pace | Length % | Budget (words/CJK) |
|---|---|---|---|---|---|---|
| 1 | + | - | Medium | Medium | ~22–28% | |
| 2a | - | -- | High | Accelerating | ~30–38% | |
| 2b | -- | --- | Very High | Fast | ~30–38% | |
| 3 | --- | Crisis | Maximum | Very Fast / Tight | ~22–28% | |

Each act should feel more urgent than the last. If two acts have the same intensity, redesign one.

**Where the words go (load-bearing rule).** Length is not uniform. The deepest act (where the negation-of-the-negation goes onstage) and the payoff zone (Crisis/Climax/Resolution) are the *least compressible* — they should carry the most weight per scene, not the least. A common failure is the inverse: the setup act is fattest and the climax is thinnest. Mark which act is the deepest and protect its budget. The percentages above are a starting point; adjust to the spine, but keep `target_total` as the sum.

> These budgets flow down: `/story-act` divides each act's budget across its scenes (`length_budget` on each Scene Card), and `/story-audit` checks the realized prose against them. A scene that is a deliberate short blade (the withdrawn-hand beat, an ignition scene) can be under budget *by design* — note it on the card so the density check doesn't false-alarm.

## Step 5 — Sequences Within Acts

For each act, sketch 2–4 sequences (mini-arcs):
- Each sequence opens at a value charge and ends at a different one
- Each sequence points its complication toward the next sequence's problem
- The act-ending turning point is the final sequence's close

## Step 6 — Write the Act Design Document

Write `drafts/{slug}/act-design.md`:

```markdown
# Act Design — {title}

**Target total**: {N words / CJK chars}

## Act Structure: {N}-Act

| Act | Opens | Closes | Spine Events Covered | Act-Ending TP | Length % | Budget |
|---|---|---|---|---|---|---|
| Act 1 | | | | | | |
| Act 2 | | | | | | |
| ... | | | | | | |

Deepest act (protect its budget): {which act}

## Sequences
### Act 1
- Sequence 1.1: [open → problem → close]
- Sequence 1.2: [open → problem → close]
...

## False Ending
[If applicable: location and nature]

## Rhythm Chart
[Table from Step 4]
```

Update `lifecycle.json`: `locked.act_design: true`, advance state.
