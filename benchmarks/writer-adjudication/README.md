# Writer Adjudication Benchmark

This benchmark exercises the two-stage blind writer adjudication harness.

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

For a real prospective pilot, write output under the story project's private
`drafts/{slug}/audit/adjudication/` directory. Give the writer only
`blind-package.md` and `stage-1-decisions.json` until Stage 1 is complete.
