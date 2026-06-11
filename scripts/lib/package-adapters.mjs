import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  GENERATED_ROOTS,
  generatedMarkdown,
  openCodeAgentMarkdown,
  sha256,
} from "./generator.mjs";
import { buildPackageModels, frameworkRoot } from "./package-model.mjs";
import { buildPackagePolicy } from "./package-policy.mjs";

export const PILOT_HOSTS = ["claude", "opencode", "codex", "pi", "cursor"];
export const PACKAGE_HOSTS = PILOT_HOSTS;
export const PILOT_SKILL_IDS = ["mck-gap-find", "mck-setup-payoff"];
export const PILOT_PACKAGE_IDS = ["mckee-story-core", "mckee-story-workflow"];
const PILOT_PACKAGE_SKILLS = new Map([
  ["mckee-story-core", ["mck-gap-find"]],
  ["mckee-story-workflow", ["mck-gap-find", "mck-setup-payoff"]],
]);

function canonicalRoleIds(root) {
  return readdirSync(join(root, "src/roles"))
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .sort();
}

function roleIdsForPackage(pkg, roleIds) {
  if (pkg.roleMode === "native-or-fallback") {
    return roleIds.filter((roleId) => roleId !== "wiki-librarian");
  }
  if (pkg.roleMode === "wiki-only") {
    return roleIds.filter((roleId) => roleId === "wiki-librarian");
  }
  return [];
}

