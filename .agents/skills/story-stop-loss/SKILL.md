---
id: story-stop-loss
version: 1.0.0
contract-version: 1
name: story-stop-loss
description: |
  Stop-loss convergence protocol for any workflow skill that iterates on an
  artifact. Prevents infinite-revision spirals by enforcing: an iteration cap
  per artifact (default 5 rounds), a quality floor (structural predicates must
  pass), an escalation path when the cap is reached without convergence, and
  an abandon-and-restart option when escalation fails. Invoked by workflow
  skills (story-spine, story-scene, story-revise) whenever an iteration loop
  begins. Not typically user-facing — workflow skills apply this protocol
  internally.
  Trigger: /story-stop-loss, "how many times should I retry", "iteration cap",
  "stop revising", "when to stop", "convergence".
allowed-tools:
  - Read
  - Write
  - Edit
triggers:
  - story stop loss
  - iteration cap
  - stop revising
  - when to stop
  - convergence protocol
contract: {"purpose":"Stop-loss convergence protocol for any workflow skill that iterates on an artifact. Prevents infinite-revision spirals by enforcing: an iteration cap per artifact (default 5 rounds), a quality floor (structural predicates must pass), an escalation path when the cap is reached without convergence, and an abandon-and-restart option when escalation fails. Invoked by workflow skills (story-spine, story-scene, story-revise) whenever an iteration loop begins. Not typically user-facing — workflow skills apply this protocol internally. Trigger: /story-stop-loss, \"how many times should I retry\", \"iteration cap\", \"stop revising\", \"when to stop\", \"convergence\".","trigger":["/story-stop-loss","story stop loss"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["structured response or task-scoped story artifact"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["cliche-hunter","story-audit"],"fixtures":{"positive":"story-stop-loss:positive","negative":"story-stop-loss:missing-trigger"}}
generated: true
source: src/skills/story-stop-loss/SKILL.md
source-sha256: 6d73efd5c59cee894635b19f829ced2c8e0da7d1ff380e9fdb21ea5879c0f718
generator-version: 1.0.0
---

# Stop-Loss Convergence Protocol

Applied whenever a workflow skill enters a **generate → critique → revise** loop on a single artifact. Without this protocol, critic failures can spiral indefinitely, wasting compute and obscuring whether the problem is the artifact or the critic.

---

## The Protocol

### 1. Quality Floor (gates before the loop starts)

Before iterating, identify the **must-pass predicates** for this artifact type:

| Artifact | Must-pass predicates |
|---|---|
| Controlling Idea | Seven-point audit: all 7 pass |
| Spine | Every spine event is causal; MDQ stated; Inciting Incident disrupts the protagonist's world; Crisis is a true dilemma |
| Scene Card | Scene turns (value charge shifts); Turning Point is caused by a character decision, not coincidence |
| Prose draft | No on-the-nose dialogue in key beats; no dangling setups paid off by coincidence; voice consistent with anchors |
| Full draft (story-audit) | All structural predicates pass (every scene turns; Crisis is a true dilemma; Climax flows from decision; MDQ answered; Controlling Idea dramatized; genre obligatory scenes delivered) |

If the artifact is entering the loop and **already passes** all floor predicates: the loop is for *quality elevation*, not repair. Apply a lighter iteration budget (3 rounds max).

---

### 2. Iteration Cap

| Situation | Cap |
|---|---|
| Repair loop (artifact fails floor predicates) | **5 rounds** |
| Quality elevation loop (artifact passes floor) | **3 rounds** |
| Single-beat revision within a scene | **3 rounds** |
| Critic disagreement (one critic flags, others pass) | **2 rounds** |

A **round** = one full generate-critique-revise cycle on the same artifact.

Track rounds explicitly. Before each round: state "Round N of cap M."

---

### 3. Three-Strikes Rule for Repeated Failures

If the **same predicate fails on the same artifact across 3 consecutive rounds**:

1. **Stop the loop.** Do not run a 4th round on the same predicate failure.
2. **Escalate**: surface the failure to the user with:
   - Which predicate is failing
   - What has been tried across the 3 rounds
   - The closest-to-passing version produced
   - Two alternative approaches not yet tried
3. **Ask**: "Should I try approach A, approach B, or would you like to rethink the upstream constraint (e.g., the spine beat that's forcing this scene into a corner)?"

---

### 4. Cap Reached Without Convergence

When the iteration cap is reached and floor predicates still fail:

**Step 1 — Present the best candidate**: show the user the version that came closest to passing, with the remaining failures clearly labeled.

**Step 2 — Offer three paths**:
- **A — Manual edit**: user fixes the identified failure point; skill resumes from the fix.
- **B — Upstream mutation**: the failure may be caused by an upstream constraint (spine event, character True Character, world rule). Identify the most likely upstream cause; offer to backtrack and mutate it.
- **C — Abandon and restart with a different seed**: generate a fresh candidate from scratch, incorporating what was learned about why this seed kept failing.

**Never**: silently declare the failing artifact "good enough." If floor predicates aren't passing, the artifact is not done.

---

### 5. Backtracking Depth Limit

When the recommendation is upstream mutation (Path B above):

- **Backtrack one level at a time.** If Scene 2.3 keeps failing, examine the Scene Card before examining the spine event before examining the character.
- **Maximum backtrack depth: 3 levels** from the failing artifact. If 3 levels up still can't be mutated to fix the downstream failure: escalate to the user with a diagnosis ("This failure seems structural — the spine commits X which forces every scene in this sequence into Y").
- **After backtracking and mutating**: restart the loop from the mutated point. Reset the iteration cap.

---

### 6. How Workflow Skills Apply This Protocol

Each workflow skill that iterates should embed stop-loss logic as follows:

```
Before loop:
  - Identify floor predicates for this artifact type (from table above)
  - Set iteration cap (5 for repair, 3 for elevation)
  - Initialize round counter = 0

Each iteration:
  - Increment round counter
  - State: "Round {N} of {cap}"
  - If round counter > cap: apply §4 (Cap Reached)
  - Run one generate-critique-revise cycle
  - Check floor predicates
  - If same predicate fails 3 consecutive rounds: apply §3 (Three-Strikes)
  - If all floor predicates pass: exit loop, report convergence round

After loop:
  - Log: artifact name, rounds taken, predicates that required most rounds
  - If converged: commit artifact to lifecycle state
  - If not converged: do not commit; apply §4 paths
```

---

### 7. What Stop-Loss Does Not Do

- It does not prevent the user from requesting additional revision after convergence. User-requested revision is not subject to the cap.
- It does not apply to critic disagreements that are matters of taste, not structural predicates. If `cliche-hunter` flags something as a cliché but the writer defends it as an honored convention: not a stop-loss trigger.
- It does not apply to Pass 7 (Reader Simulation) in the revision pipeline — reader simulation is qualitative and does not produce pass/fail predicates.

---

### 8. Quick Reference Card

```
REPAIR loop:        5 rounds max
ELEVATION loop:     3 rounds max
SAME PREDICATE 3×:  escalate immediately (don't wait for cap)
CAP REACHED:        present best version + paths A/B/C
BACKTRACK DEPTH:    3 levels max, then escalate
NEVER:              silently declare failing artifact "done"
```
