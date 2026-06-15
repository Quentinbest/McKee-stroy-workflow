---
name: story-writer-adjudication
description: |
  Protocol V2 writer adjudication for unresolved prose findings. Separately
  locks blind prose preference, blind finding judgment, and source-aware
  variant disposition. Protocol `2.1.0` adds an evidence-first Stage 2A.
  Trigger:
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
there is one bounded alternative worth testing. It measures three different
questions in sequence:

1. Which prose version does the writer prefer without knowing its source?
2. While source roles remain hidden, does the writer accept the critic finding?
3. After source-role reveal, does the writer keep the baseline, adopt the
   challenger, or defer?

Do not collapse these questions or reveal source roles before Stage 2A is
locked.

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
- For a prospective calibration pilot, use 10-12 comparisons from at least
  four scenes. Cover desire pressure, value direction, closure, and
  cross-scene repetition.
- Include at least three deliberately weak challenger controls to test whether
  blind prose comparison resists harmful or merely paraphrastic revisions.
- Include at least two unsupported-finding controls whose evidence does not
  support the diagnostic claim. These test finding-acceptance bias separately
  from revision quality.
- Keep `calibration` metadata out of writer-facing material. The runner seals
  categories and control labels in the manifest and validates the declared
  sample coverage before creating Stage 1. Protocol V2 titles, contexts, and
  finding text must not contain source-role or calibration-control labels.
- Use these default success gates:
  `minimum_weak_challenger_resistance_percent: 80`,
  `maximum_unsupported_findings_accepted: 0`, and
  `maximum_acceptances_without_meaningful_difference: 0`.
- Add `application.target_file` only when the baseline text can be matched
  exactly in one project-relative file. This declares a possible target; it
  never grants permission to edit.

For a Protocol V2 calibration input, replace top-level `calibration: null`
with:

```json
{
  "mode": "prospective",
  "pilot_id": "{{pilot-id}}",
  "minimum_comparisons": 10,
  "minimum_distinct_scenes": 4,
  "required_categories": [
    "desire_pressure",
    "value_direction",
    "closure",
    "cross_scene_repetition"
  ],
  "control_policies": {
    "weak_challenger": { "minimum_count": 3 },
    "unsupported_finding": { "minimum_count": 2 }
  },
  "success_gates": {
    "minimum_weak_challenger_resistance_percent": 80,
    "maximum_unsupported_findings_accepted": 0,
    "maximum_acceptances_without_meaningful_difference": 0
  }
}
```

When critic output already contains unresolved `REVIEW` findings, copy
`templates/writer-adjudication-variants.json`, prepare one bounded variant per
`beat_ref + predicate`, then generate the standard input:

```bash
node scripts/run-writer-adjudication.mjs prepare \
  --findings drafts/{slug}/audit/adjudication/unresolved-findings.json \
  --variants drafts/{slug}/audit/adjudication/variants.json \
  --output drafts/{slug}/audit/adjudication/{run-id}-input.json \
  --run-id {run-id} \
  --title "{blind comparison title}" \
  --created-at {YYYY-MM-DD}
```

`prepare` accepts top-level `findings` or isolated-critic `scene_reviews`,
keeps only unresolved entries, joins them to variants by
`beat_ref + predicate`, and fails on duplicate, missing, or unmatched entries.
It never generates a challenger or authority attestation by itself.

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

## Stage 2A — Blind finding adjudication

Run:

```bash
node scripts/run-writer-adjudication.mjs reveal \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --stage-1 drafts/{slug}/audit/adjudication/{run-id}/stage-1-decisions.json
```

The runner refuses incomplete decisions, package tampering, or a mismatched
hash. Protocol V2 creates `finding-package.md` and
`stage-2a-decisions.json`. Source roles and calibration labels remain hidden.
The writer records:

- `evidence_support`: `supported`, `contradicted`, or `insufficient` for
  new `2.1.0` runs
- `evidence_basis`: the specific textual basis for that judgment on `2.1.0`
  runs
- `counterevidence_checked`: what contrary or weakening evidence was checked on
  `2.1.0` runs
