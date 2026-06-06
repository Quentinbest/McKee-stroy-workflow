---
id: story-revise
version: 1.0.0
contract-version: 1
name: story-revise
description: |
  Multi-pass revision orchestrator — runs the full draft through dedicated revision
  passes, one dimension at a time: structure → cliché → subtext → image system →
  voice → specificity → reader simulation. Each pass touches the whole draft but
  fixes only one dimension. Mirrors how human writers actually revise.
  Trigger: /story-revise, "revise the draft", "revision pass", "fix the draft",
  "improve the writing", "polish the prose".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - revise the draft
  - revision pass
  - fix the draft
  - improve the writing
  - polish the prose
  - story revise
---

# Multi-Pass Revision

Revision is not "fixing everything at once." It is a sequence of dedicated passes, each with a single focus. This prevents the writer from optimizing one dimension while regressing another, and prevents Claude from losing track of what changed.

## Before Starting

Read the audit report if it exists: `drafts/{slug}/audit-report.md`
Read all prose: `drafts/{slug}/prose/*.md`
Read the spine: `drafts/{slug}/spine.md`

Ask user: *"Which passes would you like to run? (all / specific pass / audit-driven)"*

**Stop-Loss**: If a pass must re-run on the same issue (same scene, same predicate) apply the `/story-stop-loss` protocol — 5 rounds max for repair, 3 for elevation, same-predicate 3× triggers immediate escalation. Never run a failing scene indefinitely.

## The Seven Passes

### Pass 1 — Structure
**Fix**: Scenes that don't turn; spine gaps; act-ending turning points that are soft.

Process:
1. Spawn `crisis-climax-auditor` on the final act (if not already passing)
2. Spawn `antagonism-stress-tester` on the full draft
3. For each flagged scene: verify the gap exists; if not, identify the turning point and revise the scene's close
4. For spine gaps: add or expand a complication

Do not fix prose style in this pass.

### Pass 2 — Cliché
**Fix**: Stock phrases, images, characters, moves that haven't been earned.

Process:
1. Spawn `cliche-hunter` on the full prose
2. For each cliché finding: replace with a specific, researched, invented detail consistent with the world bible
3. Distinguish from honored genre conventions (do not "fix" conventions)

Do not fix subtext or structure in this pass.

### Pass 3 — Subtext
**Fix**: Any line where text ≈ want (on-the-nose dialogue or exposition).

Process:
1. Spawn `subtext-whisperer` on the full prose + character files
2. For each on-the-nose finding: apply the 5-layer subtext model to that line specifically
3. Rewrite only the flagged lines — don't rewrite surrounding prose

Do not fix voice or specificity in this pass.

### Pass 4 — Image System
**Fix**: Motifs that drop out; Key Image not landing at Climax; setup-payoff imbalances.

Process:
1. Invoke `/mck-image-thread` — builds full motif inventory, maps cadence, audits Key Image, prescribes additions
2. Invoke `/mck-setup-payoff` — builds setup-payoff ledger, detects dangling and groundless
3. Execute the prescribed additions and plants from both skill outputs

Do not fix prose rhythm in this pass.

### Pass 5 — Voice
**Fix**: Voice drift, register inconsistency, wrong-era vocabulary.

Process:
1. If `voice-anchors.md` doesn't exist: run `/mck-voice-first` to produce it
2. Spawn `voice-drift-detector` on the full prose + `voice-anchors.md`
3. For each flagged passage: rewrite to match the anchors (vocabulary, rhythm, register)
4. Read aloud (or imagine it): passages that stumble when read aloud need rhythm revision

Do not fix content in this pass — only surface execution.

### Pass 6 — Specificity
**Fix**: Generic nouns and verbs that should be particular.

Process:
1. Spawn `specificity-auditor` on the full prose + world-bible — returns a ranked ledger
2. For CRITICAL and MAJOR findings: invoke `/mck-specificity-forge` to execute replacements
3. Each substitution must be consistent with the world and the character's POV

Do not rewrite whole paragraphs — only the generic element.

### Pass 7 — Reader Simulation
**Fix**: Pacing issues, engagement drops, confusion points.

Process:
1. Spawn `reader-simulator` with the prose files ONLY (no spine, no character files — blind read)
2. In parallel, spawn `pacing-analyst` with prose + spine for a rhythm/escalation audit
3. Merge findings: engagement drops + pacing problems in the same scene = high priority
4. Execute targeted fixes: cut slack, clarify confusing transitions, insert breathing beats

## Pass Tracking

After each pass, write a brief note to `drafts/{slug}/revision-log.md`:
```
## Pass {N} — {Name} — {date}
Files changed: [list]
Summary: [what was fixed]
Outstanding: [what wasn't fixed and why]
```

## After All Passes

Update `lifecycle.json`: `state: "polished"`, `locked.polished: true`

Suggest: `/story-publish` to assemble the final manuscript.