function readCanonicalFile(root, relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function normalizeContent(content) {
  return content.endsWith("\n") ? content : `${content}\n`;
}

function addFile(files, path, content, sourcePath) {
  const normalized = normalizeContent(content);
  files.push({
    path,
    content: normalized,
    sourcePath,
    sha256: sha256(normalized),
  });
}

function hostProjectedRoleIds(host, pkg, roleIds) {
  if (roleIds.length === 0) return [];
  if (host === "codex" || host === "cursor") return [];
  return roleIds;
}

function packageVersion(root, variant) {
  return variant === "pilot" ? "1.0.0-pilot" : readFileSync(join(root, "VERSION"), "utf8").trim();
}

function packageName(pkg, variant) {
  return variant === "pilot" ? `${pkg.id}-pilot` : pkg.id;
}

function packageDescription(pkg, variant) {
  return variant === "pilot" ? `Pilot projection for ${pkg.id}` : pkg.description;
}

function buildClaudePackage(root, pkg, skillIds, roleIds, variant) {
  const files = [];
  addFile(
    files,
    ".claude-plugin/plugin.json",
    JSON.stringify(
      {
        name: packageName(pkg, variant),
        description: packageDescription(pkg, variant),
        version: packageVersion(root, variant),
        author: {
          name: "McKee Story Workflow",
        },
      },
      null,
      2,
    ),
    "src/distribution/packages.json",
  );

  for (const skillId of skillIds) {
    const sourcePath = `src/skills/${skillId}/SKILL.md`;
    addFile(
      files,
      `skills/${skillId}/SKILL.md`,
      generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
      sourcePath,
    );
  }

  if (roleIds.length > 0) {
    for (const roleId of roleIds) {
      const sourcePath = `src/roles/${roleId}.md`;
      addFile(
        files,
        `agents/${roleId}.md`,
        generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
        sourcePath,
      );
    }
  }

  return files;
}

function buildOpenCodePackage(root, pkg, skillIds, roleIds) {
  const files = [];

  for (const skillId of skillIds) {
    const sourcePath = `src/skills/${skillId}/SKILL.md`;
    addFile(
      files,
      `.agents/skills/${skillId}/SKILL.md`,
      generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
      sourcePath,
    );
  }

  if (roleIds.length > 0) {
    for (const roleId of roleIds) {
      const sourcePath = `src/roles/${roleId}.md`;
      addFile(
        files,
        `.opencode/agents/${roleId}.md`,
        openCodeAgentMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
        sourcePath,
      );
    }
  }

  return files;
}

function buildCodexPackage(root, pkg, skillIds, variant) {
  const files = [];
  addFile(
    files,
    ".codex-plugin/plugin.json",
    JSON.stringify(
      {
        name: packageName(pkg, variant),
        description: packageDescription(pkg, variant),
        version: packageVersion(root, variant),
      },
      null,
      2,
    ),
    "src/distribution/packages.json",
  );

  for (const skillId of skillIds) {
    const sourcePath = `src/skills/${skillId}/SKILL.md`;
    addFile(
      files,
      `skills/${skillId}/SKILL.md`,
      generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
      sourcePath,
    );
  }

  return files;
}

function buildPiPackage(root, pkg, skillIds, roleIds, variant) {
  const files = [];
  addFile(
    files,
    "package.json",
    JSON.stringify(
      {
        name: packageName(pkg, variant),
        version: packageVersion(root, variant),
        private: true,
        description: packageDescription(pkg, variant),
        keywords: ["pi-package"],
        edition: pkg.edition,
        pi: {
          skills: ["./skills"],
        },
      },
      null,
      2,
    ),
    "src/distribution/packages.json",
  );

  for (const skillId of skillIds) {
    const sourcePath = `src/skills/${skillId}/SKILL.md`;
    addFile(
      files,
      `skills/${skillId}/SKILL.md`,
      generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
      sourcePath,
    );
  }

  if (roleIds.length > 0) {
    for (const roleId of roleIds) {
      const sourcePath = `src/roles/${roleId}.md`;
      addFile(
        files,
        `references/roles/${roleId}.md`,
        generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
        sourcePath,
      );
    }
  }

  return files;
}

function buildCursorPackage(root, pkg, skillIds) {
  const files = [];

  for (const skillId of skillIds) {
    const sourcePath = `src/skills/${skillId}/SKILL.md`;
    addFile(
      files,
      `.cursor/skills/${skillId}/SKILL.md`,
      generatedMarkdown(readCanonicalFile(root, sourcePath), sourcePath),
      sourcePath,
    );
  }

  addFile(
    files,
    ".cursor/rules/mckee-story-workflow.mdc",
    readCanonicalFile(root, ".cursor/rules/canonical-workflow.mdc"),
    ".cursor/rules/canonical-workflow.mdc",
  );

  return files;
}

function buildHostFiles(root, host, pkg, skillIds, roleIds, variant) {
  if (host === "claude") return buildClaudePackage(root, pkg, skillIds, roleIds, variant);
  if (host === "opencode") return buildOpenCodePackage(root, pkg, skillIds, roleIds);
  if (host === "codex") return buildCodexPackage(root, pkg, skillIds, variant);
  if (host === "pi") return buildPiPackage(root, pkg, skillIds, roleIds, variant);
  if (host === "cursor") return buildCursorPackage(root, pkg, skillIds);
  throw new Error(`Unsupported package host: ${host}`);
}

function manifestFor(root, host, pkg, skillIds, roleIds, files) {
  const policy = buildPackagePolicy(root, host, pkg);
  const projectedRoleIds = hostProjectedRoleIds(host, pkg, roleIds);
  return {
    schemaVersion: 1,
    host,
    packageId: pkg.id,
    edition: pkg.edition,
    description: pkg.description,
    projectedSkillIds: skillIds,
    projectedRoleIds,
    roleMode: pkg.roleMode,
    capabilityProfile: policy.capabilityProfile,
    permissionProfile: policy.permissionProfile,
    fileCount: files.length + 1,
    generatedRoots: GENERATED_ROOTS,
    files: files
      .map(({ path, sourcePath, sha256: fileHash }) => ({
        path,
        sourcePath,
        sha256: fileHash,
      }))
      .sort((left, right) => left.path.localeCompare(right.path)),
  };
}

function buildArtifacts(root, { packageIds, skillsForPackage, variant }) {
  const packageModels = buildPackageModels(root);
  const allRoleIds = canonicalRoleIds(root);

  return packageModels
    .filter((pkg) => packageIds.includes(pkg.id))
    .map((pkg) => ({
      ...pkg,
      projectedSkillIds: skillsForPackage(pkg).filter((skillId) => pkg.skills.includes(skillId)),
      projectedHosts: pkg.targets.filter((host) => PACKAGE_HOSTS.includes(host)),
      projectedPackageRoleIds: roleIdsForPackage(pkg, allRoleIds),
    }))
    .filter((pkg) => pkg.projectedSkillIds.length > 0)
    .flatMap((pkg) =>
      pkg.projectedHosts.map((host) => {
        const files = buildHostFiles(
          root,
          host,
          pkg,
          pkg.projectedSkillIds,
          pkg.projectedPackageRoleIds,
          variant,
        );
        const policy = buildPackagePolicy(root, host, pkg);
        if (policy.hostConfig) {
          addFile(files, policy.hostConfig.file, policy.hostConfig.content, "config/security-policy.json");
        }
        const manifest = manifestFor(
          root,
          host,
          pkg,
          pkg.projectedSkillIds,
          pkg.projectedPackageRoleIds,
          files,
        );
        addFile(
          files,
          "package-manifest.json",
          JSON.stringify(manifest, null, 2),
          "src/distribution/packages.json",
        );
        return {
          host,
          packageId: pkg.id,
          edition: pkg.edition,
          projectedSkillIds: pkg.projectedSkillIds,
          projectedRoleIds: manifest.projectedRoleIds,
          files: files
            .map(({ path, content, sourcePath, sha256: fileHash }) => ({
              path,
              content,
              sourcePath,
              sha256: fileHash,
            }))
            .sort((left, right) => left.path.localeCompare(right.path)),
        };
      }),
    )
    .sort((left, right) => {
      const packageComparison = left.packageId.localeCompare(right.packageId);
      return packageComparison !== 0 ? packageComparison : left.host.localeCompare(right.host);
    });
}

export function buildPilotPackageArtifacts(root = frameworkRoot()) {
  return buildArtifacts(root, {
    packageIds: PILOT_PACKAGE_IDS,
    skillsForPackage: (pkg) => PILOT_PACKAGE_SKILLS.get(pkg.id) ?? [],
    variant: "pilot",
  });
}

export function buildPackageArtifacts(root = frameworkRoot()) {
  return buildArtifacts(root, {
    packageIds: buildPackageModels(root).map((pkg) => pkg.id),
    skillsForPackage: (pkg) => pkg.skills,
    variant: "full",
  });
}

function writeArtifacts(root, artifacts, outputRoot, summaryPath, summary) {
  rmSync(outputRoot, { force: true, recursive: true });

  for (const artifact of artifacts) {
    for (const file of artifact.files) {
      const absolutePath = join(outputRoot, artifact.host, artifact.packageId, file.path);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, file.content);
    }
  }

  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

function artifactSummary(artifacts) {
  return artifacts.map((artifact) => ({
    host: artifact.host,
    packageId: artifact.packageId,
    edition: artifact.edition,
    projectedSkillIds: artifact.projectedSkillIds,
    projectedRoleIds: artifact.projectedRoleIds,
    permissionEnforcement: JSON.parse(
      artifact.files.find((file) => file.path === "package-manifest.json").content,
    ).permissionProfile.reduce((acc, entry) => {
      acc[entry.enforcementLevel] = (acc[entry.enforcementLevel] ?? 0) + 1;
      return acc;
    }, {}),
    fileCount: artifact.files.length,
  }));
}

export function writePilotPackageArtifacts(root = frameworkRoot()) {
  const artifacts = buildPilotPackageArtifacts(root);
  const outputRoot = join(root, "reports/package-pilots");
  const summary = {
    schemaVersion: 1,
    generatedAt: "pilot-package-runtime",
    source: "src/distribution/packages.json",
    pilotHosts: PILOT_HOSTS,
    pilotSkillIds: PILOT_SKILL_IDS,
    packages: artifactSummary(artifacts),
  };

  return writeArtifacts(
    root,
    artifacts,
    outputRoot,
    join(root, "reports/package-pilots.json"),
    summary,
  );
}

export function writePackageArtifacts(root = frameworkRoot()) {
  const artifacts = buildPackageArtifacts(root);
  const summary = {
    schemaVersion: 1,
    generatedAt: "package-artifact-runtime",
    source: "src/distribution/packages.json",
    hosts: PACKAGE_HOSTS,
    packageCount: buildPackageModels(root).length,
    packages: artifactSummary(artifacts),
  };

  return writeArtifacts(
    root,
    artifacts,
    join(root, "reports/package-artifacts"),
    join(root, "reports/package-artifacts.json"),
    summary,
  );
}
