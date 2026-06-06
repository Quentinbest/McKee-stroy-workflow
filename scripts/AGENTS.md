# Deterministic Script Instructions

- Use Node.js standard library only for the baseline toolchain.
- Default to no network and no environment mutation.
- Resolve paths from the repository root, not the caller's current directory.
- Sort filesystem inputs and JSON keys where order affects output.
- Fail with actionable diagnostics and a nonzero exit code.
- Never write outside documented generated or task-approved paths.
- Tests must cover expected failures, idempotence, and path safety.
