---
id: key-image-curator
version: 1.0.0
contract-version: 1
name: key-image-curator
description: |
  Identify or design the story's Key Image — the single recurring image that,
  by the Climax, has gathered the Controlling Idea inside it. Curates the full
  image system (motif vocabulary) and ensures the Key Image lands as the carrier
  of the final value flip. Runs in main context for collaborative curation.
  Trigger: /key-image-curator, "key image", "find the image", "image system",
  "what's the recurring image", "motif", "image curation".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - key image
  - find the image
  - image system
  - what's the recurring image
  - motif
  - image curation
  - key image curator
contract: {"purpose":"Identify or design the story's Key Image — the single recurring image that, by the Climax, has gathered the Controlling Idea inside it. Curates the full image system (motif vocabulary) and ensures the Key Image lands as the carrier of the final value flip. Runs in main context for collaborative curation. Trigger: /key-image-curator, \"key image\", \"find the image\", \"image system\", \"what's the recurring image\", \"motif\", \"image curation\".","trigger":["/key-image-curator","key image curator"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/controlling-idea.md","drafts/{slug}/spine.md","drafts/{slug}/world-bible.md","drafts/{slug}/prose/","drafts/{slug}/image-system.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"key-image-curator:positive","negative":"key-image-curator:missing-trigger"}}
---

# Key Image Curator

McKee: *"The Key Image is the one image that, by the time it appears at the Climax, has gathered all the story's meaning inside it."*

The Key Image is not a symbol that needs decoding. It is an image that *accumulates resonance* through repetition, context, and transformation — until at the Climax it is no longer just itself; it is also the Controlling Idea made visible.

## Step 1 — Read the Story So Far

Load:
- `drafts/{slug}/controlling-idea.md` — the value and cause
- `drafts/{slug}/spine.md` — the major events
- `drafts/{slug}/world-bible.md` — the world's physical vocabulary
- Any prose files that exist (`drafts/{slug}/prose/`)

## Step 2 — Mine Candidate Images

Scan the world bible, the setting, the characters' professions and wounds for **concrete, physical objects or phenomena** that could carry the Controlling Idea's value.

Good Key Image candidates:
- Belong to the world (not imported as symbols)
- Are physical and specific (not abstract)
- Can appear in multiple contexts across the story with different emotional valences
- Can be transformed at the Climax to signal the value flip

Examples by Controlling Idea:
- *"Love endures because it survives the revealing of one's worst self"* → the image of a cracked thing that still holds together (a mended cup, a repaired window)
- *"Power corrupts because authority destroys empathy"* → the image of something once alive now behind glass (a specimen in a jar, a pressed flower)
- *"Justice fails because systems protect themselves before people"* → the image of a scale weighted by a thumb

Generate 3–5 candidates. Present them to the user.

## Step 3 — Select the Key Image

For each candidate, assess:
- Can it appear in the **opening** (subtle, almost unnoticed)?
- Can it appear in **2–3 scenes across Acts 1 and 2** (accumulating resonance)?
- Can it **transform at the Climax** to carry the final value flip?
- Is it specific to **this story's world** (not a borrowed symbol from another story)?

Ask the user to pick. Their instinct is better than logic here — the image that makes them feel something is likely right.

## Step 4 — Build the Image System

Beyond the Key Image, every story benefits from an **image system** — a vocabulary of 3–5 recurring motifs that run beneath the narrative, creating texture and underground meaning.

From the world and characters, identify supporting motifs:
- Each motif should be thematically adjacent to the Key Image (not competing with it)
- Each motif should appear at least twice in the story
- Motifs should NOT all peak at the same moment — distribute them

Example image system for the clockmaker story:
- **Key Image**: the backwards-running clock (accumulates grief → acceptance → irony)
- **Supporting Motifs**: broken things / the hands (clock hands, hands that can't hold) / silence / dust

## Step 5 — Create the Placement Plan

For the Key Image, design its appearances:

| Appearance | Scene | Context | Emotional charge | What it accumulates |
|---|---|---|---|---|
| Seed (opening) | 1.1 | Almost unnoticed; one sentence | Neutral | Introduced |
| First resonance | 1.3 | Character interacts with it | Tender or painful | Connected to character |
| Echo | 2.2 | Briefly appears in changed context | Darker | Resonance deepens |
| Pre-climax | 3.1 | Character faces it consciously | Loaded | Full weight |
| **Climax / Resolution** | 4.2 | Transformed or seen differently | **Value flip** | **Controlling Idea embodied** |

## Step 6 — Write the Image System Document

Write to `drafts/{slug}/image-system.md`:

```markdown
# Image System — {title}

## Key Image
**{Image}**
- Controlling Idea connection: {how it embodies the value}
- Transformation at Climax: {how it changes to signal the value flip}

## Placement Plan
[Table from Step 5]

## Supporting Motifs
| Motif | First appearance | Recurrences | Thematic function |
|---|---|---|---|
...

## Image System Rules
- Key Image is NEVER used as simple decor — only when emotionally loaded
- Key Image must appear in the opening line or first scene (even briefly)
- No supporting motif peaks at the same scene as the Key Image
```

## Step 7 — Thread Into Existing Prose

If prose already exists, scan for organic placements of the Key Image that may have been written intuitively. Strengthen those placements.
Flag scenes where the Key Image should appear but is absent — add a brief appearance in the scene draft.
