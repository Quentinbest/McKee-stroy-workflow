---
id: mck-honesty
version: 1.0.0
contract-version: 1
name: mck-honesty
description: |
  Tests, stresses, and repairs a Controlling Idea against the Honesty Engine —
  the three-check suite that separates a story worth telling from a bumper
  sticker. Answers: does the author actually believe this? Is it dramatized
  by structure or only asserted by dialogue? Does the Counter-Idea get a fair
  fight? Three modes: TEST (run the gauntlet), STRESS (generate the hardest
  counter-case), REPAIR (find the grounded version when the CI fails).
  Invoke before locking a CI, after controlling-idea-architect FORGE, and
  once the draft is complete to verify the structure proved the idea.
  Trigger: /mck-honesty, "test the controlling idea", "is this theme true",
  "honesty check", "does the story earn this", "what's the counter-idea".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - mck honesty
  - test the controlling idea
  - is this theme true
  - honesty check
  - does the story earn this
  - what's the counter-idea
contract: {"purpose":"Tests, stresses, and repairs a Controlling Idea against the Honesty Engine — the three-check suite that separates a story worth telling from a bumper sticker. Answers: does the author actually believe this? Is it dramatized by structure or only asserted by dialogue? Does the Counter-Idea get a fair fight? Three modes: TEST (run the gauntlet), STRESS (generate the hardest counter-case), REPAIR (find the grounded version when the CI fails). Invoke before locking a CI, after controlling-idea-architect FORGE, and once the draft is complete to verify the structure proved the idea. Trigger: /mck-honesty, \"test the controlling idea\", \"is this theme true\", \"honesty check\", \"does the story earn this\", \"what's the counter-idea\".","trigger":["/mck-honesty","mck honesty"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/controlling-idea.md","drafts/{slug}/persona.md","drafts/{slug}/spine.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["controlling-idea-architect","crisis-climax-auditor","story-audit","story-revise","story-spine"],"fixtures":{"positive":"mck-honesty:positive","negative":"mck-honesty:missing-trigger"}}
generated: true
source: src/skills/mck-honesty/SKILL.md
source-version: 1.0.0
source-sha256: c26ab4f7274d603da45da1df02e9ba4cb8e8779e132318a32d7dd71f135ee079
generator-version: 1.0.0
verification-command: npm run agents:check-drift
---

# Honesty Engine

Stories assert things. The system can generate a story that *says* "power corrupts" by having a protagonist fail through hubris — but this may be structural compliance only, not truth. The Honesty Engine asks three questions that structural compliance cannot answer:

1. **Belief**: does the author actually believe this, and where is the evidence?
2. **Structure**: is the CI proved by events, or only stated in dialogue?
3. **Counter**: does the Counter-Idea get a genuine fight — not a straw man?

A CI that fails any of these three is a wish, not a truth. The Honesty Engine does not find "correct" CIs. It finds grounded ones.

---

## Mode A — TEST

*Use when: a CI has been forged (via `controlling-idea-architect` or `story-spine`) and needs to be tested before building begins.*

### A1 — Read

Load:
1. `drafts/{slug}/controlling-idea.md`
2. `drafts/{slug}/persona.md` (for Truth Library)
3. If draft exists: `drafts/{slug}/spine.md` and any completed prose

If no CI file: ask user to state the CI, or run `/controlling-idea-architect FORGE` first.

### A2 — Run the Three Checks

**Check 1 — Belief Test**

Ask the author: "What evidence — from lived observation, not from fiction — supports this claim?"

If the persona's Truth Library has an entry matching the CI's domain: cite it. If not: flag the gap.

Scoring:
- **Grounded**: CI maps to a specific Truth Library entry with hardest-counter represented
- **Plausible**: CI is defensible but not directly supported by Truth Library
- **Asserted**: CI is a common moral claim with no particular evidence behind it

If Asserted: the CI is a bumper sticker. Proceed to Mode C (REPAIR).

**Check 2 — Structure Test**

Three structural sub-checks:

a. *Strip-dialogue test*: strip all dialogue and narration from the spine (events only). Does the Controlling Idea still emerge from the event sequence? If the CI requires a character to *say* it for it to be present: fail.

b. *Belief-reversal test*: replace the protagonist's stated beliefs with their opposite. Does the story still arrive at the same Controlling Idea? If yes: the structure doesn't support the idea — only the dialogue does.

c. *Antagonist-as-Counter test*: does the antagonist (or a subplot force) embody the Counter-Idea in action — not just in speech? The Counter-Idea must be *shown to fail* in specific circumstances, not declared weak by the narrative.

Score each sub-check: ✅ PASS / ❌ FAIL

**Check 3 — Counter Test**

Identify the Counter-Idea (the value or belief the CI negates).

Rate the Counter-Idea's representation in the story:
- **Full fight**: antagonist embodies the counter; it fails for specific, demonstrated reasons
- **Partial fight**: counter is present but loses because the protagonist is strong, not because the counter is shown to fail
- **Straw man**: counter is represented by a weak character or dismissed without dramatization
- **Absent**: story contains no character or event that takes the counter seriously

Full fight required. Anything less: the CI is asserted, not proved.

### A3 — Deliver Verdict

Present:

```
CONTROLLING IDEA: {CI sentence}

CHECK 1 — BELIEF:      {GROUNDED / PLAUSIBLE / ASSERTED}
  Evidence: {what supports it or what's missing}
  Truth Library match: {entry, or "none — gap to fill"}

CHECK 2 — STRUCTURE:
  Strip-dialogue test:       ✅ / ❌  ({notes})
  Belief-reversal test:      ✅ / ❌  ({notes})
  Antagonist-as-counter:     ✅ / ❌  ({notes})

CHECK 3 — COUNTER-IDEA:
  Counter: {the opposing claim}
  Representation: {FULL FIGHT / PARTIAL / STRAW MAN / ABSENT}
  Notes: {what would make it a full fight}

VERDICT:  GROUNDED (ready to build) / REPAIR NEEDED (see Mode C)
```

If verdict is GROUNDED: confirm CI is ready for the spine. The Counter-Idea's specific defeat-mechanism must be designed into Act 2–3.

If verdict is REPAIR NEEDED: offer Mode C.

---

## Mode B — STRESS

*Use when: CI passed the initial test, but you want to find the strongest possible objection before committing. Also useful mid-draft when the story feels like it's preaching.*

### B1 — Steel-Man the Counter

Generate the strongest possible case *against* the CI. Not a weak objection — the single hardest real-world circumstance where the CI would be false.

Format:
```
CI: {the claim}
Counter-claim: {the strongest opposing claim}
Steel-man: {specific scenario where the counter-claim is demonstrably true}
Stories that dramatize the counter: {exemplars}
```

### B2 — Gap Analysis

Compare the steel-man to the story's antagonist design:

- Does the antagonist embody this specific counter-claim?
- Does the story's Act 2 ever put the protagonist in the steel-man scenario?
- If the CI is "power corrupts" and the steel-man is "power held by someone with nothing left to lose can be redemptive" — is that case present and then defeated, or simply absent?

If absent: the CI has not been stress-tested by the narrative. Recommend adding a subplot or antagonist dimension that represents the steel-man.

### B3 — Deliver

```
STEEL-MAN SCENARIO: {specific case where CI is false}
IS IT REPRESENTED? {yes (where) / no}
RECOMMENDATION: {what to add to give the steel-man its due}
```

---

## Mode C — REPAIR

*Use when: CI failed the TEST (Asserted verdict) or doesn't survive STRESS.*

### C1 — Diagnose the failure point

| Failure | Likely cause | Repair direction |
|---|---|---|
| Belief: Asserted | CI is a received idea, not an observation | Ground it in a specific Truth Library truth the author holds |
| Structure: dialogue-only | Events don't enact the CI | Add a spine event where the CI emerges from action, not speech |
| Structure: belief-reversal passes | Protagonist's stated position does all the work | Make the CI emerge from what the protagonist *does*, not what they *say* |
| Counter: straw man | Antagonist isn't a fully realized counter | Deepen antagonist's worldview; give them a scene that makes their position compelling |
| Counter: absent | No force in the story argues the other side | Introduce subplot or secondary character who embodies the counter |

### C2 — Generate Two Alternatives

For Belief failures: pull 2–3 items from the persona's Truth Library that are in the same theme-domain. Propose reformulations that are grounded in those truths.

For Structure failures: propose spine events (not dialogue) that would dramatize the CI. Be specific: "Scene in Act 2 where [protagonist] must [action] and the outcome [event] demonstrates [CI-mechanism] without anyone stating it."

For Counter failures: propose an antagonist revision or subplot addition that gives the Counter-Idea its strongest representation.

### C3 — Present and wait for lock

Show the user:
1. The diagnosis
2. Two candidate repairs (specific, not generic)
3. The implication of each repair for existing spine/character design

Do not apply any repair without user confirmation. Repairs to the CI cascade through the spine — the invalidation is significant.

---

## Integration Points

- **After `controlling-idea-architect FORGE`**: run Mode A TEST automatically on the chosen candidate before writing the CI card.
- **Before `story-spine` begins**: CI should have passed Mode A.
- **After first draft is complete**: run Mode B STRESS as part of `/story-audit` Pass 1 (Structure). The antagonist's full-fight status is a structural predicate.
- **In `/story-revise` Pass 1**: if crisis-climax-auditor finds the Controlling Idea is asserted rather than dramatized, use Mode C REPAIR to identify the structural gap.

---

## What the Honesty Engine Is Not

- It does not require the author to agree with the CI morally. A CI can be bleak, amoral, or even one the author finds repugnant — what matters is that the author has *observed* it as true in specific circumstances, not that they endorse it.
- It does not demand philosophical proof. "Truth Library" means "claims the author has witnessed" — not universal laws.
- It does not override the author's vision. If the author insists on a CI the engine rates as Asserted: note the risk (the story will feel like it's preaching) and proceed.
