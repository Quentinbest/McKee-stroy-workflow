---
id: story-cast
version: 1.0.0
contract-version: 1
name: story-cast
description: |
  Design and audit the full cast as a system of pressures — every character
  justified by a unique force they apply to the protagonist, no role redundant,
  every dimension of the protagonist illuminated by at least one foil.
  Delegates analysis to cast-balancer agent; guides character creation through
  character-forger agent. Use after spine is locked and before scene-level work.
  Trigger: /story-cast, "design the cast", "character system", "who are the
  characters", "audit the cast", "is this character necessary".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - design the cast
  - character system
  - who are the characters
  - audit the cast
  - is this character necessary
  - cast design
contract: {"purpose":"Design and audit the full cast as a system of pressures — every character justified by a unique force they apply to the protagonist, no role redundant, every dimension of the protagonist illuminated by at least one foil. Delegates analysis to cast-balancer agent; guides character creation through character-forger agent. Use after spine is locked and before scene-level work. Trigger: /story-cast, \"design the cast\", \"character system\", \"who are the characters\", \"audit the cast\", \"is this character necessary\".","trigger":["/story-cast","story cast"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/characters/","drafts/{slug}/cast-design.md","drafts/{slug}/cast-roster.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["cast-balancer","character-forger","story-act"],"fixtures":{"positive":"story-cast:positive","negative":"story-cast:missing-trigger"}}
generated: true
source: src/skills/story-cast/SKILL.md
source-sha256: 5b64a1577270a3e1c5b3509eed8575b7900dca14fc55b030f49a0b300eca3e60
generator-version: 1.0.0
---

# Cast Design

The cast is not a list of characters — it's a **system of pressures**. Every character exists because they apply a force to the protagonist that no other character can apply. Remove a character; nothing else loses that pressure. Add a character; a new pressure arrives that changes the protagonist's situation.

McKee: *"Every principal character must be justified by the unique pressure they exert on the protagonist's arc."*

## Step 1 — Inventory Existing Characters

Read all files in `drafts/{slug}/characters/`. List:
- Character name
- Role (protagonist / antagonist / love interest / confidant / etc.)
- What pressure they apply to the protagonist
- Which of the protagonist's dimensions they illuminate

If fewer than 3 characters exist (excluding the protagonist), proceed to Step 2.
If a full cast exists, proceed to Step 4.

## Step 2 — Identify Required Pressure Types

From the spine and controlling idea, identify what pressures the protagonist must face:

**Inner antagonism** — the protagonist's own contradictions, fears, wounds
**Personal antagonism** — one or more principal characters in conflict with the protagonist
**Extra-personal antagonism** — institutional / societal / environmental / supernatural forces

At least one character must embody each relevant antagonism tier.

Also check the Genre Contract (if locked) for character archetypes the genre demands.

## Step 3 — Forge Missing Characters

For each missing essential role, invoke the `character-forger` agent with:
- The protagonist's character file (or description)
- The spine
- The specific pressure this new character must apply
- Any genre or period constraints

The agent returns a Character File with Characterization, True Character, Dimensions, and Biography Spine.

## Step 4 — Run cast-balancer

Invoke the `cast-balancer` agent with:
- All character files
- The spine
- The Genre Contract (if locked)

The agent returns `drafts/{slug}/cast-design.md` with:
- **Pressure matrix** (who applies what force)
- **Redundancy diagnosis** (any two characters applying the same pressure)
- **Dimension coverage** (which protagonist dimensions are illuminated by foils)
- **Merge/cut/promote recommendations**

## Step 5 — Act on Recommendations

For each recommendation:
- **Cut**: If a character is redundant, confirm with user, then remove the file or mark inactive
- **Merge**: Combine two characters' functions into one — rewrite the remaining file
- **Promote**: Elevate a minor character to a principal role — expand the file
- **Add**: Create a new character for an uncovered pressure (loop to Step 3)

## Step 6 — Write the Cast Roster

Write `drafts/{slug}/cast-roster.md`:

```markdown
# Cast Roster — {title}

## Protagonist
**{Name}** — {one-sentence True Character statement}

## Principal Characters
| Character | Pressure Applied | Dimension Illuminated | Arc Type |
|---|---|---|---|
| {Name} | {what they do to protagonist} | {which side of protagonist} | {flat/positive/negative} |
...

## Supporting Characters
| Character | Function | Scenes |
|---|---|---|
...

## Pressure Matrix
Inner: {character(s) embodying protagonist's inner conflict}
Personal: {principal antagonist(s)}
Extra-Personal: {institution / force / system}

## Redundancy Check
None — or: [Characters X and Y both apply pressure of type Z; recommendation: merge]
```

## Step 7 — Lock Cast

Update `lifecycle.json`:
```json
"state": "cast_locked",
"locked": { "cast": true }
```

Suggest next: `/story-act` to begin designing act-level scene sequences.
