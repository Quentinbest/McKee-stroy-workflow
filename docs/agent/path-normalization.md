# Path Normalization

## Rules

- Canonical framework paths are repository-relative and use `/`.
- Skills live under `src/skills/<skill-id>/`.
- Roles live under `src/roles/<role-id>.md`.
- Templates live under `src/templates/`.
- Generated paths are never canonical inputs.
- External wiki references use `MCKEE_WIKI_ROOT` at runtime.
- Story artifacts use story-project-relative paths such as `drafts/{slug}/`.
- Absolute author or machine paths are forbidden in canonical skills and roles.

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `MCKEE_WIKI_ROOT` | Root of the `LLM-Wiki-Story` checkout | only when no sibling/local wiki exists |

## Compatibility

Legacy `skills/`, `agents/`, and `templates/` paths remain readable during v1.
New edits must target `src/`.
