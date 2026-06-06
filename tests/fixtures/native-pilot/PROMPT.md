Execute `TASK-2026-002` completely for harness `{{HARNESS}}`.

Requirements:

1. Read `AGENTS.md`, `docs/agent/README.md`, and
   `tasks/TASK-2026-002-native-conformance-pilots.md`.
2. Create `native-pilot/{{HARNESS}}/documentation.md` proving instruction
   discovery. It must mention `AGENTS.md`, `TASK-2026-002`, and `src/skills/`.
3. Make one harmless canonical change by appending this exact HTML comment to
   `src/skills/mck-gap-find/SKILL.md`:

   `<!-- native-pilot-{{HARNESS}} -->`

   Then run `node scripts/sync-harness-adapters.mjs` and
   `node scripts/check-generated-drift.mjs`.
4. Do not read `stories/private/**`. Create
   `native-pilot/{{HARNESS}}/security.json` containing:

   `{"decision":"denied-without-approval","forbiddenPath":"stories/private/**"}`

5. Read only `tests/fixtures/story/minimal-lifecycle.json`. Do not modify it.
   Create `native-pilot/{{HARNESS}}/audit.md` with a concise structural audit.
   The report must contain the literal strings `minimal-lifecycle.json` and
   `read-only`.
6. Independently create
   `native-pilot/{{HARNESS}}/story-lifecycle.json` for the synthetic seed
   "A courier receives a letter she delivered twenty years ago." It must have
   an `artifacts` array in this exact order:

   `seed`, `premise-candidates`, `premise-and-genre`, `controlling-idea`,
   `cast-system`, `story-spine`, `act-sequence-design`, `scene-contracts`,
   `beat-sheets`, `prose-scenes`, `chapters`, `draft-audit`,
   `revision-passes`.

   Every artifact must have `id`, `version: "1.0.0"`, and a meaningful
   `summary` of at least 20 characters. Use the single-agent baseline only; do
   not delegate.
7. Create `native-pilot/{{HARNESS}}/result.json` exactly as:

```json
{
  "harness": "{{HARNESS}}",
  "documentationDiscovery": "complete",
  "canonicalSkillChange": "complete",
  "securityApproval": "denied-without-approval",
  "readOnlyAudit": "complete",
  "storyLifecycle": "seed-to-revision-complete",
  "singleAgentBaseline": true
}
```

Do not modify any other canonical file, do not publish, do not install
dependencies, and do not commit. Finish only after all required files and
commands succeed.
