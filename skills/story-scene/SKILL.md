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
- Show to user — ask if it lands
- If user says yes, move to the next beat
- If user says no, revise in place before moving on

POV consistency: maintain the scene's POV throughout. Never slip into another character's interiority.

Rhythm: vary sentence length. Use fragments for shock; long sentences for dread.

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

## Step 9 — Commit

Write the final prose to `drafts/{slug}/prose/{act}-{scene}.md`.

Update `drafts/{slug}/state.json` if it exists:
- Mark scene as complete
- Update character locations and knowledge states
- Log any new image-system motifs introduced
- Log any setups added to the setup-payoff ledger

Update Scene Card with `status: complete` and `prose_file` path.

Suggest next: `/story-scene {next scene}` or `/story-audit` if the act is complete.
