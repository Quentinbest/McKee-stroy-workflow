import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const VALID_SCOPE_TYPES = new Set(["full_story", "act", "scenes"]);
const VALID_EXECUTION_MODES = new Set([
  "parallel-agents",
  "native-tools",
  "in-context-sequential",
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizedScope(scope) {
  return {
    type: scope?.type ?? null,
    scenes: [...(scope?.scenes ?? [])].sort(),
    planned_complete: scope?.planned_complete === true,
  };
}

function normalizedSnapshot(snapshot) {
  return {
    files: [...(snapshot?.files ?? [])]
      .map((file) => ({
        path: file.path,
        kind: file.kind ?? "prose",
        sha256: file.sha256,
      }))
      .sort((left, right) => left.path.localeCompare(right.path)),
  };
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function createInputSnapshot({ rootDir, files }) {
  const root = path.resolve(rootDir);
  return normalizedSnapshot({
    files: files.map((entry) => {
      const relativePath = typeof entry === "string" ? entry : entry.path;
      const kind = typeof entry === "string" ? "prose" : entry.kind;
      const absolutePath = path.resolve(root, relativePath);
      if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
        throw new Error(`Snapshot path escapes root: ${relativePath}`);
      }
      return {
        path: relativePath,
        kind: kind ?? "prose",
        sha256: sha256(fs.readFileSync(absolutePath)),
      };
    }),
  });
}

export function evaluateAuditState({
  lifecycle,
  audit_records: auditRecords = [],
  current_snapshot: currentSnapshot,
  target_scope: targetScope,
  required_dimensions: requiredDimensions = [],
}) {
  const lifecycleConflicts = [];
  const claimsCriticPassed =
    lifecycle?.state === "critic_passed" ||
    lifecycle?.state === "polished" ||
    lifecycle?.state === "done";
  if (claimsCriticPassed !== (lifecycle?.locked?.critic_passed === true)) {
    lifecycleConflicts.push(
      "state and locked.critic_passed disagree; no next-stage recommendation is safe",
    );
  }
  for (const [state, lock] of [
    ["polished", "polished"],
    ["done", "published"],
  ]) {
    if (lifecycle?.state === state && lifecycle?.locked?.[lock] !== true) {
      lifecycleConflicts.push(
        `state ${state} requires locked.${lock}=true`,
      );
    }
  }

  const expectedScope = normalizedScope(targetScope);
  const expectedSnapshot = normalizedSnapshot(currentSnapshot);
  const recordResults = auditRecords.map((record) => {
    const reasons = [];
    if (!record?.audit_id) reasons.push("missing audit_id");
    if (!VALID_SCOPE_TYPES.has(record?.scope?.type)) reasons.push("missing or invalid scope type");
    if (!record?.workflow_version) reasons.push("missing workflow_version");
    if (!VALID_EXECUTION_MODES.has(record?.execution_mode)) reasons.push("missing or invalid execution_mode");
    if (!Array.isArray(record?.dimensions_completed)) reasons.push("missing dimensions_completed");
    if (!Array.isArray(record?.dimensions_required)) reasons.push("missing dimensions_required");
    if (!record?.input_snapshot?.files) reasons.push("missing input_snapshot");
    if (record?.result !== "PASS") reasons.push("result is not PASS");
    if (record?.invalidated_at || (record?.invalidation_reasons ?? []).length > 0) {
      reasons.push("record is invalidated");
    }
    if (!sameValue(normalizedScope(record?.scope), expectedScope)) {
      reasons.push("scope does not match the requested story scope");
    }
    if (expectedScope.type === "full_story" && !record?.scope?.planned_complete) {
      reasons.push("all existing prose is not confirmed as the complete planned story");
    }
    if (!sameValue(normalizedSnapshot(record?.input_snapshot), expectedSnapshot)) {
      reasons.push("prose or constraint input snapshot changed");
    }
    const completed = new Set(record?.dimensions_completed ?? []);
    const declaredRequired = new Set(record?.dimensions_required ?? []);
    const undeclaredDimensions = requiredDimensions.filter(
      (dimension) => !declaredRequired.has(dimension),
    );
    if (undeclaredDimensions.length > 0) {
      reasons.push(`audit did not declare required dimensions: ${undeclaredDimensions.join(", ")}`);
    }
    const missingDimensions = requiredDimensions.filter(
      (dimension) => !completed.has(dimension),
    );
    if (missingDimensions.length > 0) {
      reasons.push(`missing required dimensions: ${missingDimensions.join(", ")}`);
    }
    return {
      audit_id: record?.audit_id ?? null,
      status: reasons.length === 0 ? "valid_pass" : "unverified_or_stale",
      reasons,
    };
  });
  const validRecord = recordResults.find((record) => record.status === "valid_pass");
  return {
    global_critic_passed: Boolean(validRecord) && lifecycleConflicts.length === 0,
    supporting_audit_id: validRecord?.audit_id ?? null,
    lifecycle_conflicts: lifecycleConflicts,
    records: recordResults,
    next_action: lifecycleConflicts.length > 0
      ? "resolve_lifecycle_conflict"
      : validRecord
        ? "eligible_for_critic_passed"
        : "run_or_resume_missing_audit_work",
  };
}

export function invalidateAuditRecords(auditRecords, {
  reason,
  changed_paths: changedPaths = [],
  invalidated_at: invalidatedAt,
}) {
  if (!reason || !invalidatedAt) {
    throw new Error("reason and invalidated_at are required");
  }
  return auditRecords.map((record) => ({
    ...record,
    invalidated_at: invalidatedAt,
    invalidation_reasons: [
      ...(record.invalidation_reasons ?? []),
      { reason, changed_paths: [...changedPaths].sort() },
    ],
  }));
}

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  const inputPath = option(args, "--input");
  const outputPath = option(args, "--output");
  if (command !== "evaluate" || !inputPath || !outputPath) {
    throw new Error("Usage: node audit-state.mjs evaluate --input <json> --output <json>");
  }
  const result = evaluateAuditState(
    JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8")),
  );
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`);
  console.log(result.global_critic_passed ? "AUDIT_STATE: PASS" : "AUDIT_STATE: BLOCKED");
}
