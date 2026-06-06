---
id: mck-arc-walk
version: 1.0.0
contract-version: 1
name: mck-arc-walk
description: |
  Walk a character's arc across the spine — mapping revelation moments, naming
  the want-to-need transition, identifying the obligatory revelation scene, and
  producing a value-progression chart. Use after character files and spine are
  in place, or to diagnose a character who feels static or unmotivated.
  Trigger: /mck-arc-walk, "character arc", "trace the arc", "character progression",
  "where does the character change", "map the arc".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - character arc
  - trace the arc
  - character progression
  - where does the character change
  - map the arc
  - arc walk
contract: {"purpose":"Walk a character's arc across the spine — mapping revelation moments, naming the want-to-need transition, identifying the obligatory revelation scene, and producing a value-progression chart. Use after character files and spine are in place, or to diagnose a character who feels static or unmotivated. Trigger: /mck-arc-walk, \"character arc\", \"trace the arc\", \"character progression\", \"where does the character change\", \"map the arc\".","trigger":["/mck-arc-walk","mck arc walk"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/characters/{name}.md","drafts/{slug}/spine.md","drafts/{slug}/characters/{name}-arc.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["scene-architect"],"fixtures":{"positive":"mck-arc-walk:positive","negative":"mck-arc-walk:missing-trigger"}}
---

# Arc Walk — Character Trajectory Mapping

McKee: *"Structure is character. A person's true character is revealed through the choices they make under pressure — the greater the pressure, the deeper the revelation."*

An arc is not a character **improving**. It's a character **changing** — discovering who they truly are, or refusing to discover it. The change can be positive (the character grows into their best self), negative (they degrade), flat (they resist change but remain who they are against enormous pressure), or tragic (they *almost* change but can't).

## Step 1 — Read the Character File

Load `drafts/{slug}/characters/{name}.md`. Identify:
- **Want** (conscious desire): what the character thinks they're pursuing
- **Need** (unconscious desire): what the character actually needs (often the opposite or deeper version of the Want)
- **Wound**: the past pain that creates the gap between want and need
- **Contradictions**: the character's internal conflicts (Dimension)
- **Habitual worldview**: how they interpret events before the arc begins

If no character file exists, synthesize from available scene appearances.

## Step 2 — Read the Spine

Load `drafts/{slug}/spine.md`. Map the major events:
- Inciting Incident
- Progressive Complications (major turning points)
- Crisis
- Climax
- Resolution

## Step 3 — Place the Character at the Opening

At the story's opening, state:
- Where is the character on the positive/negative pole of the story's primary value?
- What is their **active want** at the opening?
- What **wound** is in place but not yet surfaced?
- What is their **worldview** — the false belief they're operating from?

## Step 4 — Identify Revelation Moments

A **revelation** is a moment when the character learns something that challenges or shatters their worldview. Revelations cause value-charge shifts.

Types of revelation:
- **Discovery**: they learn a fact they didn't know
- **Decision under pressure**: they act and discover what they're capable of
- **Other-character mirror**: another character forces them to see themselves
- **Cost realization**: they see what pursuing their Want is actually costing them

For each major spine event, ask: *Does this event force a revelation on this character? If yes, what do they learn — and do they accept it, partially accept it, or resist it?*

## Step 5 — Name the Want-to-Need Transition

Every positive arc has a moment where the character **stops pursuing their want and begins serving their need**. This is not always conscious. Find it:

- Before this moment: the character makes choices driven by their conscious Want
- After this moment: the character's choices (even unconsciously) serve their Need
- The moment itself: usually a crisis within the arc — a cost so severe they can no longer maintain the false worldview

Mark this event on the spine.

## Step 6 — Produce the Value-Progression Chart

| Spine Event | Value Charge | Revelation | False Belief Status |
|---|---|---|---|
| Opening | [+ or -] | none | Active |
| Inciting Incident | [shift] | [if any] | Intact / Challenged |
| Complication 1 | [shift] | [if any] | ... |
| ... | ... | ... | ... |
| Want→Need Transition | [shift] | [Key revelation] | Shattered / Resisted |
| Crisis | [shift] | [character faces choice] | Resolved / Refused |
| Climax | [final charge] | [True Character revealed] | [arc outcome] |
| Resolution | [settled charge] | | [new worldview or tragedy] |

Value charges: `++` (strongly positive), `+` (positive), `+/-` (ambiguous), `-` (negative), `--` (strongly negative).

## Step 7 — Identify the Obligatory Revelation Scene

The obligatory revelation scene is the one where the character's **True Character** is *finally*, *definitively* revealed — usually at or just before the Climax. This scene must:
- Be *unique* (only this character could have this revelation in this way)
- Follow from *all the prior arc beats* (feel inevitable)
- Deliver the *value flip* that the arc has been building to

Mark this scene in the spine. If no scene card exists for it yet, flag it for `scene-architect`.

## Step 8 — Write the Arc Summary

Write to `drafts/{slug}/characters/{name}-arc.md`:

```markdown
## {Character Name} — Arc Map

**Opening Condition:** [value charge + active want + false worldview]
**True Need:** [what they actually need; opposed to or deeper than want]
**Wound:** [the past pain creating the gap]

**Want → Need Transition:** [scene where this shifts]

### Revelation Sequence
1. [Spine event] → [Revelation] → [Belief status]
2. ...

### Value Progression Chart
[Table from Step 6]

### Obligatory Revelation Scene
- Spine position: [which act/scene]
- What happens: [specific action that reveals True Character]
- Value flip: [from X to Y]
- Scene Card reference: [scenes/{act}-{scene}.md]

### Arc Type
- [ ] Positive (growth into true self)
- [ ] Negative (degradation)
- [ ] Flat (resistance against enormous pressure)
- [ ] Disillusionment (positive → negative, earned)
- [ ] Tragic (almost changes, but can't)
```

## Diagnosing a Static Arc

If the arc feels flat:
- **No revelations**: add at least one revelation per act
- **Want = Need** from the start: the character has no gap to close; create a false worldview
- **Revelations not accepted**: check that at least one revelation lands; if all are resisted, this is a flat arc by design — ensure that's intentional
- **True Character never under pressure**: the Crisis dilemma must threaten something the character actually cares about; if it doesn't, the arc has no ending
