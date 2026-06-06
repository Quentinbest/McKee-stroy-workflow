---
id: story-premise
version: 1.0.0
contract-version: 1
name: story-premise
description: |
  Generate or lock a premise — the story's nucleus: who wants what against what
  opposition. Produces a slate of 3–5 candidates via the premise-prospector agent,
  walks the user through selection, and locks the Premise Card. Can also be used
  to iterate on an existing premise that isn't working.
  Trigger: /story-premise, "generate a premise", "fix the premise",
  "what's the premise", "lock the premise", "premise slate".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - generate a premise
  - fix the premise
  - what's the premise
  - lock the premise
  - premise slate
  - story premise
contract: {"purpose":"Generate or lock a premise — the story's nucleus: who wants what against what opposition. Produces a slate of 3–5 candidates via the premise-prospector agent, walks the user through selection, and locks the Premise Card. Can also be used to iterate on an existing premise that isn't working. Trigger: /story-premise, \"generate a premise\", \"fix the premise\", \"what's the premise\", \"lock the premise\", \"premise slate\".","trigger":["/story-premise","story premise"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/lifecycle.json","drafts/{slug}/premise-card.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["genre-cartographer","mck-controlling-idea","premise-prospector","story-spine"],"fixtures":{"positive":"story-premise:positive","negative":"story-premise:missing-trigger"}}
---

# Premise Generation and Locking

## What a Premise Is

A premise is not a plot summary. It is the story's **nucleus**: *who wants what against what opposition*. From this nucleus, all structure grows.

McKee's three-part premise structure:
1. **Who** — the protagonist (defined by wound, want, and True Character)
2. **Wants what** — the Object of Desire (specific, active, achievable)
3. **Against what opposition** — the primary Force of Antagonism

Example premises:
- A grieving clockmaker [who] wants to reverse time to undo his daughter's death [wants what] against the laws of physics, his community's pity, and his own fear that reversal would erase who he has become [against what].
- A disgraced magistrate [who] wants to rebuild his reputation through one correct verdict [wants what] against a corrupt court system and his own history of compromise [against what].

## Step 1 — Gather What Exists

Read `drafts/{slug}/lifecycle.json` and `drafts/{slug}/premise-card.md` if they exist.

If a premise exists and the user wants to fix it, ask: *"What specifically isn't working? Is it the who, the want, or the opposition?"*

If no premise exists, proceed to Step 2.

## Step 2 — Spawn premise-prospector

Hand the agent:
- Any seed, haunt, or inspiration the user has provided
- The working title or slug
- Any constraints (genre, period, length, thematic direction)
- The project's Controlling Idea if already locked

The agent returns 5 premise candidates with:
- The premise sentence
- The probable genre
- Object of Desire
- Primary Force of Antagonism
- Probable Controlling Idea polarity
- Probable Inciting Incident

## Step 3 — Present and Discuss

Show all 5 to the user. For each, note:
- What this premise implies about the genre
- What this premise implies about the protagonist's wound
- What the probable Controlling Idea polarity is

Ask the user:
- *"Which premise compels you most? Or shall we combine elements from two?"*
- *"Is the Object of Desire specific enough to be gettable and refusable?"*

## Step 4 — Refine

If the user wants a variant of a candidate, invoke premise-prospector again with:
- The chosen candidate as the starting point
- The specific element to vary (tighten the want / deepen the opposition / change the protagonist)

## Step 5 — Lock the Premise

When the user chooses, write `drafts/{slug}/premise-card.md` and update `lifecycle.json`:
```json
"state": "premise_locked",
"locked": { "premise": true }
```

Suggest next:
- `/mck-controlling-idea` to forge the theme
- `/genre-cartographer` agent to lock the Genre Contract
- `/story-spine` when Controlling Idea is ready
