# Legacy Mapping

## Path Mapping

| Legacy path | Canonical path | Generated targets |
|---|---|---|
| `skills/<id>/` | `src/skills/<id>/` | `.agents/skills/<id>/`, `.claude/skills/<id>/` |
| `agents/<id>.md` | `src/roles/<id>.md` | `.claude/agents/<id>.md`, `.opencode/agents/<id>.md` |
| `templates/<file>` | `src/templates/<file>` | none |
| story-project `wiki/` | `${MCKEE_WIKI_ROOT}/wiki/` | none |

Legacy directories remain temporarily as migration inputs. After all consumers
and documentation use canonical paths, they may be removed in a separately
reviewed compatibility change.

## Same-Name Role-to-Skill Mapping

| Legacy role | Canonical capability |
|---|---|
| `act-designer` | skill `act-designer` |
| `arc-tracer` | skill `arc-tracer` |
| `composition-conductor` | skill `composition-conductor` |
| `controlling-idea-architect` | skill `controlling-idea-architect` |
| `exposition-smuggler` | skill `exposition-smuggler` |
| `key-image-curator` | skill `key-image-curator` |
| `wiki-librarian` | skill `wiki-librarian` |

Generated role adapters preserve these names and identify the canonical skill
handoff. Remaining role names map one-to-one to canonical role IDs.

## Wiki Alias Mapping

| Legacy reference | Canonical resolution |
|---|---|
| `wiki/en/concepts/convention-vs-cliche.md` | `wiki/en/comparisons/convention-vs-cliche.md` |
| `wiki/en/concepts/subtext.md` | `wiki/en/concepts/text-and-subtext.md` |
| `wiki/...` | `${MCKEE_WIKI_ROOT}/wiki/...` when not present in a story project |

Aliases are compatibility data for validation. Canonical source should use the
current wiki path when it is edited for another reason.
