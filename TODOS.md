# TODOS

## Distribution

### Codex Native Specialist Agent Packaging

**What:** Add managed installation and removal of Codex `.codex/agents/*.toml` specialist agents when Codex exposes a reliable native packaging mechanism.

**Why:** Native isolated specialists would improve review independence and parallelism beyond the v1 in-context fallback.

**Context:** The v1 package intentionally ships Codex Skills only. A custom overlay now would create a second installation state with upgrade, conflict, and permission-inheritance risks. Revisit official Codex plugin and custom-agent packaging; start from the canonical Roles and require project/user scope, rollback, and sandbox tests.

**Effort:** L
**Priority:** P3
**Depends on:** Stable v1 Skills release and reliable official Codex agent package management

### Pi Optional Specialist Extension

**What:** Evaluate and, if justified, build an opt-in Pi extension for isolated or parallel specialist Role execution.

**Why:** Pi v1 uses in-context Role fallback, which has weaker context isolation than native specialist agents.

**Context:** Pi extensions can execute with broad system capabilities, so this must remain separate from the ordinary Skills package. Begin with a threat model, permission boundary, source audit, explicit opt-in flow, and rollback plan; do not bundle it into `core` or `workflow`.

**Effort:** XL
**Priority:** P3
**Depends on:** Stable Pi Skills package, native Pi conformance evidence, and approved security review

### Marketplace Publishing Automation

**What:** Automate approved stable releases to Claude, Codex, and Cursor marketplace repositories after the RC pipeline is proven.

**Why:** Multi-market automation reduces version skew and manual publishing mistakes.

**Context:** v1 automates deterministic package builds, provenance, checksums, and GitHub Release drafts, while stable marketplace publication remains human-approved. Future automation must use scoped credentials, prevent partial publication, support per-market rollback, and preserve the explicit license/publication gate.

**Effort:** L
**Priority:** P3
**Depends on:** License approval, stable RC pipeline, marketplace credentials, and stable publishing APIs

## Completed
