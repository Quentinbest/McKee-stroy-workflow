# Harness Compatibility

## Common Contract

All harnesses must discover `AGENTS.md`, use the same task contract and
canonical source, respect the same safety policy, produce the same required
artifacts, and run comparable repository checks.

| Harness | Entry | Skills | Roles | Runtime policy |
|---|---|---|---|---|
| Claude Code | `CLAUDE.md` | `.claude/skills/` | `.claude/agents/` | `.claude/settings.json` |
| Cursor | `AGENTS.md`, `.cursor/rules/` | `.cursor/skills/` | baseline single agent with documented Role fallback | native sandbox |
| Pi | `AGENTS.md` | `.agents/skills/` | baseline single agent | OS/process policy |
| OpenCode | `AGENTS.md` | `.agents/skills/` | `.opencode/agents/` | `opencode.jsonc` |
| Codex | root/scoped `AGENTS.md` | `.agents/skills/` | optional native delegation | `.codex/config.toml` |

## Capability Ladder

1. Baseline: one agent, local files, deterministic scripts.
2. Native read-only subagents or critics.
3. Isolated write delegation in worktrees.
4. Reviewed hooks/plugins/extensions.

Higher levels may accelerate work but cannot change acceptance or safety.

## Exceptions

Capability exceptions must document the missing optional feature, fallback,
verification equivalence, owner, and review date. Missing baseline discovery or
safety enforcement is not an acceptable exception.

See `compatibility-baseline.md` for the observed local environment.
See `package-installation.md` for generated RC layouts, installation commands,
and the isolated verification boundary.
