---
name: story-act
description: |
  Plan a single act's scene sequence — choosing how many scenes the act needs,
  where each sequence ends with a turning point, and how the act's rhythm
  escalates from its opening to its ending value flip. Use after the spine is
  locked, one act at a time. Produces scene cards for each scene in the act.
  Trigger: /story-act, "plan act 1", "plan act 2", "design act {N}",
  "break act {N} into scenes", "scene sequence for act {N}".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - plan act
  - design act
  - break act into scenes
  - scene sequence for act
  - story act
  - plan the first act
---

# Act Scene Planning

You are planning a single act's scene sequence — the specific scenes that execute the spine events assigned to this act, arranged for escalation and rhythm.

## Step 1 — Identify the Act

The user specifies which act (e.g., "Act 1", "Act 2", "the final act"). For acts that need clarification:
- **Classical 3-act**: Act 1 (setup), Act 2 (confrontation), Act 3 (resolution)
- **Extended**: Act 1, Act 2a, Act 2b, Act 3 (longer works)
- **Sequences**: Groups of 2–5 scenes that form a mini-arc within an act

Ask the user to confirm if needed.

## Step 2 — Read Spine for This Act

Load `drafts/{slug}/spine.md`. Identify the spine events that fall within this act:
- Opening condition
- Inciting Incident (if Act 1)
- Progressive Complications assigned to this act
- The Act-Ending Turning Point (the value-charge flip that closes the act)

## Step 3 — Define the Act's Value Journey

State:
- **Opening value charge** of this act (where is the protagonist at the act's start?)
- **Closing value charge** (where do they end? positive or negative flip from opening?)
- **The act-ending turning point** (what event causes the flip?)

This defines the act's "shape."

## Step 4 — Break Into Sequences

An act contains 2–4 sequences (mini-arcs). Each sequence:
- Opens at a value charge
- Escalates pressure
- Ends at a worse (or briefly better) value charge
- Points toward the next sequence's problem

Sketch the sequences for this act:
```
Sequence 1: [opening condition] → [sequence problem] → [sequence resolution/failure]
Sequence 2: [new condition] → [escalated problem] → [resolution/failure]
Sequence 3 (if needed): ...
Act Ending: [act-closing turning point]
```

## Step 5 — Generate Scene Cards

For each scene needed in the act, either:
- Invoke the `scene-architect` agent (for scenes you haven't designed yet), or
- Draft the Scene Card directly in the conversation if the scene is clear

Each Scene Card goes in `drafts/{slug}/scenes/{act}-{scene}.md`.

Before generating cards, read the act's **Budget** from `act-design.md` and divide it across the act's scenes. Heavier on the load-bearing scenes (the act's turning point, its deepest confrontation), lighter on bridges/ignition scenes — not an even split.

Scene Card format:
```markdown
---
title: Scene {act}.{scene}
act: {N}
scene: {N}
location: {where}
characters: [{list}]
value_open: {+/-}
value_close: {+/-}
length_budget: {target words/CJK for this scene}
length_note: {optional — e.g. "deliberate short blade; under budget by design"}
---

## Objective
What the POV character wants from this scene.

## Conflict
What opposes them. Which antagonism level (inner / personal / extra-personal)?

## Turning Point
The moment the value charge flips. What happens?

## Value Shift
From [X] to [Y].

## Setup / Payoffs
- Plants: [what this scene introduces that will pay off later]
- Pays off: [what earlier setup this scene pays off]

## Image / Motif
[Any image system element active in this scene]
```

## Step 6 — Rhythm Check

After generating all scene cards for the act, run a rhythm check:

| Scene | Value Open | Value Close | Conflict Level | Pace |
|---|---|---|---|---|
| 1.1 | + | - | Low | Slow |
| 1.2 | - | -- | Medium | Medium |
| ... | | | | |

Verify:
- No two consecutive scenes have the same value direction (variety)
- Conflict level escalates across the act (not uniform)
- At least one scene provides a "breath" (brief positive charge before the next descent)
- The act-ending scene's value flip is the act's strongest
- **Budget reconciles**: the sum of scene `length_budget`s equals the act's budget from `act-design.md`, and the heaviest budgets sit on the load-bearing scenes (turning point, deepest confrontation) — not on the setup/bridge scenes.

## Step 6.5 — Density Check (after prose exists)

This runs when you return to an act whose scenes already have prose (e.g. before `/story-audit`, or when checking progress). For each scene, compare realized length (count words / CJK chars in the prose body) against its `length_budget`:

| Scene | Budget | Realized | Δ | Flag |
|---|---|---|---|---|

Flag:
- **Undershoot**: realized < 60% of budget and no `length_note` explaining it → likely under-built; candidate for `/story-scene` expansion.
- **Inversion**: a load-bearing scene (turning point / deepest confrontation) is realized *thinner* than the setup/bridge scenes around it → the wrong scenes are carrying the weight; rebalance.
- **Act total**: sum realized vs act budget. If the whole act is well under budget, surface it now — do not let it reach publish unnoticed.

## Step 7 — Scaffold State DB & Geography Lock

Before prose drafting begins, ensure `drafts/{slug}/state.json` exists (copy from `templates/state.json` and fill from the cast + world-bible). This is **not optional** — without it, `/story-scene` runs in degraded mode: continuity tracking (Step 9C/10) and the `continuity-supervisor` critic are skipped silently, and continuity bugs surface late (wrong locations, proper-name drift, geography contradictions baked into scene cards).

Populate at minimum:
- `characters`: each character's opening location, knowledge, possessions.
- `world_state`: every named location, with a **geography lock** — for any setting where physical layout matters (building floor counts, distances, which building is which), pin the facts here so scene cards and prose can't contradict them. (A real draft shipped a climax set on the "8–9th floor" of a building established elsewhere as 6 floors; the scene cards themselves disagreed. Lock it once, here.)
- `timeline`: story start date; scene timestamps get filled as prose is written.

## Step 8 — Update Lifecycle

When all scenes for this act have scene cards:

Update `lifecycle.json` — if all acts now have scene cards, set `locked.scene_cards` to `true` and `state` to `"scene_cards_locked"`.

Suggest next:
- If more acts need planning: `/story-act {next act number}`
- If all acts planned: `/story-scene 1.1` to begin prose drafting
