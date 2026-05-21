---
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

## Step 4 — Rhythm Chart

Verify the act rhythm escalates:

| Act | Opening Value | Closing Value | Intensity Level | Pace |
|---|---|---|---|---|
| 1 | + | - | Medium | Medium |
| 2a | - | -- | High | Accelerating |
| 2b | -- | --- | Very High | Fast |
| 3 | --- | Crisis | Maximum | Very Fast / Tight |

Each act should feel more urgent than the last. If two acts have the same intensity, redesign one.

## Step 5 — Sequences Within Acts

For each act, sketch 2–4 sequences (mini-arcs):
- Each sequence opens at a value charge and ends at a different one
- Each sequence points its complication toward the next sequence's problem
- The act-ending turning point is the final sequence's close

## Step 6 — Write the Act Design Document

Write `drafts/{slug}/act-design.md`:

```markdown
# Act Design — {title}

## Act Structure: {N}-Act

| Act | Opens | Closes | Spine Events Covered | Act-Ending TP |
|---|---|---|---|---|
| Act 1 | | | | |
| Act 2 | | | | |
| ... | | | | |

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
