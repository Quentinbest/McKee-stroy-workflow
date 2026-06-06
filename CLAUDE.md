@AGENTS.md

<!-- GENERATED FILE. DO NOT EDIT.
source=AGENTS.md source-version=policy-1.0.0 sha256=2a2b2071774de2834bac44c4bb088c99d1018d869f0f488e06eb6628021628ed generator=1.0.0
verification=npm-run-agents-check-drift
-->

# Claude Code Adapter

- Load applicable files from `.claude/rules/`.
- Use project subagents only for bounded read, review, or isolated work.
- Follow `.claude/settings.json` permission boundaries.
