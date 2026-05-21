---
name: controlling-idea-architect
description: |
  Forge or audit a story's Controlling Idea — the single "value + cause" sentence
  every scene must serve (McKee Ch.6). Supports four modes: FORGE (premise → 3
  candidate ideas), STRESS-TEST (audit one idea), TRACE (draft → does it serve
  the idea?), REPAIR (broken idea → minimum-edit prescription). Produces the
  Controlling-Idea Card at drafts/{slug}/controlling-idea.md. Refactored from
  agent to skill — runs in main context for iterative refinement.
  Trigger: /controlling-idea-architect, "forge controlling idea", "stress test CI",
  "trace controlling idea", "repair controlling idea", "audit the theme",
  "CI audit", "is my controlling idea right".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - forge controlling idea
  - stress test CI
  - trace controlling idea
  - repair controlling idea
  - audit the theme
  - CI audit
  - is my controlling idea right
  - controlling idea architect
---

# Controlling Idea Architect

The Controlling Idea is the single most load-bearing sentence in any story: one declarative sentence stating how and why life changes from one condition to another — **value + cause**. Every scene, beat, and choice must ultimately serve this sentence.

Authority: McKee, *Story*, Chapter 6 — Structure and Meaning.

---

## Step 0 — Load Context

Before any work:

1. Read `drafts/{slug}/controlling-idea.md` if it exists — never silently overwrite a locked idea.
2. If genre contract exists (`drafts/{slug}/genre-contract.md`), read it — the CI polarity must match genre obligations.
3. If premise card exists (`drafts/{slug}/premise-card.md`), read it.
4. Check `wiki/en/concepts/controlling-idea.md` or `wiki/zh/concepts/controlling-idea.md` if available in the project. Load only what adds precision; do not spend context on wiki if premise + genre + draft give enough.

Respond in the user's language.

---

## Step 1 — Identify Mode

| What the user provides | Mode |
|---|---|
| Premise, logline, rough pitch | **FORGE** |
| One existing CI sentence | **STRESS-TEST** |
| Outline or draft + stated CI | **TRACE** |
| Draft/outline + broken CI judgment | **REPAIR** |

If unclear, ask once. Default to FORGE for new projects.

---

## What a Controlling Idea Is

**Template:** `[Value end-state] + because + [cause through action/choice]`

The **value** is a charged human universal (love, justice, freedom, truth, survival, meaning) named at its end-state at the Climax — positive, negative, or ironic.

The **cause** points to action and choice visible on the page, not to abstract forces ("fate," "society," "time") without behavioral anchors.

**McKee's own examples** (shape, not content):
- *Goodness triumphs when we outwit evil.* — *Witness*
- *Evil triumphs because it is part of human nature.* — *Chinatown*
- *Love endures when lovers refuse to compromise their individuality.*
- *Justice prevails because the protagonist is more cunning than the criminal.*

A CI is **not**: a theme word ("loss"), a moral lesson ("be kind"), an opinion ("war is bad"), or a question.

---

## Mode A — FORGE

Input: premise, logline, or pitch.

1. Extract the implied value from the premise's Object of Desire and the forces opposing it.
2. Generate **three candidate Controlling Ideas** with distinct polarities:
   - **Idealist**: positive value triumphs / the protagonist gets the need
   - **Pessimist**: negative value wins / the protagonist fails or pays fully
   - **Ironic**: the value appears to win but the cause reveals a hollowness; or wins in a form the protagonist cannot receive
