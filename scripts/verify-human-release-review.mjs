import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = process.argv[2]
  ? isAbsolute(process.argv[2]) ? process.argv[2] : join(root, process.argv[2])
  : join(root, "reports/human-release-review.json");
const failures = [];

if (!existsSync(reportPath)) {
  failures.push("missing reports/human-release-review.json");
} else {
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const requiredCriteria = {
    literaryReview: [
      "causal-structure",
      "controlling-idea",
      "character-pressure",
      "scene-turns-and-gaps",
      "voice-subtext-specificity",
      "climax-and-resolution",
    ],
    operationalReview: [
      "instruction-clarity",
      "checkpoint-usability",
      "failure-recovery",
      "artifact-traceability",
      "cross-harness-consistency",
      "time-and-correction-cost",
    ],
  };

  if (report.schemaVersion !== 1) failures.push("unsupported human review schemaVersion");
  if (!["pending", "changes-requested", "approved"].includes(report.status)) {
    failures.push("invalid human review status");
  }
  if (report.story?.synthetic !== false) failures.push("human review story must be non-synthetic");

  for (const [sectionName, ids] of Object.entries(requiredCriteria)) {
    const section = report[sectionName];
    const actual = section?.criteria?.map((criterion) => criterion.id) ?? [];
    if (JSON.stringify(actual) !== JSON.stringify(ids)) {
      failures.push(`${sectionName}: criterion set or order mismatch`);
    }
  }

  if (report.status === "approved") {
    if (!report.reviewer?.name || !report.reviewer?.role || !report.reviewer?.reviewedAt) {
      failures.push("approved review requires named reviewer, role, and reviewedAt");
    }
    if (!report.story.lifecycleComplete || !report.story.artifactPath) {
      failures.push("approved review requires a complete non-synthetic lifecycle artifact");
    } else {
      const artifactPath = isAbsolute(report.story.artifactPath)
        ? normalize(report.story.artifactPath)
        : join(root, report.story.artifactPath);
      if (!existsSync(artifactPath)) failures.push("reviewed lifecycle artifact does not exist");
    }
    for (const sectionName of Object.keys(requiredCriteria)) {
      const section = report[sectionName];
      if (section.status !== "approved") failures.push(`${sectionName} is not approved`);
      for (const criterion of section.criteria) {
        if (!Number.isInteger(criterion.score) || criterion.score < 3) {
          failures.push(`${sectionName}/${criterion.id}: approved score must be at least 3`);
        }
        if (!criterion.evidence?.trim()) {
          failures.push(`${sectionName}/${criterion.id}: approved criterion lacks evidence`);
        }
      }
    }
    if (report.releaseApproval?.stableRelease !== true) {
      failures.push("approved review requires explicit stable-release approval");
    }
  } else if (report.releaseApproval?.stableRelease === true) {
    failures.push("stable-release approval cannot be true while human review is incomplete");
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Human release review record: PASS");
