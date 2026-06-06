---
id: mck-exposition-ammo
version: 1.0.0
contract-version: 1
name: mck-exposition-ammo
description: |
  Convert backstory and information dumps into "exposition as ammunition" —
  every piece of information the audience needs is delivered inside a scene where
  someone is fighting to reveal it, conceal it, extract it, or weaponize it.
  Exposition is not furniture. It is a weapon, and weapons must be fired in combat.
  Use before drafting info-heavy scenes, or to fix scenes that read as "talking heads."
  Trigger: /mck-exposition-ammo, "exposition", "info dump", "backstory", "show don't tell",
  "talking heads", "exposition as ammunition", "smuggle the information".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - exposition
  - info dump
  - backstory
  - talking heads
  - exposition as ammunition
  - smuggle the information
  - show don't tell
contract: {"purpose":"Convert backstory and information dumps into \"exposition as ammunition\" — every piece of information the audience needs is delivered inside a scene where someone is fighting to reveal it, conceal it, extract it, or weaponize it. Exposition is not furniture. It is a weapon, and weapons must be fired in combat. Use before drafting info-heavy scenes, or to fix scenes that read as \"talking heads.\" Trigger: /mck-exposition-ammo, \"exposition\", \"info dump\", \"backstory\", \"show don't tell\", \"talking heads\", \"exposition as ammunition\", \"smuggle the information\".","trigger":["/mck-exposition-ammo","mck exposition ammo"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/spine.md","drafts/{slug}/world-bible.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-exposition-ammo:positive","negative":"mck-exposition-ammo:missing-trigger"}}
generated: true
source: src/skills/mck-exposition-ammo/SKILL.md
source-sha256: 858f1bd5779a4d3c211ded49f87e974e95db5259e190678681edb1fdc87eff00
generator-version: 1.0.0
---

# Exposition as Ammunition

McKee: *"The audience will accept any exposition — no matter how technical, how dense — if it is fired in the middle of a scene where someone is fighting. Give them a battle and they will absorb any amount of information while watching it."*

The rule is absolute: **no fact may be delivered without a fight.** Every piece of information needs a character who wants to conceal it, extract it, weaponize it, or be forced to reveal it against their will.

---

## Step 1 — Catalog the Information

Read:
- `drafts/{slug}/spine.md`
- `drafts/{slug}/world-bible.md`
- All prose files

Build an inventory of every fact the audience needs to receive:

| Fact | Type | Current delivery method | Problem |
|---|---|---|---|
| {fact} | world-rule / backstory / character-history / plot-mechanics | dropped / narrated / explained / withheld | dump / absent / earned |

**Types of exposition:**
- **World rules** — how the world works (physics, magic, law, social structure)
- **Backstory** — what happened before the story began
- **Character history** — what happened to this specific character
- **Plot mechanics** — what makes the current situation possible

---

## Step 2 — Identify the Information Dumps

A dump is any passage where:
- A character explains something at length without being forced to
- A narrator digresses from scene action to deliver background
- Two characters discuss information they both already know ("As you know, Bob...")
- A character recounts events to a willing listener

Flag each dump with its location and word count.

---

## Step 3 — Assign a Combat Mode to Each Fact

For each piece of information, assign the combat mode that fits:

### Concealment
*Character A knows X and is fighting NOT to reveal it; Character B is trying to extract it.*
Best for: secrets, personal histories, crimes, betrayals, plans.
The fact emerges in fragments, under pressure, involuntarily.

### Extraction
*Character A needs information Character B has; Character B may or may not know they have it.*
Best for: world rules, locations, technical knowledge, histories.
The fact emerges through questioning, manipulation, trade.

### Weaponization
*Character A uses information as a weapon against Character B — revealing it, threatening to reveal it, or selectively distorting it.*
Best for: information that could destroy, expose, or change the power balance.
The fact is deployed at a moment of maximum advantage.

### Forced Revelation
*Circumstances force a fact into the open regardless of anyone's preference.*
Best for: world rules that activate when the story's events trigger them; discoveries.
The fact surfaces because something happens, not because someone explains.

---

## Step 4 — Design or Redesign the Combat Scene

For each fact that is currently dumped or absent, identify or design a scene where it can be fired in combat:

**Questions to ask:**
- Who in this story has reason to conceal this fact?
- Who has reason to extract it?
- What is the cost of the fact becoming known?
- What scene is already in the story where the power dynamic, stakes, and character motivations would make this fight natural?

**The scene should already exist.** Rarely do you need a new scene — more often, an existing scene is the right container. Add the information fight to a scene that's already turning.

**Template for a redesigned passage:**
> In scene [X.Y], Character A [tactic — conceals/extracts/weaponizes] the information that [fact]. Character B is [wants — trying to get / trying to prevent / oblivious]. The information emerges when [trigger — Character A slips / is cornered / uses it deliberately].

---

## Step 5 — Execute the Rewrite

For each dumped passage:

1. **Cut the dump**
2. **Locate the combat scene** that will receive the information
3. **Write the information fight** into that scene — the fact emerges from the conflict, not alongside it
4. **Verify**: after the rewrite, is the fact still clearly received by the audience? If not, add a second combat beat.

**Anti-patterns to eliminate:**
- The patient explainer (a character who explains the world to a newcomer who exists only to receive the explanation)
- The willing confessor (a character who reveals their backstory with no resistance)
- The recap conversation (two characters summarizing what happened for the audience's benefit)
- The omniscient aside (narrator steps outside scene action to deliver context)

---

## Step 6 — The "As You Know, Bob" Test

After redesigning, run the test: could either character in this conversation plausibly *not* know this information? If both characters know it and neither has a reason to say it aloud, the exposition isn't in combat — it's still a dump in disguise.

The information must be *new* to at least one participant — either new to the character receiving it, or new in the sense that revealing it now is dangerous/surprising/useful/costly.

---

## Output

1. **Information inventory** — all facts catalogued with their current delivery method
2. **Dump list** — all dumps identified with location and word count
3. **Combat assignments** — each fact assigned a combat mode and a scene
4. **Redesigned passages** — drafted rewrites for all dumps
5. **Absent information** — any fact the audience needs that currently isn't delivered at all, with a suggested scene for it
