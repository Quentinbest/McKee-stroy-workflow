---
id: arc-tracer
version: 1.0.0
contract-version: 1
name: arc-tracer
description: |
  Plot a character's arc — the trajectory of inner change or refusal to change —
  across the story's spine. Maps revelation moments, names the want-to-need
  transition, produces a beat-by-beat value-progression chart, and identifies the
  obligatory revelation scene. Runs in main context (iterative, user can redirect).
  Prefer this over the arc-tracer agent for collaborative, visible arc work.
  Trigger: /arc-tracer, "trace the arc", "character arc for {name}",
  "map {name}'s arc", "where does {name} change", "plot the arc".
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
triggers:
  - trace the arc
  - character arc for
  - map the arc
  - where does the character change
  - plot the arc
  - arc tracer
contract: {"purpose":"Plot a character's arc — the trajectory of inner change or refusal to change — across the story's spine. Maps revelation moments, names the want-to-need transition, produces a beat-by-beat value-progression chart, and identifies the obligatory revelation scene. Runs in main context (iterative, user can redirect). Prefer this over the arc-tracer agent for collaborative, visible arc work. Trigger: /arc-tracer, \"trace the arc\", \"character arc for {name}\", \"map {name}'s arc\", \"where does {name} change\", \"plot the arc\".","trigger":["/arc-tracer","arc tracer"],"exclusions":["unrelated requests","operations outside the active task scope"],"inputs":{"required":["active task or explicit user goal"],"optional":["story project artifacts","McKee wiki references"]},"preconditions":["applicable instructions and task scope are loaded","required private-data access is explicitly authorized"],"procedure":["follow the ordered workflow in the SKILL.md body","validate produced artifacts against the stated quality gates"],"artifacts":["drafts/{slug}/characters/{name}.md","drafts/{slug}/spine.md","drafts/{slug}/characters/{name}-arc.md"],"quality_gates":["required workflow steps are completed","outputs remain consistent with canonical terminology and task acceptance"],"failure_behavior":["report missing inputs or authorization as blocked","apply story-stop-loss when bounded revision limits are reached"],"side_effects":["task-scoped story artifact writes","no network or publication by default"],"handoff":["mck-arc-walk","story-scene"],"fixtures":{"positive":"arc-tracer:positive","negative":"arc-tracer:missing-trigger"}}
generated: true
source: src/skills/arc-tracer/SKILL.md
source-version: 1.0.0
source-sha256: f428e90e6784050655d8a80f5191baccfd5e0c51f33ae7fb2b0e66f355e64f30
generator-version: 1.0.0
verification-command: npm run agents:check-drift
---

# Arc Tracer — Character Trajectory Skill

This skill runs the arc-analysis methodology in main context, making the work visible and collaborative. For a fully isolated, agent-produced arc document, use the `arc-tracer` agent instead.

## What You Need

- A character to analyze (user specifies by name)
- `drafts/{slug}/characters/{name}.md` (character file)
- `drafts/{slug}/spine.md` (the story's spine)

## Full Methodology

Follow the complete **Arc Walk** methodology from `/mck-arc-walk`:

1. **Read the character file** — extract Want, Need, Wound, Contradictions, habitual worldview
2. **Read the spine** — identify all major events
3. **Place the character at opening** — value charge, active want, false worldview at story start
4. **Identify revelation moments** — at each spine event, ask: what does this character learn?
5. **Name the Want → Need transition** — the event where the character stops pursuing Want and begins serving Need (consciously or not)
6. **Build the value-progression chart** — scene-by-scene value charge table
7. **Identify the obligatory revelation scene** — the scene where True Character is finally, definitively revealed

## Show Work As You Go

After each step, show the user what you've derived. Ask for corrections. Arc analysis benefits from the user's knowledge of their characters — they may know things the file doesn't capture.

Example dialogue:
> "I've found Jake's Want as 'to make Maria admit fault.' Does that feel right for Act 2, or does his want shift earlier?"

## Output

Write the arc summary to `drafts/{slug}/characters/{name}-arc.md` using the format from `/mck-arc-walk`.

Flag to the user any arc problems discovered:
- **Arc stalls**: character unchanged across multiple scenes → specify which scenes
- **Arc warps**: sudden unmotivated change → specify where and why it feels unearned
- **Missing obligatory revelation scene**: True Character never definitively revealed → flag as scene design gap

After completing, suggest:
- `/story-scene` for the obligatory revelation scene if it needs drafting
- `/arc-tracer` on another character if the cast needs arc work
