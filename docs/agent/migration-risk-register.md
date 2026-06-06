# Migration Risk Register

| Risk | Impact | Control | Detection | Rollback |
|---|---|---|---|---|
| Creative prompt semantics change during import | high | byte-preserving import before normalization | source hash ledger | baseline tag |
| Legacy callers use `skills/` or `agents/` | high | retain legacy paths through v1 | reference scan and smoke fixtures | restore adapters |
| Wiki is absent on another machine | high | `MCKEE_WIKI_ROOT`, bootstrap check, degraded diagnostics | dependency test | no canonical write |
| Generated adapters drift | high | deterministic generator and manifest | drift CI | regenerate |
| Private story/persona material leaks | critical | deny patterns and no-network default | security suite | remove artifact, incident runbook |
| Harness behavior differs | medium | shared task and contract fixtures | five-harness smoke tests | capability exception |
| Dirty wiki worktree is overwritten | high | wiki read-only integration | Git status check | no wiki commit |
| Migration creates oversized commits | medium | one commit per phase | phase review | revert phase commit |
| Unsupported extension executes code | critical | no approved third-party extensions | config scan | remove config |
| False completion | high | requirement/evidence audit | completion report | reopen phase |
