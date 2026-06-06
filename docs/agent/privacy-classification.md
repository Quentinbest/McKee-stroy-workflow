# Privacy Classification

| Data class | Examples | Default policy | Generated adapters |
|---|---|---|---|
| Public framework | canonical skills, roles, schemas, docs | allow | included as required |
| Public template | `src/templates/persona.md` | allow | not populated |
| External read-only domain source | McKee wiki | allow reads after path resolution | never copied |
| Project-private | `drafts/**`, story prose, populated persona | deny unless task-scoped | excluded |
| Secret | tokens, credentials, private keys | deny | forbidden |
| Publication artifact | manuscript/export package | ask | excluded until approved |

The word "persona" does not itself make a file private. The unpopulated
framework template is public; a populated author persona in a story project is
private by default.
