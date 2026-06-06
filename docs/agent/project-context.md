# Project Context

## Mission

McKee Story Workflow is a cross-harness framework for planning, drafting,
auditing, revising, and exporting fiction with McKee-derived story methods.
It combines reusable creative skills, bounded specialist roles, deterministic
contracts, and human review.

## Users

- Writers developing private story projects.
- Maintainers evolving the workflow and McKee methodology.
- AI coding or writing agents operating through Claude Code, Cursor, Pi,
  OpenCode, or Codex.
- Reviewers validating safety, compatibility, and story quality.

## Scope

- Canonical skill and role definitions.
- Story lifecycle templates and artifact contracts.
- Cross-harness discovery adapters.
- Deterministic generation, verification, security, and drift controls.
- Read-only integration with the bilingual McKee wiki.
- Resumable task and artifact state.

## Non-Goals

- Storing private stories in this public framework repository.
- Replacing human story judgment with a numeric score.
- Requiring proprietary subagent, hook, plugin, or network features.
- Publishing or disclosing manuscripts without explicit approval.
- Maintaining separate prompt truth for each harness.

## Domain Boundaries

The framework owns workflow contracts and reusable methodology. The
`LLM-Wiki-Story` repository owns McKee reference content. Story repositories own
manuscripts, populated personas, research, and publication decisions.

## Product Principles

- Canonical source first; generated adapters second.
- One-agent baseline; optional native acceleration.
- Contracts and evidence over completion claims.
- Creative iteration is bounded by explicit stop-loss rules.
- Humans retain authority over private data, irreversible actions, subjective
  quality, and release.
