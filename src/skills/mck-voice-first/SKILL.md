---
id: mck-voice-first
version: 1.0.0
contract-version: 1
name: mck-voice-first
description: |
  Lock a story's voice before drafting prose — select exemplar passages, extract
  style rules (vocabulary range, sentence rhythm, register, tense, POV, taboo
  words), and write a voice-anchors.md file that all subsequent drafting must honor.
  Also use mid-draft to recalibrate voice drift. Voice is what makes a story by
  *someone*, not just by *anyone*.
  Trigger: /mck-voice-first, "voice anchors", "lock the voice", "voice rules",
  "voice drift", "establish the voice", "what's the voice of this story".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - voice anchors
  - lock the voice
  - voice rules
  - voice drift
  - establish the voice
  - what's the voice
  - mck-voice-first
contract: {"purpose":"Lock a story's voice before drafting prose — select exemplar passages, extract style rules (vocabulary range, sentence rhythm, register, tense, POV, taboo words), and write a voice-anchors.md file that all subsequent drafting must honor. Also use mid-draft to recalibrate voice drift. Voice is what makes a story by *someone*, not just by *anyone*. Trigger: /mck-voice-first, \"voice anchors\", \"lock the voice\", \"voice rules\", \"voice drift\", \"establish the voice\", \"what's the voice of this story\".","trigger":["/mck-voice-first","mck voice first"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/voice-anchors.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["voice-drift-detector"],"fixtures":{"positive":"mck-voice-first:positive","negative":"mck-voice-first:missing-trigger"}}
---

# Voice-First Drafting

Voice is the story's irreducible quality — the way the narrator sees, the rhythm of their thought, the words they reach for and the words they never use. Structure can be taught. Voice cannot be faked for long.

This skill locks voice before prose begins (or re-locks it when drift is detected). It produces `voice-anchors.md` — a binding style contract that every drafting session must honor.

---

## Step 1 — Gather the Raw Material

The user should provide at least one of:
- **Exemplar passages** — 3–5 paragraphs of prose that feel *right* for this story (from the writer's own work, from a cited author, from prior scenes in this draft)
- **A description of the target voice** ("austere", "lyrical", "clinical", "observational", "intimate", "oracular")
- **Negative space** — voices this story must NOT sound like

If the draft already has scenes, read the 2–3 strongest prose sections as exemplars. The existing prose *is* the voice, even if imperfect. The goal is to codify what's working.

---

## Step 2 — Extract the Voice Signature

Analyze the exemplar passages for these dimensions:

### Vocabulary Range
- What's the register? (plain / elevated / vernacular / technical / period-appropriate)
- What words appear that are **distinctive** (would only appear in this voice)?
- What words are conspicuously **absent**?
- Does the vocabulary contract under pressure (shorter words when tension rises)?

### Sentence Architecture
- Average sentence length? (count words in 5 random sentences)
- What's the variance? (tight/uniform vs. wide/irregular)
- Favored structures: declarative / interrogative / imperative / exclamatory
- Parataxis (short coordinated clauses) or hypotaxis (long subordinated clauses)?
- Where do fragments appear, and why?

### Rhythm
- What's the beat? Read 3 sentences aloud — where do they stress?
- Does the rhythm vary with emotional temperature?
- What's the characteristic closing rhythm of a paragraph?

### Register and Distance
- Is this intimate (close, personal, breathing down the neck of experience)?
- Or observational (stepping back, cataloguing, finding patterns)?
- Does the narrator have opinions that surface in word choice?
- What's the emotional temperature: cool / warm / ironic / elegiac / taut?

### Tense and POV
- Tense: past / present / past-habitual?
- POV: first / third limited / third close / third objective?
- Any POV slippage that needs to be flagged as error vs. intentional?

### Taboo Words and Patterns
- What words would break the voice? (too modern / too ornate / too casual / too clichéd)
- What sentence patterns signal drift? (passive constructions, adjective stacking, filtering verbs like "he felt that..." "she noticed that...")

---

## Step 3 — Write the Voice Anchors

Write `drafts/{slug}/voice-anchors.md`:

```markdown
# Voice Anchors — {title}

## The Voice in One Sentence
{A one-sentence description: "The voice of this story is X — it sees the world as Y and speaks in Z."}

## Exemplar Passages
{Paste 2–3 short exemplar passages that define the voice at its best.}

## Vocabulary Rules
- Register: {plain / elevated / period / vernacular}
- Characteristic words: {list 5–10 words that feel right}
- Taboo words: {list 5–10 words that would break the voice}
- Vocabulary contracts under pressure: {yes / no}

## Sentence Architecture
- Average length: {N} words
- Structure bias: {parataxis / hypotaxis / mixed}
- Fragment rule: {fragments used for X; never used for Y}
- Paragraph close rhythm: {description}

## Register and Distance
- Distance: {intimate / observational / ironic / cold / warm}
- Narrator opacity: {does the narrator have opinions? how do they surface?}
- Emotional temperature: {cool / taut / elegiac / etc.}

## Tense and POV
- Tense: {past / present}
- POV: {first / third limited / third close}
- POV slip rule: {how to handle interiority vs. external observation}

## Anti-Patterns (voice drift signals)
- {Pattern 1 that breaks the voice — e.g., "adjective stacking"}
- {Pattern 2 — e.g., "filtering verbs: 'she felt that', 'he noticed that'"}
- {Pattern 3 — e.g., "passive constructions in action sequences"}
- {Pattern 4 — e.g., "adverb props: 'slowly', 'suddenly', 'quietly'"}

## Cadence Test
Read this aloud. If it sounds right, the voice is holding:
{Paste one exemplar paragraph as the test passage.}
```

---

## Step 4 — Run a Voice Spot-Check on Existing Prose

If the draft already has prose, select 5 random paragraphs (from different scenes and acts) and test each against the voice anchors:

For each paragraph:
1. Does the vocabulary match the register?
2. Do the sentence rhythms match the architecture?
3. Are any anti-patterns present?
4. Does it sound like it comes from the same narrator as the exemplar?

Flag any paragraph that drifts with a specific diagnosis:
> "Scene 2.4, paragraph 3: register drift — vocabulary elevates unexpectedly ('lachrymose', 'ineffable') where the voice is plain and direct. Revise by restating in simpler diction."

---

## Step 5 — Calibrate for Scene Type

The voice should modulate — not drift. Note how the voice adapts:

- **High-tension scenes**: sentences compress; vocabulary contracts; fragments increase
- **Reflective scenes**: sentences extend; subordination increases; vocabulary expands slightly
- **Dialogue-heavy scenes**: prose beats between lines should maintain POV voice, not go neutral
- **Climax**: the voice should be at its most compressed and direct — this is not the moment for style

Write a note in voice-anchors.md: *"The voice modulates by X in scenes of type Y, but never loses these core properties: {list 2–3 invariant features}."*

---

## Output

1. **`drafts/{slug}/voice-anchors.md`** — the binding voice contract
2. **Spot-check findings** — any drift paragraphs flagged with specific diagnosis
3. **Modulation notes** — how the voice adapts to scene type while staying coherent

After locking voice anchors, mention: the `voice-drift-detector` agent can be spawned on any completed draft to audit voice consistency at scale.
