---
id: story-spine
version: 1.0.0
contract-version: 1
name: story-spine
description: |
  Build or revise a story's load-bearing skeleton — the spine of major events
  from Inciting Incident through Progressive Complications, Crisis, Climax, and
  Resolution. Delegates heavy generation to the structure-skeleton agent; audits
  the result against McKee predicates; and locks the spine when validated. Use
  after the cast pressure system is locked.
  Trigger: /story-spine, "build the spine", "story structure", "map the plot",
  "inciting incident", "what happens in the story", "story skeleton".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - build the spine
  - story structure
  - map the plot
  - story skeleton
  - what happens in the story
  - inciting incident to climax
contract: {"purpose":"Build or revise a story's load-bearing skeleton — the spine of major events from Inciting Incident through Progressive Complications, Crisis, Climax, and Resolution. Delegates heavy generation to the structure-skeleton agent; audits the result against McKee predicates; and locks the spine when validated. Use after the cast pressure system is locked. Trigger: /story-spine, \"build the spine\", \"story structure\", \"map the plot\", \"inciting incident\", \"what happens in the story\", \"story skeleton\".","trigger":["/story-spine","story spine"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/premise-card.md","drafts/{slug}/controlling-idea.md","drafts/{slug}/genre-contract.md","drafts/{slug}/cast-design.md","drafts/{slug}/cast-roster.md","drafts/{slug}/characters/","drafts/{slug}/world-bible.md","drafts/{slug}/spine.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["mck-crisis-dilemma","mck-surprise-plant","story-act","story-cast","structure-skeleton"],"fixtures":{"positive":"story-spine:positive","negative":"story-spine:missing-trigger"}}
generated: true
source: src/skills/story-spine/SKILL.md
source-version: 1.0.0
source-sha256: c5498df972a87db633d5ecd6b984db71b266e888f98f64d65c9e352a55eb0406
generator-version: 1.0.0
verification-command: npm run agents:check-drift
---

# Building the Story Spine

The spine is the story's load-bearing skeleton: the sequence of events from Inciting Incident through Crisis, Climax, and Resolution. It is the most important structural artifact. Everything else — act design, scene cards, character arcs, image system — hangs from it.

## Before Starting

Read:
- `drafts/{slug}/premise-card.md` (required — locked premise)
- `drafts/{slug}/controlling-idea.md` (required — locked)
- `drafts/{slug}/genre-contract.md` (required — locked)
- `drafts/{slug}/cast-design.md` and `drafts/{slug}/cast-roster.md` (required)
- All character files in `drafts/{slug}/characters/` (required)
- `drafts/{slug}/world-bible.md` or the locked Setting Survey (required)

If the premise, genre, Controlling Idea, setting, or cast is not locked, stop
and route to the missing contract. In particular, run `/story-cast` before
building the spine: the spine must dramatize an already-defined pressure system.

## Step 1 — Brief the structure-skeleton Agent

Invoke the `structure-skeleton` agent with:
- The locked premise
- The locked Controlling Idea
- The locked Genre Contract
- The locked cast design, roster, and Character Files
- The locked setting and world rules
- The target length (short story / novella / novel / series)
- Any known constraints (must start in X, must end with Y, real historical events, etc.)

The agent returns `drafts/{slug}/spine.md`.

## Step 2 — Audit the Spine Against McKee Predicates

Read the returned spine and check each predicate:

### Inciting Incident
- [ ] The II **upsets the balance** of the protagonist's life
- [ ] The II is **singular** — one event, not a montage
- [ ] The II **raises the Major Dramatic Question** (MDQ)
- [ ] The II occurs in the **correct act position** (Act 1, early — but not the opening page for longer works)

### Progressive Complications
- [ ] Each complication is **worse than the last** (escalation)
- [ ] At least one complication **inverts the protagonist's strategy** (forcing a different approach)
- [ ] At least one complication creates an **irreversible change** (point of no return)
- [ ] The complications arise from **character choices** + **antagonist forces**, not coincidence

### Crisis
- [ ] The Crisis is a **true dilemma** (not a hard choice with an obvious right answer)
- [ ] The Crisis presses on the protagonist's **True Character** (reveals who they really are)
- [ ] The Crisis connects directly to the **Controlling Idea**'s value
- [ ] The protagonist **cannot escape** the decision (forced confrontation)

### Climax
- [ ] The Climax **flows from the Crisis decision** — not coincidence
- [ ] The Climax **answers the MDQ**
- [ ] The Climax delivers the **obligatory genre scene** (check genre contract)
- [ ] The value charge makes its **final flip** at the Climax
- [ ] The Climax delivers the **Controlling Idea** through action, not dialogue

### Resolution
- [ ] The Resolution shows the **world after** the value change (new equilibrium)
- [ ] The Resolution is **proportional** (not overlong)
- [ ] The Resolution completes any **open subplots** minimally

## Step 3 — Gap Analysis

For each spine event, ask:
- Is there a **Gap** between what the protagonist expected and what happened?
- Does the Gap cause the **next** spine event (causality: *therefore / but*, not *and then*)?

Flag any event connected by "and then" (no causal gap) — these need redesign.

## Step 4 — Iterate if Needed

If the spine fails predicates, identify which layer is broken:
- Inciting Incident weak → ask structure-skeleton to redesign it with a stronger II
- Crisis is a hard choice → invoke `/mck-crisis-dilemma` to sharpen it
- Climax requires coincidence → trace back to the Crisis decision and redesign the causal chain
- MDQ not answered → restate the MDQ explicitly and verify the Climax resolves it

Cap at 3 revision rounds with the agent. After 3, surface remaining issues to user.

## Step 5 — Lock the Spine

When all predicates pass:

Update `lifecycle.json`:
```json
"state": "spine_locked",
"locked": { "spine": true }
```

## Step 5.5 — Offer Surprise Architecture (V3)

After spine is locked, offer:

> "Want to design the Inevitable-Surprise architecture before writing Act 1? `/mck-surprise-plant DESIGN` builds the misdirection plan from the Climax backward — it specifies what the audience will expect vs. what actually happens, and plants dual-reading items in the act/scene outline. This cannot be retrofitted onto a finished draft without it showing. Takes ~15 minutes now; saves an unresolvable revision problem later."

If user accepts: run `/mck-surprise-plant DESIGN` inline. The misdirection plan writes to `drafts/{slug}/misdirection-plan.md` and registers in `lifecycle.json` artifacts.

If user declines: note in `lifecycle.json`:
```json
"misdirection_plan": null
```

## Step 6 — Suggest Next

> "Spine is locked. Next: optionally re-run `/story-cast` in audit mode to verify scene-time coverage, then use `/story-act` to plan each act's scene sequence."
