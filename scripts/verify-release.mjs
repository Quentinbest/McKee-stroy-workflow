import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const required = [
  "VERSION",
  "CHANGELOG.md",
  "docs/agent/versioning-policy.md",
  "docs/agent/compatibility-ledger.md",
  "docs/agent/maintenance-calendar.md",
  "docs/agent/ownership-matrix.md",
  "docs/agent/framework-health.md",
  "docs/agent/release-checklist.md",
  "reports/release-evidence.json",
  "reports/acceptance-audit.json",
  "reports/native-conformance-pilots.json",
];
for (const path of required) if (!existsSync(join(root, path))) failures.push(`missing ${path}`);

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = readFileSync(join(root, "VERSION"), "utf8").trim();
if (packageJson.version !== version) failures.push("VERSION and package.json disagree");

const manifest = JSON.parse(readFileSync(join(root, "generated-manifest.json"), "utf8"));
for (const entry of manifest.files) {
  if (!entry.sourceVersion) failures.push(`${entry.path}: missing sourceVersion`);
  if (!entry.generatorVersion) failures.push(`${entry.path}: missing generatorVersion`);
  if (!entry.verification?.command) failures.push(`${entry.path}: missing verification trace`);
}
const evidence = JSON.parse(readFileSync(join(root, "reports/release-evidence.json"), "utf8"));
const audit = JSON.parse(readFileSync(join(root, "reports/acceptance-audit.json"), "utf8"));
if (evidence.verification.framework !== "passed") failures.push("framework evidence not passed");
if (evidence.verification.deterministicConformance !== "passed") {
  failures.push("deterministic conformance evidence not passed");
}
if (evidence.verification.nativeConformance !== "partial") {
  failures.push("native conformance must preserve the unresolved Claude gate");
}
if (evidence.verification.humanLiteraryReview !== "pending") {
  failures.push("release candidate must preserve the pending human review state");
}
if (evidence.releaseDecision !== "blocked-native-and-human-gates") {
  failures.push("release must remain blocked before native and human gates pass");
}
if (audit.conclusion !== "native-conformance-and-human-gates-pending") {
  failures.push("acceptance audit must preserve native and human pending gates");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Release governance: PASS (${version}, release candidate)`);
