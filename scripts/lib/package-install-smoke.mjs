import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import { buildRcArtifacts, buildCodexMarketplaceManifest } from "./release-artifacts.mjs";
import { frameworkRoot } from "./package-model.mjs";

function safeRelativePath(path) {
  const parts = path.split("/");
  if (
    !path ||
    isAbsolute(path) ||
    path.includes("\\") ||
    parts.some((part) => !part || part === "." || part === "..") ||
    posix.normalize(path) !== path
  ) {
    throw new Error(`unsafe package path: ${path || "<empty>"}`);
  }
  return path;
}

function writeArtifact(root, artifact) {
  for (const file of artifact.files) {
    const path = safeRelativePath(file.path);
    const absolutePath = resolve(root, ...path.split("/"));
    const relativePath = relative(root, absolutePath);
    if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
      throw new Error(`package path escapes install root: ${path}`);
    }
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, file.content);
  }
}

function markdownIds(root, suffix) {
  if (!existsSync(root)) return [];
  const ids = [];

  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const absolutePath = join(path, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.isFile() && absolutePath.endsWith(suffix)) {
        ids.push(basename(dirname(absolutePath)));
      }
    }
  }

  visit(root);
  return ids.sort();
}

function roleIds(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .sort();
}

function assertFrontmatterDoesNotContainUnsafePlainScalars(path) {
  const document = readFileSync(path, "utf8");
  if (!document.startsWith("---\n")) return;
  const end = document.indexOf("\n---\n", 4);
  if (end === -1) throw new Error(`unterminated frontmatter: ${path}`);

  for (const line of document.slice(4, end).split("\n")) {
    const match = line.match(/^[A-Za-z0-9_-]+:\s+(.+)$/);
    if (!match) continue;
    const value = match[1].trim();
    if (/^(?:["'{[]|[>|])/.test(value)) continue;
    if (value.includes(": ")) {
      throw new Error(`unsafe YAML plain scalar in ${path}: ${line}`);
    }
  }
}

function validateFrontmatterTree(root) {
  if (!existsSync(root)) return;

  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const absolutePath = join(path, entry.name);
      if (entry.isDirectory()) visit(absolutePath);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        assertFrontmatterDoesNotContainUnsafePlainScalars(absolutePath);
      }
    }
  }

  visit(root);
}

function expectedIds(artifact) {
  return {
    skills: [...artifact.manifest.projectedSkillIds].sort(),
    roles: [...artifact.manifest.projectedRoleIds].sort(),
  };
}

function verifyIds(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} discovery mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function installClaude(sandbox, artifact) {
  const root = join(sandbox, "claude", "plugins", artifact.packageId);
  writeArtifact(root, artifact);
  const manifest = JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8"));
  if (manifest.name !== artifact.packageId) throw new Error("Claude plugin name mismatch");
  validateFrontmatterTree(join(root, "skills"));
  validateFrontmatterTree(join(root, "agents"));
  const expected = expectedIds(artifact);
  verifyIds(markdownIds(join(root, "skills"), "SKILL.md"), expected.skills, "Claude Skill");
  verifyIds(roleIds(join(root, "agents")), expected.roles, "Claude agent");
  return root;
}

function installCodex(sandbox, artifact) {
  const marketplaceRoot = join(sandbox, "codex-marketplace");
  const root = join(marketplaceRoot, "plugins", artifact.packageId);
  writeArtifact(root, artifact);
  const manifest = buildCodexMarketplaceManifest([artifact]);
  const marketplacePath = join(marketplaceRoot, ".agents", "plugins", "marketplace.json");
  mkdirSync(dirname(marketplacePath), { recursive: true });
  writeFileSync(marketplacePath, `${JSON.stringify(manifest, null, 2)}\n`);

  const entry = manifest.plugins[0];
  if (entry.name !== artifact.packageId || entry.source.path !== `./plugins/${artifact.packageId}`) {
    throw new Error("Codex marketplace entry mismatch");
  }
  const plugin = JSON.parse(readFileSync(join(root, ".codex-plugin", "plugin.json"), "utf8"));
  if (plugin.name !== artifact.packageId) throw new Error("Codex plugin name mismatch");
  validateFrontmatterTree(join(root, "skills"));
  verifyIds(
    markdownIds(join(root, "skills"), "SKILL.md"),
    expectedIds(artifact).skills,
    "Codex Skill",
  );
  return root;
}

