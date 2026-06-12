import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const requiredFiles = [
  "templates/beat-gate-policy.json",
  "templates/beat-gate-ledger.json",
  "templates/writer-adjudication-input.json",
  "templates/lifecycle.json",
  "skills/story-beat-gate/SKILL.md",
  "skills/story-writer-adjudication/SKILL.md",
  "skills/story-beat-gate/scripts/beat-gate-rules.mjs",
  "scripts/run-beat-gate-dry-run.mjs",
  "scripts/run-beat-gate-dogfood.mjs",
  "scripts/run-writer-adjudication.mjs",
  "benchmarks/writer-adjudication/README.md",
  "benchmarks/writer-adjudication/memory-tide-pilot.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/blind-package.md",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/stage-1-decisions.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/reveal-package.md",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/stage-2-decisions.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/adjudication-report.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/adjudication-report.md",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/sealed-manifest.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/run-metadata.json",
  "benchmarks/beat-gate-dogfood/README.md",
  "benchmarks/beat-gate-dogfood/memory-tide.json",
  "benchmarks/beat-gate-dogfood/runs/2026-06-11-memory-tide/dogfood-report.json",
  "benchmarks/beat-gate-dogfood/runs/2026-06-11-memory-tide/writer-review-package.md",
  "benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide/dogfood-report.json",
  "benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide/writer-review-package.md",
  "benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide/drafts/memory-tide/prose/1-4.md",
  "benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide/drafts/memory-tide/audit/rolling/1-4-reader.md",
  "benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide/drafts/memory-tide/audit/rolling/1-4-pacing.md",
  "agents/blind-beat-critic.md",
  "agents/batch-beat-pattern-auditor.md",
  "agents/diversity-challenger.md",
  "scripts/compare-beat-gate-critics.mjs",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/scene-reviews.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/batch-pattern-review.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/adjudication.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/comparison-report.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/comparison-report.md",
  "tests/beat-gate-rules.test.mjs",
  "tests/beat-gate-skill-contract.test.mjs",
  "tests/beat-gate-agent-contracts.test.mjs",
  "tests/beat-gate-isolated-comparison.test.mjs",
  "tests/story-scene-beat-gate.test.mjs",
  "tests/story-authority-boundaries.test.mjs",
  "tests/rolling-reader-check.test.mjs",
  "tests/beat-gate-resume.test.mjs",
  "tests/beat-gate-workflow.test.mjs",
  "tests/beat-gate-e2e.test.mjs",
  "tests/beat-gate-dogfood.test.mjs",
  "tests/writer-adjudication.test.mjs",
  "tests/writer-adjudication-contract.test.mjs"
];

const jsonFiles = [
  "templates/beat-gate-policy.json",
  "templates/beat-gate-ledger.json",
  "templates/writer-adjudication-input.json",
  "templates/lifecycle.json",
  "benchmarks/writer-adjudication/memory-tide-pilot.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/stage-1-decisions.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/sealed-manifest.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/run-metadata.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/stage-2-decisions.json",
  "benchmarks/writer-adjudication/runs/2026-06-12-memory-tide-unresolved/adjudication-report.json",
  "benchmarks/beat-gate-dogfood/memory-tide.json",
  "benchmarks/beat-gate-dogfood/runs/2026-06-11-memory-tide/dogfood-report.json",
  "benchmarks/beat-gate-dogfood/runs/2026-06-12-memory-tide/dogfood-report.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/scene-reviews.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/batch-pattern-review.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/adjudication.json",
  "benchmarks/beat-gate-dogfood/isolated-comparison-2026-06-12/comparison-report.json",
  "tests/fixtures/beat-gate/normal.json",
  "tests/fixtures/beat-gate/protected-field.json",
  "tests/fixtures/beat-gate/ambiguous.json",
  "tests/fixtures/beat-gate/non-convergent.json",
  "tests/fixtures/beat-gate/rolling-window.json"
];

const stringChecks = [
  {
    file: "skills/story-scene/SKILL.md",
    needle: "/story-beat-gate"
  },
  {
    file: "skills/story-scene/SKILL.md",
    needle: "drafts/{slug}/audit/rolling/{through-scene}-reader.md"
  },
  {
    file: "skills/story-status/SKILL.md",
    needle: "Beat Gate version status"
  },
  {
    file: "skills/story-revise/SKILL.md",
    needle: "Rolling WINDOW reports may inform priorities"
  },
  {
    file: "README.md",
    needle: "internal Beat Gate"
  },
  {
    file: "README.md",
    needle: "run-beat-gate-dry-run.mjs"
  },
  {
    file: "README.md",
    needle: "run-beat-gate-dogfood.mjs"
  },
  {
    file: "README.md",
    needle: "run-writer-adjudication.mjs"
  },
  {
    file: "MANUAL.md",
    needle: "Beat Gate"
  },
  {
    file: "MANUAL-ZH.md",
    needle: "Beat Gate"
  }
];

const bannedSessionFile =
  "pi-session-2026-06-10T11-12-49-706Z_" +
  "019eb13c-2622-742f-8fea-23b14b2644e6.html";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    fail(`Missing required file: ${file}`);
  }
}

for (const file of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${file}: ${error.message}`);
  }
}

const lifecycle = JSON.parse(fs.readFileSync("templates/lifecycle.json", "utf8"));
if (!lifecycle.workflow_versions || !Object.prototype.hasOwnProperty.call(lifecycle.workflow_versions, "beat_gate")) {
  fail("templates/lifecycle.json is missing workflow_versions.beat_gate");
}

for (const { file, needle } of stringChecks) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes(needle)) {
    fail(`${file} is missing required text: ${needle}`);
  }
}

const repoRoot = process.cwd();
const pathsToScan = [
  "tests",
  "scripts",
  "skills",
  "agents",
  "templates",
  "benchmarks"
];
for (const scanRoot of pathsToScan) {
  const stack = [scanRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
        continue;
      }
      const content = fs.readFileSync(absolute, "utf8");
      if (content.includes(bannedSessionFile)) {
        fail(`Private session filename leaked into ${absolute}`);
      }
      if (content.includes(repoRoot)) {
        fail(`Absolute repo path leaked into ${absolute}`);
      }
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Beat Gate verification: PASS");
