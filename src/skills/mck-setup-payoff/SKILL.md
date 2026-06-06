---
id: mck-setup-payoff
version: 1.0.0
contract-version: 1
name: mck-setup-payoff
description: |
  Build and audit the story's setup-payoff ledger — every element planted for
  future use is logged with its intended payoff scene; every payoff is traced
  to its setup; dangling setups and groundless payoffs are detected and remedied.
  Use after a full draft, before final polish, or whenever a payoff "comes from
  nowhere" or a planted element never returns.
  Trigger: /mck-setup-payoff, "setup payoff", "ledger", "check the setups",
  "planted elements", "dangling setup", "groundless payoff", "Chekhov's gun".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
triggers:
  - setup payoff
  - setup-payoff ledger
  - check the setups
  - planted elements
  - dangling setup
  - groundless payoff
  - chekhov's gun
contract: {"purpose":"Build and audit the story's setup-payoff ledger — every element planted for future use is logged with its intended payoff scene; every payoff is traced to its setup; dangling setups and groundless payoffs are detected and remedied. Use after a full draft, before final polish, or whenever a payoff \"comes from nowhere\" or a planted element never returns. Trigger: /mck-setup-payoff, \"setup payoff\", \"ledger\", \"check the setups\", \"planted elements\", \"dangling setup\", \"groundless payoff\", \"Chekhov's gun\".","trigger":["/mck-setup-payoff","mck setup payoff"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/spine.md","drafts/{slug}/state.json","drafts/{slug}/prose/**/*.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["return control to the primary agent"],"fixtures":{"positive":"mck-setup-payoff:positive","negative":"mck-setup-payoff:missing-trigger"}}
---

# Setup-Payoff Ledger

McKee's law: every payoff must trace to a setup. Every setup demands a payoff or must be cut. The audience accepts any revelation — however shocking — if the writer planted it faithfully. They accept nothing — however logical — that arrives without a setup.

---

## Step 1 — Load Context

Read:
- `drafts/{slug}/spine.md` — to understand what the story promises
- `drafts/{slug}/state.json` — the `setup_payoff_ledger` block, if populated
- All prose files in `drafts/{slug}/prose/**/*.md`

If `state.json` has an existing setup-payoff ledger, use it as starting inventory and verify against prose. Otherwise build from scratch.

---

## Step 2 — Catalog Setups

Read all prose. For every element that is **planted for later use**, log it:

**What counts as a setup:**
- Physical objects introduced without immediate plot function (a weapon, a letter, a photograph, a specific tool)
- Skills or knowledge attributed to a character that haven't been used
- Backstory facts revealed early ("she used to be a doctor")
- Information the protagonist lacks that will matter later
- Relationships established or hinted at before they become plot-relevant
- World rules stated that will later be invoked to cause or explain events
- Character contradictions planted that will flip under pressure
- Any image/motif given enough weight to promise significance

**For each setup, record:**

| Element | Setup scene | Setup method (shown / stated / hinted) | Payoff scene (planned/delivered/none) | Status |
|---|---|---|---|---|
| {element} | {scene} | shown/stated/hinted | {scene or "?"} | planted / delivered / dangling / groundless |

---

## Step 3 — Catalog Payoffs

Read the full prose with fresh eyes looking for **moments that rely on prior information.** For each payoff:

- Trace it backward: what setup makes this payoff *inevitable*?
- If no setup exists: flag as **groundless**
- If a setup exists but is too weak (too subtle, too far back, never reinforced): flag as **undersupported**

---

## Step 4 — Classify Each Item

**Planted (✅)** — has a setup AND a payoff, both adequate
**Delivered (✅)** — payoff has occurred and was earned
**Dangling (⚠️)** — setup exists but no payoff — the setup promised something that never arrived
**Groundless (❌)** — payoff exists but no setup — the story's answer to a question it never asked
**Undersupported (⚠️)** — setup exists but was too brief / too far back to do the work the payoff needs

---

## Step 5 — Diagnose and Prescribe

### For each Dangling setup:
*"Element [X] was set up in scene [A] but never paid off. Options:*
- *(a) Deliver the payoff in scene [suggested scene] — [brief description of how]*
- *(b) Cut the setup from scene [A] if the element serves no other purpose"*

Choose based on whether the element could plausibly enrich a later scene. Draft the payoff addition if option (a).

### For each Groundless payoff:
*"The payoff in scene [A] — [description] — has no prior setup. Plant a setup in [suggested scene] — [specific suggestion for what the setup could look like: shown briefly / mentioned in passing / attributed as backstory]."*

Draft the setup addition.

### For each Undersupported setup:
*"The setup in scene [A] is too brief to carry the payoff in scene [B]. Add a reinforcement in scene [middle scene] — a second mention, a closer look, a moment where the element becomes more specific."*

Draft the reinforcement.

---

## Step 6 — Apply the Inevitable-Surprise Test

For the story's most important payoffs (Climax, major reversals, character reveals), run this test:

1. **On first read**: Did the payoff feel surprising? (It should)
2. **On re-read**: Is every setup visible? (It must be)
3. **Verdict**: If surprising but not visible in retrospect → plant more setups. If visible but not surprising → the setups were too obvious, soften them.

The target: setups that a re-reader slaps their forehead at — *"It was there all along."*

---

## Step 7 — Update State

If `state.json` exists, update the `setup_payoff_ledger` array with the complete, classified inventory.

---

## Output

1. **Complete setup-payoff ledger** — all elements classified
2. **Dangling setups** — list with remediation options
3. **Groundless payoffs** — list with planting prescriptions
4. **Undersupported setups** — list with reinforcement suggestions
5. **Drafted additions** — prose insertions for all critical issues
6. **Inevitable-surprise verdict** on the 3 most important payoffs
