# Publication Approval

Stable-release approval and external publication approval are separate gates.
No command, tag, or general instruction to finish a task authorizes uploading
release assets to an external target.

## Required Preconditions

1. A reviewed, non-placeholder top-level `LICENSE` exists.
2. `reports/publication-approval.json` conforms to
   `schemas/publication-approval.schema.json`.
3. The approval names the publication operation, external target, release,
   release ref, exact source commit, asset scope, authorizing task, approver,
   approval time, and expiry.
4. The approval is current and names either the checkout being published or
   its direct parent when the checkout is an approval-only carrier commit.
5. The repository publication preflight passes.

## GitHub RC Approval

For the `github-release` target, the approval scope must include:

```text
release-assets/checksums.txt
release-assets/dist.tar.gz
release-assets/manifest.json
release-assets/reports.tar.gz
```

Example structure:

```json
{
  "schemaVersion": 1,
  "status": "approved",
  "operation": "publication",
  "target": "github-release",
  "release": "1.0.0",
  "releaseRef": "v1.0.0-rc.1",
  "sourceCommit": "0123456789abcdef0123456789abcdef01234567",
  "scope": [
    "release-assets/checksums.txt",
    "release-assets/dist.tar.gz",
    "release-assets/manifest.json",
    "release-assets/reports.tar.gz"
  ],
  "task": "TASK-2026-000",
  "approvedBy": {
    "name": "Authorized reviewer",
    "role": "Release owner"
  },
  "approvedAt": "2026-06-11T10:00:00Z",
  "expiresAt": "2026-06-12T10:00:00Z"
}
```

The example is structural only and is not an approval.

## Commit Binding

An approval record cannot contain the hash of the same Git commit that contains
the record because changing the record changes the commit hash. The supported
release sequence is therefore:

1. Commit the complete approved release source.
2. Record that commit as `sourceCommit`.
3. Create one direct child commit that changes only
   `reports/publication-approval.json`.
4. Tag or publish the approval carrier commit.

The verifier inspects Git history and rejects carrier commits containing any
other path. Release assets are generated from the approved source plus the
non-payload approval record.

## Verification

Run:

```bash
node scripts/verify-publication-readiness.mjs \
  --target github-release \
  --ref v1.0.0-rc.1
```

The verifier fails closed for missing or placeholder licenses; missing,
malformed, expired, or mismatched approvals; non-direct or contaminated
approval carrier commits; and incomplete asset scope.

## Workflow Behavior

The `build-rc` GitHub Actions job can build internal artifacts without
publication approval. The tag-triggered `draft-release` job receives
`contents: write` only at job scope and must pass publication preflight before
calling `gh release create`.
