---
name: story-tournament
description: |
  Tournament generation for high-stakes creative decisions — spawns N diverse
  candidates in parallel, then judges them blind against the project's CI,
  genre contract, and Author Persona. Extends beyond premises (where
  premise-prospector already runs a slate) to Controlling Ideas, Crisis designs,
  and Climax designs — the decisions where a single default answer produces
  competent-but-forgettable work. Six tournaments available: PREMISE (5),
  CONTROLLING-IDEA (3), INCITING-INCIDENT (3), PROTAGONIST (3), CRISIS (5),
  CLIMAX (5). Each enforces candidate diversity (polarity, interiority, genre
  hybridization). Runs tournament-judge blind against all candidates.
  Trigger: /story-tournament, "tournament", "generate alternatives", "give me
  options", "run a tournament", "what are my climax options", "competing premises".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - tournament
  - generate alternatives
  - give me options
  - run a tournament
  - what are my climax options
  - competing premises
  - Agent
  - story tournament
  - run a tournament
  - generate alternatives
  - give me options
  - what are my climax options
  - competing premises
  - tournament generation
---

# Tournament Generation

The default creative decision — the first answer, the obvious choice — averages toward the competent and forgettable. Tournament generation is the mechanism for exceeding the default: generate N candidates that differ in kind (not just in surface detail), judge them blind, and commit to the winner rather than the reflex.

The premise-prospector agent already runs a 5-candidate tournament on premises. This skill extends that architecture to the five other high-stakes decisions where the default answer is most damaging.

---

## Tournament Selection Guide

| Decision | Tournament | Size | When to run |
|---|---|---|---|
| Premise | PREMISE | 5 | At project start (premise-prospector already handles this) |
| Controlling Idea | CONTROLLING-IDEA | 3 | After premise is locked, before spine begins |
| Inciting Incident | INCITING-INCIDENT | 3 | When spine's Inciting Incident feels generic or weak |
| Protagonist's True Character | PROTAGONIST | 3 | When cast feels flat or pressure system is weak |
| Crisis dilemma | CRISIS | 5 | When crisis feels like a hard choice, not a true dilemma |
| Climax design | CLIMAX | 5 | When climax follows too predictably from the Crisis |

---

## Diversity Enforcement

Tournament candidates must differ in kind, not just surface. For each tournament, the system enforces a minimum diversity set. Generating 3 or 5 versions of the same idea with different names is not a tournament.

| Slot | Required difference |
|---|---|
| **Idealist candidate** | CI / outcome that confirms a positive value (life, love, freedom, truth) |
| **Pessimist candidate** | CI / outcome that negates the same value — the world wins |
| **Ironic candidate** | Protagonist achieves the stated want and loses the actual need — or vice versa |
| **Interiority-maximal** | The deciding moment is entirely internal — no external event triggers the Climax |
| **Behavioral** | The deciding moment is entirely in action — no internal state determines it; behavior is the truth |

For 3-candidate tournaments: use idealist / pessimist / ironic.
For 5-candidate tournaments: add interiority-maximal and behavioral.

Before generating candidates, confirm to the user which slots will be filled by which candidates.

---

## Tournament A — CONTROLLING-IDEA

### A1 — Load

Read:
1. `drafts/{slug}/premise-card.md`
2. `drafts/{slug}/persona.md` (for Truth Library and Animating Belief)
3. `drafts/{slug}/genre-contract.md` (if exists)

### A2 — Generate 3 candidates

Run `/controlling-idea-architect FORGE` three times, forcing different polarities:

**Candidate 1 — Idealist**: the CI's value is affirmed by the protagonist's journey. Life/love/freedom/justice wins because of a specific causal mechanism rooted in the protagonist's decision.

**Candidate 2 — Pessimist**: the CI's value is negated. The world or the protagonist's fatal flaw defeats the positive value. The cause is specific and structural, not arbitrary.

**Candidate 3 — Ironic**: the protagonist achieves the stated want and the result is the opposite of what was desired. Or: the protagonist achieves the need by losing the want. The CI is a recognition, not a triumph or defeat.

Each candidate must also pass the Honesty Engine's Belief check (Mode A, Check 1 of `/mck-honesty`): is there a Truth Library entry that supports this claim, or is it asserted?

### A3 — Judge blind

Spawn `tournament-judge` with all three candidates and:
- The premise card
- The genre contract
- The persona's Animating Belief

Brief: "Rank these three Controlling Idea candidates by McKee's criteria. Consider: (1) Is the CI one sentence naming a value and a cause? (2) Is it falsifiable by the story's events — does it make a specific, testable claim? (3) Is it grounded in truth, not in moral platitude? (4) Does the Counter-Idea have room to be a full fight? (5) Which candidate is most aligned with the Author Persona's Animating Belief?"

