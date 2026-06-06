# Testing and Verification

## Test Order

1. Static instruction, Markdown, JSON, and link checks.
2. Unit tests for parsing, hashes, path resolution, and generation.
3. Contract tests for skills, roles, tasks, and artifacts.
4. Canonical-to-adapter integration and idempotence tests.
5. Security tests for privacy, secrets, paths, commands, and disclosure.
6. Harness discovery smoke tests.
7. Synthetic story and task E2E tests.
8. Human evaluation for subjective story quality and usability.

## Target Commands

The `agents:*` commands are implemented in Phase 7. Until then, phase-specific
commands in the active task are authoritative.

```bash
npm run agents:bootstrap
npm run agents:lint
npm run agents:test:contracts
npm run agents:sync
npm run agents:check-drift
npm run agents:test
npm run agents:verify
```

## Evidence Requirements

Record the exact command, exit result, summarized output, environment exception,
and affected acceptance criterion. A passing narrow check cannot prove a broad
release gate. Expected failure fixtures must fail for the intended reason.

## Documentation and HTML

Verify internal links, headings, parseability, source references, and command
accuracy. HTML deliverables additionally require desktop/mobile visual review
and link checks.

## Clean Checkout Standard

Node.js 20 or newer is the only baseline runtime dependency. Baseline tests
must not require network access, third-party packages, a private manuscript, or
native subagent support.
