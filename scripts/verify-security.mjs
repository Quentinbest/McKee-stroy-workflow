import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyCommand,
  classifyOperation,
  loadSecurityPolicy,
  matchesAnyPath,
  scanSensitiveText,
} from "./lib/security-policy.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const policy = loadSecurityPolicy(root);
const failures = [];

function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

const scannedRoots = [
  "AGENTS.md",
  "docs",
  "src",
  "schemas",
  "scripts",
  "tasks",
  ".agents",
  ".claude",
  ".cursor",
  ".opencode",
  ".codex",
  ".pi",
  "opencode.jsonc",
  "generated-manifest.json",
].filter((path) => existsSync(join(root, path)));

const files = scannedRoots.flatMap((path) => {
  const absolute = join(root, path);
  return readdirSafe(absolute);
});

function readdirSafe(path) {
  return existsSync(path) && !path.endsWith(".json") && !path.endsWith(".md")
    && !path.endsWith(".mjs") && !path.endsWith(".toml") && !path.endsWith(".jsonc")
    ? walk(path)
    : [path];
}

for (const file of files) {
  const path = relative(root, file);
  if (matchesAnyPath(path, policy.forbiddenPathPatterns)) {
    failures.push(`forbidden repository path: ${path}`);
    continue;
  }
  const findings = scanSensitiveText(readFileSync(file, "utf8"));
  if (findings.length) failures.push(`${path}: sensitive content ${findings.join(", ")}`);
}

for (const operation of ["destructive_git", "destructive_filesystem", "publication"]) {
  if (classifyOperation(policy, operation) !== "deny") {
    failures.push(`${operation} must be denied by default`);
  }
}
for (const operation of ["network", "dependency_install", "extension_or_plugin"]) {
  if (classifyOperation(policy, operation) !== "ask") {
    failures.push(`${operation} must require approval`);
  }
}

const commandCases = [
  ["git reset --hard HEAD~1", "destructive_git"],
  ["rm -rf drafts", "destructive_filesystem"],
  ["npm publish", "publication"],
  ["node scripts/verify-security.mjs", "run_committed_verification"],
];
for (const [command, expected] of commandCases) {
  if (classifyCommand(command) !== expected) {
    failures.push(`command classification mismatch: ${command}`);
  }
}

const claudeSettings = readFileSync(join(root, ".claude/settings.json"), "utf8");
const openCodeSettings = readFileSync(join(root, "opencode.jsonc"), "utf8");
for (const marker of ["git reset --hard", "git push --force", "npm publish"]) {
  if (!claudeSettings.includes(marker) || !openCodeSettings.includes(marker)) {
    failures.push(`harness permission adapter missing deny marker: ${marker}`);
  }
}
if (
  policy.approvedExtensions.length
  || policy.approvedPlugins.length
  || policy.approvedMcpServers.length
  || policy.approvedPublicationTargets.length
) {
  failures.push("baseline must not approve extensions, plugins, MCP servers, or publication targets");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Security policy: PASS (${files.length} files scanned)`);
