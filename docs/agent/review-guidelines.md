# Review Guidelines

## Severity

| Level | Meaning |
|---|---|
| P0 | privacy disclosure, destructive loss, unsafe publication, or false release |
| P1 | broken core workflow, contract bypass, or cross-harness incompatibility |
| P2 | bounded functional defect, drift, missing validation, or resumability gap |
| P3 | clarity, maintainability, or non-blocking documentation issue |

## Review Order

1. Safety and scope.
2. Behavioral correctness and regression.
3. Contract and schema integrity.
4. Generated drift and traceability.
5. Harness equivalence.
6. Test quality and failure coverage.
7. Documentation accuracy.
8. Subjective story quality, clearly separated from deterministic findings.

## Output

Findings lead, ordered by severity, with file/line evidence, impact, and a
specific repair. Then record open questions, test gaps, and residual risks.
State explicitly when no actionable finding remains.

## Completion Review

Check each acceptance item against authoritative evidence. Absence of a known
failure is not proof. Unverified or indirect evidence keeps the item open.
