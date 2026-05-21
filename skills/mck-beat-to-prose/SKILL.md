---
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

Add a beat-progress comment as you go:
```
<!-- Beat 1 complete -->
<!-- Beat 2 complete -->
```

This lets you resume mid-scene without re-reading everything.

## Common Beat-Level Failures

| Failure | Symptom | Fix |
|---|---|---|
| Explained emotion | "She felt angry" | Show the micro-behavior that signals anger |
| Double-performance | Action + dialogue say the same thing | Cut one |
| Rhythm monotony | All sentences same length | Vary; place a fragment after a long observation |
| Generic action | "He walked to the door" | Specify: *how* he walks says everything |
| Skipped gap | Beat moves to next without registering the discrepancy | Add 1-3 lines on the texture of the unexpected result |
