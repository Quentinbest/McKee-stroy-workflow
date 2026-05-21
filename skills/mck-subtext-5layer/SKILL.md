---
name: mck-subtext-5layer
description: |
  McKee's 5-layer subtext authoring model. Author dialogue by computing Wound →
  Want → Fear → Tactic first; surface Text is generated last, in service of the
  Tactic. Architecturally prevents on-the-nose writing. Use BEFORE drafting any
  dialogue-heavy scene, or to fix dialogue that already feels on-the-nose.
  Trigger: /mck-subtext-5layer, "subtext layers", "fix on the nose", "stop
  characters saying what they mean", "dialogue feels too direct", "subtext model".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - subtext layers
  - on the nose
  - fix this dialogue
  - subtext model
  - characters saying what they mean
---

# The 5-Layer Subtext Authoring Model

You are applying McKee's subtext discipline. The fundamental rule: **characters never say what they mean**. They pursue tactics. Their words perform their tactics. Their wounds shape their tactics. Text is the last thing you write, not the first.

## The Five Layers (always in this order)

### Layer 1 — Wound
The character's **deepest past pain** that is *active* in this specific moment. Not a backstory fact — an open wound that is being pressed, right now, by the circumstances of this scene.

- Ask: *What happened to this person that makes this moment uniquely threatening or resonant?*
- The wound warps perception: it makes the character see threats that aren't there, miss threats that are.
- If the wound isn't relevant to this scene, find the one that is.

### Layer 2 — Want
The character's **conscious desire** in this scene. Must be:
- **Active** — a verb, not a noun ("to make her admit", not "justice")
- **Specific** — this exact scene, not their life goal
- **Gettable** — the other character *could* give it
- **Refusable** — the other character *could* deny it

### Layer 3 — Fear
What the character **cannot admit they fear** about getting what they want. The fear is usually the shadow of the want: getting it would cost something, or expose something, or require vulnerability they cannot bear.

- Often connects directly to the Wound.
- The character is usually unaware of this fear, or aware but suppressing it.

### Layer 4 — Tactic
The **action** the character takes to make the other person do what they need. Tactics are verbs applied to people:

> "to wound" · "to seduce" · "to disarm" · "to interrogate" · "to corner" · "to charm" · "to shame" · "to pity" · "to recruit" · "to dismiss"

- Tactics **change** within a scene as resistance is met. A character starts by charming; when that fails, they wound; when that fails, they beg. The tactic shifts reveal desperation.
- Each line of dialogue is often a *new* micro-tactic within the macro-tactic.

### Layer 5 — Text
The surface utterance. **Generated last.** Never matches Want directly. Performs the Tactic. Is shaped by the Wound so that what the character *cannot say* leaks through the edges of what they *do* say.

## How to Use This Skill

**Step 1.** For each speaking character, fill in this table before writing any dialogue:

| Layer | Character A | Character B |
|---|---|---|
| **Wound** | | |
| **Want** | | |
| **Fear** | | |
| **Tactic** | | |
| **Text strategy** | | |

**Step 2.** Write the dialogue from Layer 5 only — each line performing its tactic, not stating its want.

**Step 3.** After drafting, run the cross-check: *"Does any line of Text ≈ Want?"* If yes, the line is on-the-nose. Rewrite by foregrounding the Tactic instead.

## Diagnostic — On-the-Nose vs Subtext

| On-the-nose | Subtext version |
|---|---|
| "Do you still love me?" | "You look tired. Is he keeping you up?" |
| "I'm afraid of losing you." | "I can get us tickets for next month. If you want." |
| "You never respected my work." | "The Whitmore account — you handled that yourself, right?" |
| "I need help." | [character starts making a small repair they clearly can't finish] |

The subtext version performs a tactic ("to wound", "to invite", "to diminish", "to be seen struggling") without stating the want.

## When Layers Collapse

Layers collapse when:
- **Fear is absent** → the character has no cost to wanting, so there's no tension
- **Tactic is too obvious** → the dialogue becomes transparent manipulation
- **Wound is wrong** → the scene feels unmotivated; try a different wound
- **Want is too diffuse** → nothing is at stake in *this* scene

If the scene still feels flat after applying the model, the problem is usually that the **Want is not gettable/refusable** — redesign what the character is actually after in this moment.

## Reading the Character Files

If character files exist (e.g., `drafts/{slug}/characters/{name}.md`), read them before filling in the layers. Look for:
- The stated **Wound** (often in the "True Character" or "Biography Spine" section)
- The stated **contradictions** (these often reveal the Fear)
- The character's habitual **tactics** (they have a tactical repertoire; this scene's tactic should fit that repertoire or mark a deviation)

If no character file exists, synthesize layers from what you know of the character so far, then suggest a character file be created.
