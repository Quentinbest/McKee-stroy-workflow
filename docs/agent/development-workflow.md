# Development Workflow

## Preflight

1. Read `AGENTS.md`, this context index, and the active task.
2. Inspect Git status in every affected repository.
3. Confirm canonical versus generated targets.
4. Confirm runtime, wiki availability, permissions, and network requirements.
5. Restate goal, assumptions, scope, tests, and acceptance.

## Change Flow

1. Edit canonical source only.
2. Add or update focused tests.
3. Run focused checks.
4. Regenerate adapters when skills, roles, prompts, or adapter rules change.
5. Run drift, contracts, security, and relevant regression checks.
6. Inspect generated diffs and unrelated worktree changes.
7. Record evidence and residual risk.
8. Commit one coherent phase or task result.

## Branching and Commits

- Agent-created branches use the `codex/` prefix.
- Phase migrations use one reviewed commit per phase.
- Do not rewrite, reset, or discard unrelated user changes.
- Parallel writes require isolated worktrees or disjoint path ownership.
- Generated adapters and their canonical changes ship in the same commit.

## Release

Release requires the documented release checklist, clean generated drift,
contract/security/compatibility evidence, human story-quality review, and
explicit publication approval. Network publishing is never implicit.