function installCursor(sandbox, artifact) {
  const root = join(sandbox, "cursor-project");
  writeArtifact(root, artifact);
  validateFrontmatterTree(join(root, ".cursor", "skills"));
  verifyIds(
    markdownIds(join(root, ".cursor", "skills"), "SKILL.md"),
    expectedIds(artifact).skills,
    "Cursor Skill",
  );
  if (!existsSync(join(root, ".cursor", "rules", "mckee-story-workflow.mdc"))) {
    throw new Error("Cursor rule fallback is missing");
  }
  return root;
}

function installOpenCode(sandbox, artifact) {
  const root = join(sandbox, "opencode-project");
  writeArtifact(root, artifact);
  validateFrontmatterTree(join(root, ".agents", "skills"));
  validateFrontmatterTree(join(root, ".opencode", "agents"));
  const expected = expectedIds(artifact);
  verifyIds(
    markdownIds(join(root, ".agents", "skills"), "SKILL.md"),
    expected.skills,
    "OpenCode Skill",
  );
  verifyIds(roleIds(join(root, ".opencode", "agents")), expected.roles, "OpenCode agent");
  return root;
}

function installPi(sandbox, artifact) {
  const root = join(sandbox, "pi-packages", artifact.packageId);
  writeArtifact(root, artifact);
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (!manifest.keywords?.includes("pi-package")) throw new Error("Pi package keyword is missing");
  if (JSON.stringify(manifest.pi?.skills) !== JSON.stringify(["./skills"])) {
    throw new Error("Pi package must declare pi.skills as [\"./skills\"]");
  }
  validateFrontmatterTree(join(root, "skills"));
  verifyIds(markdownIds(join(root, "skills"), "SKILL.md"), expectedIds(artifact).skills, "Pi Skill");
  return root;
}

const INSTALLERS = {
  claude: installClaude,
  codex: installCodex,
  cursor: installCursor,
  opencode: installOpenCode,
  pi: installPi,
};

export function smokeArtifactInstall(artifact) {
  const sandbox = mkdtempSync(join(tmpdir(), "mckee-package-smoke-"));
  try {
    const installRoot = INSTALLERS[artifact.host](sandbox, artifact);
    if (!existsSync(installRoot)) throw new Error("install root was not created");
    rmSync(installRoot, { recursive: true, force: true });
    if (existsSync(installRoot)) throw new Error("uninstall did not remove the package");
    return {
      host: artifact.host,
      packageId: artifact.packageId,
      edition: artifact.edition,
      installedSkillCount: artifact.manifest.projectedSkillIds.length,
      installedRoleCount: artifact.manifest.projectedRoleIds.length,
      install: "pass",
      discovery: "pass",
      uninstall: "pass",
    };
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

export function runPackageInstallSmoke(root = frameworkRoot()) {
  return buildRcArtifacts(root)
    .map(smokeArtifactInstall)
    .sort((left, right) => {
      const packageComparison = left.packageId.localeCompare(right.packageId);
      return packageComparison !== 0 ? packageComparison : left.host.localeCompare(right.host);
    });
}

export function writePackageInstallSmokeReport(root = frameworkRoot()) {
  const results = runPackageInstallSmoke(root);
  const report = {
    schemaVersion: 1,
    generatedAt: "package-install-smoke-runtime",
    isolation: "temporary-directories",
    network: "not-used",
    userConfigurationMutation: false,
    results,
  };
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(
    join(root, "reports", "package-install-smoke.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  return report;
}
