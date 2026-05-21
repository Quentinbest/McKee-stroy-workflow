---
name: story-scene
description: |
  Draft or revise a single scene — the most-used skill in the platform. Loads
  the Scene Card, walks through the 5-layer subtext authoring model in-context,
  generates prose iteratively with user able to interject, then runs parallel
  critic audits (cliche-hunter, subtext-whisperer, continuity-supervisor) before
  committing the scene to the project. The primary scene-writing workflow.
  Trigger: /story-scene, "write scene", "draft scene", "scene 2.3",
  "work on scene", "write the next scene".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - write scene
  - draft scene
  - work on scene
  - write the next scene
  - story scene
  - scene 2.3
---

# Scene Drafting Workflow

This is the primary scene-writing skill. It runs in main context — the methodology is visible, the user can interject at any step. Agents are spawned only for isolated audits at the end.

## Step 1 — Identify the Scene

The user specifies a scene reference (e.g., "2.3" = Act 2, Scene 3) or says "write the next scene" (auto-detect from lifecycle).

Find the Scene Card: `drafts/{slug}/scenes/{act}-{scene}.md`

If no Scene Card exists: run the scene-architect agent to create one first, then proceed.

## Step 2 — Load Context

Read in this order:
1. `drafts/{slug}/scenes/{act}-{scene}.md` (the Scene Card)
2. Character files for all characters appearing in this scene
3. `drafts/{slug}/world-bible.md` (world rules, setting)
4. `drafts/{slug}/voice-anchors.md` (if exists — voice style rules)
5. The preceding prose file (if drafting sequentially) to maintain continuity
6. `wiki/en/concepts/subtext.md` (if the scene is dialogue-heavy)
7. `drafts/{slug}/persona.md` → run `/story-persona LOAD` to compress into 5-bullet working reference (if file exists). If missing, proceed without it and note degraded mode.

## Step 3 — Walk the 5-Layer Subtext Model

For each character who speaks or acts in the scene, fill in this table **before writing any prose**:

