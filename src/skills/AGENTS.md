# Canonical Skill Instructions

- Each directory contains one canonical `SKILL.md`.
- Keep stable `id`, semantic `version`, and `contract-version` metadata.
- Define trigger, exclusions, inputs, preconditions, ordered procedure,
  artifacts, quality gates, failure/stop-loss behavior, side effects, handoff,
  and fixtures through contract metadata.
- Preserve McKee terminology from `docs/agent/glossary.md`.
- Never embed private manuscripts, populated personas, credentials, or absolute
  machine paths.
- After edits, run contract checks and regenerate all skill adapters.
