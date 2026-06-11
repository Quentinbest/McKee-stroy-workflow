import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { buildPackageArtifacts } from "./lib/package-adapters.mjs";
import { buildArchiveArtifacts, verifyArchiveArtifacts } from "./lib/archive-artifacts.mjs";
import { buildPackageDoctorReport } from "./lib/package-doctor.mjs";
import { buildPackageModels, frameworkRoot } from "./lib/package-model.mjs";

const root = frameworkRoot();

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }

  return { command, options };
}

function runNodeScript(path) {
  const result = spawnSync(process.execPath, [path], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function filteredArtifacts(options) {
  const target = options.target;
  const edition = options.edition;
  const artifacts = buildPackageArtifacts(root);

  const filtered = artifacts.filter((artifact) => {
    if (target && target !== "all" && artifact.host !== target) return false;
    if (edition && artifact.edition !== edition) return false;
    return true;
  });

  if (target && target !== "all" && !artifacts.some((artifact) => artifact.host === target)) {
    throw new Error(`Unknown target: ${target}`);
  }
  if (edition && !artifacts.some((artifact) => artifact.edition === edition)) {
    throw new Error(`Unknown edition: ${edition}`);
  }

  return filtered;
}

function buildCommand() {
  runNodeScript("scripts/build-package-models.mjs");
  runNodeScript("scripts/build-pilot-packages.mjs");
  runNodeScript("scripts/build-package-artifacts.mjs");
  runNodeScript("scripts/build-package-doctor.mjs");
  runNodeScript("scripts/build-rc-artifacts.mjs");
}

function archiveCommand() {
  const manifest = buildArchiveArtifacts(root);
  verifyArchiveArtifacts(root);
  process.stdout.write(`archive: PASS (${manifest.assets.length} tarballs)\n`);
}

function inspectCommand(options) {
  const artifacts = filteredArtifacts(options).map((artifact) => ({
    host: artifact.host,
    packageId: artifact.packageId,
    edition: artifact.edition,
    projectedSkillIds: artifact.projectedSkillIds,
    projectedRoleIds: artifact.projectedRoleIds,
    fileCount: artifact.files.length,
  }));
  process.stdout.write(`${JSON.stringify({ artifacts }, null, 2)}\n`);
}

function verifyCommand(options) {
  const artifacts = filteredArtifacts(options);
  const doctor = buildPackageDoctorReport(root);

  assert.ok(artifacts.length > 0, "No artifacts matched the requested filter");
  for (const artifact of artifacts) {
    const manifest = JSON.parse(artifact.files.find((file) => file.path === "package-manifest.json").content);
    assert.equal(manifest.projectedSkillIds.length, artifact.projectedSkillIds.length);
    assert.ok(
      manifest.permissionProfile.every((entry) =>
        ["native", "runtime", "advisory"].includes(entry.enforcementLevel),
      ),
      "invalid permission enforcement level",
    );
  }

  const conflictScopes = doctor.scopes.filter((scope) => scope.scope.endsWith("core+workflow"));
  assert.ok(conflictScopes.every((scope) => scope.status === "fail"));
  process.stdout.write(
    `verify: PASS (${artifacts.length} artifacts, ${buildPackageModels(root).length} package models)\n`,
  );
}

function doctorCommand(options) {
  const report = buildPackageDoctorReport(root);
  const scope = options.scope;

  if (!scope || scope === "project") {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  const filteredScopes = report.scopes.filter((entry) => entry.scope === scope);
  if (filteredScopes.length === 0) throw new Error(`Unknown doctor scope: ${scope}`);
  process.stdout.write(`${JSON.stringify({ ...report, scopes: filteredScopes }, null, 2)}\n`);
}

function usage() {
  process.stderr.write(
    "Usage: node scripts/mckee-skills.mjs <build|inspect|verify|doctor|archive> [--target <host>] [--edition <edition>] [--scope <scope>]\n",
  );
}

const { command, options } = parseArgs(process.argv.slice(2));

try {
  switch (command) {
    case "build":
      buildCommand(options);
      break;
    case "inspect":
      inspectCommand(options);
      break;
    case "verify":
      verifyCommand(options);
      break;
    case "doctor":
      doctorCommand(options);
      break;
    case "archive":
      archiveCommand(options);
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
