# ADR-0001: Cross-Harness Baseline Defaults

Status: accepted
Date: 2026-06-06

## Context

The implementation plan leaves several release and privacy decisions for human
ownership. Implementation cannot be deterministic until conservative defaults
are recorded.

## Decision

- Generated adapters are committed and verified for drift.
- Private stories, drafts, and author personas are denied by default unless a
  task contract explicitly scopes them.
- The external wiki is read-only and located through `MCKEE_WIKI_ROOT`.
- No third-party Pi extension, OpenCode plugin, MCP server, or hook is approved
  for baseline operation.
- Deterministic structural story gates are blocking; subjective story-quality
  gates are advisory and require human evaluation.
- No publication target is enabled. Publishing always requires explicit human
  approval.
- Story projects remain in separate private repositories by default.
- Supported harness versions are capability-based and reviewed quarterly.

## Consequences

The baseline remains portable and least-privileged. Some native harness
features and live publishing flows remain intentionally unavailable until a
later ADR approves them.
