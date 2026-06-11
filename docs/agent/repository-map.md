# Repository Map

| Path | Contents | Editable | Owner |
|---|---|---:|---|
| `AGENTS.md` | universal execution policy | yes | framework |
| `docs/agent/` | canonical project context | yes | framework |
| `src/skills/` | canonical skill definitions | yes | domain |
| `src/roles/` | canonical bounded roles | yes | domain |
| `src/distribution/` | canonical package editions and classification manifest | yes | framework |
| `src/templates/` | canonical story templates | yes | framework/domain |
| `src/prompts/` | shared canonical prompts | yes | domain |
| `schemas/` | machine contracts | yes | framework |
| `scripts/` | deterministic framework tooling | yes | framework |
| `tests/` | fixtures and verification | yes | framework/security |
| `tasks/` | active and archived work contracts | yes | task owners |
| `dist/` | generated installable RC directories; Codex includes a local marketplace root | generated | release tooling |
| `release-assets/` | generated tarball exports and archive manifests | generated | release tooling |
| `reports/` | pilot/full package, doctor, install smoke, RC, archive, and release evidence | generated/reviewed | framework/release |
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
