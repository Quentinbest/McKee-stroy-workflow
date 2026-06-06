# Delegation Protocol

The primary agent owns the task contract, integration, evidence, and final
completion claim.

## Envelope

Every delegation records role, mode, bounded inputs and outputs, allowed paths,
forbidden actions, timebox, acceptance, status, and worktree when required.

## Parallelism

- Read-only research and review may run in parallel against the same checkout.
- Writes may run in parallel only with non-overlapping paths or separate
  worktrees/branches.
- Generated directories are never delegated as editable scope.
- A delegate may not expand scope, publish, access private data, or delegate an
  irreversible action.

## Integration

The primary agent inspects evidence, rejects output outside the envelope,
resolves conflicts against task acceptance criteria, and records the accepted
artifact in the ledger.
