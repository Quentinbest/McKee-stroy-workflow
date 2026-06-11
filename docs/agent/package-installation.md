# Package Installation

Authority: framework packaging contract  
Owner: framework/release  
Volatility: host commands and discovery paths must be reviewed when host
documentation or pinned CLI versions change  
Last reviewed: 2026-06-11

## Scope

The release candidate matrix contains three editions for five hosts:

- `mckee-story-core`
- `mckee-story-workflow`
- `mckee-story-wiki-maintainer`

Baseline verification never changes user configuration. It installs each of
the 15 projections into a new temporary directory, verifies Skill and Role
discovery using the documented filesystem contract, removes the package, and
verifies that the installation root is gone.

Run:

```bash
npm run skills:test:install
```

Evidence is written to `reports/package-install-smoke.json`.

## Claude Code

Layout:

```text
dist/claude/<package>/
├── .claude-plugin/plugin.json
├── skills/<skill>/SKILL.md
└── agents/<role>.md
```

Validate and load for one session:

```bash
claude plugin validate --strict dist/claude/<package>
claude --plugin-dir "$PWD/dist/claude/<package>"
```

`--plugin-dir` is session-scoped, so ending the session removes the loaded
package without changing persistent plugin configuration.

## Codex

Layout:

```text
dist/codex/
├── .agents/plugins/marketplace.json
└── plugins/<package>/
    ├── .codex-plugin/plugin.json
    └── skills/<skill>/SKILL.md
```

Install and remove:

```bash
codex plugin marketplace add "$PWD/dist/codex"
codex plugin add <package>@mckee-story-workflow-local
codex plugin remove <package>@mckee-story-workflow-local
```

These commands modify Codex configuration and are intentionally excluded from
automated baseline verification.

## Cursor

Layout:

```text
dist/cursor/<package>/.cursor/
├── skills/<skill>/SKILL.md
└── rules/mckee-story-workflow.mdc
```

Copy the generated `.cursor/` contents into a target project. Remove only the
files listed in the package's `package-manifest.json`. Role behavior remains an
explicit in-context fallback; this package does not claim native subagent
projection.

## OpenCode

Layout:

```text
dist/opencode/<package>/
├── .agents/skills/<skill>/SKILL.md
├── .opencode/agents/<role>.md
└── opencode.fragment.json
```

Copy `.agents/` and `.opencode/` into the target project, then review and merge
`opencode.fragment.json`. Uninstallation removes the copied files and reverts
the reviewed configuration merge.

## Pi

Layout:

```text
dist/pi/<package>/
├── package.json
├── skills/<skill>/SKILL.md
└── references/roles/<role>.md
```

The manifest declares `keywords: ["pi-package"]` and
`pi.skills: ["./skills"]`.

Install and remove project-locally:

```bash
pi install "$PWD/dist/pi/<package>" --local
pi remove "$PWD/dist/pi/<package>" --local
```

These commands update `.pi/settings.json` and are intentionally excluded from
automated baseline verification.

## Official References

- Claude Code plugins:
  <https://code.claude.com/docs/en/plugins-reference>
- Codex plugin construction:
  <https://developers.openai.com/codex/plugins/build>
- Codex CLI plugin commands:
  <https://developers.openai.com/codex/cli/reference>
- Cursor Skills:
  <https://cursor.com/docs/skills>
- OpenCode Skills:
  <https://opencode.ai/docs/skills/>
- OpenCode agents:
  <https://opencode.ai/docs/agents/>
- Pi packages:
  <https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md>

