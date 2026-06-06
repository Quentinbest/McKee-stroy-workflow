---
id: mck-image-thread
version: 1.0.0
contract-version: 1
name: mck-image-thread
description: |
  Thread the story's image system — inventory every motif and symbolic object in
  the prose, map cadence against the planned rhythm, identify and verify the Key
  Image (the one image that by Climax has gathered the Controlling Idea inside it),
  flag dropped motifs and motif deserts, and prescribe or execute targeted additions.
  Use after any full draft or act completion, and before final polish.
  Trigger: /mck-image-thread, "image system", "thread the motifs", "key image",
  "check the motifs", "motif cadence", "image audit".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - image system
  - image thread
  - thread the motifs
  - key image
  - motif cadence
  - check the motifs
  - image audit
contract: {"purpose":"Thread the story's image system — inventory every motif and symbolic object in the prose, map cadence against the planned rhythm, identify and verify the Key Image (the one image that by Climax has gathered the Controlling Idea inside it), flag dropped motifs and motif deserts, and prescribe or execute targeted additions. Use after any full draft or act completion, and before final polish. Trigger: /mck-image-thread, \"image system\", \"thread the motifs\", \"key image\", \"check the motifs\", \"motif cadence\", \"image audit\".","trigger":["/mck-image-thread","mck image thread"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/controlling-idea.md","drafts/{slug}/spine.md","drafts/{slug}/key-image.md","drafts/{slug}/state.json","drafts/{slug}/prose/**/*.md","drafts/{slug}/revision-log.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-image-thread:positive","negative":"mck-image-thread:missing-trigger"}}
generated: true
source: src/skills/mck-image-thread/SKILL.md
source-version: 1.0.0
source-sha256: b332002f62276c197a80262fa76e05d53cb903ca59a3229f3cf5e99808c0f38f
generator-version: 1.0.0
verification-command: npm run agents:check-drift
---

# Image System Threading

McKee: *"The Key Image is the one image that, by the Climax, has gathered the Controlling Idea inside it — visible proof of the story's truth."* Everything else in the image system exists to build toward that moment.

This skill does three things in order: **Inventory** (what's there), **Audit** (what's wrong), **Prescribe** (what to do about it).

---

## Step 1 — Load the Story's Semantic Core

Read:
- `drafts/{slug}/controlling-idea.md` — the value + cause sentence
- `drafts/{slug}/spine.md` — where Climax occurs
- `drafts/{slug}/key-image.md` — if it exists; if not, you will derive it
- `drafts/{slug}/state.json` — the `image_system` block, if populated

If `state.json` has an `image_system` block with motifs already logged, use it as your starting inventory (verify against prose). If not, build the inventory from scratch.

---

## Step 2 — Build the Motif Inventory

Read all prose files: `drafts/{slug}/prose/**/*.md`

For each motif/symbolic object/recurring image you find, log it in this format:

| Motif | First appearance | Recurrences (scenes) | Payoff scene | Key Image candidate? |
|---|---|---|---|---|
| {motif} | {scene} | {list} | {scene or "none"} | Y / N |

**What counts as a motif:**
- Physical objects that reappear (a broken tool, a specific garment, a letter)
- Recurring sensory details (a sound, a smell, a color that keeps appearing)
- Gestures that repeat (a character's habitual microgesture)
- Environmental conditions that echo (weather, light quality, time of day)
- Verbal echoes (a phrase that recurs across scenes)

**What doesn't count:**
- One-time descriptive details with no plan to recur
- Objects present only for plot function with no symbolic charge

---

## Step 3 — Identify the Key Image Candidate

The Key Image has these properties:
1. It appears **early** — subtly, as background or incidental detail
2. It **recurs** across the story, gathering associations each time
3. By the Climax, it **carries** the Controlling Idea's value judgment inside it
4. Its final appearance at Climax **does not need explanation** — the accumulated weight speaks

Ask: *"Which motif in this story, by the Climax, has been charged with the most weight — such that its final appearance could embody the story's truth?"*

If the Controlling Idea is already locked, the Key Image should embody the value (positive, negative, or ironic) that the Controlling Idea names.

Propose a Key Image if none is locked. If `key-image.md` exists, verify the current Key Image is fulfilling its function.

---

## Step 4 — Map Cadence

For each motif, plot its appearances against the act structure:

```
Act 1 | Act 2 | Act 3 | Act 4 (if applicable)
──────┼───────┼───────┼──────
  ●   |  ●  ● |       |  ●  ●   ← motif A: has a desert in Act 3
  ●   |       |   ●   |  ●      ← motif B: drops out after Act 1
      |   ●   |   ●   |  ●      ← motif C: no opening establishment
```

**Cadence problems to flag:**
- **Motif desert** — a motif absent for 2+ acts after introduction
- **No opening** — Key Image not present in Act 1 (cannot pay off at Climax)
- **Climax absence** — Key Image not present at or near the Climax
- **Monotony** — a motif appears in every scene (loses weight through overuse)
- **Orphan** — a motif introduced but never paid off

---

## Step 5 — Audit Key Image Placement

The Key Image must satisfy these predicates:

- [ ] **Present in Act 1** — subtle, background, not spotlit
- [ ] **Recurs through Act 2** — accumulating associations, never explained
- [ ] **Present near Crisis** — charged with the story's full weight by now
- [ ] **Lands at Climax** — in the moment the value charge makes its final flip
- [ ] **Not over-explained** — no character comments on it at the Climax moment

If any predicate fails, flag it with the specific scene gap.

---

## Step 6 — Prescribe and Execute

For each flagged issue, prescribe a specific fix:

### Motif desert
> "Motif [X] disappears between scenes [A] and [B]. Plant a brief touch in scene [C] — the object could be glimpsed in the background / the gesture could repeat as a habit / the sound could echo from an adjacent space."

Draft the specific 1–3 sentence addition for the writer. Do not rewrite whole scenes — a motif touch is a single detail.

### Key Image absent from opening
> "The Key Image ([X]) doesn't appear in Act 1. It needs a planted appearance in scene [early scene] — at this point it should carry no weight yet, only be present: a background object, an offhand reference, an incidental detail that can only be understood in retrospect."

Draft the addition.

### Key Image absent from Climax
> "The Key Image ([X]) needs to be present at the Climax scene ([scene]). At this moment it should carry the full accumulated weight of its prior appearances."

Draft the insertion.

### Orphaned motif
> "Motif [X] was introduced in scene [A] but never returned. Either: (a) plant a payoff in [late scene], or (b) remove the introduction if the motif isn't earning its place."

Recommend which option fits better; draft accordingly.

---

## Step 7 — Update State

If `drafts/{slug}/state.json` exists, update the `image_system` block with the full inventory:

```json
"image_system": {
  "{motif-slug}": {
    "label": "{Human-readable name}",
    "introduced": "{act.scene}",
    "recurrences": ["{act.scene}", "..."],
    "payoff_planned": "{act.scene}",
    "payoff_delivered": null,
    "key_image": false
  }
}
```

Mark one motif as `"key_image": true`.

---

## Output

After the audit, present:
1. **Motif inventory table** (complete)
2. **Key Image** — named, with verdict on its placement
3. **Cadence chart** — act-by-act presence map
4. **Issues list** — each flagged issue with a severity (critical / major / minor) and a prescribed fix
5. **Drafted additions** — for any critical issues, draft the prose addition inline

Record findings in `drafts/{slug}/revision-log.md` under the relevant revision pass.
