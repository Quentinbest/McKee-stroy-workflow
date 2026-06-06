---
id: mck-gap-find
version: 1.0.0
contract-version: 1
name: mck-gap-find
description: |
  Find the Gap in any beat or scene — the discrepancy between what a character
  expects to happen and what actually happens. The Gap is where story lives.
  A beat without a Gap is not a story beat; it's inert description. Use to audit
  beats that feel flat, or as a pre-draft check on any scene.
  Trigger: /mck-gap-find, "find the gap", "where is the gap", "this beat feels
  flat", "nothing happens in this scene", "gap analysis".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - find the gap
  - where is the gap
  - beat feels flat
  - nothing happens in this scene
  - gap analysis
  - scene feels static
contract: {"purpose":"Find the Gap in any beat or scene — the discrepancy between what a character expects to happen and what actually happens. The Gap is where story lives. A beat without a Gap is not a story beat; it's inert description. Use to audit beats that feel flat, or as a pre-draft check on any scene. Trigger: /mck-gap-find, \"find the gap\", \"where is the gap\", \"this beat feels flat\", \"nothing happens in this scene\", \"gap analysis\".","trigger":["/mck-gap-find","mck gap find"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["structured response or task-scoped story artifact"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-gap-find:positive","negative":"mck-gap-find:missing-trigger"}}
---

# The Gap — Finding Where Story Lives

McKee: *"The gap between expectation and result is where story lives. Story is born in that treacherous space."*

A beat is the minimum story unit. Its structure:
1. A character takes an **action** to achieve a desire
2. The character (and audience) has an **expectation** of what will result
3. The world delivers a **result** that differs from the expectation
4. The **Gap** opens — the discrepancy between expected and actual

Without a Gap, there is no change. Without change, there is no scene. Without a scene, there is no story.

## Finding the Gap — Three Questions

For any beat, scene, or sequence, answer:

**Q1: What does the character want (in this specific moment)?**
Not their life goal — what do they want from *this interaction*, *this phone call*, *this room they're entering*?

**Q2: What action do they take to get it?**
Specifically: what do they *say*, *do*, or *attempt*?

**Q3: What actually happens?**
The gap opens when the answer to Q3 is not the answer Q2 was designed to produce.

## The Gap Spectrum

Gaps range from small to catastrophic:

| Gap Size | Expectation | Reality | Effect |
|---|---|---|---|
| No Gap | Character asks for coffee | Gets coffee | No story; inert description |
| Micro Gap | Character smiles warmly | Other character doesn't smile back | Slight chill; minor complication |
| Medium Gap | Character asks for help | Gets polite refusal | Clear obstacle; scene turns |
| Large Gap | Character offers a truce | Gets attacked | Major reversal; value charges flip |
| Catastrophic Gap | Character tries to save someone | Causes their death instead | Irreversible; spine-level event |

More story requires larger gaps — or many small gaps accumulating.

## Gap Shapes

### Positive → Negative Gap (most common)
Character expects success → receives failure or complication.
*Protagonist presents the plan confidently → the board laughs.*

### Negative → Positive Gap (relief, reversal)
Character expects failure or punishment → receives unexpected help or success.
*Character expects to be arrested → cop looks the other way.*

### Positive → Worse Positive (irony)
Character gets what they wanted → discovers they didn't really want it.
*Character wins the argument → realizes they've just ended the relationship.*

### Negative → Worse Negative (escalating tragedy)
Character already in bad state → situation deteriorates further.
*Character tries to flee → discovers the exit is already blocked.*

## Diagnosing a Missing Gap

Symptoms of a gapless beat:
- The scene describes activity but nothing *changes* — value charge is same at start and end
- Characters talk and nothing is refused, unexpected, or revealed
- A character moves from A to B and arrives at B as expected
- The scene ends at the same emotional register it began

Remedy: identify the scene's central *want*, then make the world refuse it — not completely (that produces no story either), but *unexpectedly*. The gap is the distance between what the character expected to get and what they actually received.

## Gap as Scene Architecture

The Gap is not just a beat concept — it structures whole scenes:

**Opening Gap** (the scene's Inciting Incident): something disrupts the status quo and creates a want.
**Deepening Gap**: the character's actions to close the gap keep making it wider.
**Closing Gap (or final flip)**: the Turning Point — the value charge flips and the gap either closes in an unexpected way or becomes permanent.

For a scene to work:
1. The opening must establish a want clearly
2. The middle must escalate the gap
3. The end must flip the value charge (positively or negatively) — the gap closes one way or another

## Quick Audit Format

For each scene/beat being audited, fill in:

```
Scene/Beat: [reference]
Character: [name]
Want: [specific, active, this moment]
Action taken: [what they do]
Expected result: [what they hoped would happen]
Actual result: [what actually happened]
Gap: [large / medium / small / NONE]
Value charge shift: [+ to - / - to + / no shift]
Verdict: [Beat works / Beat is gapless — rewrite needed]
```

If the Verdict is "gapless": specify where the action could meet unexpected resistance, and what that resistance would be.
