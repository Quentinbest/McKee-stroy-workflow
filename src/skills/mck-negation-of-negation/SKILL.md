---
id: mck-negation-of-negation
version: 1.0.0
contract-version: 1
name: mck-negation-of-negation
description: |
  Drive a story's controlling value to its absolute depth — from the positive pole
  through its simple contradiction to the negation of the negation (the deepest
  opposite, which often wears the positive pole's mask). McKee's tool for designing
  Crisis and Climax at the level that separates tragedy from melodrama. Use when
  designing Crisis, testing whether a Controlling Idea is truly negative or merely
  sad, or checking whether the story's ultimate value charge is as deep as it can go.
  Trigger: /mck-negation-of-negation, "negation of the negation", "deepest negative",
  "value square", "drive to the depths", "crisis design depth", "ultimate negative".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - negation of the negation
  - deepest negative
  - value square
  - drive to the depths
  - crisis design depth
  - ultimate negative
  - how dark can it go
contract: {"purpose":"Drive a story's controlling value to its absolute depth — from the positive pole through its simple contradiction to the negation of the negation (the deepest opposite, which often wears the positive pole's mask). McKee's tool for designing Crisis and Climax at the level that separates tragedy from melodrama. Use when designing Crisis, testing whether a Controlling Idea is truly negative or merely sad, or checking whether the story's ultimate value charge is as deep as it can go. Trigger: /mck-negation-of-negation, \"negation of the negation\", \"deepest negative\", \"value square\", \"drive to the depths\", \"crisis design depth\", \"ultimate negative\".","trigger":["/mck-negation-of-negation","mck negation of negation"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/controlling-idea.md","drafts/{slug}/spine.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-negation-of-negation:positive","negative":"mck-negation-of-negation:missing-trigger"}}
---

# Negation of the Negation

McKee: *"The negation of the negation is the most powerful position a story can reach — not the simple opposite of the positive, but the contradiction of the contradiction. Not merely bad, but a corruption of the good that pretends to be the good."*

This skill maps a story's central value through all four positions on the value square, identifies which position the story reaches at its Crisis/Climax, and tests whether the story is going as deep as its subject demands.

---

## Step 1 — Name the Central Value

Read `drafts/{slug}/controlling-idea.md` and `drafts/{slug}/spine.md`.

Identify the story's **central value** — the human quality that the story is fundamentally about. This is the value in the Controlling Idea sentence ("value + cause").

Examples of central values:
- Justice
- Love
- Freedom
- Truth
- Courage
- Life
- Faith
- Identity
- Power

Name the value. This is the positive pole.

---

## Step 2 — Map the Four-Corner Value Square

For any human value, there are four positions. Map them:

### Corner 1 — The Positive Pole
The value in its full expression.
*Love → Love. Justice → Justice. Freedom → Freedom.*

### Corner 2 — The Contradiction (Simple Negation)
The straightforward absence or opposite of the value.
*Love → Indifference. Justice → Injustice. Freedom → Imprisonment.*

### Corner 3 — The Negation (Opposite Pole)
The active presence of the opposite — not just absence but the positive alternative.
*Love → Hate. Justice → Tyranny. Freedom → Slavery.*

### Corner 4 — The Negation of the Negation
**The most powerful position.** The deepest possible negative: a corruption or perversion of the positive that *presents itself* as the positive. The positive gone so wrong it has become its own enemy.
*Love → Love that destroys its object. Justice → Justice as persecution. Freedom → The freedom of total nihilism — nothing matters, therefore anything is permitted.*

The negation of the negation is almost always disguised. It wears the mask of the positive. That is what makes it devastating.

---

## Step 3 — Locate the Story's Deepest Descent

Trace the story's value charge across the spine:
- Where does it start? (opening value charge)
- What is the lowest point? (current Crisis/Climax design)
- Does the lowest point reach Corner 4?

| Spine event | Value position | Corner |
|---|---|---|
| Opening | {description} | 1 / 2 / 3 / 4 |
| Inciting Incident | {description} | 1 / 2 / 3 / 4 |
| Crisis | {description} | 1 / 2 / 3 / 4 |
| Climax | {description} | 1 / 2 / 3 / 4 |
| Resolution | {description} | 1 / 2 / 3 / 4 |

**Diagnosis:**
- If the story reaches Corner 3 but not Corner 4 → the story is **melodrama** (bad things happen, but not the deepest bad)
- If the story reaches Corner 4 → the story has **tragic weight** (the worst is not just suffering but corruption of the good itself)
- If the Controlling Idea is negative ("corruption triumphs because...") → Corner 4 must be reached at Climax

---

## Step 4 — Test the Controlling Idea's Depth

A Controlling Idea with a **negative** charge ("value fails because X") should end at a deeper negative than simple failure. Ask:

*"Does the story's ending merely show the protagonist losing the value, or does it show the positive value being transformed into its worst possible version?"*

**Shallow negative**: the protagonist loses love → ends lonely
**Deep negative (negation of the negation)**: the protagonist loses love → their love becomes the very thing that destroys the person they love

**Shallow negative**: justice fails → the guilty go free
**Deep negative**: justice fails → the system that was meant to deliver justice becomes the instrument of persecution

If the current ending is Corner 3 (simple negative) and the Controlling Idea calls for Corner 4, the story needs to go deeper.

---

## Step 5 — Apply to Crisis Design

The Crisis is the moment of deepest compression. If the story is to reach Corner 4, the Crisis dilemma must force it there.

A Corner 4 Crisis has this structure: **the protagonist must choose between two options, both of which will corrupt the central value.** Not "lose the value or keep it" (that's Corner 3), but "corrupt it this way or corrupt it that way."

For the current Crisis, ask:
- Does this dilemma force the protagonist into a position where the value itself is betrayed?
- Or does it merely put the value at risk of loss?

If the latter → redesign the dilemma. Force both options to lead to Corner 4.

**Example:**
- Corner 3 Crisis (love at risk): *"If I tell the truth, I lose her. If I lie, I keep her for now."* (Protagonist might lose love — Corner 2/3)
- Corner 4 Crisis (love corrupted): *"If I protect her, I must become what I hate, and she will love me for exactly that — a love built on a lie that she chose to believe."* (Love becomes its own betrayal — Corner 4)

---

## Step 6 — Write the Corner 4 Formulation

For this specific story, write:

> **The negation of the negation of [central value] in this story is:**
> {description — one sentence}

> **It is disguised as:** {the positive mask}

> **It arrives at:** {the specific scene/moment}

> **The protagonist's role:** {they cause it / they suffer it / both}

---

## Output

1. **Value square** — all four corners named for this specific story
2. **Depth chart** — the story's current value charge at each spine event, with corners identified
3. **Diagnosis** — does the story reach Corner 4, or does it stop at Corner 3?
4. **Crisis redesign** (if needed) — a Corner 4 dilemma formulation
5. **Corner 4 formulation** — the story's specific negation of the negation, in one precise sentence
