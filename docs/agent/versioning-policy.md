# Versioning and Deprecation Policy

## Versions

- Framework releases use Semantic Versioning.
- Skill, role, artifact, and control-plane contracts carry independent semantic
  versions.
- The adapter generator has its own version in
  `scripts/lib/generator.mjs`.
- Generated files record source version, source hash, generator version, and
  verification command.

## Compatibility

- Patch: compatible fixes, documentation, tests, and adapter corrections.
- Minor: additive skills, roles, artifacts, optional fields, or harness support.
- Major: removed/renamed IDs, changed required fields, lifecycle semantics, or
  safety behavior.

## Deprecation

Breaking changes require an ADR, migration note, and at least one minor release
of overlap where practical. Legacy `skills/`, `agents/`, and `templates/`
remain through the 1.x release candidate cycle and may be removed only in a
documented major release.

## Release Channels

- `-rc.N`: complete technical baseline awaiting required human release gates.
- Stable: all deterministic gates plus human literary quality and operational
  usability review.
