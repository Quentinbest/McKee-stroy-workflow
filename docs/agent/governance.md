# Governance

Canonical source changes and generated adapters ship together. Breaking
contract changes require an ADR, migration note, version increment, and
deprecation window. Security policy cannot be weakened by a task or harness
adapter.

Monthly reviews cover drift and stale state. Quarterly reviews compare official
harness documentation with the compatibility ledger. Major releases require a
synthetic and approved real story lifecycle, security review, rollback
exercise, and human release decision.

The release owner may reject a technically green release when privacy,
operational usability, or story quality evidence is insufficient.
