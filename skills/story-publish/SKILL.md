---
name: story-publish
description: |
  Final assembly and export of a polished manuscript. Assembles all prose files
  in sequence, applies final line-level polish pass, verifies completeness, and
  exports to a clean manuscript file. Use after story-revise has completed all
  revision passes and the draft is marked "polished".
  Trigger: /story-publish, "publish the story", "export the manuscript",
  "final assembly", "compile the story", "finish the manuscript".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - publish the story
  - export the manuscript
  - final assembly
  - compile the story
  - finish the manuscript
  - story publish
---

# Final Assembly and Export

## Step 1 — Verify Readiness

Check `lifecycle.json`:
- `locked.polished` must be `true`
- If not, warn the user: *"The draft has not completed the revision passes. Do you want to publish anyway, or run `/story-revise` first?"*

## Step 2 — Inventory All Prose Files

Read all files in `drafts/{slug}/prose/` in scene order (1-1, 1-2, ..., N-M).
Check for missing scenes (gaps in the sequence). If gaps exist, flag them.

## Step 3 — Assemble the Manuscript

Create the output file `drafts/{slug}/manuscript.md`:

```markdown
# {title}

---

{Author's note if any — optional}

---

## Act One

### Scene 1

{prose from 1-1.md}

---

### Scene 2

{prose from 1-2.md}

---

...

## Act Two

...
```

Ensure:
- Scene breaks are marked consistently
- No duplicate headers
- No metadata/frontmatter bleeds into prose
- Character names are spelled consistently throughout

## Step 4 — Final Line-Level Polish

Do one final pass reading the assembled manuscript:
- Fix any prose that reads differently in assembled context vs. isolated
- Verify the opening paragraph hooks immediately
- Verify the closing paragraph lands the Key Image and Controlling Idea
- Check the title — does it resonate with the Key Image?

## Step 5 — Completeness Check

Verify the McKee completion checklist:
- [ ] Every act has a closing turning point
- [ ] The MDQ is answered at the Climax
- [ ] The Controlling Idea is dramatized (not stated) at the Climax
- [ ] The Key Image appears in the opening and lands at the Resolution
- [ ] At least one setup-payoff chain closes cleanly at the end
- [ ] No dangling subplots without resolution
- [ ] The final line earns its finality

## Step 6 — Export

The manuscript is at `drafts/{slug}/manuscript.md`.

Optionally write a `drafts/{slug}/colophon.md` with:
- Title, author, date completed
- Word count
- Controlling Idea (for the writer's reference)
- Notes on what was hard, what worked, what surprised

Update `lifecycle.json`: `state: "done"`, `locked: { all: true }`

Output a completion summary to the user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {title} — COMPLETE
  {word count} words
  Manuscript: drafts/{slug}/manuscript.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Controlling Idea: {the sentence}
```
