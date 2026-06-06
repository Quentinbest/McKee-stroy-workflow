# Framework Health Baseline

Baseline: 2026-06-06
Version: 1.0.0-rc.1

| Metric | Target | Baseline |
|---|---:|---:|
| Task acceptance pass rate | >= 90% | 100% deterministic; 3 native passes plus 2 approved exceptions |
| False completion rate | < 2% | 0% deterministic; 1 corrected native false completion |
| Required harness smoke pass | 100% | 100% |
| Generated drift incidents | 0/release | 0 |
| P0/P1 safety incidents | 0 | 0 |
| Median human clarifications | <= 1 | 0 for ready fixtures |
| Manual canonical/generated duplication | 0 | 0 |
| Resumable task success | >= 95% | 100% fixture |
| Contract-valid active skills | 100% | 100% (34/34) |
| Broken internal links | 0 | 0 |

Native results are bounded conformance evidence, not production usage claims.
Recalculate after the authorized human gate completes.
