# Compatibility Ledger

Review date: 2026-06-06
Next review: 2026-09-01

| Harness | Baseline entry | Repository conformance | Native execution | Exception |
|---|---|---|---|---|
| Claude Code | `CLAUDE.md`, `.claude/` | 5/5 pilots pass | CLI observed; model run not approved | offline baseline |
| Cursor | `AGENTS.md`, `.cursor/rules/` | 5/5 pilots pass | CLI unavailable | deterministic discovery fallback |
| Pi | `AGENTS.md`, `.agents/skills/` | 5/5 pilots pass | CLI observed; model run not approved | offline baseline |
| OpenCode | `AGENTS.md`, `.agents/skills/`, `.opencode/agents/` | 5/5 pilots pass | CLI observed; model run not approved | offline baseline |
| Codex | `AGENTS.md`, `.agents/skills/`, `.codex/` | 5/5 pilots pass | CLI observed; model run not approved | offline baseline |

Removing a harness or weakening its safety boundary requires an ADR and major
version review.
