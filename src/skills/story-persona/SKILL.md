---
id: story-persona
version: 1.0.0
contract-version: 1
name: story-persona
description: |
  Forge, load, or apply an Author Persona — the fictional author consciousness
  who "wrote" this story, distinct from the human writer and from the AI. The
  persona defines animating belief, aesthetic bright lines, formal habits, and
  a Truth Library of non-cliché human observations. It acts as the decision
  filter for every aesthetic choice: voice, tone, what to show, what to cut.
  Three modes: FORGE (create from scratch), LOAD (prime working memory),
  APPLY (filter a specific decision).
  Trigger: /story-persona, "who wrote this", "what's the author's voice",
  "forge a persona", "load the persona", "author persona".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - story persona
  - forge a persona
  - load the persona
  - author persona
  - who wrote this
  - what's the author's voice
contract: {"purpose":"Forge, load, or apply an Author Persona — the fictional author consciousness who \"wrote\" this story, distinct from the human writer and from the AI. The persona defines animating belief, aesthetic bright lines, formal habits, and a Truth Library of non-cliché human observations. It acts as the decision filter for every aesthetic choice: voice, tone, what to show, what to cut. Three modes: FORGE (create from scratch), LOAD (prime working memory), APPLY (filter a specific decision). Trigger: /story-persona, \"who wrote this\", \"what's the author's voice\", \"forge a persona\", \"load the persona\", \"author persona\".","trigger":["/story-persona","story persona"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/persona.md","drafts/{slug}/prose/"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["story-new","story-scene"],"fixtures":{"positive":"story-persona:positive","negative":"story-persona:missing-trigger"}}
---

# Author Persona Skill

The Author Persona is the fictional consciousness who wrote this specific story. It is not the human writer (whose real biography is irrelevant here) and not a generic "AI voice." It is a specific, idiosyncratic author with a wound-knowledge, an animating belief, aesthetic bright lines, and a Truth Library. Every draft sentence is filtered through this author's way of seeing.

Three modes. Detect from context or ask the user which to run.

---

## Mode A — FORGE

*Use when: starting a new project, or when the existing persona feels thin or generic.*

### A1 — Prime the Forge

Ask the user five questions. Accept answers in any form — fragments, images, contradictions are fine. Do not require clean answers.

1. **The wound-knowledge question**: "What has happened to you, or someone you know, that left a residue you can't explain away — something you keep returning to even when you'd rather not?" (Not asking for trauma disclosure — asking for the specific emotional territory this author inhabits without faking.)

2. **The belief question**: "What do you believe about people — not a platitude, but something you've watched happen and which still surprises you each time?" Push for specificity: not "people are selfish" but the particular form of selfishness or generosity they've observed.

3. **The beauty question**: "What kind of scene, image, or sentence makes you lean forward when you read it? Not 'good writing' in general — the specific quality that pulls you." Push past the first answer if it's generic ("beautiful language").

4. **The refusal question**: "What would you never write, not because it's wrong to write but because it would feel false to you — the thing that would make you put the draft down and walk away?" 

5. **The dark question**: "When you imagine a scene of violence, grief, or humiliation in this story — what's your instinct: move close or pull back? Show the wound or show the face watching it happen? Clinical or tender? Straight or oblique?"

### A2 — Synthesize

From the five answers, derive:

- **Animating Belief**: one sentence, falsifiable, not a moral but an observation about human nature
- **Truth Library**: 3 specific truths drawn from the answers (concrete, not abstract; particular, not universal)
- **Formal Habits**: 5 axis choices (sentence length / interiority / dialogue / time / verb orientation)
- **Beauty orientation** and **Refusal list**
- **Dark handling approach**

Show the synthesis to the user as a draft persona. Ask: *"Does this sound like the author who wrote this story? What's wrong?"*

Revise until the user confirms.

### A3 — Write the Persona File

Write to `drafts/{slug}/persona.md` using the persona template structure:

```
## The Author's Name
## What This Author Knows Firsthand
## The Author's Animating Belief
## What This Author Finds Beautiful
## What This Author Refuses
## Formal Habits
## How This Author Handles the Dark
## The Author's Relationship to Genre
## Truth Library
## Voice Anchors (stub — populated after first prose)
## Decision Protocol
```

Note: Voice Anchors are stubbed at FORGE time. They are populated in Mode B (LOAD) after draft prose exists, and updated each time `story-scene` commits a scene.

Update `lifecycle.json`: add `"persona": "drafts/{slug}/persona.md"` to the `artifacts` map.

---

## Mode B — LOAD

*Use when: beginning a work session, or when `story-scene` Step 2 requests persona context.*

### B1 — Read

Read `drafts/{slug}/persona.md`.

If missing: offer to run Mode A (FORGE) now, or proceed without persona (degraded mode — flag to user).

### B2 — Populate Voice Anchors (if prose exists and anchors are stubs)

Read 1–3 committed prose files from `drafts/{slug}/prose/`. Find 3–5 sentences that best exemplify the author's voice as defined by the Formal Habits — sentences this author would not have written any other way.

Add them to the Voice Anchors section of `persona.md`.

### B3 — Produce Working Reference

Compress the persona into a 5-bullet working reference for use within the current session:

```
AUTHOR: {name}
BELIEF: {animating belief — one sentence}
BEAUTY: {what pulls this author — one phrase}
REFUSALS: {1–2 hard aesthetic lines}
TRUTHS: {2–3 Truth Library items as bullets}
DARK: {one-line dark-handling approach}
VOICE: {2–3 sentence-level habits — e.g., "Fragments at rupture points. Free indirect. Object-forward."}
```

This working reference is what gets loaded into `story-scene` Step 2. It is not written to disk — it lives in session context.

---

## Mode C — APPLY

*Use when: facing a specific aesthetic decision and unsure what this author would do.*

### C1 — Name the Decision

User or skill states the specific choice: e.g., "The scene where the protagonist discovers the letter — does this author show the letter's contents or cut away?" or "Is this line of dialogue ironic or earnest?"

### C2 — Run the Decision Protocol

Apply the four-point filter from the persona:

1. **Belief test**: does this choice dramatize or contradict the Animating Belief? If the Animating Belief is "people destroy what they cannot stop loving," and the choice is "protagonist burns the letter without reading it" — does that dramatize the belief? Yes: it enacts the self-destructive compulsion. Proceed.

2. **Beauty test**: does this choice move toward what this author finds beautiful, or away from it? If the author finds beautiful "the moment of generous action before self-interest intervenes" — and this scene offers no such moment — that's a signal, not a prohibition.

3. **Refusal test**: does this choice cross the aesthetic bright lines? Hard stop if yes. Reframe the scene to avoid the refusal without losing the scene's purpose.

4. **Truth test**: does this choice reflect a Truth Library item? If yes: confidence the choice is grounded. If no: consider whether the action is sourced in cliché instead.

### C3 — Deliver Verdict

State:
- What this author would do (specific, not hedged)
- Which filter determined the choice
- The alternative that was rejected and why

Keep under 150 words.

---

## Integration Points

### In `story-new`

After Step 3 (Initialize Project Directory), offer:
> "Want to forge an Author Persona now? Running `/story-persona` FORGE before the premise slate shapes the voice from the start — you can always revise it. Or skip and forge it before the first prose draft."

If user says yes: run Mode A inline.

### In `story-scene` Step 2 (Load Context)

After loading character files and world-bible, load the persona:

```
6. drafts/{slug}/persona.md → compress to working reference via /story-persona LOAD
```

The working reference (5 bullets) lives in session context for the duration of the scene draft. It is the last filter before writing any beat.

### In `story-scene` Step 5 (Draft Beat by Beat)

After writing each beat, before showing to user, run the beat through the Decision Protocol silently:
- If the beat passes all four filters: show it.
- If the beat fails a filter: flag the specific filter failure and offer two alternatives.

Do not run the full APPLY mode per beat — run it as a quick internal check. Only surface it when a filter fails.

### In `story-scene` Step 9 (Commit)

After committing prose, if 3+ scenes now exist and Voice Anchors are stubs: automatically populate Voice Anchors from committed prose (Mode B, B2). This keeps the persona grounded in the actual work rather than the intention.

---

## What the Persona Is Not

- It is not a style guide (it does not dictate vocabulary or sentence length universally — only habits that recur under this author's specific pressures)
- It is not a moral filter (the Refusals are aesthetic, not ethical)
- It is not fixed (it can be revised as the work evolves — especially the Truth Library and Voice Anchors)
- It is not the writer's real psychology (the wound-knowledge is emotional territory, not autobiography)

The persona's job: make every aesthetic choice feel authored by the same specific human consciousness, not assembled from competent generic prose.
