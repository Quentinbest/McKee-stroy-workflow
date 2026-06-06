---
id: story-publish
version: 1.0.0
contract-version: 1
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
contract: {"purpose":"Final assembly and export of a polished manuscript. Assembles all prose files in sequence, applies final line-level polish pass, verifies completeness, and exports to a clean manuscript file. Use after story-revise has completed all revision passes and the draft is marked \"polished\". Trigger: /story-publish, \"publish the story\", \"export the manuscript\", \"final assembly\", \"compile the story\", \"finish the manuscript\".","trigger":["/story-publish","story publish"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/prose/","drafts/{slug}/manuscript.md","drafts/{slug}/colophon.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["story-act","story-revise","story-scene","story-status"],"fixtures":{"positive":"story-publish:positive","negative":"story-publish:missing-trigger"}}
generated: true
source: src/skills/story-publish/SKILL.md
source-sha256: 984934a8f9a999b7d9caacac97aa540e5a3725f55df2fe0028f0ed7517203a15
generator-version: 1.0.0
---

# Final Assembly and Export

## Step 1 — Verify Readiness

Check `lifecycle.json`:
- `locked.polished` must be `true`
- If not, warn the user: *"The draft has not completed the revision passes. Do you want to publish anyway, or run `/story-revise` first?"*

## Step 2 — Inventory All Prose Files

Read all files in `drafts/{slug}/prose/` in scene order (1-1, 1-2, ..., N-M).
Check for missing scenes (gaps in the sequence). If gaps exist, flag them.

### Step 2.5 — Bleed scan (before assembling, not during line-polish)

Before concatenating anything, scan every prose body for authoring-annotation bleed (convention defined in `/story-scene` Step 9A). Resolve each hit at its **source scene file**, then re-inventory — do not patch the assembled manuscript (that desyncs it from its prose). Patterns:

- `<!--` … `-->` comments (incl. `<!-- Beat N -->`, `<!-- AUTHORING -->` blocks)
- `Seq \d`, `(Seq`, `本拍`, `magnitude`, beat/sequence cross-refs
- `✗`, `已证伪`, parenthetical `（…级）`/`（reason）` belief-litany shorthand
- Inline latin disambiguators next to CJK numbers (`calendar`, `physical`)
- Frontmatter field names leaking into body (`title:`, `value_open:`, etc.)

If a scan hit encodes reader-needed information (e.g. an age-system tag), it requires a content decision, not a silent delete — surface it to the user. AUTHORING fences are dropped wholesale; the prose body above them is what assembles.

### Step 2.6 — Length reconciliation

Read `target_total` and per-act budgets from `act-design.md`. Count the realized total and per-act lengths. If the realized draft is well under budget (or density is inverted — setup act fattest, payoff zone thinnest), **flag it before assembling**: a draft that lands at a fraction of its intended size is the most common silent failure, and publish is the last place to catch it. Offer `/story-act {act}` Step 6.5 + `/story-scene` expansion rather than shipping under-built.

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
- No metadata/frontmatter or authoring-annotation bleeds into prose (the Step 2.5 scan should already be clean — verify the assembled output once more)
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

Update `lifecycle.json`:
- `state: "done"`, `locked.published: true`
- `manuscript_built_at`: today's date (timestamp of this assembly). `/story-status` compares this against prose mtimes to detect a stale manuscript after later edits.
- Record the realized length (words/CJK) and, if `act-design.md` has a `target_total`, the realized-vs-target ratio in `notes`.

**Re-opening after `done`:** if the user later edits prose (e.g. expands an under-built act), the project is effectively back at `polished` — the manuscript, colophon counts, and notes are stale. Re-running `/story-publish` regenerates them and bumps `manuscript_built_at`. Do not treat `done` as immutable.

Output a completion summary to the user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {title} — COMPLETE
  {word count} words
  Manuscript: drafts/{slug}/manuscript.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Controlling Idea: {the sentence}
```
