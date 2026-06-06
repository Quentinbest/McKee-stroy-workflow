# Source Provenance

The machine-readable ledger is `src/source-provenance.json`.

## Import Policy

- Skill bodies originate from `skills/<id>/SKILL.md`.
- Role bodies originate from `agents/<id>.md`.
- Templates originate from `templates/`.
- The import adds only stable contract metadata before later normalization.
- SHA-256 hashes record both the legacy input and canonical result.
- Canonical source is edited under `src/` after Phase 1.
- Legacy source remains a compatibility snapshot and is not a generated target.

## External Domain Source

The McKee wiki remains in `/Users/quentin/Writing/LLM-Wiki-Story` on the current
machine. Portable tooling resolves it in this order:

1. `MCKEE_WIKI_ROOT`
2. A sibling `../LLM-Wiki-Story`
3. A story-project-local repository containing `wiki/CANONICAL.md`

The workflow repository never copies private wiki worktree changes into
generated adapters.
