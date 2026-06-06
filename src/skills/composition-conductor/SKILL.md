---
id: composition-conductor
version: 1.0.0
contract-version: 1
name: composition-conductor
description: |
  Audit and tune the cross-scene craft of a story — Unity & Variety, Pacing,
  Setup-Payoff chains, Transitions, and Image System threading. Reads above the
  scene level and below the spine level, looking for repetition that flattens,
  monotony of rhythm, broken setup-payoff chains, and missing image patterns.
  Runs in main context. Use after enough scenes exist to see the texture.
  Trigger: /composition-conductor, "cross-scene audit", "pacing", "is the rhythm
  right", "setup-payoff", "composition", "transitions", "image threading".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - cross-scene audit
  - pacing
  - is the rhythm right
  - setup-payoff
  - composition audit
  - transitions
  - image threading
  - composition conductor
contract: {"purpose":"Audit and tune the cross-scene craft of a story — Unity & Variety, Pacing, Setup-Payoff chains, Transitions, and Image System threading. Reads above the scene level and below the spine level, looking for repetition that flattens, monotony of rhythm, broken setup-payoff chains, and missing image patterns. Runs in main context. Use after enough scenes exist to see the texture. Trigger: /composition-conductor, \"cross-scene audit\", \"pacing\", \"is the rhythm right\", \"setup-payoff\", \"composition\", \"transitions\", \"image threading\".","trigger":["/composition-conductor","composition conductor"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/state.json","drafts/{slug}/image-system.md","drafts/{slug}/composition-audit.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["story-revise"],"fixtures":{"positive":"composition-conductor:positive","negative":"composition-conductor:missing-trigger"}}
---

# Composition Conductor — Cross-Scene Craft Audit

You are reading *above* the scene level (not line-editing) and *below* the spine level (not redesigning structure). Your domain is texture: the felt experience of moving through the story from scene to scene.

## What You're Looking For

### 1. Unity & Variety
- **Too much unity** (monotony): consecutive scenes that feel the same — same setting, same emotional register, same characters, same pace
- **Too much variety** (incoherence): scenes so different they feel like different stories

Read the last 4–6 scenes in sequence. Do they feel like one story? Do they feel interchangeable?

**Fix for monotony**: insert a contrasting scene (different setting, different characters, different pace) between two similar scenes.
**Fix for incoherence**: identify the through-line (character, image, value) and make it visible in each scene.

### 2. Pacing — The Law of Diminishing Returns
No scene type can hold audience attention indefinitely. After a scene type repeats, it loses impact.

Audit for:
- **Too many consecutive dialogue-heavy scenes** → insert a wordless action scene
- **Too many consecutive action scenes** → insert a reflective or intimate scene
- **Scene lengths** — are they all the same? Short scenes should be shorter; climactic scenes should earn their length
- **Intensity** — does every scene play at full intensity? (Forbids the "breath" scenes the audience needs to absorb impact)

Mark the pacing problem and recommend where to insert contrast.

### 3. Setup-Payoff Ledger Audit

Read all scene cards and prose for:
- Elements introduced (named objects, stated abilities, established rules, mentioned places)
- Elements paid off

Build or update the ledger in `drafts/{slug}/state.json`:

**Dangling setups**: introduced but never paid off
- Severity: if the setup was prominent, the payoff is owed; if incidental, it may be cut
- Action: pay it off, or remove the setup

**Groundless payoffs**: paid off but never set up
- These are deus ex machina — they feel arbitrary
- Action: plant the setup earlier in the story

**Payoff before setup**: information or object appears before it was established
- Action: move the setup earlier, or cut the premature payoff

### 4. Transitions

Read the ending of each scene and the beginning of the next. Transitions should be:
- **Continuous** (same moment, different character perspective)
- **Cut** (skip time; next scene begins in the new situation)
- **Match-cut** (an image or phrase echoes across the cut)

Flag:
- **Clumsy transitions**: the next scene begins with "Later..." or explains what happened between
- **Redundant transitions**: the scene ends AND the next scene opens with the same beat
- **Missing transitions**: a logical gap between scenes that leaves the reader confused

### 5. Image System Threading

Using the image system document (`drafts/{slug}/image-system.md`):
- Verify the Key Image appears at planned cadence
- Verify no supporting motif has gone absent for more than 3 consecutive scenes
- Verify no two motifs peak in the same scene
- Verify the Key Image hasn't been used decoratively (it must be emotionally loaded each appearance)

Flag any threading violations.

## Output Format

Write `drafts/{slug}/composition-audit.md`:

```markdown
# Composition Audit — {title}
Date: {today}

## Unity & Variety
[Monotony zones / incoherence zones / recommendations]

## Pacing Map
| Scene | Type | Intensity | Length | Verdict |
|---|---|---|---|---|
...
[Law of Diminishing Returns violations]

## Setup-Payoff Ledger
Dangling setups: [list with severity]
Groundless payoffs: [list]
Payoff-before-setup: [list]

## Transition Issues
[List by scene pair with recommendation]

## Image Threading
Key Image appearances: [list — on cadence / gaps / decorative misuse]
Motif gaps: [list]
Simultaneous peaks: [if any]

## Priority Fixes
1. [Most important]
2. ...
```

Suggest: `/story-revise` to address findings, specifying Pass 4 (Image System) for threading issues.
