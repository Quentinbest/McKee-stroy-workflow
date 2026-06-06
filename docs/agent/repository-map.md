# Repository Map

| Path | Contents | Editable | Owner |
|---|---|---:|---|
| `AGENTS.md` | universal execution policy | yes | framework |
| `docs/agent/` | canonical project context | yes | framework |
| `src/skills/` | canonical skill definitions | yes | domain |
| `src/roles/` | canonical bounded roles | yes | domain |
| `src/templates/` | canonical story templates | yes | framework/domain |
| `src/prompts/` | shared canonical prompts | yes | domain |
| `schemas/` | machine contracts | yes | framework |
| `scripts/` | deterministic framework tooling | yes | framework |
| `tests/` | fixtures and verification | yes | framework/security |
| `tasks/` | active and archived work contracts | yes | task owners |
| `.agents/skills/` | shared generated skills | no | generator |
| `.claude/` | generated Claude adapters and reviewed settings | generated/config only | adapters |
| `.cursor/rules/` | generated Cursor rules | no | generator |
| `.opencode/agents/` | generated OpenCode role adapters | no | generator |
| `.codex/`, `.pi/`, `opencode.jsonc` | reviewed runtime settings | yes, narrowly | security/adapters |
| `skills/`, `agents/`, `templates/` | v1 legacy compatibility snapshot | no new edits | migration |

## External Repositories

`/Users/quentin/Writing/LLM-Wiki-Story` is the current wiki checkout. This
repository must not modify it during framework generation or verification.
Portable resolution uses `MCKEE_WIKI_ROOT` or the documented fallback search.

Story repositories are separate and private by default. Framework tests use
synthetic fixtures under `tests/fixtures/`, never real manuscripts.
