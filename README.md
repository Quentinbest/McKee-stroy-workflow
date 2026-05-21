# McKee Story Workflow

A McKee-native, hybrid Skill + Agent architecture for consistently and reliably producing great stories using Claude Code.

Built on Robert McKee's *Story* methodology. See `story-plan.md` for the full implementation design.

---

## What This Is

A complete AI-agent workflow for story generation, organized into four layers:

```
skills/mck-*          McKee methodology skills (the how-tos)
skills/story-*        Workflow skills (the lifecycle entry points)
agents/               Generator + critic agents (bounded, isolated work)
templates/            Project scaffolding (lifecycle.json, state.json)
```

---

## Skills

### Methodology Skills (`/mck-*`)
Drop into `~/.claude/skills/` to make available globally in Claude Code.

| Skill | Purpose |
|---|---|
| `mck-subtext-5layer` | Author dialogue in 5 layers (Wound → Want → Fear → Tactic → Text). The most important single skill. |
| `mck-controlling-idea` | Forge the story's "value + cause" sentence |
| `mck-beat-to-prose` | Translate a beat sheet into polished prose |
| `mck-crisis-dilemma` | Sharpen a hard choice into a true dilemma |
| `mck-arc-walk` | Map a character's arc across the spine |
| `mck-gap-find` | Find the Gap (expectation vs. result) in any beat or scene |

### Workflow Skills (`/story-*`)
Full lifecycle from seed to manuscript.

| Skill | Purpose |
|---|---|
| `story-new` | Start a new project from any seed (dream, image, news, mood) |
| `story-status` | Dashboard — what's locked, what's next |
| `story-premise` | Generate and lock a Premise Card |
| `story-spine` | Build the story skeleton (Inciting Incident → Crisis → Climax) |
| `story-cast` | Design the full cast as a system of pressures |
| `story-act` | Plan an act's scene sequence |
| `story-scene` | Draft or revise a single scene (most-used skill) |
| `story-audit` | Run the full McKee critic suite |
| `story-revise` | Multi-pass revision orchestrator |
| `story-publish` | Final assembly and manuscript export |

### Refactored Skills (formerly agents)
| Skill | Purpose |
|---|---|
| `arc-tracer` | Plot a character arc (iterative, in main context) |
| `act-designer` | Design act structure and rhythm |
| `exposition-smuggler` | Convert info dumps into "exposition as ammunition" |
| `key-image-curator` | Identify and thread the Key Image across the story |
| `composition-conductor` | Cross-scene craft audit (pacing, setups, image threading) |

---

## Agents

Drop into `.claude/agents/` in your project directory.

### Generator Agents (produce artifacts)
- `premise-prospector` — 5-candidate premise slate
- `character-forger` — Character File with True Character + Dimensions
- `structure-skeleton` — Spine document
- `scene-architect` — Scene Cards
- `beat-miner` — Beat Sheets
- `prose-drafter` — Long-form prose from beat sheets *(new)*

### Critic Agents (audit, with fresh eyes)
- `cliche-hunter` — Clichés vs. honored conventions
- `antagonism-stress-tester` — Antagonism force balance
- `crisis-climax-auditor` — Dilemma authenticity, climax causality
- `subtext-whisperer` — Text ≠ subtext ≠ desire audit
- `continuity-supervisor` — World rules, character knowledge, physics *(new)*
- `tournament-judge` — Blind ranking of N candidates *(new)*

### Specialist Agents
- `cast-balancer` — Cast pressure matrix
- `genre-cartographer` — Genre Contract
- `setting-surveyor` — Four-dimensional setting + world rules
- `wiki-librarian` — McKee wiki maintenance

---

## Installation

```bash
# Clone this repo
git clone https://github.com/Quentinbest/McKee-stroy-workflow.git

# Install skills globally
cp -r McKee-stroy-workflow/skills/* ~/.claude/skills/

# Install agents into your story project
cp -r McKee-stroy-workflow/agents/* your-story-project/.claude/agents/

# Scaffold a new project
mkdir -p drafts/my-story/{characters,scenes,prose}
cp McKee-stroy-workflow/templates/lifecycle.json drafts/my-story/lifecycle.json
cp McKee-stroy-workflow/templates/state.json drafts/my-story/state.json
```

---

## Usage

Start a new story:
```
/story-new "I had a dream about a clockmaker who builds clocks that run backwards"
```

Work on a scene:
```
/story-scene 2.3
```

Apply subtext discipline to dialogue:
```
/mck-subtext-5layer
```

Run the full critic suite:
```
/story-audit
```

---

## The Architecture Decision

**Skills are the spine; Agents are the bounded workers.**

- Skills run in main context — visible, iterative, composable, cheap
- Agents run in isolation — for parallel work, adversarial critics, and long tasks that would burn parent context

See `story-plan.md` for the full design rationale, V1/V2/V3 roadmap, and the five hard problems the system addresses.

---

## Based On

Robert McKee, *Story: Substance, Structure, Style and the Principles of Screenwriting* (1997).

The McKee wiki this system queries lives at [LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story).