Judge does not know which candidate was generated for which slot.

### A4 — Present ranked results + run Honesty Engine

Show the ranking. For the winner: run `/mck-honesty TEST` immediately. If the winner fails the Honesty Engine: show the runner-up and run it through the same test. Do not lock a CI that fails the Honesty Engine test.

On user confirmation: write `drafts/{slug}/controlling-idea.md` via `controlling-idea-architect`.

---

## Tournament B — INCITING-INCIDENT

### B1 — Load

Read:
1. `drafts/{slug}/premise-card.md`
2. `drafts/{slug}/controlling-idea.md`
3. `drafts/{slug}/characters/{protagonist}.md` (if exists)

### B2 — Generate 3 candidates

Each Inciting Incident must:
- Genuinely disrupt the protagonist's ordinary world (not merely introduce a new situation)
- Create a gap between what the protagonist expects and what they get (the Gap — expectation vs. result)
- Make the Major Dramatic Question inevitable (the audience must want to know the answer)

**Candidate 1 — External disruption**: the incident is imposed on the protagonist by an external force. The protagonist is passive in the moment of the incident; the world changes around them.

**Candidate 2 — Self-initiated disruption**: the protagonist makes a choice that disrupts their own world. The incident flows from their own action — they did this to themselves without fully knowing it.

**Candidate 3 — Delayed recognition**: the incident happened in the backstory; Act 1's inciting event is the protagonist's *discovery* that their world was already disrupted. The gap is between what they believed and what was actually true.

### B3 — Judge blind

Spawn `tournament-judge` with all three candidates and the CI.

Brief: "Rank these three Inciting Incident candidates. Criteria: (1) Does it genuinely disrupt the protagonist's ordinary world — not just introduce a new situation? (2) Does it make the Major Dramatic Question inevitable and urgent? (3) Does it create forward momentum — does the audience want to see what comes next? (4) Does it serve the Controlling Idea — is there a thematic connection between the incident and what the story is ultimately about?"

---

## Tournament C — PROTAGONIST True Character

*Use when the protagonist feels generic or when the antagonism stress-test shows the pressure system is weak.*

### C1 — Load

Read:
1. `drafts/{slug}/characters/{protagonist}.md`
2. `drafts/{slug}/spine.md`
3. `drafts/{slug}/controlling-idea.md`

### C2 — Generate 3 variants

Each variant mutates the protagonist's **True Character** — what they reveal under maximum pressure — not their Characterization (the surface). Same name, same Characterization. Different wound, different fear, different unconscious want.

**Variant 1 — Maximal contradiction**: the protagonist's conscious want and unconscious need are opposites. They actively work against what they need. The CI is proved when they stop fighting the need.

**Variant 2 — Hidden complicity**: the protagonist is partially responsible for the conditions that oppress them. They are not a victim — they are a participant. The wound is self-inflicted, or was self-inflicted by a choice they've buried.

**Variant 3 — Inverted wound**: the protagonist's apparent wound (what they show) conceals the real wound (what they hide). The apparent wound is how they defend against the real one. The story's Crisis strips the defense.

