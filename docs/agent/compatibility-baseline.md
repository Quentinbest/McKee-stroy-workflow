# Harness Compatibility Baseline

Baseline date: 2026-06-06

## Supported Baseline

Support is defined by repository contract rather than a pinned proprietary
binary version. A harness is supported when it can:

1. Discover root project instructions.
2. Read Markdown skills or role prompts.
3. Perform scoped local file operations.
4. Run Node.js 20 or newer for deterministic verification.
5. Report command evidence.

Official documentation is reviewed quarterly. Optional native capabilities do
not define baseline support.

| Harness | Required discovery | Optional acceleration | Local CLI observed |
|---|---|---|---|
| Claude Code | `CLAUDE.md` importing `AGENTS.md` | skills, agents, hooks | yes |
| Cursor | `AGENTS.md`, `.cursor/rules/` | background/cloud agents | no |
| Pi | `AGENTS.md`, `.agents/skills/` | audited extensions | yes |
| OpenCode | `AGENTS.md`, `.agents/skills/` | native agents/plugins | yes |
| Codex | root/nested `AGENTS.md`, `.agents/skills/` | subagents, hooks | yes |

## Approved Exceptions

- Cursor conformance uses deterministic repository discovery tests until a
  Cursor CLI is installed.
- Native subagents, hooks, extensions, plugins, MCP servers, and network access
  are not required for baseline operation.
- Story-quality judgments are human-evaluated; deterministic structural gates
  remain mandatory.
