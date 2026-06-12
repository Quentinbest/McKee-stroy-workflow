# Writer Adjudication Benchmark

This benchmark exercises the two-stage blind writer adjudication harness.

To avoid manually copying critic evidence into an input, use `prepare` with an
unresolved findings file and an explicit catalog based on
`templates/writer-adjudication-variants.json`. The join key is
`beat_ref + predicate`; missing, duplicate, or unmatched entries fail closed.
The command does not generate prose or certify protected authority.

Create a fresh copy of the Memory Tide package:

```bash
node scripts/run-writer-adjudication.mjs create \
  --input benchmarks/writer-adjudication/memory-tide-pilot.json \
  --output /tmp/2026-06-12-memory-tide-adjudication \
  --seed 20260612
```

The retained run is now `COMPLETE`. One writer preferred both challengers
blind, marked both differences meaningful, accepted both findings, approved
both variants for adoption, and judged cross-scene repetition reduced.

This is real prospective evidence for these two comparisons, but it is still a
single-writer, two-comparison sample. Do not promote a general critic rule from
this run alone.

## Prospective calibration V2

The synthetic Glass Orchard package expands calibration to 12 comparisons
across four scenes. It covers desire pressure, value direction, closure, and
cross-scene repetition, with three sealed weak-challenger controls.

```bash
node scripts/run-writer-adjudication.mjs create \
  --input benchmarks/writer-adjudication/glass-orchard-calibration-v2.json \
  --output benchmarks/writer-adjudication/runs/2026-06-12-glass-orchard-calibration-v2 \
  --seed 20260612-v2
```

The retained run is `AWAITING_BLIND_REVIEW`; it is a prepared experiment, not
human quality evidence. Give the writer only `blind-package.md` and
`stage-1-decisions.json`. Control labels remain sealed through both writer
decision stages and appear only in the final scored report.

For a real prospective pilot, write output under the story project's private
`drafts/{slug}/audit/adjudication/` directory. Give the writer only
`blind-package.md` and `stage-1-decisions.json` until Stage 1 is complete.

After scoring, `apply` writes an exact-match application plan and remains a
dry-run unless `--write` is supplied. `aggregate` combines completed reports
without treating writer preferences as objective truth.
