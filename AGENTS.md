# McKee Story Workflow — AGENTS.md

This file provides the instructions that Codex, OpenCode, and Pi agents need to work with this repository.

## What this repo is

A McKee-native story generation platform built on Robert McKee's *Story* (1997). It contains:

- **Skills** (`skills/`): Claude Code skill files (SKILL.md with YAML frontmatter). On non-Claude-Code hosts, paste/load the SKILL.md content as a prompt. Each skill includes a capability ladder that degrades gracefully (parallel agent → native critic tool → in-context sequential).
- **Agents** (`agents/`): Bounded worker agents with YAML frontmatter. On Claude Code they're spawned via the `Agent` tool; on other hosts, treat them as standalone prompt templates.
- **Templates** (`templates/`): JSON and Markdown templates for project scaffolding.
- **Benchmarks + Tests** (`benchmarks/`, `tests/`): Node.js verification suites.

## Cross-platform capability ladder

Every critic skill defines a 3-rung capability ladder. On non-Claude-Code hosts, use the highest available rung:

1. **Parallel agents** — only on Claude Code with `Agent` tool support.
2. **Native critic tools** — Pi exposes `cliche_hunt`, `subtext_check`, `antagonism_test`, `pacing_analyze`, `reader_simulate`, `setup_payoff`. Call these as tools if available.
3. **In-context sequential** — run each critic pass yourself, one at a time, with a **fresh-eyes reset** between passes. Before each pass, state "Reading only for {dimension}; ignoring all other concerns," and judge against that dimension alone. Do not let one pass's conclusions leak into the next.

Record which rung you used in the final report header (`Execution mode: parallel-agents | native-tools | in-context-sequential`), because in-context audits are weaker and the user should know.

## Using skills on non-Claude-Code hosts

Skills are plain Markdown files with YAML frontmatter. To use one:

1. Read the skill file from `skills/<skill-name>/SKILL.md`
2. Paste/load it as a system prompt or initial instruction
3. Follow the numbered steps; the skill handles the rest

The `allowed-tools` frontmatter field is Claude Code-specific and can be ignored on other hosts. The `triggers` field lists natural-language phrases that invoke the skill on Claude Code; use them as a reference for when to manually load the skill.

## Agent invocation (non-Claude-Code)

Agent files in `agents/` are self-contained prompt templates. To use one:

1. Read the agent file
2. Provide the input artifacts specified in the agent's opening instructions
3. The agent returns its report to the specified output path
4. The orchestrating skill reads the report and continues

## Project conventions

- Bilingual EN + 中文 documentation
- McKee terminology: Spine, Crisis, Climax, Controlling Idea, Value Charge, Gap, Negation of Negation
- Critic agents must read artifacts cold (no generator reasoning context)
- Every lifecycle gate is tracked in `lifecycle.json`
