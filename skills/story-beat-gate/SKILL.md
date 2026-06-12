---
name: story-beat-gate
description: |
  Internal Beat-level workflow used by story-scene. Scans a candidate Beat for
  deterministic mechanical fixes, runs a blind critique on the highest supported
  capability rung, classifies findings into AUTO / REVIEW / REJECT, records a
  resumable ledger, and returns one consolidated writer decision. Trigger:
  /story-beat-gate, "resume beat gate", "inspect beat gate", "diagnose beat gate".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
triggers:
  - story beat gate
  - resume beat gate
  - inspect beat gate
  - diagnose beat gate
---

# Story Beat Gate

This workflow runs **inside** `/story-scene`. It is not a second user-facing writing step. Its job is to replace repeated Beat micro-confirmations with one recoverable gate:

1. Scan the candidate Beat for deterministic, meaning-preserving fixes
2. Run a blind critique using the highest capability rung the host supports
3. Merge findings into `AUTO`, `REVIEW`, and `REJECT`
4. Recheck only the dimensions affected by local patches
5. Persist a resumable ledger before summarizing
6. Return one writer decision point

The Beat Gate never grants final aesthetic approval. Only the writer can do that.

## Artifacts

- Policy: `drafts/{slug}/beat-gate-policy.json`, or `templates/beat-gate-policy.json` when absent
- Ledger: `drafts/{slug}/audit/beat-gate/{act}-{scene}.json`
- Blind critic report: `drafts/{slug}/audit/beat-gate/{act}-{scene}-{beat}-critic.md`
- Diversity report: `drafts/{slug}/audit/beat-gate/{act}-{scene}-{beat}-diversity.md`

## Stage 0 — Resolve the active project and authority

1. Resolve the active project from the confirmed `drafts/{slug}/lifecycle.json`.
2. If lifecycle slug, selected path, and requested scene disagree: stop and surface all competing authorities.
3. Load `drafts/{slug}/beat-gate-policy.json` if it exists. Otherwise copy the template values into working memory and write the project-local policy only when the project is already initialized.
4. Load the scene ledger if it exists. If not, create it from the template. Existing prose and `state.json` must not be rewritten during initialization.

## Stage 1 — Deterministic scan

Run the adjacent fixed runner at `skills/story-beat-gate/scripts/beat-gate-rules.mjs`.

- Input: candidate Beat text, explicit project policy, bounded context metadata
- Output: `patches`, `review_items`, `reject_items`, `output_text`, policy warnings

If the runner cannot be executed because Node.js is unavailable, the command cannot be resolved, or the script is missing:

- Record `execution_mode: detect-only`
- Apply no `AUTO`
- Downgrade all mechanical findings to `REVIEW`
- Continue to blind critique so the writer still gets one consolidated result

The runner may only apply built-in rule IDs. Project policy cannot inject commands, code, or arbitrary regular expressions.

## Stage 2 — Blind critique capability ladder

Use the highest rung available:

1. **Parallel isolated Agent**: spawn `blind-beat-critic`
2. **Native critic tool**: if the host exposes a compatible bounded critic tool
3. **In-context fallback**: run a fresh-eyes pass from the bounded brief below

Record `execution_mode` in the ledger as:

- `parallel-agent`
- `native-tool`
- `in-context-fallback`
- `detect-only`

### Blind critic bounded brief

The blind critic receives only:

- candidate Beat or cleaned Beat
- Beat role and position: opening / middle / final / turning
- bounded Scene Contract excerpt
- relevant character/world constraints
- continuity excerpt
- voice anchors

The blind critic must not see:

- drafter reasoning
- prior verdicts
- patch history
- author rationale
- other critics' outputs

It returns findings and evidence only. It must not rewrite the Beat.

## Stage 3 — Classification

Classification is strict:

- `AUTO`: the runner already proved the change is local, reversible, explainable, and meaning-preserving
- `REVIEW`: a human judgment is still required
- `REJECT`: the change touches protected contract fields or requires reopening an upstream artifact

Protected fields include:

- Premise
- character desire
- relationship stance
- causality
- Gap
- Turning Point
- Value Shift
- world core fact

If a candidate patch touches one of those fields, the Beat Gate must refuse local application and name the upstream artifact to reopen.

## Stage 4 — Delta recheck

After any `AUTO` patch:

1. Record affected dimensions
2. Re-run only the local checks relevant to those dimensions
3. Re-run the full Beat Gate only when the impact range is unclear or the Scene Contract may have changed

## Stage 5 — Convergence and diversity

Track rounds explicitly in the ledger.

- Round 2 on the same unresolved predicate: require diversity challenge
- Round 3 on the same unresolved predicate: stop ordinary patching and escalate to upstream backtracking or human adjudication

### Diversity bounded brief

When diversity is required, provide only:

- compact mechanism summaries for recent accepted Beats
- the blocked Beat
- the specific predicate that failed to converge

The diversity challenger must return 2-3 alternatives that differ in mechanism:

- action
- relationship pressure
- material immersion
- information control

It must not mutate Premise, desire, Scene Gap, or Value Shift.

### Batch pattern audit

Before a consolidated batch-boundary writer decision, when the batch contains
at least 6 cleaned Beats across at least 2 scenes:

1. Run `batch-beat-pattern-auditor` over Beat text, refs, and voice anchors
   only.
2. Do not provide mechanism labels, prior findings, writer decisions, revision
   history, or diversity alternatives.
3. Write `drafts/{slug}/audit/beat-gate/{through-scene}-pattern.md`.
4. Merge its findings as `REVIEW` only. It cannot rewrite or reject prose.
5. If it finds a `HIGH` repetition that weakens a load-bearing final Beat,
   require diversity before the writer decision even when local mechanism
   labels differ.

Mechanism labels are bookkeeping, not proof of reader-visible diversity.

## Stage 6 — Ledger and resumability

Write the scene ledger **before** returning the writer summary.

The ledger stores:

- workflow version
- execution mode
- stages completed
- current round
- writer decision
- per-Beat candidate text, clean text, detections, patches, review items, reject items
- history of diversity and backtracking triggers
- batch pattern audit status and report path when the batch threshold is met

If the run is interrupted, resume from the first incomplete stage rather than redrafting or re-running completed work.

## Stage 7 — Writer summary

Return one consolidated summary:

- cleaned Beat
- applied `AUTO` changes with brief rationale
- remaining `REVIEW`
- any `REJECT` items and the upstream artifact they implicate
- current round and whether diversity or upstream backtracking is required

The writer can then:

- accept
- revise
- defer to batch boundary
- reopen upstream

The Beat Gate does not declare the Beat aesthetically approved.
