---
id: mck-controlling-idea
version: 1.0.0
contract-version: 1
name: mck-controlling-idea
description: |
  Forge or audit a story's Controlling Idea — the single sentence of "value +
  cause" that every scene must ultimately serve (McKee Ch.4). Walks the writer
  through value identification, negation, cause, and the four-corner value test.
  Invoke when starting a new project, when the theme feels vague, or when scenes
  keep drifting without apparent purpose.
  Trigger: /mck-controlling-idea, "what is this story about", "controlling idea",
  "theme", "what does this story say", "主控思想".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - controlling idea
  - what is this story about
  - forge the theme
  - what does this story say
  - 主控思想
contract: {"purpose":"Forge or audit a story's Controlling Idea — the single sentence of \"value + cause\" that every scene must ultimately serve (McKee Ch.4). Walks the writer through value identification, negation, cause, and the four-corner value test. Invoke when starting a new project, when the theme feels vague, or when scenes keep drifting without apparent purpose. Trigger: /mck-controlling-idea, \"what is this story about\", \"controlling idea\", \"theme\", \"what does this story say\", \"主控思想\".","trigger":["/mck-controlling-idea","mck controlling idea"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/controlling-idea.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-controlling-idea:positive","negative":"mck-controlling-idea:missing-trigger"}}
generated: true
source: src/skills/mck-controlling-idea/SKILL.md
source-sha256: b2df5390c685bb5a7facbea3c59310456b57ac5221d163580039b1fd8ae97591
generator-version: 1.0.0
---

# The Controlling Idea Workflow

McKee's definition: the Controlling Idea is **a single declarative sentence** that says how and why life changes from one condition of existence to another — value plus cause.

**Template:** `[Value] is [won/lost/maintained/degraded] because [cause].`

This is the story's thesis — what it *proves*, not what it *argues*. The story dramatizes the idea through action; the idea is not stated by a character.

## Why This Matters

Without a Controlling Idea:
- Scenes drift without accumulating meaning
- The Climax feels arbitrary
- Revisions have no compass
- Characters' choices don't cohere

The Controlling Idea is the pressure that holds the whole structure together. Every scene must, if you trace it far enough, serve this sentence.

## Step 1 — Identify the Value

What is the **primary value** at stake in this story? Values are human experiences that can be positive or negative: love / hatred, freedom / slavery, life / death, justice / injustice, wisdom / ignorance, courage / cowardice, integrity / corruption.

Ask:
- At the Climax, what has the protagonist gained or lost?
- What does the audience feel — hope, grief, joy, disgust?
- What is the emotional charge of the final image?

The value is whatever **changes** (or has been fought to preserve) from the story's opening condition to its closing condition.

## Step 2 — State the Positive and Negative Poles

Every value has two poles. Name both:

| Positive Pole | Negative Pole |
|---|---|
| Love | Hatred |
| Freedom | Slavery |
| Justice | Injustice |
| Truth | Deception |
| Belonging | Isolation |

The story begins at one pole and ends at the other — or begins at the negative and fights toward the positive. This is the **value arc**.

## Step 3 — Find the Cause

What **causes** the value to change by the Climax? The cause must be:
- **Specific** (not "fate" or "life" — something the story actually dramatizes)
- **True** (must feel genuinely earned by what happens)
- **Active** (caused by choices, not coincidences)

Ask:
- Why does love win or lose? Because of what decision, what revelation, what force?
- What is it about *this* protagonist facing *these* forces that produces *this* outcome?

## Step 4 — Draft the Sentence

Combine: **`[Value] triumphs/fails because [cause]`**

Examples:
- *"Love endures because it survives the revealing of one's worst self."* (Positive Controlling Idea)
- *"Power corrupts because absolute authority destroys the capacity for empathy."* (Negative Controlling Idea)
- *"Justice is achieved because one person refuses to capitulate to social convenience."* (Positive)

The **polarity** (positive or negative) determines the emotional valence of the ending: tragedies have negative Controlling Ideas; comedies have positive; ironic stories have Ideas that seem positive but are secretly negative.

## Step 5 — Test the Four Corners (Negation of the Negation)

McKee's value square ensures depth:

```
POSITIVE          ←→        CONTRADICTION
(e.g., Love)              (e.g., Hate)
      ↕                         ↕
NEGATIVE CONTRASTING  ←→  NEGATION OF THE NEGATION
(e.g., Indifference)      (e.g., Self-destruction dressed as love)
```

The Negation of the Negation is the most complex form of the negative: not merely the absence of the positive, but its perverse inversion. The story should visit all four corners across its spine — including the darkest.

Ask: *What is the most extreme, most damaging version of the negative? Does the story go there?*

## Step 6 — Test Dramatizability

Can the Controlling Idea be **proven through action**? Could you summarize the spine of events and have a reader recognize the Idea in the events — without you stating it?

If not, the Idea is too abstract. Make it more specific, or redesign the events.

## Step 7 — Record the Controlling-Idea Card

Write to `drafts/{slug}/controlling-idea.md`:

```markdown
---
title: Controlling Idea
project: {slug}
polarity: positive | negative | ironic
last_updated: YYYY-MM-DD
---

## The Idea
[Value] [wins/fails] because [cause].

## Value Poles
- Positive: [positive value]
- Contradiction: [opposite]
- Negative contrasting: [absence/indifference]
- Negation of the negation: [darkest form]

## Dramatization Test
[2-3 sentences: how the spine proves the Idea through events]

## Counter-Idea
[The argument the story defeats — what the antagonist's worldview implies]
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Too abstract: *"Truth matters."* | Add cause: *"Truth liberates because denial ultimately destroys the denier."* |
| Too simple: no negation-of-negation | Find the darkest form of the negative; send the story there before the Climax |
| Stated by a character | The Idea must be *dramatized*, not *spoken*; cut the speech |
| Multiple competing ideas | Identify the primary one; the others become subplots |
| Wishful thinking | Test: *is this actually true about human experience?* |
