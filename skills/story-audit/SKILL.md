---
name: story-audit
description: |
  Run the full McKee critic suite over the current draft — structural compliance,
  antagonism balance, cliché hunt, crisis/climax validity, subtext check — in
  parallel agents, then aggregate findings into a prioritized revision list.
  Use after prose drafting is complete for an act or the whole story.
  Trigger: /story-audit, "audit the story", "run the critics", "check the draft",
  "what's wrong with this draft", "full audit".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
triggers:
  - audit the story
  - run the critics
  - check the draft
  - what's wrong with this draft
  - full audit
  - story audit
---

# Full Story Audit

You are running the full McKee critic suite. This skill spawns multiple critic agents in parallel, each reading the draft with fresh eyes on a different dimension, then aggregates their findings into a ranked revision list.

## Step 1 — Determine Scope

Ask (or infer from context):
- Full story audit, or specific act?
- Specific critic only (structural / cliché / subtext / climax)?

Load prose files:
- Full audit: all files in `drafts/{slug}/prose/`
- Act audit: all files in `drafts/{slug}/prose/{act}-*.md`

Also load:
- `drafts/{slug}/spine.md`
- `drafts/{slug}/controlling-idea.md`
- `drafts/{slug}/genre-contract.md`
- `drafts/{slug}/characters/*.md`

## Step 2 — Spawn Critic Agents in Parallel

Invoke all relevant critics simultaneously:

### Structural Critic — `antagonism-stress-tester`
Brief: spine + all character files + prose
Question: Is the antagonism adequate at every level (inner / personal / extra-personal) at every spine event?

### Climax Critic — `crisis-climax-auditor`
Brief: spine + final act prose + controlling idea + genre contract
Question: Is the Crisis a true dilemma? Does the Climax flow from the decision without coincidence? Is the MDQ answered? Is the Controlling Idea dramatized at the final value flip?

### Cliché Critic — `cliche-hunter`
Brief: all prose + genre contract
Question: What stock phrases, images, moves, or characters exist that haven't been earned through specificity?

### Subtext Critic — `subtext-whisperer`
Brief: all prose + character files
Question: Where does text ≈ want (on-the-nose)? Where do characters say what they mean?

### Composition Critic — `composition-conductor`
Brief: all scene cards + all prose
Question: Are setups paid off? Are there dangling setups? Is the image system threaded? Is pacing varied?

Wait for all critics to return.

## Step 3 — Aggregate Findings

Merge all findings into a single report at `drafts/{slug}/audit-report.md`:

```markdown
# Story Audit — {title}
Date: {today}

## Overall Verdict
[PASS / NEEDS WORK / MAJOR REVISION] — brief rationale

## Critical Issues (must fix before polish)
1. [Issue] — [Location] — [Critic] — [Recommendation]
...

## Major Issues (strongly recommended fixes)
...

## Minor Issues (polish-phase fixes)
...

## Structural Predicates
| Predicate | Status | Notes |
|---|---|---|
| Every scene turns | ✅ / ❌ | |
| Crisis is a true dilemma | ✅ / ❌ | |
| Climax flows from decision | ✅ / ❌ | |
| MDQ answered | ✅ / ❌ | |
| Controlling Idea dramatized | ✅ / ❌ | |
| Genre obligatory scene delivered | ✅ / ❌ | |
| No clichés unearned | ✅ / ❌ | |
| Subtext holds throughout | ✅ / ❌ | |

## Setup-Payoff Ledger
Dangling setups: [list]
Groundless payoffs: [list]

## Image System
Key Image present in opening (subtle): ✅ / ❌
Key Image lands at Climax: ✅ / ❌
Motifs threaded at adequate cadence: ✅ / ❌
```

## Step 4 — Present Findings

Show the user:
1. The overall verdict
2. The critical issues (these block the next lifecycle gate)
3. Offer to run `/story-revise` to address findings systematically

## Step 5 — Update Lifecycle

If overall verdict is PASS (all critical predicates satisfied):
Update `lifecycle.json`: `state: "critic_passed"`, `locked.critic_passed: true`

Suggest next: `/story-revise` for major issues, or `/story-publish` if passing.
