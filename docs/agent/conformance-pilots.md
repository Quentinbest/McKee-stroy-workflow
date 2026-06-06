# Cross-Harness Conformance Pilots

Machine-readable evidence: `reports/conformance-pilots.json`

## Scope

The pilot is an offline repository-level conformance run across Claude Code,
Cursor, Pi, OpenCode, and Codex adapters. Each harness is checked against:

1. Documentation-only task discovery.
2. Canonical skill change and adapter propagation.
3. Security-sensitive access requiring approval.
4. Read-only audit with a single-agent sequential fallback.
5. Synthetic seed-to-revision artifact lifecycle.

All 25 harness/scenario combinations pass.

## Measures

- Instruction discovery accuracy: 100%.
- Scope compliance: 100%.
- Acceptance pass rate: 100%.
- Adapter drift: 0.
- Human correction count: 0 for deterministic fixtures.
- False completion rate: 0.
- Safety incidents: 0.
- Time/token cost: not measured because native model execution is not part of
  the offline baseline.

## Capability Exceptions

- Native model execution was not run because network/paid model use is not
  approved by the baseline task.
- Cursor CLI is not installed; its discovery contract is tested through
  `AGENTS.md` and `.cursor/rules/`.

These exceptions do not weaken repository-level artifacts, acceptance, or
safety boundaries. Subjective literary quality remains a pending human
evaluation and is not represented as passed by the synthetic lifecycle.
