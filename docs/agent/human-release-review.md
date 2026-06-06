# Human Release Review

Stable release requires an authorized person to review one complete,
non-synthetic story lifecycle. Synthetic fixtures and model self-evaluation do
not satisfy this gate.

## Procedure

1. Select a real story seed that the reviewer is authorized to use.
2. Run the lifecycle through `revision-passes`, preserving each artifact and
   checkpoint decision.
3. Record the artifact root in `reports/human-release-review.json`.
4. Use `docs/agent/human-review-scorecard.md` and
   `reports/human-review-objective-evidence.json` to inspect the prepared
   evidence.
5. Score every literary and operational criterion from 1 to 5 and cite concrete
   artifact or execution evidence.
6. Use `changes-requested` if any blocking criterion scores below 3.
7. Set `status`, both review-section statuses, and `stableRelease` to approved
   only when all criteria score at least 3 and no P0/P1 finding remains.
8. Run `npm run agents:test:human-review-evidence`,
   `npm run agents:test:human-review`, and `npm run agents:verify`.

## Literary Criteria

- Causal structure and progressive complications.
- Controlling idea expressed through climax action.
- Distinct inner, personal, and extra-personal character pressure.
- Scene objectives, gaps, turns, value changes, and consequences.
- Voice, subtext, specificity, and controlled exposition.
- Earned crisis, climax, and resolution.

## Operational Criteria

- Instruction clarity without hidden chat context.
- Checkpoint usefulness and approval ergonomics.
- Failure recovery, retry limits, and resumption.
- Artifact provenance and change traceability.
- Comparable behavior across the harnesses used.
- Time, clarification, and correction cost.

Stable-release approval does not authorize external publication. Publication
requires a separate explicit approval.
