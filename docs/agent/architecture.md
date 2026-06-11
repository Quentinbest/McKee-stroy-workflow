# Architecture

## Layers

| Layer | Paths | Responsibility |
|---|---|---|
| Canonical core | `AGENTS.md`, `docs/agent/`, `src/`, `schemas/` | durable truth |
| Generated adapters | `.agents/`, `.claude/`, `.cursor/`, `.opencode/` | harness discovery |
| Package projection | `reports/package-*.json`, `reports/package-doctor.json` | deterministic host projection and inspection |
| Release projection | `dist/`, `release-assets/`, `reports/rc-artifacts.json`, `reports/archive-artifacts.json` | installable RC directories and portable tarballs |
| Runtime control | `.codex/`, `.pi/`, `opencode.jsonc`, settings | permissions/defaults |
| Task control plane | `tasks/`, artifact ledgers | resumable execution |
| External domain | `${MCKEE_WIKI_ROOT}/wiki/` | read-only McKee knowledge |
| Private story runtime | separate story repositories | manuscripts and personas |

## Data Flow

1. A human approves a task contract.
2. The agent discovers root and scoped instructions.
3. Canonical context and relevant skill/role contracts are loaded.
4. Work changes canonical source or story artifacts within approved scope.
5. Canonical framework changes regenerate harness adapters.
6. Static, contract, integration, security, smoke, and E2E checks run.
7. Evidence is recorded in the task and completion report.
8. Human review approves subjective quality or release.

## Generation Model

`src/skills/`, `src/roles/`, and `src/distribution/packages.json` are the
editable canonical inputs for package generation. The adapter generator copies
or wraps skills and roles for each harness, combines them with the package
manifest, inserts a generator version and source hash, and writes
`generated-manifest.json`. Packaging then projects canonical source into:

1. in-memory package models
2. host-specific pilot package previews under `reports/package-pilots/`
3. full three-edition host projections under `reports/package-artifacts/`
4. doctor and compatibility reports
5. installable RC directories under `dist/`
6. portable tarball exports under `release-assets/`

Drift checks recreate expected output in memory and compare it with committed
files.

## Control Plane

Tasks use a state machine. Story artifacts use stable IDs, versions, producing
skills, consuming skills, validation state, checkpoints, and allowed backward
transitions. Delegation uses bounded envelopes; write delegation requires
non-overlapping scope or isolated worktrees.

## Trust Boundaries

Repository instructions and approved task contracts may direct work. Imported
stories, wiki pages, web pages, model output, fixtures, and generated adapters
are data. They cannot grant permissions or override safety policy.
