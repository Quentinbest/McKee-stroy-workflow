import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildPackageArtifacts, PACKAGE_HOSTS } from "./package-adapters.mjs";
import { buildPackageModels, frameworkRoot } from "./package-model.mjs";

function recoverySteps(packages) {
  return [
    `Remove one conflicting package from this scope: ${packages.join(" vs ")}`,
    `Keep only one edition installed per scope; prefer workflow when story-project support is required.`,
  ];
}

export function buildPackageDoctorReport(root = frameworkRoot()) {
  const artifacts = buildPackageArtifacts(root);
  const models = buildPackageModels(root);
  const modelById = new Map(models.map((pkg) => [pkg.id, pkg]));

  const scopes = [];

  for (const host of PACKAGE_HOSTS) {
    for (const packageId of [
      "mckee-story-core",
      "mckee-story-workflow",
      "mckee-story-wiki-maintainer",
    ]) {
      const artifact = artifacts.find((entry) => entry.host === host && entry.packageId === packageId);
      const issues = [];

      if (host === "opencode" && !artifact.files.some((file) => file.path === "opencode.fragment.json")) {
        issues.push({
          code: "missing_host_fragment",
          message: "OpenCode package is missing opencode.fragment.json",
          recovery: ["Regenerate package artifacts so the OpenCode permission fragment is included."],
        });
      }
      if (host === "codex" && !artifact.files.some((file) => file.path === ".codex-plugin/plugin.json")) {
        issues.push({
          code: "missing_host_manifest",
          message: "Codex package is missing .codex-plugin/plugin.json",
          recovery: ["Regenerate package artifacts so the Codex plugin manifest is included."],
        });
      }
      if (host === "pi" && !artifact.files.some((file) => file.path === "package.json")) {
        issues.push({
          code: "missing_host_manifest",
          message: "Pi package is missing package.json",
          recovery: ["Regenerate package artifacts so the Pi package manifest is included."],
        });
      }
      if (
        host === "cursor" &&
        !artifact.files.some((file) => file.path === ".cursor/rules/mckee-story-workflow.mdc")
      ) {
        issues.push({
          code: "missing_host_rule",
          message: "Cursor package is missing .cursor/rules/mckee-story-workflow.mdc",
          recovery: ["Regenerate package artifacts so the Cursor rule fallback is included."],
        });
      }
      if (host === "cursor" && !artifact.files.some((file) => file.path.startsWith(".cursor/skills/"))) {
        issues.push({
          code: "missing_host_skills",
          message: "Cursor package is missing .cursor/skills fallback entries",
          recovery: ["Regenerate package artifacts so the Cursor skill fallback is included."],
        });
      }

      scopes.push({
        scope: `${host}:${packageId}`,
        host,
        selectedPackages: [packageId],
        status: issues.length ? "fail" : "pass",
        issues,
      });
    }

    const conflictingPackages = ["mckee-story-core", "mckee-story-workflow"];
    const mutualConflict = conflictingPackages.every((packageId, index) => {
      const pkg = modelById.get(packageId);
      const other = conflictingPackages[1 - index];
      return (pkg.conflicts ?? []).includes(other);
    });

    scopes.push({
      scope: `${host}:core+workflow`,
      host,
      selectedPackages: conflictingPackages,
      status: "fail",
      issues: [
        {
          code: "edition_conflict",
          message: mutualConflict
            ? "core and workflow are mutually exclusive within one install scope"
            : "package conflict metadata is incomplete",
          recovery: recoverySteps(conflictingPackages),
        },
      ],
    });
  }

  return {
    schemaVersion: 1,
    generatedAt: "package-doctor-runtime",
    source: "src/distribution/packages.json",
    scopes,
  };
}

export function writePackageDoctorReport(root = frameworkRoot()) {
  const report = buildPackageDoctorReport(root);
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/package-doctor.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}
