import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "reports/human-review-objective-evidence.json");
const failures = [];

if (!existsSync(path)) {
  failures.push("missing reports/human-review-objective-evidence.json");
} else {
  const evidence = JSON.parse(readFileSync(path, "utf8"));
  const requiredCriteria = [
    "causal-structure",
    "controlling-idea",
    "character-pressure",
    "scene-turns-and-gaps",
    "voice-subtext-specificity",
    "climax-and-resolution",
    "instruction-clarity",
    "checkpoint-usability",
    "failure-recovery",
    "artifact-traceability",
    "cross-harness-consistency",
    "time-and-correction-cost",
  ];

  if (evidence.schemaVersion !== 1) failures.push("unsupported objective evidence schema");
  if (evidence.candidate?.lifecycleComplete !== true) failures.push("candidate lifecycle is incomplete");
  if (evidence.candidate?.lifecycleState !== "revision-passes") {
    failures.push("candidate has not reached revision-passes");
  }
  if (evidence.candidate?.checkpointCount !== 15) failures.push("unexpected checkpoint count");
  if (evidence.candidate?.manuscriptWordCount < 1500) failures.push("manuscript is too short");
  if (evidence.candidate?.auditFindings !== evidence.candidate?.closedAuditFindings) {
    failures.push("not all audit findings are closed");
  }
  if (evidence.candidate?.unresolvedP0P1Findings !== 0) failures.push("unresolved P0/P1 findings");
  if (evidence.reliability?.deterministicStatus !== "passed") {
    failures.push("deterministic conformance is not passed");
  }
  if (evidence.reliability?.deterministicPilots !== 25) {
    failures.push("expected 25 deterministic harness pilots");
  }
  if (evidence.reliability?.nativeStatus !== "passed") failures.push("native conformance is not passed");
  if (evidence.reliability?.nativeObservedPasses < evidence.reliability?.nativeRequiredPasses) {
    failures.push("native lifecycle pass count is below the release requirement");
  }
  if (evidence.operations?.safetyIncidents !== 0) failures.push("safety incidents are nonzero");
  if (evidence.operations?.generatedDriftIncidents !== 0) {
    failures.push("generated drift incidents are nonzero");
  }

  const actualCriteria = Object.keys(evidence.criterionEvidence ?? {});
  if (JSON.stringify(actualCriteria) !== JSON.stringify(requiredCriteria)) {
    failures.push("objective criterion evidence set or order mismatch");
  }
  for (const [criterion, paths] of Object.entries(evidence.criterionEvidence ?? {})) {
    if (!Array.isArray(paths) || paths.length === 0) {
      failures.push(`${criterion}: no objective evidence paths`);
      continue;
    }
    for (const evidencePath of paths) {
      if (!existsSync(join(root, evidencePath))) {
        failures.push(`${criterion}: missing evidence ${evidencePath}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Human review objective evidence: PASS");

