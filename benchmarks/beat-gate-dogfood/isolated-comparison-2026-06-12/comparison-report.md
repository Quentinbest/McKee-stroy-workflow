# Isolated Beat Gate Critic Comparison

Run date: 2026-06-12

## Result

Isolated scene critics improved independence but did not reproduce the fallback's full coverage. They found 4 issues across 3 Beats, overlapping 3 of the 7 Beats flagged by the in-context fallback. The prose-only batch auditor found 5 cross-scene patterns, including 1 high-severity pattern.

## Metrics

| Metric | Result |
|---|---:|
| Fallback findings | 7 |
| Isolated findings | 4 |
| Shared flagged Beats | 3 |
| Fallback-only flagged Beats | 4 |
| Fallback-relative Beat coverage | 42.9% |
| Isolated novel predicates | 1 |
| Confirmed false positives | 0 |
| Findings requiring fresh human review | 2 |
| Human-changed Beats caught by isolated critics | 1/4 |
| Batch findings confirmed by prior changes | 2 |
| New residual batch patterns | 3 |

## Interpretation

The isolated findings were generated after the prior human decision, so this is alignment, not a causal acceptance rate.

- Isolation improved local independence but did not reproduce fallback coverage uniformly.
- Scene-bounded critics cannot detect cross-scene diminishing returns.
- Beat role must be explicit so a final Beat is tested for enacted closure rather than pressure alone.
- A prose-only batch pattern audit should run before the consolidated writer decision.
- No isolated finding should be labeled a false positive without fresh human adjudication.

## Evidence

- `scene-reviews.json`: raw isolated scene-critic outputs
- `batch-pattern-review.json`: raw prose-only batch audit
- `adjudication.json`: comparison judgments with unresolved findings preserved
- `comparison-report.json`: machine-readable metrics
