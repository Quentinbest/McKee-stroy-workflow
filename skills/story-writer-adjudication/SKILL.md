---
name: story-writer-adjudication
description: |
  Two-stage writer adjudication for unresolved prose findings. Creates a seeded
  A/B package without source-role labels, locks blind preference before reveal,
  then records finding disposition and adoption intent. Trigger:
  /story-writer-adjudication, "blind adjudication", "compare revisions blind",
  "resolve critic disagreement".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
triggers:
  - story writer adjudication
  - blind adjudication
  - compare revisions blind
  - resolve critic disagreement
---

# Writer Adjudication

Use this workflow when a specific prose-level `REVIEW` remains unresolved and
there is one bounded alternative worth testing. It measures two different
questions in sequence:

1. Which prose version does the writer prefer without knowing its source?
2. After reveal, does the writer accept the critic finding and intend to adopt
   the preferred version?

Do not collapse these questions into one prompt.

## Authority boundary

This workflow may compare prose alternatives. It must not silently reopen or
mutate Premise, character desire, relationship stance, causality, Gap, Turning
Point, Value Shift, or world core facts. A comparison that requires such a
change must return to the owning upstream workflow.

Final aesthetic judgment remains human-only. A challenger win is evidence, not
permission to edit accepted prose.

## Input

Create an input from `templates/writer-adjudication-input.json`.

- Keep each challenger single-purpose.
- Give both variants the same bounded context.
- Set `authority_attestation.protected_fields_unchanged` to `true` only after
  checking both variants against the locked authority artifacts.
- Do not place source-role labels in `context`, `baseline_text`, or
  `challenger_text`.
- For a prospective batch-quality pilot, prefer 12-18 Beats from at least two
  scenes and include stylistically different material.

## Stage 1 — Create and blind-review

Run:

```bash
node scripts/run-writer-adjudication.mjs create \
  --input drafts/{slug}/audit/adjudication/{run-id}-input.json \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --seed {recorded-seed}
```

Give the writer only:

- `blind-package.md`
- `stage-1-decisions.json`

Do not reveal or summarize `sealed-manifest.json`. The writer records:

- `preferred_variant`: `A`, `B`, or `tie`
- `confidence`: 1-5
- `meaningful_difference`: `yes`, `no`, or `uncertain`
- concise reasons and optional batch-level repetition notes
- reviewer start and completion timestamps

Set `status` to `COMPLETE` only after every comparison is decided.

## Stage 2 — Reveal and adjudicate the finding

Run:

```bash
node scripts/run-writer-adjudication.mjs reveal \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --stage-1 drafts/{slug}/audit/adjudication/{run-id}/stage-1-decisions.json
```

The runner refuses incomplete decisions, package tampering, or a mismatched
hash. After reading `reveal-package.md`, the writer completes
`stage-2-decisions.json`:

- `finding_disposition`: `accept`, `reject`, or `uncertain`
- `adopt_preferred_variant`: `yes`, `no`, or `defer`
- whether cross-scene repetition was reduced, unchanged, increased, or remains
  uncertain
- rationale

Again, set `status` to `COMPLETE` only when all entries are decided.

## Stage 3 — Score without auto-applying

Run:

```bash
node scripts/run-writer-adjudication.mjs score \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --stage-1 drafts/{slug}/audit/adjudication/{run-id}/stage-1-decisions.json \
  --stage-2 drafts/{slug}/audit/adjudication/{run-id}/stage-2-decisions.json
```

The report separates:

- baseline/challenger blind preference
- accepted/rejected/uncertain findings
- explicit adoption intent
- writer review minutes, recorded agent calls, and cross-scene repetition effect

The report calls human rejection a writer-rejected finding rate. It is not an
objective false-positive rate.

Apply prose only when the writer recorded adoption. Preserve rejected and
uncertain findings as evidence; do not rewrite history to make the critic look
correct.

## Limits

- The seed and manifest provide reproducibility and tamper detection, not
  cryptographic secrecy.
- A retained example with no completed human decision is a harness
  demonstration, not quality evidence.
- Do not calibrate a general rule from one story or one writer. Require repeated
  adjudications across distinct material.
