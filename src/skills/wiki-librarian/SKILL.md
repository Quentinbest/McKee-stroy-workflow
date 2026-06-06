---
id: wiki-librarian
version: 1.0.0
contract-version: 1
name: wiki-librarian
description: |
  Ingest, mirror, link, and lint the bilingual McKee wiki at wiki/{en,zh}/.
  The sole skill with write authority over wiki/. Supports four operations:
  INGEST (source → wiki pages in both languages), LINT (diagnose + auto-fix),
  MIGRATE (promote drafts/ artifacts into wiki/), REGEN (rebuild MAP.md and
  derived artifacts). Refactored from agent to skill — runs in main context
  for cost efficiency; the cold-start overhead of re-reading CLAUDE.md,
  CANONICAL.md, and both indexes every spawn is eliminated.
  Trigger: /wiki-librarian, "ingest chapter", "lint the wiki", "migrate to wiki",
  "regenerate MAP", "sync zh/", "update indexes", "land it in the wiki".
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
triggers:
  - ingest chapter
  - lint the wiki
  - migrate to wiki
  - regenerate MAP
  - sync zh
  - update indexes
  - land it in the wiki
  - wiki librarian
  - update the wiki
---

# Wiki Librarian

The sole owner of the `wiki/` tree. Every other skill and agent writes to `drafts/`, `characters/`, or `scenes/`; only this skill may create, edit, or delete files inside `wiki/en/` and `wiki/zh/`. Purpose: keep the bilingual McKee wiki **complete, mirrored, linked, and lint-clean**.

Authority: the project's `CLAUDE.md` and `wiki/CANONICAL.md`. Both are binding policy. If anything conflicts with them, stop and surface the conflict.

---

## Step 0 — Load Governing Documents

At the start of every operation:

1. Read `CLAUDE.md` at the project root (full operating contract).
2. Read `wiki/CANONICAL.md` (terminology, canonical-chapter assignments, conflict-resolution policy, authorship rules). CANONICAL wins all disputes.
3. Read both indexes: `wiki/en/index.md`, `wiki/zh/index.md`.
4. Read both MAPs: `wiki/en/MAP.md`, `wiki/zh/MAP.md`.
5. Plan deep-loads from MAP — MAP is the agent-facing manifest sorted by `importance`. Do not guess paths.

Respond in the user's language. Log entries follow CLAUDE.md's bilingual format.

---

## Step 1 — Identify Operation

Pick exactly one operation per invocation. Never silently mix.

| Trigger | Operation |
|---|---|
| New source under `sources/`; new `drafts/` artifact | **INGEST** |
| "lint", "audit wiki", scheduled audit | **LINT** |
| "land it", "migrate to wiki", stable artifact ready | **MIGRATE** |
| "regenerate MAP", "rebuild indexes", detected drift | **REGEN** |

---

## Operation A — INGEST

Bring new knowledge from a source or finished draft artifact into the wiki.

1. Read the source completely. **Never modify `sources/`.**
2. For each required page type (chapter-summary, concept, structure, principle, entity, genre, character, comparison, application, quote), create or update the page in **both** `wiki/en/` and `wiki/zh/`.
3. Set frontmatter on every new page: `title`, `type`, `lang`, `last_updated`, `last_verified`, `author: claude`, `importance` (default by type, override per CANONICAL §2), `canonical_chapter`, `tags`, plus type-specific fields per CLAUDE.md Frontmatter Reference.
4. Add or update **Mermaid diagrams** with **identical EN/ZH topology** on every required type (`concept`, `structure`, `principle`, `chapter-summary`, `comparison`, `overview`). EN labels in EN page; ZH labels in ZH page; same nodes, edges, shapes, edge-label verbs.
5. Run the **Conflict Check** (CANONICAL §3). If a contradiction exists: do not silently overwrite — flag it in the log and ask the user.
6. **Atomize Notable Quotes** for any new chapter page into `wiki/{en,zh}/quotes/`, one quote per file, with `concept_refs` and `film_refs` populated.
7. Update `wiki/en/index.md` and `wiki/zh/index.md`.
8. Regenerate `wiki/{en,zh}/MAP.md` — run `python scripts/regen_map.py` if available; otherwise emit MAP manually (one row per page, sorted by `importance` desc then `canonical_chapter` asc, format: `type | canonical_chapter | last_updated | title`).
9. Append to **both** logs (EN and ZH formats below).

---

## Operation B — LINT

Diagnose and auto-fix safe issues.

Run the full LINT checklist from CLAUDE.md:
- Contradictions between pages
- Stale claims (source file newer than `last_verified`)
- Orphan pages (exist in `wiki/` but not in index)
- Missing pages (referenced by wikilinks but absent)
- Zero film examples on concept/structure/principle pages (missing `<!-- TODO: add film example -->` placeholder)
- Missing cross-refs (`related:` frontmatter entry has no corresponding `[[wikilink]]` in body)
- Frontmatter gaps: missing `importance`, `canonical_chapter`, `last_verified`, `author`
- EN/ZH sync gaps (page exists in one tree but not the other)
- Index gaps (page exists in `wiki/` but not in `index.md`)
- Missing language toggles
- Missing Mermaid blocks on required page types
- Diagram drift (`related:` entry absent from diagram nodes)
- Bilingual topology mismatch (EN/ZH diagrams have different nodes or edges)
- Terminology not matching CANONICAL §1
- `canonical_chapter` inconsistent with `chapter_refs`
- MAP.md out of date

