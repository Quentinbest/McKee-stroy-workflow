---
id: story-new
version: 1.0.0
contract-version: 1
name: story-new
description: |
  Start a new story project from any seed — image, dream, news clipping, overheard
  line, mood, or abstract concept. Initializes the project lifecycle, generates a
  premise slate via the premise-prospector agent, and guides the writer from raw
  inspiration to a locked Premise Card. The entry point for all new story projects.
  Trigger: /story-new, "start a new story", "new project", "I have an idea",
  "let's start a story", "I had a dream about", "what if".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
triggers:
  - start a new story
  - new story project
  - i have an idea
  - let's start a story
  - new project
  - i had a dream about
---

# Starting a New Story Project

You are initializing a new story project using the McKee-native platform. Your job is to take whatever the user brings — raw, fragmentary, partially formed — and convert it into a viable Premise Card and initialized project lifecycle.

## Step 1 — Extract the Haunt

Ask the user: *"What about this seed will not let you go?"*

The "haunt" is the emotional or imagistic core that compels the writer. It is usually not a plot idea — it's a mood, a question, a face, a situation, an irreconcilable tension.

If the user has given you a seed already, synthesize the haunt from it. Name it in 1–2 sentences. Confirm with the user before proceeding.

Example seeds → haunts:
- *"Clockmaker who builds backwards clocks"* → *"The grief of someone who believes time, if reversed, could undo loss"*
- *"Two sisters fighting over their mother's estate"* → *"How love curdled by inheritance becomes indistinguishable from hate"*
- *"A soldier who doesn't believe the war is over"* → *"Loyalty so total it becomes its own kind of madness"*

## Step 2 — Generate the Project Slug

From the user's seed or working title, derive a slug:
- Lowercase, kebab-case, ≤20 characters
- Examples: `reverse-dao`, `clockmaker`, `sisters-estate`

Confirm with user.

## Step 3 — Initialize the Project Directory

Create the following structure:

```
drafts/{slug}/
├── lifecycle.json
├── world-bible.md        (stub)
├── voice-anchors.md      (stub)
├── premise-slate.md      (stub)
├── characters/           (directory)
├── scenes/               (directory)
└── prose/                (directory)
```

Initialize `lifecycle.json` from the template:

```json
{
  "slug": "{slug}",
  "title": "{working title or slug}",
  "lang": "zh",
  "created": "{today}",
  "last_updated": "{today}",
  "state": "inspiration",
  "locked": {
    "premise": false,
    "genre": false,
    "controlling_idea": false,
    "setting": false,
    "cast": false,
    "spine": false,
    "act_design": false,
    "scene_cards": false,
    "beat_sheets": false,
    "prose": false,
    "critic_passed": false,
    "polished": false
  },
  "artifacts": {
    "premise_card": "drafts/{slug}/premise-card.md",
    "controlling_idea": "drafts/{slug}/controlling-idea.md",
    "genre_contract": "drafts/{slug}/genre-contract.md",
    "spine": "drafts/{slug}/spine.md",
    "world_bible": "drafts/{slug}/world-bible.md",
    "scene_cards_dir": "drafts/{slug}/scenes/",
    "prose_dir": "drafts/{slug}/prose/"
  }
}
```

Write the stub world-bible:
```markdown
# World Bible — {title}

## Period
[TBD]

## Duration
[How much time does the story span?]

## Location
[Where does the story take place?]

## Level of Conflict
[Personal / Institutional / Societal / Environmental / Supernatural]

## World Rules
[What laws govern this world that do not govern ours, or that govern ours differently?]

## Research Targets
[What do you need to know to write this story faithfully?]
```

## Step 3.5 — Offer Persona Forge

After the project directory is initialized, offer:

> "Want to forge an Author Persona before the premise slate? The persona defines the specific author-consciousness who'll write this story — their animating belief, aesthetic bright lines, Truth Library. Running it now shapes voice from the start; you can always revise it later. Type `yes` to forge now, or skip and do it before the first prose draft."

If user says yes: run `/story-persona FORGE` inline. The persona file writes to `drafts/{slug}/persona.md` and its path is registered in `lifecycle.json` artifacts.

If user skips: note in `lifecycle.json` artifacts that persona is pending:
```json
"persona": null
```

## Step 4 — Spawn premise-prospector

Hand the agent:
- The haunt (your synthesis from Step 1)
- Any constraints the user has mentioned (genre, period, length, character germ)
- The project slug

The agent returns `drafts/{slug}/premise-slate.md` with 5 candidates. Each candidate includes:
- A Premise sentence (who wants what against what opposition)
- A probable genre
- The Object of Desire
- The primary Force of Antagonism
- A probable Controlling Idea polarity (positive / negative / ironic)
- The probable Inciting Incident

## Step 5 — Present and Lock the Premise

Show the slate to the user. Ask them to:
1. Pick a candidate (or request a variant)
2. Optionally modify the chosen candidate

When the user locks a premise:
- Write `drafts/{slug}/premise-card.md`:
```markdown
---
title: Premise Card
project: {slug}
locked: true
date: {today}
---

## Premise
{the locked premise sentence}

## Genre (probable)
{genre}

## Object of Desire
{what the protagonist wants}

## Forces of Antagonism
{the primary opposing force}

## Controlling Idea Polarity
{positive / negative / ironic}

## Inciting Incident
{probable opening disruption}

## The Haunt
{the writer's emotional core — why this story}
```

- Update `lifecycle.json`: set `state` to `"premise_locked"` and `locked.premise` to `true`

## Step 6 — Suggest Next Step

After premise is locked, suggest:
> "Premise is locked. Next: run `/story-spine` to build the story skeleton, or `/mck-controlling-idea` to forge the Controlling Idea first."

If the user wants to go deeper before the spine, suggest `/genre-cartographer` (agent) to produce the Genre Contract.
