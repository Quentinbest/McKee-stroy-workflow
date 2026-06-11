# Compatibility Ledger

Review date: 2026-06-08
Next review: 2026-09-01

| Harness | Baseline entry | Repository conformance | Native execution | Exception |
|---|---|---|---|---|
| Claude Code | `CLAUDE.md`, `.claude/` | 5/5 deterministic | HTTP 401 | owner-approved deterministic fallback |
| Cursor | `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/` fallback | 5/5 deterministic | CLI unavailable | manual fallback RC; plugin schema not yet verified for local generation |

## 2026-06-08 Cursor Packaging Review

- Verified official rules surface: project rules live in `.cursor/rules` and use MDC files. Source: [Cursor Rules docs](https://docs.cursor.com/context/rules-for-ai).
- Verified official skills surface: Cursor documents Agent Skills as a first-class primitive. Source: [Cursor Skills docs](https://cursor.com/docs/skills).
- Verified official plugin concept and marketplace existence, but not a stable local plugin manifest schema suitable for hand-written generation. Source: [Extend Cursor with plugins](https://cursor.com/blog/marketplace/).
- Repository consequence: RC artifacts use manual fallback under `.cursor/skills/` plus `rules/`; no `.cursor-plugin/plugin.json` is generated until the schema is documented and re-verified.
| Pi | `AGENTS.md`, `.agents/skills/` | 5/5 deterministic | Native verifier pass | none |
| OpenCode | `AGENTS.md`, `.agents/skills/`, `.opencode/agents/` | 5/5 deterministic | Native verifier pass after one correction | malformed first result recorded |
| Codex | `AGENTS.md`, `.agents/skills/`, `.codex/` | 5/5 deterministic | Native verifier pass after sandbox rerun | hidden-directory write restriction |

Removing a harness or weakening its safety boundary requires an ADR and major
version review.
