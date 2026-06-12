# Writer Adjudication Benchmark

This benchmark exercises the two-stage blind writer adjudication harness.

Create the demonstrative Memory Tide pilot:

```bash
node scripts/run-writer-adjudication.mjs create \
  --input benchmarks/writer-adjudication/memory-tide-pilot.json \
  --output benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved \
  --seed 20260612
```

The retained run stops at `AWAITING_BLIND_REVIEW`. It proves deterministic
ordering, balanced source roles, hash binding, and decision-package shape. It
does **not** contain a human preference and must not be counted as evidence that
either revision is better.

For a real prospective pilot, write output under the story project's private
`drafts/{slug}/audit/adjudication/` directory. Give the writer only
`blind-package.md` and `stage-1-decisions.json` until Stage 1 is complete.
