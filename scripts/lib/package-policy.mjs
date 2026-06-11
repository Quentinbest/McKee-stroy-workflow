import { readFileSync } from "node:fs";
import { join } from "node:path";
import { frameworkRoot } from "./package-model.mjs";

function readSecurityPolicy(root = frameworkRoot()) {
  return JSON.parse(readFileSync(join(root, "config/security-policy.json"), "utf8"));
}

function enforcementLevel(host, operation) {
  if (host === "opencode") {
    if (["network", "destructive_git", "publication"].includes(operation)) return "native";
    if (
      ["private_data_read", "external_wiki_write", "destructive_filesystem", "external_disclosure"].includes(
        operation,
      )
    ) {
      return "runtime";
    }
    return "advisory";
  }

  if (host === "claude") {
    if (
      ["private_data_read", "external_wiki_write", "destructive_git", "destructive_filesystem", "publication", "external_disclosure"].includes(
        operation,
      )
    ) {
      return "runtime";
    }
    return "advisory";
  }

  if (host === "codex" || host === "pi" || host === "cursor") {
    if (
      ["private_data_read", "external_wiki_write", "destructive_git", "destructive_filesystem", "publication", "external_disclosure"].includes(
        operation,
      )
    ) {
      return "runtime";
    }
    return "advisory";
  }

  return "advisory";
}

function capabilityProfile(host, pkg) {
  const hasSpecialist = ["native-or-fallback", "wiki-only"].includes(pkg.roleMode);
  return {
    skills: {
      discovery: "native",
      invocation: "native",
    },
    specialists: {
      declaredMode: pkg.roleMode,
      execution:
        hasSpecialist
          ? host === "opencode" || host === "claude"
            ? "native-specialist"
            : "in-context"
          : "in-context",
      fallback:
        hasSpecialist
          ? host === "pi"
            ? "reference-card"
            : host === "cursor"
              ? "manual-fallback"
            : "in-context"
          : "not-applicable",
    },
    storyProject: {
      required: pkg.requiresStoryProject,
      locator: "runtime-lifecycle-json",
    },
    wiki: {
      mode: pkg.wikiMode,
      availability: pkg.wikiMode === "offline-optional" ? "optional" : "separate-package",
    },
  };
}

function permissionProfile(host, pkg, securityPolicy) {
  const operations = [
    "network",
    "private_data_read",
    "external_wiki_write",
    "destructive_git",
    "destructive_filesystem",
    "publication",
    "external_disclosure",
    "extension_or_plugin",
    "environment_change",
  ];

  return operations.map((operation) => ({
    operation,
    defaultAction: securityPolicy.operations[operation],
    enforcementLevel: enforcementLevel(host, operation),
    rationale:
      operation === "external_wiki_write" && pkg.wikiMode !== "project-required"
        ? "Ordinary packages must not require or mutate the external wiki."
        : operation === "private_data_read"
          ? "Private story artifacts remain task-scoped and cannot be inferred from package installation."
          : operation === "network"
            ? "Network access remains approval-gated even when the host exposes native web tools."
            : operation === "destructive_git"
              ? "Packages must not broaden destructive Git privileges."
              : operation === "publication"
                ? "Publishing remains explicitly human-approved."
                : "Projected from the canonical security policy.",
  }));
}

function opencodeFragment(pkg) {
  const editMode = pkg.requiresStoryProject ? "allow" : "ask";
  return {
    $schema: "https://opencode.ai/config.json",
    permission: {
      read: "allow",
      edit: editMode,
      glob: "allow",
      grep: "allow",
      list: "allow",
      skill: "allow",
      task: ["native-or-fallback", "wiki-only"].includes(pkg.roleMode) ? "allow" : "ask",
      external_directory: "deny",
      webfetch: "ask",
      websearch: "ask",
      bash: {
        "*": "ask",
        "git diff": "allow",
        "git log*": "allow",
        "git status": "allow",
        "node scripts/*": "allow",
        "npm run skills:*": "allow",
        "npm run agents:*": "allow",
        "git reset --hard*": "deny",
        "git push --force*": "deny",
        "npm publish*": "deny",
      },
    },
  };
}

export function buildPackagePolicy(root = frameworkRoot(), host, pkg) {
  const securityPolicy = readSecurityPolicy(root);
  const policy = {
    capabilityProfile: capabilityProfile(host, pkg),
    permissionProfile: permissionProfile(host, pkg, securityPolicy),
  };

  if (host === "opencode") {
    policy.hostConfig = {
      file: "opencode.fragment.json",
      content: `${JSON.stringify(opencodeFragment(pkg), null, 2)}\n`,
    };
  }

  return policy;
}
