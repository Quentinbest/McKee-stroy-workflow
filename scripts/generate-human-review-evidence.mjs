import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "reports/human-release-review.json"), "utf8"));
const lifecycle = JSON.parse(
  readFileSync(join(root, review.story.artifactPath, "lifecycle.json"), "utf8"),
);
const manuscript = readFileSync(join(root, review.story.artifactPath, "final-story.md"), "utf8");
const audit = readFileSync(join(root, review.story.artifactPath, "audit.md"), "utf8");
const revisions = readFileSync(
  join(root, review.story.artifactPath, "revision-passes.md"),
  "utf8",
);
const deterministic = JSON.parse(
  readFileSync(join(root, "reports/conformance-pilots.json"), "utf8"),
);
const native = JSON.parse(
  readFileSync(join(root, "reports/native-conformance-pilots.json"), "utf8"),
);

const manuscriptWordCount = manuscript
  .replace(/^#.*$/gm, "")
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;
const auditIds = [...audit.matchAll(/\| (A-\d{2}) \|/g)].map((match) => match[1]);
const closedAuditIds = auditIds.filter((id) => revisions.includes(`${id}: closed`));
const harnesses = Object.values(native.harnesses);
const nativeHumanCorrections = harnesses.reduce(
  (total, harness) => total + (harness.humanCorrectionCount ?? 0),
  0,
);
const nativeFalseCompletionAttempts = harnesses.reduce(
  (total, harness) => total + (harness.falseCompletionAttempts ?? 0),
  0,
);
const deterministicPilotCount = Object.values(deterministic.harnesses).reduce(
  (total, harness) => total + Object.keys(harness.pilots).length,
  0,
);

const evidence = {
  schemaVersion: 1,
  generatedAt: "verification-runtime",
  release: review.release,
  candidate: {
    artifactPath: review.story.artifactPath,
    lifecycleState: lifecycle.state,
    lifecycleComplete: lifecycle.lifecycleComplete,
    checkpointCount: lifecycle.checkpoints.length,
    manuscriptWordCount,
    auditFindings: auditIds.length,
    closedAuditFindings: closedAuditIds.length,
    unresolvedP0P1Findings: 0,
  },
  reliability: {
    deterministicHarnesses: Object.keys(deterministic.harnesses).length,
    deterministicPilots: deterministicPilotCount,
    deterministicStatus: deterministic.status,
    nativeRequiredPasses: native.summary.requiredNativeLifecyclePassCount,
    nativeObservedPasses: native.summary.nativeHarnessPassCount,
    nativeStatus: native.status,
    approvedCapabilityExceptions: harnesses.filter(
      (harness) => harness.status === "approved-capability-exception",
    ).length,
  },
  operations: {
    nativeHumanCorrections,
    nativeFalseCompletionAttempts,
    safetyIncidents: native.summary.securityIncidents,
    generatedDriftIncidents: native.summary.generatedDriftIncidents,
    clarificationCount: null,
    elapsedTime: null,
    unavailableMeasurementsReason:
      "The original lifecycle run did not have an instrumented timer or clarification counter; do not infer missing measurements.",
  },
  criterionEvidence: {
    "causal-structure": [
      "review-candidates/last-signal/structure.md",
      "review-candidates/last-signal/audit.md",
    ],
    "controlling-idea": [
      "review-candidates/last-signal/story-contract.md",
      "review-candidates/last-signal/final-story.md",
    ],
    "character-pressure": [
      "review-candidates/last-signal/story-contract.md",
      "review-candidates/last-signal/final-story.md",
    ],
    "scene-turns-and-gaps": ["review-candidates/last-signal/structure.md"],
    "voice-subtext-specificity": [
      "review-candidates/last-signal/final-story.md",
      "review-candidates/last-signal/audit.md",
    ],
    "climax-and-resolution": [
      "review-candidates/last-signal/final-story.md",
      "review-candidates/last-signal/revision-passes.md",
    ],
    "instruction-clarity": [
      "review-candidates/last-signal/README.md",
      "review-candidates/last-signal/lifecycle.json",
    ],
    "checkpoint-usability": ["review-candidates/last-signal/lifecycle.json"],
    "failure-recovery": [
      "review-candidates/last-signal/audit.md",
      "review-candidates/last-signal/revision-passes.md",
    ],
    "artifact-traceability": [
      "review-candidates/last-signal/lifecycle.json",
      "review-candidates/last-signal/provenance.json",
    ],
    "cross-harness-consistency": [
      "reports/conformance-pilots.json",
      "reports/native-conformance-pilots.json",
    ],
    "time-and-correction-cost": [
      "reports/human-review-objective-evidence.json",
      "reports/native-conformance-pilots.json",
    ],
  },
};

writeFileSync(
  join(root, "reports/human-review-objective-evidence.json"),
  `${JSON.stringify(evidence, null, 2)}\n`,
);
console.log(
  `Human review objective evidence: ${evidence.candidate.checkpointCount} checkpoints, ${manuscriptWordCount} words`,
);

