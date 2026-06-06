---
id: mck-beat-to-prose
version: 1.0.0
contract-version: 1
name: mck-beat-to-prose
description: |
  Translate a beat sheet into polished prose. Each beat (action/reaction unit)
  is performed through scene description, action, and dialogue — not explained.
  Applies voice anchors, subtext discipline, and specificity to every line.
  Invoke after beat-miner has produced a beat sheet, or when the writer has
  a beat sheet and wants to draft the prose.
  Trigger: /mck-beat-to-prose, "draft the prose", "write this beat", "turn
  beats into prose", "perform this scene".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - draft the prose
  - write this beat
  - turn beats into prose
  - perform this scene
  - beat to prose
contract: {"purpose":"Translate a beat sheet into polished prose. Each beat (action/reaction unit) is performed through scene description, action, and dialogue — not explained. Applies voice anchors, subtext discipline, and specificity to every line. Invoke after beat-miner has produced a beat sheet, or when the writer has a beat sheet and wants to draft the prose. Trigger: /mck-beat-to-prose, \"draft the prose\", \"write this beat\", \"turn beats into prose\", \"perform this scene\".","trigger":["/mck-beat-to-prose","mck beat to prose"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/voice-anchors.md","drafts/{slug}/characters/{names}.md","drafts/{slug}/scenes/{act}-{scene}.md","drafts/{slug}/prose/{act}-{scene}.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["mck-subtext-5layer","story-scene"],"fixtures":{"positive":"mck-beat-to-prose:positive","negative":"mck-beat-to-prose:missing-trigger"}}
---

# Beat-to-Prose Translation

A beat sheet is a **score**. Prose is the **performance**. The same beats can be played in infinite ways — your job is to choose the performance that most honors the score while adding the irreducible texture of lived experience: sensory detail, rhythm, the specific weight of this particular gesture.

## Before You Start

Read these files if they exist:
- `drafts/{slug}/voice-anchors.md` — voice style rules
- `drafts/{slug}/characters/{names}.md` — character files for characters in the scene
- `drafts/{slug}/scenes/{act}-{scene}.md` — the Scene Card for objective/conflict/turn
- `wiki/en/concepts/subtext.md` — subtext reminders

## The Beat-to-Prose Process

### For each beat in the sheet:

**1. Identify what the beat is doing** (not what it says)
- What is the *action*? (One character tries something on another)
- What is the *reaction*? (The other character responds — gap opens or closes)
- What is the *gap*? (Expected vs. actual result — this is where story lives)

**2. Choose the mode of performance**
A beat can be performed through any combination of:
- **Action** — physical movement, gesture, object use
- **Dialogue** — subtext-layered (see `/mck-subtext-5layer`)
- **Interior** (if POV allows) — thought or sensation, not explanation
- **Silence / absence** — what is not said or done

Choose the mode that makes the subtext richest. If the obvious mode is dialogue, try writing the beat in action first.

**3. Apply the Specificity Rule**
Every noun and verb must be the *specific* one, not the generic one:
- ❌ "He picked up a cup." → ✅ "He picked up the cup she'd left on the wrong side of the sink, deliberately, and moved it to his side."
- ❌ "She looked at him." → ✅ "She looked at the wall behind him."
- ❌ "They argued." → ✅ "He recited the invoice line by line, slowly, until she interrupted."

**4. Apply the Sensory Rule**
Default away from vision. Each beat should involve at least one non-visual sense:
- Sound (the specific sound, not "noise")
- Touch/proprioception (weight, temperature, texture)
- Smell (the most memory-triggering sense)
- Taste (rare; use sparingly for maximum impact)

**5. Apply the Rhythm Rule**
Sentence length = emotional pace:
- Long sentences with subordinate clauses: contemplation, observation, dread building slowly
- Short sentences: shock, decision, violence, sex
- Fragments: consciousness fragmenting under pressure
- Run-ons: obsessive thought, panic, the mind refusing to stop

**6. Write, then cut**
Write the beat slightly long. Then cut everything that is:
- Explained (show, don't tell — but more precisely: *perform*, don't explain)
- Repeated (if the gesture does the work, cut the dialogue that says the same thing)
- On-the-nose (see `/mck-subtext-5layer`)

## The Gap as Prose Opportunity

The Gap (expectation vs. result) is where story lives — and where prose should linger. When a character expects one thing and gets another, the *texture* of that discrepancy is the prose's job.

Examples of gap as prose:
- Expected: a warm greeting. Got: an empty room. The prose dwells on what the room looks like when it should have had someone in it.
- Expected: agreement. Got: silence. The prose makes the silence specific — the quality of it, its weight, what the character does inside it.

## After Each Beat: Voice Check

After drafting a beat, read it aloud (or imagine it). Ask:
- Does this sound like the story's established voice?
- Are the sentence rhythms consistent with adjacent beats?
- Is there a word that's too modern, too formal, too casual for the register?

If voice anchors exist (`voice-anchors.md`), check the draft against them.

## Output Format

Write directly into the prose file: `drafts/{slug}/prose/{act}-{scene}.md`

You may add a beat-progress comment as you go, to resume mid-scene without re-reading everything:
```
<!-- Beat 1 complete -->
<!-- Beat 2 complete -->
```

**These comments are scaffolding, not prose — strip them before the scene is committed.** Likewise, keep *all* authoring annotation (beat refs, belief-tracking, `Seq` cross-refs, magnitude tags, age/disambiguation tags) out of the prose body: put it in frontmatter or under a trailing `<!-- AUTHORING (stripped at publish) -->` fence (see `/story-scene` Step 9A). Inline authoring tokens written into paragraphs become reader-facing pollution that has to be excavated at publish — and some force last-minute worldbuilding decisions. Decide the reader-facing form as you draft.

## Common Beat-Level Failures

| Failure | Symptom | Fix |
|---|---|---|
| Explained emotion | "She felt angry" | Show the micro-behavior that signals anger |
| Double-performance | Action + dialogue say the same thing | Cut one |
| Rhythm monotony | All sentences same length | Vary; place a fragment after a long observation |
| Generic action | "He walked to the door" | Specify: *how* he walks says everything |
| Skipped gap | Beat moves to next without registering the discrepancy | Add 1-3 lines on the texture of the unexpected result |
| Narrated realization | `他知道…` / `不是X，是Y` / `他听懂了…底下的意思` — naming the insight the prose just dramatized | Delete the naming. Trust the behavior to carry it. |
| Dash-gloss | A strong behavioral beat, then `——` and a clause explaining what it meant | Cut the gloss; let the beat stand. The fix is subtraction. |

> The last two are insidious because they read as "deep." They are the drafter explaining its own subtext — the single most common note from the cliché and subtext critics, and they cluster in *freshly written* prose. If the persona's Refusals include narrated interiority, these violate it directly. Catch them as you write, not at audit.