**Auto-fix safe issues**: missing toggles, missing tags, kebab-case slug fixes, MAP regeneration, frontmatter gaps where value is unambiguously derivable, missing index entries.

**Never auto-fix without confirmation**: terminology divergence, contradictions between pages, deletion of orphan pages, edits to `author: user` pages.

End: regenerate MAP if any structural change occurred; append lint findings to both logs; present unresolved issues to user as a numbered list with severity (critical / major / minor).

---

## Operation C — MIGRATE

Promote a `drafts/` artifact into `wiki/`.

1. Identify destination type and path:
   - `drafts/{slug}/controlling-idea.md` → `wiki/{en,zh}/application/controlling-idea-{slug}.md` (type: `application`)
   - `drafts/{slug}/spine.md` → `wiki/{en,zh}/application/spine-{slug}.md`
   - `characters/{name}.md` → `wiki/{en,zh}/characters/{name}-{slug}.md` (suffix slug to avoid collisions)
   - Scene cards: stay in `drafts/` unless user explicitly requests wiki ingest
2. Translate to the second language — natural Chinese, not literal translation. Honor CLAUDE.md bilingual rules (first-mention term gloss, simplified Chinese, film title format).
3. Add language toggles, required Mermaid diagram, full frontmatter, and `[[wikilinks]]` for every concept already in the wiki. New concept names without pages are flagged — **do not silently create stub concept pages from a single project's draft**; concept pages derive from `sources/`.
4. Update both indexes and regenerate MAP. Append to both logs.

---

## Operation D — REGEN

Rebuild derived artifacts from canonical state.

1. Run `python scripts/regen_map.py` to rebuild `wiki/{en,zh}/MAP.md`.
2. Run `scripts/atomize_quotes.py`, `scripts/patch_canonicals.py`, `scripts/update_frontmatter.py` only if user explicitly requested those; do not run without consent.
3. Verify both indexes still cover every existing page; rebuild missing index rows.
4. Append a `regen` entry to both logs.

---

## The Bilingual Contract

Every operation respects these rules:

1. **Every page exists in both languages** with the same kebab-case filename.
2. **Language toggle on every page** (top of file):
   - EN: `> 中文版：[[wiki/zh/{path}|中文]]`
   - ZH: `> English: [[wiki/en/{path}|English]]`
3. **Wikilinks stay within the language tree**; only the toggle crosses trees.
4. **Both indexes and both logs updated together** in the same operation.
5. **Frontmatter `lang: en | zh`** on every page.
6. **ZH first mention of a McKee term**: `中文名（English Name）`; subsequent mentions: Chinese only.
7. **Simplified Chinese (简体中文)**. Film titles: `中文片名（*English Title*, Year）`.
8. **Mermaid diagrams**: identical topology in both trees. If you change one, change the other in the same edit.

---

## Authorship Bright Line

- `author: claude` — everything generated by this skill.
- `author: user` — anything under `wiki/{en,zh}/notes/` and pages the user authored personally.
- **Never silently rewrite `author: user` pages.** Surface typos, broken links, factual drift as findings; act only on explicit confirmation.

---

## Log Format

Append to **both** `wiki/en/log.md` and `wiki/zh/log.md`. Never one without the other.

**EN log** (adapt verb for lint/migrate/regen):
```
## [YYYY-MM-DD] ingest | {Source Title}
- Source: `path`
- Pages created: [list]
- Pages updated: [list]
- Contradictions flagged: [if any]
```

**ZH log**:
```
## [YYYY-MM-DD] 收录 | {标题}
- 来源：`path`
- 新建页面：[list]
- 更新页面：[list]
- 标记矛盾：[如有]
```

Verbs: LINT → `lint` / `审计`; REGEN → `regen` / `重建`; MIGRATE → `migrate` / `迁移`.

---

## Hard Rules

1. **Never modify `sources/`.** Immutable source-of-truth.
2. **Never edit `author: user` pages without explicit confirmation.**
3. **Never leave the trees out of sync.** Create/delete on both sides in the same operation.
4. **Never skip the indexes or logs.** Both update on every operation.
5. **Never auto-create concept pages from a single project's draft.** Concept pages derive from `sources/`.
6. **Never let MAP go stale after a structural change.**
7. **Never trust prior session state over current files.** Re-read indexes and CANONICAL at the start of every operation. (Note: as a skill running in main context, prior-session state from *this session* may be trusted; always re-read at session start.)
8. **Stop and ask** when CANONICAL terminology and a draft disagree. CANONICAL wins.

---

## Self-Check Before Returning

Before declaring an operation complete:

- Did I touch both `wiki/en/` and `wiki/zh/` — pages, index, log?
- Does every new or modified page have valid frontmatter (including `last_verified` and `author`)?
- Does every required page type carry a Mermaid block with identical EN/ZH topology?
- Is MAP.md regenerated for both languages if any structural change happened?
- Are all new wikilinks resolvable? (Grep `\[\[[^]]+\]\]`; confirm targets exist or are intentional stubs.)
- Did I append to both logs in the correct formats?
- For contradictions, terminology drift, or `author: user` issues: did I surface them to the user instead of silently fixing?

If any answer is no: complete the missing step before returning.

End every response with:
- Operation summary (what was done)
- Counts (pages created/updated, links repaired, lint findings remaining)
- Any **unresolved issues** the user must decide on
- Handoff if a downstream step should run next (rare — usually terminal)
