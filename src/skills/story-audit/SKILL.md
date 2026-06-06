---
id: story-audit
version: 1.0.0
contract-version: 1
name: story-audit
description: |
  Run the full McKee critic suite over the current draft — structural compliance,
  antagonism balance, cliché hunt, crisis/climax validity, subtext check — as
  parallel agents where supported (else native critic tools, else in-context
  sequential passes), then aggregate findings into a prioritized revision list.
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
contract: {"purpose":"Run the full McKee critic suite over the current draft — structural compliance, antagonism balance, cliché hunt, crisis/climax validity, subtext check — as parallel agents where supported (else native critic tools, else in-context sequential passes), then aggregate findings into a prioritized revision list. Use after prose drafting is complete for an act or the whole story. Trigger: /story-audit, \"audit the story\", \"run the critics\", \"check the draft\", \"what's wrong with this draft\", \"full audit\".","trigger":["/story-audit","story audit"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/audit/{critic}.md","drafts/{slug}/prose/","drafts/{slug}/prose/{act}-*.md","drafts/{slug}/spine.md","drafts/{slug}/controlling-idea.md","drafts/{slug}/genre-contract.md","drafts/{slug}/characters/*.md","drafts/{slug}/misdirection-plan.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["antagonism-stress-tester","cliche-hunter","composition-conductor","crisis-climax-auditor","mck-honesty","reader-simulator","story-publish","story-revise"],"fixtures":{"positive":"story-audit:positive","negative":"story-audit:missing-trigger"}}
---

# Full Story Audit

You are running the full McKee critic suite. Each critic reads the draft with **fresh eyes** on a different dimension; you then aggregate their findings into a ranked revision list. The fresh-eyes independence is the entire value of the audit — a self-review by whoever just wrote the prose is biased and will pass its own mistakes.

> **Execution is platform-dependent — see Step 0.** The critics run as parallel isolated agents *when the host supports them*, and degrade gracefully to in-context sequential passes when it does not. Either way, **every critic writes its report to disk before returning a summary**, so a mid-run failure (session/rate limit) is recoverable.

## Step 0 — Detect Execution Mode (capability ladder)

Pick the highest rung the host supports:

1. **Parallel agents** (Claude Code with the `Agent` tool): spawn each critic as an isolated agent. Best — true fresh eyes, no context bleed.
2. **Native critic tools** (e.g. Pi exposes `cliche_hunt`, `subtext_check`, `antagonism_test`, `pacing_analyze`, `reader_simulate`, `setup_payoff`): call them as tools, one dimension each. See the Cross-Platform Critic Map at the end.
3. **In-context sequential** (OpenCode/DeepSeek or any host without agents/tools): run each critic yourself, one at a time, with a **fresh-eyes reset** between critics — before each pass, state "Reading only for {dimension}; ignoring all other concerns," and judge against that dimension alone. Do not let one pass's conclusions leak into the next.

Record which rung you used in the final report's header (`Execution mode: parallel-agents | native-tools | in-context-sequential`), because in-context audits are weaker and the user should know.

**Resilience rule (all rungs):** each critic MUST write its full report to `drafts/{slug}/audit/{critic}.md` *first*, then return only a short summary. If the run is interrupted, on resume read whatever `audit/*.md` reports already landed and only re-run the missing critics — never silently drop one.

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

## Step 2 — Run the Critic Suite

Run all relevant critics by the rung chosen in Step 0 (parallel agents simultaneously; native tools in any order; in-context one at a time with a fresh-eyes reset between each). Each critic writes `drafts/{slug}/audit/{critic}.md` before returning its summary.

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

### Surprise Critic — `surprise-auditor` (if `misdirection-plan.md` exists)
Brief: all prose + `drafts/{slug}/misdirection-plan.md`
Question: Does the surface misdirection hold through Acts 1–2? Is each planted item dual-reading capable? Does the Climax deliver the re-read moment?
*Skip if no misdirection plan exists — note its absence as a V3 gap if the genre warrants it.*

### Honesty Critic — run `/mck-honesty TEST` in-context (not an agent spawn)
Input: `controlling-idea.md` + `persona.md` Truth Library
Question: Is the CI grounded in the author's truth, not asserted? Does the antagonist embody the Counter-Idea as a full fight?
*This is the only critic that is **always** in-context regardless of rung — it needs the persona's Truth Library which is session-state.*

Wait for all critics to return (or, in-context mode, finish all passes). Confirm each `drafts/{slug}/audit/{critic}.md` exists before aggregating; if any critic failed to land its report, re-run just that one.

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
| CI grounded (not asserted) | ✅ / ❌ / N/A (no persona) | |
| Counter-Idea gets full fight | ✅ / ❌ | |
| Surface misdirection holds | ✅ / ❌ / N/A (no plan) | |
| Dual-reading plants functional | ✅ / ❌ / N/A (no plan) | |
| Re-read moment at Climax | ✅ / ❌ / N/A (no plan) | |
| Length on-budget (vs act-design `target_total`) | ✅ / ⚠️ under / ❌ / N/A (no budget) | |
| Density not inverted (load-bearing acts heaviest) | ✅ / ❌ | |

## Length & Proportion
Run the density check before aggregating (the composition critic, or in-context if no budget tooling):
- Realized total vs `target_total`: {X} / {Y} ({pct}%)
- Per-act realized vs budget (flag any act < 60% with no `length_note`)
- Inversion check: are the deepest act and the payoff zone the heaviest per scene? If the setup act is fattest and the climax thinnest, flag as a Major issue.

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

---

## Appendix — Cross-Platform Critic Map

Each critic dimension maps to a Claude Code agent, an optional native tool, and an in-context fallback. Use whichever the host offers (Step 0). The dimension and its question are identical across rungs — only the execution differs.

| Dimension | Claude Code agent | Native tool (e.g. Pi) | In-context fallback |
|---|---|---|---|
| Structural / antagonism | `antagonism-stress-tester` | `antagonism_test` | read prose + spine, judge antagonism per spine event |
| Crisis / Climax | `crisis-climax-auditor` | — | read final act + CI + genre, judge dilemma/causality |
| Cliché | `cliche-hunter` | `cliche_hunt` | scan prose vs genre contract for unearned stock |
| Subtext | `subtext-whisperer` | `subtext_check` | scan dialogue/behavior for text ≈ want |
| Composition / setup-payoff | `composition-conductor` | `setup_payoff`, `pacing_analyze`, `image_system` | grep plant→payoff chains; check pacing variety |
| Surprise / misdirection | `surprise-auditor` | — | re-read plants for dual-reading; verify Climax re-read |
| Honesty (always in-context) | — | — | `/mck-honesty TEST` vs persona Truth Library |
| Reader simulation (optional) | `reader-simulator` (if built) | `reader_simulate` | read straight through; note where attention/belief drops |

**Note for in-context mode:** running all dimensions yourself in one pass collapses them into a single perspective and loses the fresh-eyes value. Mitigate with the per-dimension reset in Step 0, and bias toward flagging your *own* prose harder than imported prose — the drafter is structurally blind to the moves it just made.
