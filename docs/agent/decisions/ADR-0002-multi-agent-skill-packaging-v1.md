# ADR-0002: Multi-Agent Skill Packaging v1

Status: accepted
Date: 2026-06-08
Owner: codex

## Context

The framework has canonical Skills, Roles, contracts, and generated harness adapters, but no
durable packaging contract for distributing Skills to multiple agent hosts. An engineering
review approved a narrower v1 scope than the original packaging proposal in order to avoid
parallel installers, duplicate sources of truth, and premature host-specific complexity.

## Decision

- `src/distribution/packages.json` is the only canonical packaging manifest.
- Canonical Skill and Role formats remain unchanged in v1; packaging projects from existing
  inline contracts rather than migrating source formats.
- v1 editions are `core`, `workflow`, and `wiki-maintainer`.
- `core` and `workflow` are self-contained but mutually exclusive within the same install scope.
- A normalized in-memory `PackageModel` is built deterministically and then projected into
  host-specific package outputs. It is not a public release artifact.
- Claude Code, Codex, Cursor, and Pi rely on host-native plugin or package installation.
- OpenCode may use a constrained project-local overlay helper because it lacks an equivalent
  marketplace path in the current baseline.
- Codex v1 ships Skills only; specialist Roles fall back to in-context execution.
- Ordinary packages must remain fully offline-capable; the external wiki is an optional
  enhancement, never a required runtime dependency.
- Permission declarations in package manifests must declare their enforcement level as
  `native`, `runtime`, or `advisory`; advisory controls may not be represented as enforced.

## Alternatives

- A cross-host installer with shared install/update/uninstall state was rejected because the
  supported hosts already provide native package management in most cases, and duplicating
  that state would increase drift and conflict handling.
- A public "universal package" release artifact was rejected because users install host-native
  packages, not an intermediate model.
- Codex custom-agent overlays in v1 were rejected because they would reintroduce a second
  managed install surface before an official packaging path exists.
- Multiple hand-written distribution manifests were rejected because they would duplicate
  information already present in canonical Skill, Role, dependency, and security sources.

## Consequences

The repository gains a single packaging source of truth and can validate package-model logic
early through a two-Skill pilot. Some native specialist behaviors remain deferred per host,
and OpenCode retains a narrower helper path than hosts with marketplaces. The implementation
must generate capability and permission reports rather than storing them as additional
canonical files.

## Verification

- `src/distribution/packages.json` validates and classifies every canonical Skill exactly once.
- `npm run agents:test:contracts` includes package distribution verification.
- `npm run skills:verify:fast` builds a deterministic package-model preview.
