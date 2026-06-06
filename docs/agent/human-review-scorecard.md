# Human Release Review Scorecard

This scorecard is the final authorized-human gate for `1.0.0-rc.1`. It does not
authorize external publication.

## Review Inputs

1. Read `review-candidates/last-signal/final-story.md`.
2. Inspect `review-candidates/last-signal/lifecycle.json`, `audit.md`, and
   `revision-passes.md`.
3. Inspect `reports/human-review-objective-evidence.json`.
4. Enter integer scores from 1 to 5 in
   `reports/human-release-review.json`, preserving concrete evidence.

## Decision Rules

- Score 1-2: blocking; set the relevant section and overall status to
  `changes-requested`.
- Score 3-5: acceptable for that criterion.
- Approve only if every criterion is at least 3, no P0/P1 issue remains, and
  reviewer name, role, and ISO 8601 timestamp are recorded.
- Keep `externalPublication` false unless a separate publication approval is
  explicitly granted.

## Literary Questions

| Criterion | Reviewer question |
|---|---|
| causal-structure | Does each major turn result from the prior choice or consequence? |
| controlling-idea | Does Mara's climactic action prove the stated controlling idea? |
| character-pressure | Are inner, personal, and institutional pressures distinct and escalating? |
| scene-turns-and-gaps | Does each scene create a meaningful expectation-reality gap and value change? |
| voice-subtext-specificity | Is the prose specific, controlled, and meaningfully indirect where appropriate? |
| climax-and-resolution | Is the crisis irreducible, climax earned, and consequence preserved? |

## Operational Questions

| Criterion | Reviewer question |
|---|---|
| instruction-clarity | Can the workflow be understood without private chat context? |
| checkpoint-usability | Do checkpoint records make decisions and resume points clear? |
| failure-recovery | Are findings, revisions, retries, and recovery paths explicit? |
| artifact-traceability | Can every material output be traced to provenance and lifecycle state? |
| cross-harness-consistency | Is evidence comparable across all supported harnesses and exceptions explicit? |
| time-and-correction-cost | Are measured corrections acceptable, with unavailable metrics disclosed rather than invented? |

## Verification

```bash
npm run agents:test:human-review-evidence
npm run agents:test:human-review
MCKEE_WIKI_ROOT=/Users/quentin/Writing/LLM-Wiki-Story npm run agents:verify
```

