# Beat Gate Dogfood Benchmark

This benchmark exercises the Beat Gate against a four-scene synthetic Chinese
story. It is intentionally separate from real manuscripts and populated author
personas.

Run it with:

```bash
node scripts/run-beat-gate-dogfood.mjs
```

The fixture now contains the writer's recorded choice of ending `A`, so the
default run commits the accepted batch and writes rolling review reports. To
reproduce the pre-decision boundary:

```bash
node scripts/run-beat-gate-dogfood.mjs --pending
```

To retain all ledgers, critic reports, candidate prose, metrics, and the writer
decision package:

```bash
node scripts/run-beat-gate-dogfood.mjs --output benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide
```

The `--pending` benchmark must stop at `AWAITING_WRITER`. The decided run may
reach `COMMITTED` only because the fixture contains a dated human decision. It
is a failure if the runner invents approval, treats in-context self-review as
isolated criticism, or runs rolling reviews before the writer commits the
scene batch.

The mechanism-category metric is diagnostic only. The retained run also records
batch-level prose homogeneity because different mechanism labels can still
produce stylistically interchangeable prose.
