import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

export const GENERATOR_VERSION = "1.0.0";

export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function directories(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function markdownFiles(path) {
  return readdirSync(path)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

function generatedMarkdown(source, sourcePath) {
  const hash = sha256(source);
  if (!source.startsWith("---\n")) {
    return [
      `<!-- GENERATED FILE. DO NOT EDIT. source=${sourcePath} sha256=${hash} generator=${GENERATOR_VERSION} -->`,
      source,
    ].join("\n");
  }
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) throw new Error(`Unterminated frontmatter: ${sourcePath}`);
  const metadata = [
    "generated: true",
    `source: ${sourcePath}`,
    `source-sha256: ${hash}`,
    `generator-version: ${GENERATOR_VERSION}`,
  ].join("\n");
  return `${source.slice(0, end)}\n${metadata}${source.slice(end)}`;
}

function addFile(files, path, content, sourcePath = null) {
  files.set(path, {
    content: content.endsWith("\n") ? content : `${content}\n`,
    sourcePath,
  });
}

export function buildGeneratedFiles(root) {
  const files = new Map();
  const skillsRoot = join(root, "src/skills");
  const rolesRoot = join(root, "src/roles");

  for (const id of directories(skillsRoot)) {
    const sourcePath = `src/skills/${id}/SKILL.md`;
    const source = readFileSync(join(root, sourcePath), "utf8");
    const generated = generatedMarkdown(source, sourcePath);
    addFile(files, `.agents/skills/${id}/SKILL.md`, generated, sourcePath);
    addFile(files, `.claude/skills/${id}/SKILL.md`, generated, sourcePath);
  }

  for (const filename of markdownFiles(rolesRoot)) {
    const id = basename(filename, ".md");
    const sourcePath = `src/roles/${filename}`;
    const source = readFileSync(join(root, sourcePath), "utf8");
    const generated = generatedMarkdown(source, sourcePath);
    addFile(files, `.claude/agents/${id}.md`, generated, sourcePath);
    addFile(files, `.opencode/agents/${id}.md`, generated, sourcePath);
  }

  const agentsSource = readFileSync(join(root, "AGENTS.md"), "utf8");
  const agentsHash = sha256(agentsSource);
  addFile(
    files,
    "CLAUDE.md",
    [
      "@AGENTS.md",
      "",
      "<!-- GENERATED FILE. DO NOT EDIT.",
      `source=AGENTS.md sha256=${agentsHash} generator=${GENERATOR_VERSION}`,
      "-->",
      "",
      "# Claude Code Adapter",
      "",
      "- Load applicable files from `.claude/rules/`.",
      "- Use project subagents only for bounded read, review, or isolated work.",
      "- Follow `.claude/settings.json` permission boundaries.",
    ].join("\n"),
    "AGENTS.md",
  );
  addFile(
    files,
    ".claude/rules/canonical-workflow.md",
    generatedMarkdown(
      "# Canonical Workflow\n\n`AGENTS.md` and the active task contract remain authoritative.\n",
      "AGENTS.md",
    ),
    "AGENTS.md",
  );
  addFile(
    files,
    ".cursor/rules/canonical-workflow.mdc",
    [
      "---",
      "description: McKee Story Workflow canonical entry point",
      "alwaysApply: true",
      "generated: true",
      "source: AGENTS.md",
      `source-sha256: ${agentsHash}`,
      `generator-version: ${GENERATOR_VERSION}`,
      "---",
      "",
      "# Canonical Workflow",
      "",
      "Follow root `AGENTS.md`, scoped instructions, and the active task contract.",
      "Run the same repository verification for local, background, and cloud agents.",
    ].join("\n"),
    "AGENTS.md",
  );

  const outputEntries = [...files.entries()]
    .map(([path, value]) => ({
      path,
      source: value.sourcePath,
      sha256: sha256(value.content),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const manifest = {
    schemaVersion: 1,
    generatorVersion: GENERATOR_VERSION,
    canonicalRoots: ["AGENTS.md", "src/skills", "src/roles"],
    files: outputEntries,
  };
  addFile(files, "generated-manifest.json", JSON.stringify(manifest, null, 2));

  const report = {
    schemaVersion: 1,
    generatorVersion: GENERATOR_VERSION,
    harnesses: {
      claude: { root: "CLAUDE.md", skills: 34, roles: 27, status: "generated" },
      cursor: { root: "AGENTS.md", rules: 1, status: "generated" },
      pi: { root: "AGENTS.md", sharedSkills: 34, status: "generated" },
      opencode: { root: "AGENTS.md", sharedSkills: 34, roles: 27, status: "generated" },
      codex: { root: "AGENTS.md", sharedSkills: 34, status: "generated" },
    },
  };
  addFile(files, "reports/compatibility-report.json", JSON.stringify(report, null, 2));
  return files;
}

export const GENERATED_ROOTS = [
  ".agents/skills",
  ".claude/skills",
  ".claude/agents",
  ".claude/rules",
  ".cursor/rules",
  ".opencode/agents",
];
