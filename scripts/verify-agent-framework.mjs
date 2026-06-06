import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
function testFiles(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return testFiles(child);
    return entry.name.endsWith(".test.mjs") ? [relative(root, child)] : [];
  });
}
const checks = [
  ["unit-integration-security", "node", ["--test", ...testFiles(join(root, "tests"))]],
  ["smoke-claude", "node", ["scripts/smoke-harness.mjs", "claude"]],
  ["smoke-cursor", "node", ["scripts/smoke-harness.mjs", "cursor"]],
  ["smoke-pi", "node", ["scripts/smoke-harness.mjs", "pi"]],
  ["smoke-opencode", "node", ["scripts/smoke-harness.mjs", "opencode"]],
  ["smoke-codex", "node", ["scripts/smoke-harness.mjs", "codex"]],
];
const results = [];
let failed = false;

for (const [id, command, args] of checks) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  const status = result.status === 0 ? "pass" : "fail";
  results.push({ id, command: [command, ...args].join(" "), status });
  if (result.status !== 0) failed = true;
}

const report = {
  schemaVersion: 1,
  generatedAt: "verification-runtime",
  nodeVersion: process.versions.node,
  status: failed ? "failed" : "passed",
  checks: results,
  residualRisks: [
    "Subjective story quality requires human evaluation.",
    "Native Cursor CLI execution is unavailable in the current environment.",
  ],
};
mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(
  join(root, "reports/completion-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
if (failed) process.exit(1);
console.log("Agent framework tests: PASS");