| Layer | {Character A} | {Character B} |
|---|---|---|
| **1. Wound** (active in this moment) | | |
| **2. Want** (this scene only; active verb) | | |
| **3. Fear** (what they can't admit) | | |
| **4. Tactic** (verb-on-person) | | |
| **5. Text strategy** (how they'll speak) | | |

Show this table to the user. Ask: *"Does this feel right? Any corrections before we draft?"*

Revise based on feedback, then proceed.

## Step 4 — Identify the Scene's Gap

Before writing, confirm:
- **What does the POV character expect?** (opening expectation)
- **What does the scene actually deliver?** (closing reality)
- **The Gap**: how far is the result from the expectation, and in which direction?

If the gap is "none" or "as expected" → redesign the scene's turning point before drafting.

## Step 5 — Draft Prose Beat by Beat

Translate the beat sheet (or infer beats from the Scene Card) into prose, one beat at a time.

For each beat:
- Write the beat
- Apply sensory specificity (at least one non-visual sense)
- Apply subtext (no character says what they mean)
- Run the persona Decision Protocol silently (Belief / Beauty / Refusal / Truth filters). If the beat passes all four: show it. If any filter fails: flag the failure and offer two alternatives.
- Show to user — ask if it lands
- If user says yes, move to the next beat
- If user says no, revise in place before moving on

POV consistency: maintain the scene's POV throughout. Never slip into another character's interiority.

Rhythm: defer to the Formal Habits in the persona (sentence length axis, verb orientation axis). If no persona: vary sentence length — fragments for shock; long sentences for dread.

## Step 6 — Turning Point Check

At the scene's midpoint or climax, confirm:
- The value charge has begun to shift
- The turning point is in the **scene's action**, not in a speech
- After the turning point, the scene moves toward its close at the new value charge

## Step 7 — Run Critic Audits (Agents, in parallel)

When the draft is complete, invoke three agents in parallel:

**Agent 1: `cliche-hunter`**
Input: The draft prose + genre contract
Returns: Any stock phrases, images, or moves that need replacement

**Agent 2: `subtext-whisperer`**
Input: The draft prose + the subtext table from Step 3 + character files
Returns: Any beats where text ≈ want (on-the-nose), with rewrite directions

**Agent 3: `continuity-supervisor`** (if state DB exists)
Input: The draft prose + `drafts/{slug}/state.json`
Returns: Any continuity violations (wrong location, anachronistic knowledge, physics breach)

Wait for all three. Merge findings into a revision list.

## Step 8 — Revise

Apply revision findings:
- Cliché hits → rewrite the specific line/image (not the whole beat)
- Subtext collapses → foreground the Tactic instead of the Want
- Continuity violations → fix location/knowledge/physics

If more than 2 critics flag the same beat → drop into a focused revision loop on that beat. Cap at 3 rounds.

If the same predicate fails 3 consecutive rounds → do not run a 4th. Apply the **Backtracking Protocol** below before escalating to the user.

## Backtracking Protocol (V2)

When a scene repeatedly fails a predicate despite revisions, the cause is usually upstream — the Scene Card, a character's want/wound, or a spine event has locked the scene into a corner.

**Step B1 — Diagnose upstream cause**

Ask: if this beat cannot be fixed at the prose level, what upstream constraint is forcing the problem?

| Failing predicate | Most likely upstream cause |
|---|---|
| Scene doesn't turn (no value shift) | Scene Card objective or conflict framing |
| Subtext collapses (text ≈ want) | Character want or wound mismatch for this scene |
| Continuity violation (location/knowledge wrong) | State DB inconsistency from prior scene |
| Cliché is structural (not a word choice) | Scene Card turning point design |
| Scene feels unmotivated | Spine event preceding this scene |

**Step B2 — Propose backtrack target**

Name the specific upstream artifact and the specific field to mutate. Examples:
- "Scene Card conflict is stated as `protagonist wants approval from master` — but the scene can't turn because master has already been established as unable to give approval. Recommend: reframe conflict as `protagonist wants to prove master wrong`, which can turn."
- "Character file states want as `to be recognized` — but this scene's beat requires the character to *deny* wanting recognition. Recommend: add contradiction: `conscious want: acceptance / unconscious refusal: recognition when offered`."

**Step B3 — Get confirmation, then mutate**

Show the proposed upstream edit to the user. On confirmation:
1. Edit the upstream artifact.
2. Note the **invalidation cascade**: which other scenes depend on the mutated field?
   - Scene Card mutation → current prose draft is invalidated (restart from Step 3)
   - Character want/wound mutation → flag all scenes featuring this character for re-check
   - Spine event mutation → flag all scenes in the affected sequence
3. Restart the current scene from Step 3 with the mutated upstream constraint. Reset round counter.

**Depth limit**: 3 levels of backtracking maximum. If the failure is still unresolved after backtracking 3 levels: escalate to user with a full diagnosis — "This scene may be unsolvable within the current spine design. Here is what upstream needs to change fundamentally."

## Step 9 — Commit

Write the final prose to `drafts/{slug}/prose/{act}-{scene}.md`.

Update `drafts/{slug}/state.json` if it exists:
- Mark scene as complete
- Update character locations and knowledge states
- Log any new image-system motifs introduced (see Step 10)
- Log any setups added to the setup-payoff ledger (see Step 10)

Update Scene Card with `status: complete` and `prose_file` path.

**Persona Voice Anchor update**: if `persona.md` exists and Voice Anchors section contains stubs, and 3 or more scenes are now committed — run `/story-persona LOAD` (B2 only) to populate Voice Anchors from the committed prose. This keeps the persona grounded in actual work rather than intention.

## Step 10 — Post-Commit Coherence Check (V2)

Run these two automated scans immediately after committing the prose. No agent spawn needed — done in-context.

### 10A — Image-System Cadence Check

If `state.json` has an `image_system` block:

1. **Motif appearance scan**: read the committed prose; for each motif in `image_system`, check if this scene contains a meaningful appearance (not just a word match — must be used as image or symbol). Update the `recurrences` array if yes.

2. **Cadence alert**: after updating, check gap since last appearance for each motif:
   - If a motif's last appearance was ≥4 scenes ago and no payoff is recorded: flag it. Example: *"'broken-clocks' motif last appeared in Scene 1.3 — now Scene 2.4. Consider a brief touch in a nearby scene or accelerate the payoff."*
   - If the Key Image (`key_image: true`) hasn't appeared at all by the end of Act 1: flag it. *"Key Image not yet introduced. Per image-threading rules, it should appear (subtly) in Act 1."*

3. **New motif detection**: scan the prose for recurring concrete objects or images that appear but aren't in `image_system`. If a significant new physical object recurs or carries weight, prompt: *"'{object}' appears {N} times with apparent significance. Add to image system? [Y/N]"*

### 10B — Setup-Payoff Ledger Check

If `state.json` has a `setup_payoff_ledger` array:

1. **Dangling setup alert**: for each ledger entry with `status: planned` and `payoff_scene` defined, check if the current scene number has passed the planned payoff scene. If so: *"Setup '{element}' (planted in Scene {setup_scene}) was planned to pay off by Scene {payoff_scene}, which has passed. Either pay it off now or update the planned payoff scene."*

2. **New setup detection**: scan the committed prose for:
   - New physical objects given specific attention (named, described in detail, placed deliberately)
   - New facts about characters revealed for the first time
   - Explicit or implicit promises to the audience ("She'd remember this later" / an object prominently placed but not used)
   
   For each detected potential setup: *"Possible setup detected: '{element}' in Scene {scene}. Add to ledger with planned payoff? [Y/N]"*

3. **Groundless payoff check**: if the scene resolves something (a character acts on information, uses an object, fulfills a promise), verify there's a corresponding setup entry. If none: *"Payoff without registered setup: '{element}'. Either plant the setup in an earlier scene or register retroactively."*

If no `state.json` exists: skip Step 10. Prompt: *"No state.json found. Run `/story-new` to scaffold, or create `state.json` from the template to enable image-system and setup-payoff tracking."*

---

Suggest next: `/story-scene {next scene}` or `/story-audit` if the act is complete.