- `finding_disposition`: `accept`, `reject`, or `uncertain`
- rationale
- `blind_difference_reconciliation` when accepting a finding after Stage 1
  recorded `meaningful_difference: no`

For new `2.1.0` runs, only `supported` may be accepted, `contradicted` must be
rejected, and `insufficient` may only end as `reject` or `uncertain`. Generic
or duplicated evidence judgments fail closed before source-role reveal.

Set `status` to `COMPLETE` only when every finding is decided.

## Stage 2B — Source-role reveal and disposition

Run:

```bash
node scripts/run-writer-adjudication.mjs reveal-roles \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --stage-1 drafts/{slug}/audit/adjudication/{run-id}/stage-1-decisions.json \
  --stage-2a drafts/{slug}/audit/adjudication/{run-id}/stage-2a-decisions.json
```

Only after Stage 2A is complete does the runner create
`role-reveal-package.md` and `stage-2b-decisions.json`. The writer records
`variant_disposition` as `keep_baseline`, `adopt_challenger`, or `defer`, plus
rationale and the batch-level repetition effect. Keeping the baseline is never
counted as variant adoption.

## Stage 3 — Score without auto-applying

Run:

```bash
node scripts/run-writer-adjudication.mjs score \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --stage-1 drafts/{slug}/audit/adjudication/{run-id}/stage-1-decisions.json \
  --stage-2a drafts/{slug}/audit/adjudication/{run-id}/stage-2a-decisions.json \
  --stage-2b drafts/{slug}/audit/adjudication/{run-id}/stage-2b-decisions.json
```

The report separates:

- baseline/challenger blind preference
- accepted/rejected/uncertain findings
- evidence-gate support counts for `2.1.0` runs
- explicit baseline/challenger disposition and post-reveal reversals
- writer review minutes, recorded agent calls, and cross-scene repetition effect
- weak-challenger resistance and unsupported-finding acceptance
- a `PASS`, `WARN`, or `FAIL` calibration status

`FAIL` means an unsupported finding was accepted or a finding was accepted
after `meaningful_difference: no`. `WARN` means those hard gates passed but
weak-challenger resistance was below the configured threshold. Only `PASS`
clears this run's calibration gates; repeated runs across distinct material
are still required before generalizing critic quality.

The report calls human rejection a writer-rejected finding rate. It is not an
objective false-positive rate.

Apply prose only for `adopt_challenger`. Preserve rejected and uncertain
findings as evidence; do not rewrite history to make the critic look correct.

## Stage 4 — Preview and apply approved variants

After scoring, create a non-mutating application plan:

```bash
node scripts/run-writer-adjudication.mjs apply \
  --input drafts/{slug}/audit/adjudication/{run-id}-input.json \
  --output drafts/{slug}/audit/adjudication/{run-id} \
  --root drafts/{slug}
```

The default is always `DRY_RUN`. A comparison is `READY` only when the writer
recorded `adopt_challenger`, the input and decision hashes still match, and the
baseline occurs exactly once in the declared target.

Inspect `application-plan.json`, then add `--write` to apply all ready
operations. Any missing or stale target blocks the write before any file is
changed.

## Aggregate completed runs

```bash
node scripts/run-writer-adjudication.mjs aggregate \
  --runs drafts/{slug}/audit/adjudication \
  --output drafts/{slug}/audit/adjudication/aggregate
```

Aggregate reports combine completed-run counts, preferences, finding
dispositions, source-aware variant choices, review time, both control types,
and V2 calibration status. They do not turn writer judgments into an objective
critic score.

## Limits

- The seed and manifest provide reproducibility and tamper detection, not
  cryptographic secrecy.
- A retained example with no completed human decision is a harness
  demonstration, not quality evidence.
- Runs created with input version `1.x` retain the legacy combined Stage 2 for
  reproducibility. Retained `2.0.0` runs replay the earlier split Stage 2
  without evidence-first fields. New runs must use input version `2.1.0`.
- Do not calibrate a general rule from one story or one writer. Require repeated
  adjudications across distinct material.
