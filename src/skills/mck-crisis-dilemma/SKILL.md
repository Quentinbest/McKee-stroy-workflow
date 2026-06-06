---
id: mck-crisis-dilemma
version: 1.0.0
contract-version: 1
name: mck-crisis-dilemma
description: |
  Sharpen a draft Crisis into a true dilemma — a choice between irreconcilable
  goods or the lesser of two evils, where no right answer exists without cost.
  McKee's Crisis is the story's "Obligatory Scene" where the protagonist faces
  their worst fear and must choose who they truly are. Use when the Crisis feels
  like a "hard choice" (obvious right answer) rather than a true dilemma.
  Trigger: /mck-crisis-dilemma, "crisis design", "sharpen the dilemma",
  "climax choice", "the story's worst moment", "obligatory scene".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - crisis design
  - sharpen the dilemma
  - climax choice
  - the story's worst moment
  - obligatory scene
  - crisis feels too easy
contract: {"purpose":"Sharpen a draft Crisis into a true dilemma — a choice between irreconcilable goods or the lesser of two evils, where no right answer exists without cost. McKee's Crisis is the story's \"Obligatory Scene\" where the protagonist faces their worst fear and must choose who they truly are. Use when the Crisis feels like a \"hard choice\" (obvious right answer) rather than a true dilemma. Trigger: /mck-crisis-dilemma, \"crisis design\", \"sharpen the dilemma\", \"climax choice\", \"the story's worst moment\", \"obligatory scene\".","trigger":["/mck-crisis-dilemma","mck crisis dilemma"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["structured response or task-scoped story artifact"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-crisis-dilemma:positive","negative":"mck-crisis-dilemma:missing-trigger"}}
---

# Crisis-Dilemma Sharpening

McKee: *"The Crisis is the story's most concentrated, irreducible moment of conflict — when all prior complexity converges and the protagonist must choose who they are."*

A **hard choice** has an obvious right answer at a high cost.
A **true dilemma** has no right answer — only two irreconcilable goods, or two genuine evils.

Your job is to turn the hard choice into the true dilemma.

## The Two Forms of True Dilemma

### Form 1 — Irreconcilable Goods
Two things the protagonist genuinely values, and choosing one destroys the other.

Examples:
- Love of one person vs. love of another
- Personal integrity vs. protection of someone innocent
- Truth vs. mercy
- Freedom vs. responsibility

The protagonist cannot choose *without betraying something real*.

### Form 2 — Lesser of Two Evils
Two genuinely bad outcomes; the protagonist must choose which wrong to commit.

Examples:
- Betray a friend or allow harm to a stranger
- Lie and preserve a relationship, or tell the truth and destroy it
- Commit violence to prevent greater violence
- Sacrifice one to save many (or refuse to)

The protagonist cannot choose *without incurring genuine moral damage*.

## Step 1 — State the Current Draft Crisis

Write out the choice the protagonist currently faces:
- *Choice A: [do X]*
- *Choice B: [do Y]*

## Step 2 — Apply the "Right Answer" Test

Ask: *Is there a choice that a reasonable person in the protagonist's position would obviously make?*

If yes → you have a hard choice, not a dilemma. Proceed to Step 3.
If no → you may already have a dilemma. Verify by stress-testing below.

## Step 3 — Remove the Obvious Right Answer

To turn a hard choice into a dilemma:

**Raise the cost of the right answer** until it becomes a different kind of wrong.
- If the "right" choice is to tell the truth: make the truth destroy someone who doesn't deserve it.
- If the "right" choice is to save the person you love: make saving them require damning someone innocent.

**Or: Make both choices incur genuine loss.**
- A is good *for this* and costs *that*.
- B is good *for that* and costs *this*.
- The costs must be in the same value-currency so they're genuinely comparable.

## Step 4 — Connect to True Character

The Crisis is the moment when the protagonist's **True Character** (who they really are under pressure) is finally revealed — or when their arc completes.

Ask:
- *What does this choice reveal about who the protagonist really is?*
- *Which choice is the person they were at the start? Which is the person they've become?*
- *What wound or fear is being pressed by this choice?*

The True Character must be the reason the choice is agonizing — not circumstances alone.

## Step 5 — Verify the Climax Flows From the Decision

The **Climax** is the *consequence* of the Crisis decision — the gap between what the protagonist hoped and what resulted.

Ask:
- *If the protagonist chooses A, what is the Climax?*
- *If the protagonist chooses B, what is the Climax?*
- *Does the chosen Climax feel like an inevitable result of that decision, or does it require coincidence?*

If the Climax requires coincidence to arrive from the decision → redesign the Climax or the Crisis.

## Step 6 — Map to the Controlling Idea

The Crisis decision and its Climax consequence should *dramatize* the Controlling Idea:
- If the Idea is "Love endures because..." — the Crisis must press on love; the Climax must reveal whether it endured.
- If the Idea is "Power corrupts because..." — the Crisis must present the protagonist with a choice that tests whether they will use power corruptly.

If the Crisis doesn't connect to the Controlling Idea → the story's spine has a gap. Surface it.

## Step 7 — Record the Revised Crisis Design

```markdown
## Crisis Design

**The Dilemma:**
Choice A: [description of option A]
  Cost: [what is lost or damaged]
Choice B: [description of option B]
  Cost: [what is lost or damaged]

**True Character Revealed:**
[What the protagonist's choice reveals about who they have become]

**Connection to Controlling Idea:**
[How this dilemma dramatizes the Idea's value + cause]

**Climax That Follows:**
[The consequence of the chosen option — what happens next, without coincidence]

**Obligatory Scene:**
[The specific scene — where, who, what action — that delivers this Climax]
```

## Stress Tests

After designing the dilemma, apply these tests:

1. **The Audience Test**: Would a viewer feel genuine dread about this choice — not just sadness, but *uncertainty* about what the protagonist will do?
2. **The Hindsight Test**: After the Climax, does the choice feel *inevitable* (this is who they are) AND *surprising* (you couldn't have been certain)?
3. **The Cost Test**: Is there genuine loss on *both* sides of the choice, not just the unchosen one?
4. **The True-Character Test**: Could a completely different protagonist make the same choice for the same reasons? If yes → the dilemma isn't tied to *this* character's specific wound/arc.
