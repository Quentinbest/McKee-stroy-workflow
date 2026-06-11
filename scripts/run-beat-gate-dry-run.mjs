import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  applyBeatGateRules,
  validateLedger,
} from "../skills/story-beat-gate/scripts/beat-gate-rules.mjs";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8"),
  );
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function relativeToWorkspace(workspaceRoot, filePath) {
  return path.relative(workspaceRoot, filePath);
}

export function runBeatGateDryRun({ outputDir } = {}) {
  const slug = "synthetic-beat-gate";
  const runDate = new Date().toISOString().slice(0, 10);
  const workspaceRoot = outputDir
    ? path.resolve(outputDir)
    : fs.mkdtempSync(path.join(os.tmpdir(), "mckee-beat-gate-"));
  const projectRoot = path.join(workspaceRoot, "drafts", slug);
  const gateAuditRoot = path.join(projectRoot, "audit", "beat-gate");
  const rollingAuditRoot = path.join(projectRoot, "audit", "rolling");

  fs.mkdirSync(projectRoot, { recursive: true });

  const policy = readJson("templates/beat-gate-policy.json");
  policy.term_mappings = [
    {
      canonical: "Scene Card",
      aliases: ["scene card"],
    },
  ];

  const candidateText = [
    "<!-- Beat 1 complete -->",
    "Mara reread the scene card.",
    "",
    "",
    "She shut the archive door before the alarm reached the corridor.",
    "",
  ].join("\n");
  const deterministicResult = applyBeatGateRules({
    candidate_text: candidateText,
    policy,
  });

  const protectedPolicy = structuredClone(policy);
  protectedPolicy.term_mappings = [
    {
      canonical: "survive",
      aliases: ["escape"],
      forced_dimension: "character_desire",
    },
  ];
  const protectedResult = applyBeatGateRules({
    candidate_text: "Mara wants to escape.",
    policy: protectedPolicy,
  });

  const lifecycle = readJson("templates/lifecycle.json");
  lifecycle.slug = slug;
  lifecycle.title = "Synthetic Beat Gate Dry Run";
  lifecycle.lang = "en";
  lifecycle.created = runDate;
  lifecycle.last_updated = runDate;
  lifecycle.state = "scene_drafting";
  for (const field of [
    "premise",
    "genre",
    "controlling_idea",
    "setting",
    "cast",
    "spine",
    "act_design",
    "scene_cards",
    "beat_sheets",
  ]) {
    lifecycle.locked[field] = true;
  }
  lifecycle.workflow_versions.beat_gate = policy.version;
  lifecycle.artifacts = Object.fromEntries(
    Object.entries(lifecycle.artifacts).map(([key, value]) => [
      key,
      value.replaceAll("{{slug}}", slug),
    ]),
  );

  const ledger = readJson("templates/beat-gate-ledger.json");
  Object.assign(ledger, {
    version: policy.version,
    scene_ref: "1-1",
    execution_mode: "runner",
    status: "upstream_blocked",
    stages_completed: [
      "scan",
      "critic",
      "writer_decision",
      "diversity",
      "escalation",
    ],
    writer_decision: null,
    current_round: 3,
    rolling_review_due: true,
    policy_snapshot: policy,
    beats: [
      {
        beat_ref: "1-1-1",
        status: "accepted",
        candidate_text: candidateText,
        clean_text: deterministicResult.output_text,
        patches: deterministicResult.patches,
        detections: [],
        review_items: deterministicResult.review_items,
        reject_items: deterministicResult.reject_items,
        critic_findings: [
          {
            category: "tension",
            severity: "medium",
            evidence:
              "The alarm supplies pressure, but its consequence is not yet visible.",
            question: "What immediate loss follows if Mara stays?",
          },
        ],
        history: [],
        rounds: {
          draft: 1,
          critic: 1,
          patch: 1,
          diversity: 0,
        },
        writer_decision: "accept",
        deferred_to_batch_boundary: false,
      },
      {
        beat_ref: "1-1-2",
        status: "rejected",
        candidate_text: "Mara wants to escape.",
        clean_text: protectedResult.output_text,
        patches: protectedResult.patches,
        detections: [],
        review_items: protectedResult.review_items,
        reject_items: protectedResult.reject_items,
        history: [],
        rounds: {
          draft: 1,
          critic: 0,
          patch: 0,
          diversity: 0,
        },
        writer_decision: "reject",
        deferred_to_batch_boundary: false,
      },
      {
        beat_ref: "1-1-3",
        status: "upstream_blocked",
        candidate_text: "Mara waits while the archive burns.",
        clean_text: "Mara waits while the archive burns.",
        patches: [],
        detections: [],
        review_items: [],
        reject_items: [],
        critic_findings: [
          {
            category: "choice",
            severity: "high",
            evidence: "Three revisions preserve the same passive action.",
            question:
              "Does the scene require a different desire or value turn?",
          },
        ],
        history: [
          "round_1_same_passive_action",
          "round_2_diversity_challenge",
          "round_3_upstream_block",
        ],
        rounds: {
          draft: 3,
          critic: 3,
          patch: 0,
          diversity: 1,
        },
        writer_decision: null,
        deferred_to_batch_boundary: false,
        escalation: {
          round: 3,
          reason: "Non-convergence after diversity challenge.",
          required_action: "human_or_upstream_revision",
        },
      },
    ],
  });

  const ledgerErrors = validateLedger(ledger);
  if (ledgerErrors.length > 0) {
    throw new Error(`Dry-run ledger is invalid: ${ledgerErrors.join("; ")}`);
  }

  const lifecyclePath = path.join(projectRoot, "lifecycle.json");
  const policyPath = path.join(projectRoot, "beat-gate-policy.json");
  const ledgerPath = path.join(gateAuditRoot, "1-1.json");
  const criticPath = path.join(gateAuditRoot, "1-1-1-critic.md");
  const diversityPath = path.join(gateAuditRoot, "1-1-3-diversity.md");
  const readerPath = path.join(rollingAuditRoot, "1-3-reader.md");
  const pacingPath = path.join(rollingAuditRoot, "1-3-pacing.md");
  const reportPath = path.join(workspaceRoot, "beat-gate-dry-run-report.json");

  writeJson(lifecyclePath, lifecycle);
  writeJson(policyPath, policy);
  writeJson(ledgerPath, ledger);
  writeText(
    criticPath,
    [
      "# Blind Beat Critic: 1-1-1",
      "",
      "Context consulted: candidate beat only.",
      "Author intent, premise rationale, and prior writer discussion were not consulted.",
      "",
      "## Finding",
      "",
      "- Category: tension",
      "- Severity: medium",
      "- Evidence: The alarm supplies pressure, but its consequence is not yet visible.",
      "- Question: What immediate loss follows if Mara stays?",
      "",
    ].join("\n"),
  );
  writeText(
    diversityPath,
    [
      "# Diversity Challenge: 1-1-3",
      "",
      "The prior revisions converged on the same passive action.",
      "Generate alternatives by changing the active value, tactic, and cost rather than paraphrasing.",
      "Round 3 remains blocked until a human accepts an option or revises an upstream premise, desire, or scene purpose.",
      "",
    ].join("\n"),
  );
  writeText(
    readerPath,
    [
      "# Rolling Reader Review: Scenes 1-3",
      "",
      "Advisory only. The reader can track Mara's immediate objective, but the archive loss still needs a visible consequence.",
      "",
    ].join("\n"),
  );
  writeText(
    pacingPath,
    [
      "# Rolling Pacing Review: Scenes 1-3",
      "",
      "Advisory only. Scene pressure rises, but the third beat stalls because the protagonist does not choose.",
      "",
    ].join("\n"),
  );

  const checks = {
    deterministic_patch_applied:
      deterministicResult.output_text.includes("Scene Card") &&
      !deterministicResult.output_text.includes("<!--"),
    protected_field_rejected:
      protectedResult.output_text === "Mara wants to escape." &&
      protectedResult.patches.length === 0 &&
      protectedResult.reject_items.length === 1,
    human_decision_recorded: ledger.beats[0].writer_decision === "accept",
    non_convergence_escalated:
      ledger.beats[2].escalation.required_action ===
      "human_or_upstream_revision",
    rolling_reviews_written: [readerPath, pacingPath].every((filePath) =>
      fs.existsSync(filePath),
    ),
    ledger_valid: true,
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  if (failedChecks.length > 0) {
    throw new Error(`Dry-run checks failed: ${failedChecks.join(", ")}`);
  }

  const report = {
    status: "PASS",
    workspace_root: workspaceRoot,
    project_root: projectRoot,
    checks,
    artifacts: [
      lifecyclePath,
      policyPath,
      ledgerPath,
      criticPath,
      diversityPath,
      readerPath,
      pacingPath,
    ].map((filePath) => relativeToWorkspace(workspaceRoot, filePath)),
  };
  writeJson(reportPath, report);

  return {
    ...report,
    report_path: reportPath,
  };
}

function parseOutputDir(args) {
  if (args.length === 0) {
    return undefined;
  }
  if (args.length === 2 && args[0] === "--output") {
    return args[1];
  }
  throw new Error(
    "Usage: node scripts/run-beat-gate-dry-run.mjs [--output <dir>]",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const outputDir = parseOutputDir(process.argv.slice(2));
    const report = runBeatGateDryRun({ outputDir });
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