For each variant: rewrite the `True Character` and `Dimension` sections of the character file (show as draft, don't commit until judged).

### C3 — Run `antagonism-stress-tester` on each variant

Brief: "For this protagonist's True Character, test whether the forces of antagonism are adequate at every level (inner / personal / extra-personal) to make their victory or defeat expensive."

Judge blind across the three results.

---

## Tournament D — CRISIS Design

*Use when the Crisis is designed but feels like a hard choice rather than a true dilemma.*

### D1 — Load

Read:
1. `drafts/{slug}/spine.md` (the current Crisis beat)
2. `drafts/{slug}/controlling-idea.md`
3. `drafts/{slug}/characters/{protagonist}.md`

### D2 — Verify the dilemma requirement

A true dilemma requires irreconcilable goods or unavoidable evils. Hard choices (between clearly better and clearly worse options) are not dilemmas. The predicate: **the protagonist cannot have both; each option costs something irreplaceable.**

If the current Crisis is a hard choice: it fails the dilemma predicate. Proceed to generate 5 alternatives.

### D3 — Generate 5 candidates

**Candidate 1 — Good vs. Good**: two goods that cannot coexist. Choosing one destroys the other. Both are things the protagonist genuinely values.

**Candidate 2 — Bad vs. Bad (necessary evil)**: no good option exists. Both paths lead to genuine harm. The question is which harm the protagonist can live with — and what that choice reveals.

**Candidate 3 — Self vs. Other**: the protagonist's survival/success/freedom comes at the cost of someone they love. Or vice versa: someone else's survival costs the protagonist everything.

**Candidate 4 — Want vs. Need (recognition dilemma)**: the Crisis forces the protagonist to choose between what they consciously want and what they genuinely need. Taking the want destroys the need; taking the need requires surrendering the want.

**Candidate 5 — Value vs. Value (CI-testing dilemma)**: the protagonist must choose between the value the CI affirms and another value the story has built. The CI is proved only if the protagonist chooses correctly — and "correctly" has a cost.

### D4 — Judge + Honesty Engine

Spawn `crisis-climax-auditor` on each candidate (forward-projection: given this Crisis, does the Climax flow causally?).

Brief: "For each Crisis design: (1) Is this a true dilemma — are both options genuinely costly and irreconcilable? (2) Does the decision reveal the protagonist's True Character under maximum pressure? (3) Does the Crisis design allow a Climax that flows from the decision rather than from coincidence? (4) Does the dilemma make the Controlling Idea's verdict feel earned, not arbitrary?"

---

## Tournament E — CLIMAX Design

*Use when the Climax is being designed (after Crisis is locked).*

### E1 — Load

Read:
1. `drafts/{slug}/spine.md` (Crisis + locked Climax beat or stub)
2. `drafts/{slug}/controlling-idea.md`
3. `drafts/{slug}/genre-contract.md`
4. `drafts/{slug}/misdirection-plan.md` (if exists)

### E2 — Generate 5 candidates

All candidates must: flow causally from the Crisis decision (not from coincidence or new information); answer the MDQ; deliver the genre's obligatory scene.

**Candidate 1 — Positive Climax**: the value affirmed, the protagonist's decision leads to the positive pole. The Controlling Idea is proved by the protagonist winning at the CI's terms.

**Candidate 2 — Negative Climax**: the value negated. The protagonist's decision leads to loss, defeat, or failure. The Controlling Idea is proved by the protagonist's defeat — the negative pole is the truth.

**Candidate 3 — Ironic Climax**: the protagonist achieves their stated want and discovers it was the wrong thing. Or: loses everything they were fighting for and discovers they've become what the story needed them to become. The Controlling Idea is proved by the gap between the surface outcome and the inner one.

**Candidate 4 — Behavioral Climax**: the protagonist acts — a specific, concrete, observable physical or verbal action that is the Climax. No interiority required; the action *is* the CI dramatized.

**Candidate 5 — Recognition Climax**: the protagonist sees something they could not see before. The Climax is a revelation of true character — the protagonist's or another's — and the action is secondary. The CI is in the seeing, not the doing.

### E3 — Judge blind + Surprise check

Spawn `crisis-climax-auditor` on all 5 candidates simultaneously.
Spawn `tournament-judge` with all 5 candidates and the CI, genre contract, and persona.

If `misdirection-plan.md` exists: note in the judge's brief which candidate best enables the re-read moment at Climax.

Brief for `tournament-judge`: "Rank these five Climax designs. Criteria: (1) Does the Climax flow causally from the Crisis decision — no coincidence, no deus ex machina? (2) Does the Climax answer the MDQ in a way that feels earned? (3) Does the Climax dramatize the Controlling Idea at the value's final charge — not through speech, but through event? (4) Does it deliver the genre's obligatory scene? (5) Which candidate has the most potential for Inevitable-Surprise — the re-read experience?"

---

## After the Tournament: Cross-Tournament Coherence Check

When multiple decisions have been tournament-selected independently, run:

1. **CI ↔ Protagonist coherence**: does the selected CI's value map to the protagonist's wound/want/need? A CI about power and a protagonist whose wound is about love creates thematic drift.

2. **Inciting Incident ↔ Crisis coherence**: does the wound opened by the Inciting Incident become the exact pressure that makes the Crisis a dilemma? The Crisis should be the Inciting Incident's deepest consequence.

3. **Crisis ↔ Climax causality**: does the selected Climax flow from the selected Crisis decision? Run the counterfactual: if the protagonist had made the opposite Crisis choice, would the Climax have been different? If no: the Climax is not caused by the decision.

If any of these coherence checks fail: the weaker of the two conflicting artifacts must be re-run with the stronger as a constraint.

---

## Commit Protocol

After any tournament:
1. Write the winning artifact to its `drafts/{slug}/` file
2. Update `lifecycle.json` with the artifact path
3. Archive the runner-up candidates in `drafts/{slug}/tournament-archive/` — they may be useful if the winner is later revised
4. If the winner required a Honesty Engine pass or coherence check: note the result in `lifecycle.json` as metadata
