# Agent Context Index

This directory is the canonical, harness-neutral project context.

## Read First

1. [Project context](project-context.md)
2. [Architecture](architecture.md)
3. [Repository map](repository-map.md)
4. [Development workflow](development-workflow.md)
5. [Testing and verification](testing-and-verification.md)
6. [Safety and permissions](safety-and-permissions.md)
7. [Current migration state](current-state.md)

The active `tasks/TASK-*.md` contract, when present, defines temporary scope
and acceptance criteria. It cannot weaken repository safety policy.

## Authority Map

| Subject | Authority | Owner | Update trigger |
|---|---|---|---|
| Migration order and acceptance | implementation plan | framework | plan revision |
| Agent execution behavior | root/scoped `AGENTS.md` | framework | workflow change |
| Project purpose and boundaries | `project-context.md` | maintainers | product change |
| Canonical/generated ownership | `repository-map.md` | framework | path change |
| Contracts | `schemas/` plus contract docs | framework/domain | interface change |
| Safety policy | `safety-and-permissions.md` plus deterministic checks | security | risk change |
| Harness support | `harness-compatibility.md` | adapter owner | quarterly review |
| Current work | active task contract | task owner | every execution session |
| Decisions | `decisions/ADR-*.md` | decision owner | architectural change |

Summaries and generated adapters must point back to these authorities.

## Supporting Records

- [Inventory](inventory.md)
- [Legacy mapping](legacy-mapping.md)
- [Source provenance](source-provenance.md)
- [Path normalization](path-normalization.md)
- [Privacy classification](privacy-classification.md)
- [Migration risks](migration-risk-register.md)
- [Glossary](glossary.md)
- [Runbooks](runbooks/)
- [Decisions](decisions/)
