# Worktree and Branch Isolation

- Agent-created branches use `codex/`.
- Each concurrent write delegation receives a unique worktree and branch.
- Allowed paths must be disjoint unless work is serialized.
- Shared generated adapters are integrated only after canonical branches merge.
- Do not remove a worktree with modified files; inspect and preserve evidence.
- Do not force-delete branches or worktrees.
- Read-only delegates do not require a separate worktree.

Before integration, run focused tests in the delegate worktree, inspect the
diff, merge or cherry-pick non-interactively, regenerate adapters once in the
integration branch, and run full verification.
