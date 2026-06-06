---
id: mck-surprise-plant
version: 1.0.0
contract-version: 1
name: mck-surprise-plant
description: |
  Designs and audits the Inevitable-Surprise architecture — the dual-reading
  system where planted data supports two simultaneous readings (surface
  misdirection + submerged truth), so the Climax produces the "of course —
  it was always going to be this" experience. Cannot be added in revision;
  must be designed before Act 1 is written. Three modes: DESIGN (build the
  misdirection plan from the Climax backward), PLANT (specify exact scene
  placements for each dual-reading item), AUDIT (post-draft verification
  that the planted data actually works). Spawn surprise-auditor agent for
  the AUDIT mode's blind read.
  Trigger: /mck-surprise-plant, "inevitable surprise", "plant the foreshadowing",
  "misdirection plan", "dual reading", "make the climax feel inevitable",
  "foreshadowing".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - mck surprise plant
  - inevitable surprise
  - plant the foreshadowing
  - misdirection plan
  - dual reading
  - make the climax feel inevitable
  - foreshadowing architecture
contract: {"purpose":"Designs and audits the Inevitable-Surprise architecture — the dual-reading system where planted data supports two simultaneous readings (surface misdirection + submerged truth), so the Climax produces the \"of course — it was always going to be this\" experience. Cannot be added in revision; must be designed before Act 1 is written. Three modes: DESIGN (build the misdirection plan from the Climax backward), PLANT (specify exact scene placements for each dual-reading item), AUDIT (post-draft verification that the planted data actually works). Spawn surprise-auditor agent for the AUDIT mode's blind read. Trigger: /mck-surprise-plant, \"inevitable surprise\", \"plant the foreshadowing\", \"misdirection plan\", \"dual reading\", \"make the climax feel inevitable\", \"foreshadowing\".","trigger":["/mck-surprise-plant","mck surprise plant"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/spine.md","drafts/{slug}/controlling-idea.md","drafts/{slug}/characters/*.md","drafts/{slug}/misdirection-plan.md","drafts/{slug}/scenes/*.md","drafts/{slug}/prose/","drafts/{slug}/surprise-audit.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["beat-miner","cliche-hunter","crisis-climax-auditor","mck-crisis-dilemma","prose-drafter","story-audit","story-revise","story-scene"],"fixtures":{"positive":"mck-surprise-plant:positive","negative":"mck-surprise-plant:missing-trigger"}}
generated: true
source: src/skills/mck-surprise-plant/SKILL.md
source-sha256: 0609bab627a58897c1212a309e068b8fbffca36415fd77db65b498d5f6301ca5
generator-version: 1.0.0
---

# Surprise Engineering

McKee's Inevitable-Surprise is the hardest structural achievement: the audience feels "of course — it was always going to be this, and I never saw it coming." This requires data planted from the opening that admits two readings simultaneously. The Climax doesn't introduce surprise — it *reveals* the true reading of data already in the story.

This cannot be added in revision. It must be designed before Act 1 is written. Foreshadowing retrofitted onto a finished draft reads as foreshadowing. Architecture designed from the Climax backward reads as fate.

---

## The Dual-Reading Rule

Every planted item must satisfy two tests simultaneously:

**Surface test** (first read): given everything the audience knows *at the moment the item is planted*, does it plausibly read as supporting the misdirected expectation? If yes: the item is available for misdirection.

**True-reading test** (re-read): given everything the audience knows *after the Climax*, does the same item clearly point toward what actually happened? If yes: the item is available as the true reading.

An item that only passes one test is either a cheat (only passes true-reading — it was never hidden) or decoration (only passes surface-reading — it doesn't actually point anywhere). Dual-reading items are the only kind that produce Inevitable-Surprise.

---

## Mode A — DESIGN

*Use when: Climax is locked (or near-locked) and Act 1 has not been written yet.*

### A1 — Load Climax and Spine

Read:
1. `drafts/{slug}/spine.md` — especially the Climax beat and Crisis dilemma
2. `drafts/{slug}/controlling-idea.md` — the value that is proved at the Climax
3. `drafts/{slug}/characters/*.md` — True Character of protagonist and antagonist

If Climax is not yet designed: run `/mck-crisis-dilemma` first. The surprise architecture depends on knowing what the Climax actually is.

### A2 — Define the Two Poles

From the Climax, derive the two readings:

**Misdirected expectation (Surface)**: what does a reader, observing Act 1–2 normally, reasonably expect to happen? This is usually the *positive* version of the protagonist's stated desire — "they will succeed," "the antagonist will be defeated," "the relationship will be saved."

**True resolution (Truth)**: what actually happens at the Climax? This is the value-charge the story arrives at, which may be positive, negative, or ironic depending on the Controlling Idea.

Name both explicitly. If the two poles are too close together (the reader's expectation is close to the truth), the surprise will be weak. The poles should be far enough apart that the revelation recontextualizes everything.

### A3 — Inventory Plantable Elements

Survey the story's materials for items that can carry a dual reading. Categories:

| Category | Examples |
|---|---|
| **Physical objects** | A weapon, a letter, a gift, a key, a wound |
| **Character behavior** | A habit, a refusal, a kindness, an avoidance |
| **Statements** | A line of dialogue that can mean two things depending on the speaker's real motive |
| **Structural absences** | What a character never says, never asks, never does — and why |
| **Relationships** | A bond that appears to be one thing (mentor/student) and is another (rival/heir) |
| **World-state details** | A location, a time of day, a weather pattern that carries symbolic weight |

For each item, fill in:

```
Item: {what it is}
Surface reading: {what it appears to mean when first encountered}
True reading: {what it means in retrospect, after the Climax}
Earliest plausible scene: {where it can be planted without forcing it}
Requires: {any setup this item depends on}
```

Generate 6–10 candidate items. Not all will be used — over-planting is detectable.

### A4 — Select and Build the Misdirection Plan

Select 4–6 items that:
- Span Acts 1–2 (not clustered in one act)
- Include at least one physical object (concrete, memorable)
- Include at least one behavioral item (action or absence, not just a line)
- Do not require the reader to *ignore* information — the surface reading must be available without the reader being careless

Write to `drafts/{slug}/misdirection-plan.md`:

```markdown
---
title: Misdirection Plan — {story title}
project: {slug}
locked: false
climax_scene: {act.scene ref}
---

## Misdirected Expectation
{What the audience is led to believe will happen — stated specifically}

## True Resolution
{What actually happens — the Climax's value-charge and decision}

## Planted Data Table

| Scene | Item | Surface Reading | True Reading | Notes |
|---|---|---|---|---|
| {act.scene} | {item} | {what it appears to mean} | {what it reveals in retrospect} | {any special handling} |
...

## Misdirection Reinforcement Points
{Scenes where the false reading is actively reinforced — and why these don't feel like cheating after the reveal}

## True-Reading Emergence Points
{Scenes where the true reading is available but submerged — specifically why it won't be noticed on first pass}

## Reveal Choreography
{The Climax moment where the re-read snaps into place. Identify the specific planted item that will be re-presented at Climax so the audience can see the true reading immediately.}
```

### A5 — Confirm with user

Show the misdirection plan. Ask: "Does the surface reading hold across this? Would a reader, engaged with the story's events, reasonably follow the misdirected expectation through Act 2?" If yes: lock and proceed to Mode B. If no: revise the misdirected expectation or add reinforcement points.

---

## Mode B — PLANT

*Use when: misdirection plan is locked and scene cards are being built (before prose is written).*

### B1 — Load

Read:
1. `drafts/{slug}/misdirection-plan.md`
2. `drafts/{slug}/scenes/*.md` (all scene cards, or the act being planted)

### B2 — Assign Placements

For each planted item in the table, identify the specific scene card it should appear in and specify the exact planting action:

```
Item: {item from misdirection plan}
Assigned scene: {act.scene}
Current scene card objective: {what the scene is doing structurally}
Planting action: {specific: "the protagonist notices X but dismisses it because Y — the dismissal is natural given Z"}
Surface-reading mechanism: {why a reader will file it as [misdirected reading] rather than pausing}
True-reading availability: {why a re-reader will see it — what makes it visible in retrospect}
Scene card edit required: {yes/no — if yes, what to add to the scene's beat sheet}
```

Rule: the planting action must fit inside the scene's existing dramatic purpose. If it requires the scene to pause for the plant, the plant is forced. Plants that feel organic serve the scene's immediate purpose *and* carry the dual reading.

### B3 — Update Scene Cards

For each planted item requiring a scene card edit: add a `planted_items` field to the scene card:

```yaml
planted_items:
  - item: "{what}"
    surface_reading: "{what it appears to mean here}"
    true_reading: "{what it signals in retrospect}"
    mechanism: "{how it's planted in the scene's action}"
```

Do not add this field to scenes where the item appears naturally without design — only to scenes where a specific action is required to place it.

### B4 — Verify Span

Check that planted items span Acts 1–2 without clustering. If all plants fall in Act 1: the misdirection has no reinforcement in Act 2 and will fade. If all plants fall in Act 2: Act 1 sets up no expectations to subvert. Redistribute if clustering is present.

---

## Mode C — AUDIT

*Use when: full prose draft exists and the misdirection plan is locked.*

Spawn the `surprise-auditor` agent with:
- Full prose files from `drafts/{slug}/prose/`
- `drafts/{slug}/misdirection-plan.md`
- The planted data table (list of items and their assigned scenes)

The agent reads the story as a naive reader and reports on three questions:

**1. Misdirection integrity**: does the surface reading hold across Acts 1–2? Are there moments where the true reading bleeds through prematurely — where a careful reader could see where this is going? (If yes: misdirection is leaking — the scene carrying the leak needs revision.)

**2. True-reading availability**: is the true reading available but suppressed? For each planted item: does it exist in the prose? Does it read convincingly as the surface reading on first pass? After knowing the Climax, does it clearly signal the true reading? (If any item fails this dual test: it must be revised or replaced.)

**3. Reveal choreography**: does the Climax produce the re-read experience? Is there a specific moment where the audience sees a planted item and thinks "of course — this is what that meant"? Is that moment embedded in the Climax scene itself, not in an epilogue?

Return findings as `drafts/{slug}/surprise-audit.md` with:
- Misdirection integrity: HOLDS / LEAKS (with leak locations)
- True-reading availability: per planted item — AVAILABLE / NOT PLANTED / CHEATING (only visible in hindsight without prior plant)
- Reveal choreography: RE-READ MOMENT PRESENT / MISSING (with recommendation)

---

## Integration Points

- **In `story-spine`**: after Climax is designed, offer to run Mode A DESIGN. The misdirection plan is an optional but high-value artifact — note if it hasn't been created before prose drafting begins.
- **In `story-scene` Step 2 (Load Context)**: if `misdirection-plan.md` exists, load the `planted_items` for the current scene (from Mode B). The beat-miner and prose-drafter should see what needs to be planted in this scene.
- **In `story-revise` Pass 4 (Image System)**: run Mode C AUDIT after full draft is committed. Surprise failures are structural — they cannot be fixed by prose revision alone; they require either adding plants to earlier scenes or adjusting the Climax choreography.
- **In `/story-audit`**: add `surprise-auditor` as a fourth parallel critic (alongside cliche-hunter, subtext-whisperer, and crisis-climax-auditor).

---

## What Surprise Engineering Is Not

- It is not the same as plot twists. A twist is a revelation event. Inevitable-Surprise is an architecture where the revelation was always present, just unread. Twists surprise; Inevitable-Surprise satisfies.
- It is not every instance of foreshadowing. Symbolic foreshadowing (the weather when someone dies) is different from dual-reading plants (the weather that means one thing in Act 1 and another in retrospect). Dual-reading plants are specific planted items, not ambient symbolism.
- It is not applicable to every story. Ironic Controlling Ideas and certain character-driven stories don't need misdirection — the revelation is the character's inner change, which doesn't require concealment. Misdirection is most essential in plot-driven and anti-plot structures where the Climax's outcome is what surprises.
