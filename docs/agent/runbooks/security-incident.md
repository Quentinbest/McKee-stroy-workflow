# Runbook: Security or Privacy Incident

Owner: security
Last verified: 2026-06-06

## Trigger

A secret, private manuscript/persona, unapproved external disclosure, unsafe
plugin, destructive action, or publication attempt is detected.

## Procedure

1. Stop the operation and record the task, command, path, and timestamp without
   copying the sensitive payload.
2. Isolate generated or exported artifacts that may contain the material.
3. Revoke or rotate exposed credentials through the owning service.
4. Notify the human owner and identify external recipients, if any.
5. Remove sensitive material from current output and history only through an
   explicitly approved recovery task.
6. Add a regression fixture and verify the security suite.

## Stop Conditions

Do not resume normal execution while disclosure scope, credential status, or
publication state is unknown.

## Rollback

Revert the smallest affected phase or artifact. Do not reset unrelated work or
rewrite shared history without explicit approval.

## Evidence

Retain redacted findings, affected hashes, containment actions, approvals, and
verification results.
