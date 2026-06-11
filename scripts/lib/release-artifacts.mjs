import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { buildPackageArtifacts } from "./package-adapters.mjs";
import { frameworkRoot } from "./package-model.mjs";
import { sha256 } from "./generator.mjs";

function gitCommit(root) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : "unknown";
}

function licenseText(root) {
  const path = join(root, "LICENSE");
  if (existsSync(path)) {
    return {
      content: readFileSync(path, "utf8"),
      path: "LICENSE",
      status: "included",
    };
  }
  return {
    content: [
      "LICENSE REVIEW REQUIRED",
      "",
      "This internal release-candidate artifact was built from a repository",
      "without a top-level LICENSE file. External distribution is not approved.",
      "",
    ].join("\n"),
    path: "LICENSE-REVIEW-REQUIRED.txt",
    status: "review-required",
  };
}

function readmeText(artifact, license) {
  const install = {
    claude: [
      "Session load:",
      `- \`claude --plugin-dir /absolute/path/to/dist/claude/${artifact.packageId}\``,
      "Removal:",
      "- End the session; `--plugin-dir` does not persist installation state.",
    ],
    codex: [
      "Install from the generated local marketplace:",
      "- `codex plugin marketplace add /absolute/path/to/dist/codex`",
      `- \`codex plugin add ${artifact.packageId}@mckee-story-workflow-local\``,
      "Removal:",
      `- \`codex plugin remove ${artifact.packageId}@mckee-story-workflow-local\``,
    ],
    cursor: [
      "Project install:",
      `- Copy \`dist/cursor/${artifact.packageId}/.cursor/\` into the target project's \`.cursor/\` directory.`,
      "Removal:",
      "- Remove only the copied Skill and rule files listed in `package-manifest.json`.",
    ],
    opencode: [
      "Project install:",
      `- Copy \`dist/opencode/${artifact.packageId}/.agents/\` and \`.opencode/\` into the target project.`,
      "- Review and merge `opencode.fragment.json` into the target configuration.",
      "Removal:",
      "- Remove only the copied files listed in `package-manifest.json` and revert the reviewed config merge.",
    ],
    pi: [
      "Project-local install:",
      `- \`pi install /absolute/path/to/dist/pi/${artifact.packageId} --local\``,
      "Removal:",
      `- \`pi remove /absolute/path/to/dist/pi/${artifact.packageId} --local\``,
    ],
  }[artifact.host];

  return [
    `# ${artifact.packageId} (${artifact.host}) RC`,
    "",
    `Edition: ${artifact.edition}`,
    `Host: ${artifact.host}`,
    "",
    "This is a deterministic RC directory artifact assembled from canonical McKee Story Workflow sources.",
    "",
    "Contents:",
    "- Host-native install layout",
    "- package-manifest.json",
    "- checksums.txt",
    "- provenance.json",
    `- ${license.path}`,
    "",
    "Validation:",
    "- Run the repository verification commands before promoting this RC artifact.",
    "",
    ...install,
  ].join("\n");
}

function checksumsFor(files) {
  return files
    .map((file) => `${file.sha256}  ${file.path}`)
    .sort((left, right) => left.localeCompare(right))
    .join("\n")
    .concat("\n");
}

export function buildCodexMarketplaceManifest(artifacts) {
  const plugins = artifacts
    .filter((artifact) => artifact.host === "codex")
    .sort((left, right) => left.packageId.localeCompare(right.packageId))
    .map((artifact) => ({
      name: artifact.packageId,
      source: {
        source: "local",
        path: `./plugins/${artifact.packageId}`,
      },
      policy: {
        installation: "AVAILABLE",
        authentication: "ON_INSTALL",
      },
      category: "Productivity",
    }));

  return {
    name: "mckee-story-workflow-local",
    interface: {
      displayName: "McKee Story Workflow",
    },
    plugins,
  };
}

export function buildRcArtifacts(root = frameworkRoot()) {
  const artifacts = buildPackageArtifacts(root);
  const commit = gitCommit(root);
  const license = licenseText(root);

  return artifacts.map((artifact) => {
    const manifest = JSON.parse(artifact.files.find((file) => file.path === "package-manifest.json").content);
    const distributedFiles = artifact.files.map((file) => ({ ...file }));

    distributedFiles.push({
      path: "README.md",
      content: `${readmeText(artifact, license)}\n`,
      sourcePath: "tasks/TASK-2026-009-rc-artifact-assembly.md",
      sha256: "",
    });
    distributedFiles.push({
      path: license.path,
      content: license.content.endsWith("\n") ? license.content : `${license.content}\n`,
      sourcePath: license.status === "included" ? "LICENSE" : "generated",
      sha256: "",
    });

    for (const file of distributedFiles) {
      file.sha256 = sha256(file.content);
    }

    const provenance = {
      schemaVersion: 1,
      packageId: artifact.packageId,
      host: artifact.host,
      edition: artifact.edition,
      sourceCommit: commit,
      licenseStatus: license.status,
      generator: "scripts/lib/release-artifacts.mjs",
      sourceManifest: "src/distribution/packages.json",
      fileCount: distributedFiles.length + 2,
    };
    const provenanceContent = `${JSON.stringify(provenance, null, 2)}\n`;
    distributedFiles.push({
      path: "provenance.json",
      content: provenanceContent,
      sourcePath: "generated",
      sha256: sha256(provenanceContent),
    });
    const finalizedChecksums = checksumsFor(distributedFiles);

    const outputFiles = [
      ...distributedFiles,
      {
        path: "checksums.txt",
        content: finalizedChecksums,
        sourcePath: "generated",
        sha256: sha256(finalizedChecksums),
      },
    ].sort((left, right) => left.path.localeCompare(right.path));

    return {
      host: artifact.host,
      packageId: artifact.packageId,
      edition: artifact.edition,
      manifest,
      files: outputFiles,
    };
  });
}

export function writeRcArtifacts(root = frameworkRoot()) {
  const artifacts = buildRcArtifacts(root);
  const distRoot = join(root, "dist");
  rmSync(distRoot, { recursive: true, force: true });

  for (const artifact of artifacts) {
    for (const file of artifact.files) {
      const hostRoot =
        artifact.host === "codex"
          ? join(distRoot, artifact.host, "plugins", artifact.packageId)
          : join(distRoot, artifact.host, artifact.packageId);
      const absolutePath = join(hostRoot, file.path);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, file.content);
    }
  }

  const codexMarketplace = buildCodexMarketplaceManifest(artifacts);
  const codexMarketplacePath = join(distRoot, "codex", ".agents", "plugins", "marketplace.json");
  mkdirSync(dirname(codexMarketplacePath), { recursive: true });
  writeFileSync(codexMarketplacePath, `${JSON.stringify(codexMarketplace, null, 2)}\n`);

  const summary = {
    schemaVersion: 1,
    generatedAt: "rc-artifact-runtime",
    source: "src/distribution/packages.json",
    artifacts: artifacts.map((artifact) => ({
      host: artifact.host,
      packageId: artifact.packageId,
      edition: artifact.edition,
      fileCount: artifact.files.length,
    })),
    hostBundles: [
      {
        host: "codex",
        root: "dist/codex",
        manifest: "dist/codex/.agents/plugins/marketplace.json",
        packageCount: codexMarketplace.plugins.length,
      },
    ],
  };

  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/rc-artifacts.json"), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}
