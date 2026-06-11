import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

export const REQUIRED_GITHUB_RELEASE_SCOPE = [
  "release-assets/checksums.txt",
  "release-assets/dist.tar.gz",
  "release-assets/manifest.json",
  "release-assets/reports.tar.gz",
];

function gitCommit(root) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : "unknown";
}

function gitResult(root, args) {
  return spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });
}

function approvalSourceFailures(root, sourceCommit, currentCommit, approvalPath) {
  if (sourceCommit === currentCommit) return [];

  const ancestor = gitResult(root, ["merge-base", "--is-ancestor", sourceCommit, currentCommit]);
  if (ancestor.status !== 0) {
    return [`approval sourceCommit must match ${currentCommit} or be its direct parent`];
  }

  const count = gitResult(root, ["rev-list", "--count", `${sourceCommit}..${currentCommit}`]);
  if (count.status !== 0 || count.stdout.trim() !== "1") {
    return ["approval carrier must be exactly one commit after the approved source commit"];
  }

  const diff = gitResult(root, ["diff", "--name-only", `${sourceCommit}..${currentCommit}`]);
  if (diff.status !== 0) {
    return ["unable to inspect approval carrier commit"];
  }
  const changedPaths = diff.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
  if (JSON.stringify(changedPaths) !== JSON.stringify([approvalPath])) {
    return [
      `approval carrier may change only ${approvalPath}; changed: ${
        changedPaths.length ? changedPaths.join(", ") : "<none>"
      }`,
    ];
  }

  return [];
}

function readJson(path, failures, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function validDate(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function licenseFailures(root) {
  const path = join(root, "LICENSE");
  if (!existsSync(path)) return ["missing top-level LICENSE"];

  const content = readFileSync(path, "utf8").trim();
  if (content.length < 40) return ["top-level LICENSE is empty or too short"];
  if (/review required|external distribution is not approved|placeholder/i.test(content)) {
    return ["top-level LICENSE is a review notice or placeholder"];
  }
  return [];
}

export function evaluatePublicationReadiness(
  root,
  {
    target,
    releaseRef,
    approvalPath = "reports/publication-approval.json",
    now = new Date(),
    currentCommit = gitCommit(root),
    requiredScope = target === "github-release" ? REQUIRED_GITHUB_RELEASE_SCOPE : [],
    inspectApprovalSource = approvalSourceFailures,
  },
) {
  const failures = [...licenseFailures(root)];
  const absoluteApprovalPath = join(root, approvalPath);
  const versionPath = join(root, "VERSION");

  if (!target) failures.push("publication target is required");
  if (!releaseRef) failures.push("release ref is required");
  if (!existsSync(versionPath)) failures.push("missing VERSION");
  if (!existsSync(absoluteApprovalPath)) {
    failures.push(`missing publication approval: ${approvalPath}`);
    return { status: "blocked", failures };
  }

  const approval = readJson(absoluteApprovalPath, failures, "publication approval");
  if (!approval) return { status: "blocked", failures };

  const release = existsSync(versionPath) ? readFileSync(versionPath, "utf8").trim() : "";
  if (approval.schemaVersion !== 1) failures.push("unsupported publication approval schemaVersion");
  if (approval.status !== "approved") failures.push("publication approval status must be approved");
  if (approval.operation !== "publication") failures.push("approval operation must be publication");
  if (approval.target !== target) failures.push(`approval target must be ${target}`);
  if (approval.release !== release) failures.push(`approval release must be ${release || "<missing VERSION>"}`);
  if (approval.releaseRef !== releaseRef) failures.push(`approval releaseRef must be ${releaseRef}`);
  failures.push(
    ...inspectApprovalSource(root, approval.sourceCommit, currentCommit, approvalPath),
  );
  if (!Array.isArray(approval.scope)) {
    failures.push("approval scope must be an array");
  } else {
    for (const path of approval.scope) {
      const parts = typeof path === "string" ? path.split("/") : [];
      if (
        typeof path !== "string" ||
        !path ||
        path.startsWith("/") ||
        path.includes("\\") ||
        parts.includes("..")
      ) {
        failures.push(`approval scope contains an unsafe path: ${String(path)}`);
      }
    }
    for (const path of requiredScope) {
      if (!approval.scope.includes(path)) failures.push(`approval scope is missing ${path}`);
    }
  }
  if (!/^TASK-\d{4}-\d{3}$/.test(approval.task ?? "")) {
    failures.push("approval task must identify a TASK-YYYY-NNN contract");
  }
  if (!approval.approvedBy?.name || !approval.approvedBy?.role) {
    failures.push("approval requires approvedBy name and role");
  }
  if (!validDate(approval.approvedAt)) {
    failures.push("approval approvedAt must be a valid date-time");
  } else if (Date.parse(approval.approvedAt) > now.getTime()) {
    failures.push("publication approval is future-dated");
  }
  if (!validDate(approval.expiresAt)) {
    failures.push("approval expiresAt must be a valid date-time");
  } else if (Date.parse(approval.expiresAt) <= now.getTime()) {
    failures.push("publication approval is expired");
  }
  if (
    validDate(approval.approvedAt) &&
    validDate(approval.expiresAt) &&
    Date.parse(approval.approvedAt) >= Date.parse(approval.expiresAt)
  ) {
    failures.push("approval expiresAt must be later than approvedAt");
  }

  return {
    status: failures.length ? "blocked" : "ready",
    failures,
    approval,
  };
}

export function verifyPublicationReadiness(root, options) {
  const result = evaluatePublicationReadiness(root, options);
  if (result.failures.length) {
    throw new Error(`Publication preflight blocked:\n- ${result.failures.join("\n- ")}`);
  }
  return result;
}