3. For each candidate: run the Seven-Point Audit (see below).
4. Recommend one candidate with explicit reasoning (ties to genre polarity, premise's emotional charge, author persona if present).
5. Write the Controlling-Idea Card (see Card Format below).

---

## Mode B — STRESS-TEST

Input: one existing CI sentence.

Run the Seven-Point Audit. For each failing point: propose two rewrites that fix it with minimum drift from the original intention. Output the Idea/Counter-Idea matrix. Write or update the card.

---

## Mode C — TRACE

Input: outline or draft + the stated CI.

Produce a table:

| Scene | Scene Summary | Verdict | Notes |
|---|---|---|---|
| 1.1 | [summary] | **Serves** / **Drifts** / **Contradicts** | [brief note] |
| ... | | | |

A scene **Serves** if its value shift advances or tests the CI.
A scene **Drifts** if its value shift is orthogonal — neither testing nor contradicting.
A scene **Contradicts** if its value shift argues for the Counter-Idea without the story framing that as the Counter-Idea's temporary apparent victory.

End with: count of Serves / Drifts / Contradicts, plus a prioritized remediation list for Drifts and Contradictions.

---

## Mode D — REPAIR

Input: outline or draft whose CI has been judged faulty.

Two paths:

**Path 1 — Pull back to the original Idea**: identify the minimum set of scene changes that would make the CI land correctly at the Climax. List: which scenes change, which beats invert, which characters take new roles.

**Path 2 — Migrate to a stronger Idea**: if the story is already arguing a different CI than stated, name what the story *actually* proves, forge that as the new CI, stress-test it, then list what (if anything) needs to change to lock it.

Recommend one path with explicit reasoning.

---

## The Seven-Point Audit

Run on every CI, whether forged or received.

1. **One sentence.** If it needs a semicolon or "and," split it — you have two Ideas, which means you have none.
2. **Names a value.** The closing value must be a charged human universal expressed as an end-state (*justice prevails*, *love dies*, *meaning collapses*).
3. **Names a cause.** The "because" must point to action and choice, not to abstract forces without behavioral anchors.
4. **Climax-shaped.** Does the sentence describe what happens at the Climax, not the Inciting Incident or midpoint?
5. **Falsifiable on the page.** A reader/viewer who watches only the final 20% must be able to *see* the Idea proven. If no single frame shows the Idea landing, it isn't a CI — it's an essay topic.
6. **Argues, not lectures.** Reject "people should…", "we must…", "the lesson is…". McKee: *"A story's meaning must be dramatized, not stated."*
7. **Counter-Idea is alive.** A real CI has a worthy opponent on the page. If the Counter-Idea can't be named and embodied by a character or force, the Idea is too weak to govern the story.

Mark each: **PASS** or **FAIL**. If any FAIL: propose two rewrites that fix the failing point.

---

## The Idea / Counter-Idea Matrix

| Pole | Statement | Carried by | Climax behavior that proves it |
|---|---|---|---|
| Idea | … | character/force name | what happens that proves it |
| Counter-Idea | … | character/force name | how it almost wins, then fails |
| Negation of the Negation | … (the worst form — only if the story goes there) | … | … |

The Negation of the Negation is the most extreme negative: not the absence of the positive, but its perverse inversion. The story should visit Corner 4 before the Climax.

---

## Controlling-Idea Card Format

Write to `drafts/{slug}/controlling-idea.md`. If status is `locked`, diff and confirm before editing.

```markdown
---
title: "Controlling Idea — {Title}"
type: note
lang: en | zh
last_updated: YYYY-MM-DD
author: claude
mode: forge | stress-test | trace | repair
status: draft | locked
---

# Controlling Idea — {Title}

## The Sentence
> **{Value end-state} because {cause through action}.**

Polarity: *idealist / pessimist / ironic*

## Idea / Counter-Idea Matrix

| Pole | Statement | Carried by | Climax proof |
|---|---|---|---|
| Idea | … | … | … |
| Counter-Idea | … | … | … |
| Negation of the Negation | … | … | … |

## Seven-Point Audit
- [ ] One sentence
- [ ] Names a value
- [ ] Names a cause
- [ ] Climax-shaped
- [ ] Falsifiable on the page
- [ ] Argues, not lectures
- [ ] Counter-Idea is alive

## What This Idea Forbids
3–7 plot moves, character beats, or endings this Idea makes incoherent.

## What This Idea Demands
Obligatory beats this Idea forces into existence.

## Open Questions
≤5 items. End with: recommended next step and why.
```

---

## Hard Rules

1. **Never produce a CI that is a theme word, a question, or a moral instruction.** Rewrite into "value + cause" form or refuse and explain.
2. **Never invent details about the user's story.** If you need facts (genre, ending, protagonist's final choice) not supplied: ask once, then proceed with the strongest reading.
3. **Never silently edit `controlling-idea.md` if `status: locked`.** Diff and request confirmation.
4. **Never bypass the Counter-Idea.** A story without a worthy Counter-Idea is propaganda.
5. **Never let two competing CIs coexist.** Subplots may carry micro-ideas; the spine has exactly one. If the draft contains two competing spines: name the conflict, ask which one stays.
6. **Never write or modify pages under `wiki/`.** Output goes to `drafts/{slug}/`. Use `[[wikilinks]]` so the librarian can absorb later.

---

## Self-Check Before Returning

- Could a stranger, reading only the card, write the Climax of this story? If no: tighten the cause.
- If the cause clause were removed, would the sentence collapse into a theme word? If yes: the cause is too weak.
- Is the Counter-Idea something a reasonable, intelligent character could actually believe and act on? If no: the antagonism is straw — flag it.

End every response with a one-line **Handoff**: which downstream skill or agent should run next and why. (Typical: `structure-skeleton` after FORGE; `story-spine` after STRESS-TEST if passing.)

After every FORGE that selects a candidate: offer to run `/mck-honesty TEST` on the chosen CI before locking. The Honesty Engine tests whether the CI is grounded in the author's truth vs. asserted as a moral claim — a 5-minute investment that prevents building a story around a bumper sticker. If the user accepts: run it inline before writing `controlling-idea.md`.
