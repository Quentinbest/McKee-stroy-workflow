---
name: story-status
description: |
  Show the current lifecycle state of a story project — what's locked, what's
  next, what artifacts exist, and what blocking issues exist. The dashboard
  for a story project in progress.
  Trigger: /story-status, "where are we", "project status", "what's locked",
  "what's next in the story", "show me the project state".
allowed-tools:
  - Read
  - Glob
  - Grep
triggers:
  - project status
  - where are we
  - what's locked
  - what's next in the story
  - show me the project state
  - story status
---

# Story Project Status

You are showing the current status of an active story project.

## Step 1 — Find the Active Project

1. Look for `drafts/*/lifecycle.json` files.
2. If exactly one project exists, use it.
3. If multiple projects exist, list them and ask the user which to show.
4. If the user specified a slug, use `drafts/{slug}/lifecycle.json`.

## Step 2 — Read Lifecycle

Read `lifecycle.json`. Extract:
- `slug`, `title`, `lang`
- `state` (current lifecycle stage)
- `locked` (map of what's done)
- `artifacts` (paths)

## Step 3 — Read Artifact Presence

For each artifact path in `artifacts`, check if the file exists and is non-stub. Count:
- Scene cards in `scenes/`
- Prose files in `prose/`
- Character files in `characters/`

**Stale-manuscript check**: if `manuscript.md` exists, compare its modified time against the newest file in `prose/`. If any prose file is newer than the manuscript, the manuscript is **stale** — prose was edited after the last assembly (a common situation after a post-publish expansion). Flag it as a blocking issue and recommend re-running `/story-publish` to regenerate. Do the same for `colophon.md` word counts if present.

## Step 4 — Display Status Report

Output a clean status dashboard:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {title}  ({slug})
  Current state: {state}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIFECYCLE GATES
  ✅ Premise           drafts/{slug}/premise-card.md
  ✅ Genre             drafts/{slug}/genre-contract.md
  ✅ Controlling Idea  drafts/{slug}/controlling-idea.md
  ✅ Setting           drafts/{slug}/world-bible.md
  ⬜ Cast              (not locked)
  ⬜ Spine             (not started)
  ⬜ Act Design        (not started)
  ⬜ Scene Cards       (not started)
  ⬜ Beat Sheets       (not started)
  ⬜ Prose             (not started)
  ⬜ Critic-Passed     (not started)
  ⬜ Polished          (not started)

ARTIFACTS
  Characters:   {N} files
  Scene Cards:  {N} files
  Prose:        {N} files

NEXT STEP
  → {suggested next action}
```

## Step 5 — Suggest Next

Based on `state`, suggest the next natural action:

| State | Suggestion |
|---|---|
| `inspiration` | `/story-new` to initialize the project |
| `premise_locked` | `/mck-controlling-idea` to forge the theme, then `/story-spine` |
| `genre_locked` | `/mck-controlling-idea` if not done, or `/story-spine` |
| `controlling_idea_locked` | `/story-spine` to build the story skeleton |
| `setting_locked` | `/story-cast` to design the character system |
| `cast_locked` | `/story-spine` if not done, or `/story-act` to begin scene planning |
| `spine_locked` | `/story-act` to plan Act 1's scene sequence |
| `act_design_locked` | `/story-scene` to draft the first scene |
| `scene_cards_locked` | `/story-scene` to begin prose drafting |
| `prose_drafted` | `/story-audit` to run the full critic suite |
| `critic_passed` | `/story-revise` for multi-pass polish |
| `polished` | `/story-publish` to assemble the final manuscript |
| `done` | Project complete. To extend it (e.g. expand under-built acts), say so — this re-opens to `polished` and the manuscript will need regenerating. |

If a gate is locked but its artifact file is missing or stubbed, flag it as a potential issue.

**Note on `done`:** `done` is not a dead-end. Post-publish edits are legitimate (the most common is expanding an act that came in under budget). When prose changes after `done`, treat the project as re-opened to `polished`: the manuscript, colophon word-count, and lifecycle notes are now stale and must be regenerated via `/story-publish`. The stale-manuscript check above will catch this automatically.
