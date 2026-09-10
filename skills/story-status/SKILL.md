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
  - Bash
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
- `workflow_versions.beat_gate` and `workflow_versions.writer_adjudication` if
  present

## Step 3 — Read Artifact Presence

For each artifact path in `artifacts`, check if the file exists and is non-stub. Count:
- Scene cards in `scenes/`
- Prose files in `prose/`
- Character files in `characters/`

If Beat Gate artifacts are declared:
- read the newest scene ledger under `drafts/{slug}/audit/beat-gate/`
- extract the current Beat, current round, pending writer decision, and `execution_mode`
- read the newest rolling report under `drafts/{slug}/audit/rolling/` if present

If Writer Adjudication artifacts are declared:
- read the newest `run-metadata.json` under
  `drafts/{slug}/audit/adjudication/`
- report its protocol version, workflow status, and calibration status

**Audit validity check**: recompute hashes for current prose and constraints and
evaluate `lifecycle.audit_records` with
`skills/story-audit/scripts/audit-state.mjs`. Show local/partial passes as such;
never infer a global pass from report-file presence. If `state` and any lock
claim disagree, show a blocking lifecycle conflict and withhold the next-step
recommendation. / 重新计算输入哈希并执行状态判定；报告文件存在本身不代表通过。

**Stale-manuscript check**: use the newest `export_records` entry and
`skills/story-publish/scripts/publish-state.mjs` semantics to compare source
hashes and the recorded manuscript hash. Modified time is advisory only. An
independently edited manuscript is a blocking, untraceable difference that must
be shown before any rebuild; changed source prose means rebuild from sources.
Run its `evaluate --input <evaluation.json> --output <result.json>` command and
display the returned status.

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
  Beat Gate:    {current | stale | unverified | absent}
  Current Beat: {scene/beat or none}
  Pending Gate: {writer decision or none}
  Last Rolling: {most recent rolling report or none}
  Adjudication: {protocol version | absent} / {workflow status}
  Calibration:  {PASS | WARN | FAIL | not assessed}
  Audit scope:  {full story | act | scenes | unverified}
  Audit input:  {current | stale | unverified}
  Export:       {current | source-stale | untraceable-edit | absent}

NEXT STEP
  → {suggested next action}
```

## Step 5 — Suggest Next

Based on the evaluated effective state (not the raw `state` field alone),
suggest the next natural action. When lifecycle conflicts exist, stop here and
recommend resolving them first:

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

**Beat Gate version status**
- `current`: lifecycle metadata and the latest ledger agree on the same Beat Gate version
- `stale`: the ledger was produced by an older Beat Gate version than the installed workflow expects
- `unverified`: the project has Beat Gate artifacts but no trustworthy version marker

**Note on `done`:** `done` is not a dead-end. Post-publish edits are legitimate (the most common is expanding an act that came in under budget). When prose changes after `done`, treat the project as re-opened to `polished`: the manuscript, colophon word-count, and lifecycle notes are now stale and must be regenerated via `/story-publish`. The stale-manuscript check above will catch this automatically.
