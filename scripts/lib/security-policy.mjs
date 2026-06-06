import { readFileSync } from "node:fs";
import { join } from "node:path";

export function loadSecurityPolicy(root) {
  return JSON.parse(readFileSync(join(root, "config/security-policy.json"), "utf8"));
}

function globToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replaceAll("**", "\0")
    .replaceAll("*", "[^/]*")
    .replaceAll("\0", ".*");
  return new RegExp(`^${escaped}$`);
}

export function matchesAnyPath(path, patterns) {
  return patterns.some((pattern) => globToRegExp(pattern).test(path));
}

export function classifyOperation(policy, operation, approval = null) {
  const base = policy.operations[operation] ?? policy.default;
  if (base !== "deny") return base;
  if (
    approval
    && policy.approvalOperations.includes(operation)
    && approval.operation === operation
    && approval.task
    && approval.scope
    && approval.expires
  ) {
    return "allow";
  }
  return "deny";
}

export function scanSensitiveText(text) {
  const findings = [];
  const patterns = [
    ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["openai-key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
    ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/],
    ["github-token", /\bgh[opusr]_[A-Za-z0-9]{30,}\b/],
    ["private-artifact", /\bprivacy:\s*private\b/i],
  ];
  for (const [kind, pattern] of patterns) {
    if (pattern.test(text)) findings.push(kind);
  }
  return findings;
}

export function classifyCommand(command) {
  const normalized = command.trim().replace(/\s+/g, " ");
  if (/\bgit (?:reset --hard|clean -[a-z]*f|push .*--force)\b/.test(normalized)) {
    return "destructive_git";
  }
  if (/\brm\s+-[a-z]*r[a-z]*f\b/.test(normalized)) return "destructive_filesystem";
  if (/\b(?:npm publish|gh release create|git push .*--tags)\b/.test(normalized)) {
    return "publication";
  }
  if (/\b(?:curl|wget|npm install|pnpm add|yarn add)\b/.test(normalized)) {
    return "network";
  }
  return "run_committed_verification";
}

export function isInstructionSource(path) {
  return (
    path === "AGENTS.md"
    || path.startsWith("docs/agent/")
    || path.startsWith("tasks/")
  );
}
