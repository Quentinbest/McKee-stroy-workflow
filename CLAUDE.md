# McKee Story Workflow — Project Guide for Claude Code

A McKee-native, hybrid Skill + Agent architecture for consistently and reliably producing great stories using Claude Code.

Built on Robert McKee's *Story: Substance, Structure, Style and the Principles of Screenwriting* (1997).

## Architecture

```
skills/mck-*          McKee methodology skills (the how-tos)
skills/story-*        Workflow skills (the lifecycle entry points)
agents/               Generator + critic agents (bounded, isolated work)
templates/            Project scaffolding (lifecycle.json, state.json)
benchmarks/           Dogfood benchmarks and calibration suites
tests/                Contract, e2e, and regression tests
scripts/              Verification and benchmark runner scripts
```

## Working on this repo

- The primary artifact is the skill and agent library. When editing skills/agents, keep the YAML frontmatter valid — every file needs `name` and `description` at minimum.
- Skills use `allowed-tools:` (Claude Code format); agents use `tools:` and `model:`. Agents run as isolated subprocesses via the `Agent` tool.
- Documentation is bilingual (EN + 中文). MANUAL.md and MANUAL-ZH.md are the user-facing docs.
- Templates in `templates/` use `{{placeholder}}` syntax; they're instantiated by workflow skills.
- The lifecycle state machine is authoritative: `lifecycle.json` tracks every project gate.

## Verify / test

```bash
# Verify Beat Gate contracts and fixtures
node scripts/verify-beat-gate.mjs

# Run the full test suite
node --test tests/*.test.mjs

# Run Beat Gate dogfood benchmark (synthetic Chinese story)
node scripts/run-beat-gate-dogfood.mjs
```

No build step — this is a docs + skills + agents repo. Verification means: frontmatter is valid, tests pass, Markdown renders correctly.

## Conventions

- **Skill naming**: `mck-*` = methodology, `story-*` = workflow entry point
- **Agent naming**: kebab-case, descriptive role (e.g., `cliche-hunter`, `subtext-whisperer`)
- **Frontmatter**: YAML between `---` fences. Skills: `name`, `description`, `allowed-tools`, `triggers`. Agents: `name`, `description`, `tools`, `model`.
- **Language**: bilingual EN + 中文 throughout docs and skills. Code/comments in English.
- **McKee terminology**: use McKee's exact terms — Spine, Crisis, Climax, Controlling Idea, Value Charge, Gap, Negation of Negation — not looser equivalents.
- **Critic independence**: critic agents must NOT see generator agent reasoning. They read the artifact cold.
- **Capability ladder**: every critic skill must define a fallback path (parallel agent → native tool → in-context sequential) for hosts that can't spawn agents.

## Dependencies

- **Claude Code** — primary host; skills and agents are authored for it
- **Node.js** (≥18) — for test/benchmark/verification scripts only; not required to use the skills
- **LLM-Wiki-Story** (https://github.com/Quentinbest/LLM-Wiki-Story) — McKee wiki that agents deep-load for authority pages
