---
id: exposition-smuggler
version: 1.0.0
contract-version: 1
name: exposition-smuggler
description: |
  Convert backstory and information dumps into "exposition as ammunition" —
  every piece of information fired in a scene where someone is fighting to
  reveal it, conceal it, weaponize it, or extract it. Runs in main context
  for scene-by-scene exposition redesign. Use when a scene reads as "talking
  heads" or info-dump, or before committing any exposition-heavy scene to prose.
  Trigger: /exposition-smuggler, "fix the exposition", "info dump", "talking heads",
  "exposition as ammunition", "smuggle the backstory", "hide the information".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - fix the exposition
  - info dump
  - talking heads
  - exposition as ammunition
  - smuggle the backstory
  - hide the information
  - exposition smuggler
contract: {"purpose":"Convert backstory and information dumps into \"exposition as ammunition\" — every piece of information fired in a scene where someone is fighting to reveal it, conceal it, weaponize it, or extract it. Runs in main context for scene-by-scene exposition redesign. Use when a scene reads as \"talking heads\" or info-dump, or before committing any exposition-heavy scene to prose. Trigger: /exposition-smuggler, \"fix the exposition\", \"info dump\", \"talking heads\", \"exposition as ammunition\", \"smuggle the backstory\", \"hide the information\".","trigger":["/exposition-smuggler","exposition smuggler"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["structured response or task-scoped story artifact"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"exposition-smuggler:positive","negative":"exposition-smuggler:missing-trigger"}}
generated: true
source: src/skills/exposition-smuggler/SKILL.md
source-version: 1.0.0
source-sha256: 5f4c58daad5b6710b888e27002491923137498ee30acf71620d093d4cdb693c3
generator-version: 1.0.0
verification-command: npm run agents:check-drift
---

# Exposition Smuggler

McKee: *"Exposition is ammunition. Never fire it unless someone is fighting to reveal, conceal, extract, or weaponize it."*

Exposition delivered without conflict is the most common prose failure. It stops the story. The reader endures it; they do not experience it. This skill takes any exposition requirement and redesigns it as conflict.

## The Four Combat Modes for Exposition

Every piece of information must enter the story through one of these modes:

### 1. Concealment Combat
A character who knows the information is fighting to *conceal* it. Another character (or the situation) is forcing it toward the surface.

> The reader learns the secret because someone is working desperately to keep it hidden.

### 2. Extraction Combat
A character who needs the information is fighting to *extract* it from someone who is reluctant, evasive, or ignorant.

> The reader learns the information through the fight to drag it out.

### 3. Weaponization
A character *deploys* the information as a weapon — to wound, to threaten, to manipulate, to seduce.

> The reader learns the information because it's a blade being drawn in a fight.

### 4. Revelation Under Pressure
A character is forced by circumstances to *reveal* something they would normally never disclose — because the cost of concealment has become greater than the cost of disclosure.

> The reader learns because the character has run out of alternatives.

## Step 1 — Inventory the Exposition

List every piece of information the scene (or passage) must deliver to the reader:
- World facts (rules of the world, history, geography)
- Character backstory (past events, relationships, wounds)
- Plot mechanics (how something works, who did what)
- Setup information (facts that will pay off later)

## Step 2 — Find the Combat Potential

For each piece of information, ask:
- *Who would want to keep this secret?*
- *Who would need to extract this?*
- *Who could weaponize this?*
- *Under what circumstances would someone be forced to reveal this?*

If the answer to all four is "no one" → the information may not need to be in the story at all. Flag it.

## Step 3 — Assign a Combat Mode

For each piece of information, assign the most dramatically potent combat mode. Match:
- High-stakes information → weaponization or forced revelation
- Sensitive character backstory → concealment or extraction
- World rules → extraction (a character needs to know and has to fight for it)
- Setup facts → plant as side-effects of other combat (the reader notices without being told to notice)

## Step 4 — Design the Combat Scene

For each information piece with a combat mode:
- *Who is fighting?*
- *What does each character want from this exchange?* (using the 5-layer model)
- *What is the Gap?* (expectation vs. result)

The information emerges as a side-effect of the fight — the reader receives it while watching the conflict.

## Step 5 — Rewrite or Design the Scene

If rewriting: revise the existing scene so the information emerges from conflict, not from explanation.

If designing: produce a brief scene plan:
```
Information to deliver: [the fact]
Combat mode: [concealment / extraction / weaponization / forced revelation]
Fighter A wants: [active verb]
Fighter B wants: [active verb]
Gap: [expected result vs. actual]
How information emerges: [through what action/dialogue]
```

## Step 6 — Audit the Pacing

After all exposition is assigned to scenes, check:
- No scene contains more than 3 major pieces of new information
- The most important information comes at the moment of highest tension in the scene
- No two consecutive scenes are primarily expository (mix exposition with action-forward beats)

## Common Failures

| Failure | Symptom | Fix |
|---|---|---|
| Maid-and-butler dialogue | "As you know, Bob..." | Find a character who does NOT know; let them extract |
| Monologue exposition | One character explains for >3 sentences | Break it up with resistance from the other character |
| Prologue dump | Opening pages explain the world | Plant world-rules as side-effects of the first conflict |
| Voice-over explanation | Narrator tells us what characters could show | Put the narrator's fact into a character's action |
