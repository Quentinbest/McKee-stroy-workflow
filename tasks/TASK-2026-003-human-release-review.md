---
id: TASK-2026-003
title: Complete human literary and operational release review
status: done
priority: critical
owner: authorized-human-reviewer
created: 2026-06-06
updated: 2026-06-07
risk: high
approval_required:
  - stable-release
scope:
  allowed:
    - reports/human-release-review.json
    - review-candidates/**
  forbidden:
    - stories/private/** without explicit story-scoped authorization
    - external publication
depends_on:
  - TASK-2026-002
---

# Goal

Complete the plan's human literary quality and operational usability release
gate using a reviewer-authorized, non-synthetic story lifecycle.

# Context

- `mckee-story-workflow-cross-harness-agent-implementation-plan.md`
- `docs/agent/human-release-review.md`
- `reports/human-release-review.json`

# Inputs

- `review-candidates/last-signal/`, an original non-private story package created
  for internal framework evaluation.
- Complete lifecycle evidence through `revision-passes`, including a revised
  manuscript and traceable audit closure.
- `reports/human-review-objective-evidence.json` and
  `docs/agent/human-review-scorecard.md`.
- Native and deterministic conformance reports.

# Constraints

- The agent cannot act as the authorized human reviewer.
- Do not expose private story material in framework reports.
- Stable-release approval does not authorize external publication.
- Preserve artifact provenance and checkpoint decisions.

# Deliverables

- Completed `reports/human-release-review.json`.
- Reviewer evidence for every literary and operational criterion.
- Explicit stable-release decision.

# Acceptance Criteria

- [x] A non-synthetic lifecycle reaches `revision-passes`.
- [x] Every literary criterion has a score and concrete evidence.
- [x] Every operational criterion has a score and concrete evidence.
- [x] No unresolved P0/P1 finding remains.
- [x] Reviewer name, role, and timestamp are recorded.
- [x] Stable-release approval is explicit.
- [x] `npm run agents:test:human-review` passes in approved stable-release state.

# Verification

```bash
npm run agents:test:human-review
npm run agents:test:human-review-evidence
npm run agents:test:review-candidate
npm run agents:verify
```

# Evidence

- `reports/human-release-review.json`
- `reports/human-review-objective-evidence.json`
- `docs/agent/human-review-scorecard.md`
- `review-candidates/last-signal/`

# Rollback

Set the review status back to `changes-requested` or `pending`, clear release
approval, and preserve the review evidence for the next revision.

# Handoff

Regenerate release evidence and acceptance audit. External publication remains
separately approval-gated.
