---
id: mck-specificity-forge
version: 1.0.0
contract-version: 1
name: mck-specificity-forge
description: |
  Convert generic language to particular language — scan prose for generic nouns,
  verbs, and descriptions; query the world bible and invent plausible specifics;
  replace each generic element with a concrete particular consistent with the world
  and the character's POV. The enemy of specificity is the first noun or verb that
  comes to mind. Use during Pass 6 revision or any time prose feels "writerly but
  vague."
  Trigger: /mck-specificity-forge, "specificity", "too generic", "forge specifics",
  "make it particular", "vague writing", "generic prose", "more specific".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - specificity
  - too generic
  - forge specifics
  - make it particular
  - vague writing
  - generic prose
  - more specific
contract: {"purpose":"Convert generic language to particular language — scan prose for generic nouns, verbs, and descriptions; query the world bible and invent plausible specifics; replace each generic element with a concrete particular consistent with the world and the character's POV. The enemy of specificity is the first noun or verb that comes to mind. Use during Pass 6 revision or any time prose feels \"writerly but vague.\" Trigger: /mck-specificity-forge, \"specificity\", \"too generic\", \"forge specifics\", \"make it particular\", \"vague writing\", \"generic prose\", \"more specific\".","trigger":["/mck-specificity-forge","mck specificity forge"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/world-bible.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-specificity-forge:positive","negative":"mck-specificity-forge:missing-trigger"}}
generated: true
source: src/skills/mck-specificity-forge/SKILL.md
source-version: 1.0.0
source-sha256: 103c6db25246ba4d7cff268306548a4ccebf6df34156d0674bf1313b602a91bc
generator-version: 1.0.0
verification-command: npm run agents:check-drift
---

# The Specificity Forge

McKee: *"The difference between a story that merely tells and one that shows is this: specific, concrete images that activate the reader's imagination, vs. generic placeholders that put it to sleep."*

The Forge works by finding every word that could refer to a thousand things and replacing it with a word that refers to exactly one.

---

## Step 1 — Load the World Bible

Read `drafts/{slug}/world-bible.md` before scanning prose. The world bible is the forge's raw material — specific place names, object names, customs, distances, textures that exist in this world. When you forge, you are selecting from what already exists before inventing.

Also read relevant character files for any scene being forged — specificity must be filtered through the POV character's way of seeing.

---

## Step 2 — Scan for Generic Markers

Scan prose for these categories. Flag every instance:

### Generic Nouns
Words that describe a category rather than a thing:
- ❌ "a building", "a room", "a street", "a city"
- ❌ "a man", "a woman", "a person", "someone"
- ❌ "a drink", "a meal", "a cup"
- ❌ "a sound", "a smell", "a light"
- ❌ "a look", "an expression", "a feeling"

### Generic Verbs (the flat-action verbs)
Verbs that describe motion without texture:
- ❌ "walked", "went", "moved", "came", "got"
- ❌ "said", "told", "asked", "replied"
- ❌ "looked", "saw", "watched", "noticed"
- ❌ "thought", "felt", "knew"

### Generic Descriptors
Adjectives/adverbs that describe scale rather than quality:
- ❌ "big", "small", "large", "old", "new"
- ❌ "beautiful", "ugly", "strange", "interesting"
- ❌ "very", "quite", "rather", "somewhat"
- ❌ "slowly", "quickly", "suddenly"

### Hedged Emotions
Emotion named rather than embodied:
- ❌ "he felt sad / happy / angry / afraid"
- ❌ "she was upset / excited / nervous"
- ❌ "he seemed worried / tired"

---

## Step 3 — Forge Each Instance

For each generic element, run the Forge:

### 1. Consult the World Bible
Does the world bible already name a specific thing in this category?
- *"the building"* in a xianxia story → *"the Qianhe Archive, three storeys of whitewashed brick"*
- *"a drink"* → check world bible for named beverages / taverns / ritual drink forms

### 2. Filter Through POV Character
The specific detail must be what *this character* would notice, not what a neutral observer would describe:
- A blacksmith notices the quality of the hinge on the door; a scholar notices the seal on the letter
- A frightened character notices exits; a confident character notices other people's eyes

### 3. Invent Consistent Particulars
If the world bible is silent, invent. The invented particular must:
- Be consistent with the world's period, culture, geography
- Be specific enough to visualize (a name, a measurement, a texture, a comparison)
- Feel *found*, not *decorative*

### 4. Replace Flat-Action Verbs With Gesture Verbs
Every action has a quality. The quality is the story:
- ❌ "he walked to the door" → ✅ "he got to the door the way he always did when he knew he was wrong — fast, not looking at anything"
- ❌ "she said" → ✅ "she said it to the wall"
- ❌ "he looked at her" → ✅ "he found a place just above her left ear and looked at that instead"

### 5. Embody Emotions Rather Than Name Them
- ❌ "she felt afraid" → ✅ "her throat closed. She swallowed and it didn't help."
- ❌ "he was angry" → ✅ "his thumb found the scar on his palm. He pressed it."
- ❌ "she was relieved" → ✅ "she let the wall take her weight."

---

## Step 4 — Apply the POV Constraint

Before finalizing any forge:
- Would this character notice this detail?
- Is this the kind of comparison *they* would reach for, or the kind a literary author would impose on them?

A soldier notices: tactical geometry, exits, load, sound. A thief notices: locks, pockets, exits, timing. A farmer notices: weather, soil quality, labor cost, animal behavior.

If a detail feels like it comes from outside the character's way of seeing → either change the detail or adjust whose POV it belongs to.

---

## Step 5 — Audit the Sensory Budget

After forging, check each scene's sensory range:
- **Sight** — the default; every scene has it
- **Sound** — often undersupplied
- **Touch/proprioception** — weight, temperature, effort, pain
- **Smell** — the most evocative and most neglected
- **Taste** — rare but powerful

Flag any scene that is entirely visual. Add one non-visual specific detail per beat that's lacking.

---

## Output

Present changes in this format:

```
Scene {X.Y} — {N} generic elements forged

GENERIC → SPECIFIC
❌ "he walked to the door"
✅ "he crossed the room at the pace that meant he'd already decided"

❌ "a cup"
✅ "the lacquer cup with the chip on the rim she'd been meaning to throw away for six months"

EMOTION EMBODIED
❌ "she was frightened"
✅ "she counted the tiles between her and the far wall. Twelve. Too many."

SENSORY ADDITIONS
Scene 2.3 (visual only): added proprioceptive detail — "[specific addition]"
```

Do not revise surrounding prose. Forge only the flagged elements. Consistency with the existing world is more important than impressiveness of the individual detail.
