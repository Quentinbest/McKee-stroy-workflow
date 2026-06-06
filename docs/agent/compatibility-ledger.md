# Compatibility Ledger

Review date: 2026-06-06
Next review: 2026-09-01

| Harness | Baseline entry | Repository conformance | Native execution | Exception |
|---|---|---|---|---|
| Claude Code | `CLAUDE.md`, `.claude/` | 5/5 deterministic | HTTP 401 | owner-approved deterministic fallback |
| Cursor | `AGENTS.md`, `.cursor/rules/` | 5/5 deterministic | CLI unavailable | plan-approved deterministic fallback |
| Pi | `AGENTS.md`, `.agents/skills/` | 5/5 deterministic | Native verifier pass | none |
| OpenCode | `AGENTS.md`, `.agents/skills/`, `.opencode/agents/` | 5/5 deterministic | Native verifier pass after one correction | malformed first result recorded |
| Codex | `AGENTS.md`, `.agents/skills/`, `.codex/` | 5/5 deterministic | Native verifier pass after sandbox rerun | hidden-directory write restriction |

Removing a harness or weakening its safety boundary requires an ADR and major
version review.
