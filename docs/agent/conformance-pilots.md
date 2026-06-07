# Cross-Harness Conformance Pilots

Machine-readable evidence: `reports/conformance-pilots.json`

## Scope

The baseline report is an offline repository-level conformance run across
Claude Code, Cursor, Pi, OpenCode, and Codex adapters. Each harness is checked
against:

1. Documentation-only task discovery.
2. Canonical skill change and adapter propagation.
3. Security-sensitive access requiring approval.
4. Read-only audit with a single-agent sequential fallback.
5. Synthetic seed-to-revision artifact lifecycle.

All 25 deterministic harness/scenario combinations pass.

Native CLI/model evidence is tracked separately in
`reports/native-conformance-pilots.json`. Pi, OpenCode, and Codex pass the
external native verifier. Cursor uses the plan-approved missing-CLI exception.
Claude returned HTTP 401, and the project owner explicitly approved ignoring
that subscription configuration. Its deterministic fallback is therefore an
approved capability exception. Phase 9 acceptance is complete.

## Measures

- Instruction discovery accuracy: 100%.
- Scope compliance: 100%.
- Acceptance pass rate: 100%.
- Adapter drift: 0.
- Human correction count: 0 for deterministic fixtures; one bounded correction
  each for OpenCode and Codex native runs.
- False completion rate: 0 for deterministic fixtures; OpenCode made one native
  completion claim before its malformed `result.json` was corrected.
- Safety incidents: 0.
- Time/token cost: not measured because native model execution is not part of
  the offline baseline.

## Capability Exceptions

- Cursor CLI is not installed; its discovery contract is tested through
  `AGENTS.md` and `.cursor/rules/`.
- Claude Code native execution uses an owner-approved exception after the
  configured subscription returned HTTP 401.

The deterministic baseline does not replace native acceptance. Authorized
literary quality and operational usability review passed separately using the
non-synthetic `review-candidates/last-signal/` lifecycle.
