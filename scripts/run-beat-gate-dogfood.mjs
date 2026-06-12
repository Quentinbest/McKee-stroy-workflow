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
const FIXTURE_PATH = path.join(
  REPO_ROOT,
  "benchmarks",
  "beat-gate-dogfood",
  "memory-tide.json",
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function criticReport(beat) {
  const findings =
    beat.critic_findings.length === 0
      ? ["- No finding."]
      : beat.critic_findings.flatMap((finding) => [
          `- Classification: ${finding.classification}`,
          `- Predicate: ${finding.predicate}`,
          `- Evidence: ${finding.evidence}`,
          `- Question: ${finding.question}`,
          "",
        ]);

  return [
    `# Blind Beat Critic: ${beat.ref}`,
    "",
    "Execution mode: in-context-fallback",
    "Contamination warning: the same model family drafted and reviewed this benchmark.",
    "Inputs consulted: cleaned Beat, bounded Scene Contract, locked authority, world constraints, voice anchors.",
    "Forbidden inputs excluded: drafter rationale, prior verdicts, patch history, diversity alternatives.",
    "",
    "## Findings",
    "",
    ...findings,
  ].join("\n");
}

function diversityReport(beat) {
  return [
    `# Diversity Challenge: ${beat.ref}`,
    "",
    `Blocked predicate: ${beat.critic_findings.at(-1)?.predicate}`,
    "",
    ...beat.diversity_alternatives.flatMap((alternative) => [
      `## ${alternative.id}: ${alternative.mechanism}`,
      "",
      alternative.text,
      "",
    ]),
  ].join("\n");
}

function reviewPackage(fixture, sceneResults, report, decision) {
  const sceneSections = sceneResults.flatMap((scene) => [
    `## ${scene.ref} ${scene.title}`,
    "",
    `Gap: ${scene.contract.gap}`,
    `Value Shift: ${scene.contract.value_shift}`,
    "",
    ...scene.beats.flatMap((beat) => [
      `### ${beat.ref}`,
      "",
      beat.clean_text,
      "",
      `AUTO: ${beat.patches.length === 0 ? "none" : beat.patches.map((patch) => patch.rule_id).join(", ")}`,
      `REVIEW: ${
        beat.critic_findings.length === 0
          ? "none"
          : beat.critic_findings
              .map((finding) => `${finding.predicate}: ${finding.question}`)
              .join(" | ")
      }`,
      ...(beat.review_resolution
        ? [`Resolution: ${beat.review_resolution}`]
        : []),
      `Status: ${beat.status}`,
      "",
    ]),
  ]);

  const blockedBeat = sceneResults
    .flatMap((scene) => scene.beats)
    .find((beat) => beat.diversity_alternatives?.length > 0);
  const alternatives = blockedBeat.diversity_alternatives.flatMap(
    (alternative) => [
      `- **${alternative.id} / ${alternative.mechanism}**: ${alternative.text}`,
    ],
  );

  return [
    `# Beat Gate Dogfood Review Package: ${fixture.title}`,
    "",
    "## Locked Human Authority",
    "",
    `- Premise: ${fixture.authority.premise}`,
    `- 林汐 desire: ${fixture.authority.character_desires["林汐"]}`,
    decision
      ? `- Final aesthetic judgment: human selected ending ${decision.selected_ending}`
      : "- Final aesthetic judgment: pending human decision",
    "",
    "## Run Conditions",
    "",
    "- 4 scenes, 12 Beats, batch mode",
    "- Mechanical runner: enabled",
    "- Blind critic: in-context fallback, not an isolated agent",
    decision
      ? `- Writer decision: recorded from ${decision.decision_source} on ${decision.decided_at}`
      : "- Writer decisions: deferred to this single batch boundary",
    "",
    ...sceneSections,
    "## Diversity Alternatives for 1-4-3",
    "",
    ...alternatives,
    ...(decision
      ? [
          "",
          `Selected ending: **${decision.selected_ending}**`,
          `Decision record: ${decision.rationale}`,
        ]
      : []),
    "",
    "## Metrics",
    "",
    `- AUTO patches: ${report.metrics.auto_patches}`,
    `- Critic REVIEW findings: ${report.metrics.critic_review_findings}`,
    `- Protected-field probe rejects: ${report.metrics.protected_probe_rejects}`,
    `- Isolated critic calls: ${report.compute.isolated_critic_calls}`,
    `- In-context critic passes: ${report.compute.in_context_critic_passes}`,
    `- Human decision points produced: ${report.metrics.human_decision_points}`,
    "",
    "## Batch-Level Risks",
    "",
    ...fixture.batch_observations.map(
      (observation) =>
        `- **${observation.category} / ${observation.severity}**: ${observation.evidence} ${observation.implication}`,
    ),
    "",
    ...(decision
      ? [
          "## Post-Commit Findings",
          "",
          ...fixture.post_commit_observations.map(
            (observation) =>
              `- **${observation.status} / ${observation.category}**: ${observation.evidence}`,
          ),
          "",
        ]
      : []),
    decision ? "## Writer Decision Applied" : "## Required Writer Decision",
    "",
    ...(decision
      ? [
          `Ending ${decision.selected_ending} was selected by the writer.`,
          "The recommended local revisions were applied, all Beat decisions were recorded as accepted, and the four-scene batch was committed before rolling review.",
        ]
      : [
          "Choose one consolidated action:",
          "",
          "1. Accept the recommended review package and choose ending A, B, or C.",
          "2. Name specific Beat refs to revise before choosing an ending.",
          "3. Reopen Premise, character desire, Gap, Turning Point, or Value Shift.",
          "",
          "Recommended review package: keep 1-1-2 ambiguous; tighten 1-1-3; change the evidence mechanism in 1-2-3; make 1-3-1's offer less explicit; treat 1-3-3 as a strategy serving the locked desire, not a desire mutation.",
        ]),
    "",
  ].join("\n");
}

function rollingReaderReport(fixture, sceneResults) {
  const notes = [
    ["1-1", "HIGH", "The dead mother's evidence creates immediate forward pull."],
    ["1-2", "MEDIUM", "The sister conflict lands, though the scene remains deliberately compressed."],
    ["1-3", "HIGH", "The antagonist's offer makes the moral cost concrete without halting the story."],
    ["1-4", "HIGH", "The irreversible ring action converts the dilemma into visible consequence."],
  ];

  return [
    `# Rolling Reader Review: ${fixture.title} through 1-4`,
    "",
    "Date: 2026-06-12",
    "Method: WINDOW review over committed prose only.",
    "Isolation note: in-context fallback; this is not an independent blind reader.",
    "",
    "## Engagement Curve",
    "",
    "1-1 HIGH -> 1-2 MEDIUM -> 1-3 HIGH -> 1-4 HIGH",
    "",
    "## Scene-by-Scene Notes",
    "",
    "| Scene | Rating | Key Note |",
    "|---|---|---|",
    ...notes.map(([scene, rating, note]) => `| ${scene} | ${rating} | ${note} |`),
    "",
    "## Confusion Points",
    "",
    "- The exact relationship between the management list and the lowland sacrifice remains intentionally incomplete after 1-1; a later scene must pay this off.",
    "",
    "## Emotional Peaks",
    "",
    "- 1-2: 阿蓁 identifies the blue sealing clay and refuses the pass.",
    "- 1-4: 林汐 sacrifices her professional ring to make the broadcast irreversible.",
    "",
    "## Residual Risk",
    "",
    "- The prose still favors concrete objects followed by restrained after-images. The material-evidence revision and action ending reduce repetition but do not eliminate the shared house style.",
    "",
    "## Reader's Verdict",
    "",
    "The four-scene window now has a clear hook, relationship resistance, moral pressure, and an active ending. It promises a political-memory story with emotional stakes. The next window must vary scene scale and sentence architecture or the controlled object-centered style may become predictable.",
    "",
  ].join("\n");
}

function rollingPacingReport(fixture, sceneResults) {
  const sceneTypes = {
    "1-1": "REVELATION",
    "1-2": "RELATIONSHIP",
    "1-3": "TENSION",
    "1-4": "ACTION",
  };
  const rows = sceneResults.map((scene) => {
    const characterCount = scene.beats
      .map((beat) => beat.clean_text)
      .join("")
      .replace(/\s/g, "").length;
    return [
      scene.ref,
      characterCount,
      sceneTypes[scene.ref],
      scene.ref === "1-2" ? "brief breath" : "escalates",
    ];
  });

  return [
    `# Rolling Pacing Review: ${fixture.title} through 1-4`,
    "",
    "Date: 2026-06-12",
    "Mode: WINDOW",
    "Isolation note: in-context fallback; findings are advisory.",
    "",
    "## Scene Length Distribution",
    "",
    "| Scene | Chinese characters (approx.) | Register | Shape |",
    "|---|---:|---|---|",
    ...rows.map(
      ([scene, count, register, shape]) =>
        `| ${scene} | ${count} | ${register} | ${shape} |`,
    ),
    "",
    "## Escalation Map",
    "",
    "- 1-1 turns private grief into public evidence.",
    "- 1-2 introduces a relational refusal and a brief reduction in external pressure.",
    "- 1-3 converts the evidence into an explicit moral bargain.",
    "- 1-4 compresses into physical danger and irreversible action.",
    "",
    "## Diminishing Returns",
    "",
    "- Resolved: the second evidence discovery no longer arrives through leaked audio.",
    "- Residual: small handled objects still carry several scene endings; the next sequence should use spatial movement, interruption, or group action as a different closing mechanism.",
    "",
    "## Prescriptions",
    "",
    "1. Keep the 1-2 relational breath; do not add more conspiracy explanation there.",
    "2. Let the next scene expand beyond the current three-Beat micro-scene length.",
    "3. Avoid another ending built around a small object being placed, folded, or released.",
    "",
  ].join("\n");
}

export function runBeatGateDogfood({
  outputDir,
  applyDecision = true,
} = {}) {
  const fixture = readJson(FIXTURE_PATH);
  const decision = applyDecision ? fixture.human_decision : null;
  if (decision) {
    const decisionBeat = fixture.scenes
      .flatMap((scene) => scene.beats)
      .find((beat) => Array.isArray(beat.diversity_alternatives));
    const selectedAlternative = decisionBeat?.diversity_alternatives.find(
      (alternative) => alternative.id === decision.selected_ending,
    );
    if (!selectedAlternative || !decisionBeat.accepted_text) {
      throw new Error(
        `Recorded ending '${decision.selected_ending}' is missing an accepted implementation.`,
      );
    }
  }
  const workspaceRoot = outputDir
    ? path.resolve(outputDir)
    : fs.mkdtempSync(path.join(os.tmpdir(), "beat-gate-dogfood-"));
  const projectRoot = path.join(workspaceRoot, "drafts", fixture.slug);
  const auditRoot = path.join(projectRoot, "audit", "beat-gate");
  const candidateRoot = path.join(projectRoot, "prose-candidates");
  const proseRoot = path.join(projectRoot, "prose");
  const rollingRoot = path.join(projectRoot, "audit", "rolling");
  const policy = readJson(
    path.join(REPO_ROOT, "templates", "beat-gate-policy.json"),
  );
  policy.term_mappings = fixture.term_mappings;

  writeJson(path.join(projectRoot, "beat-gate-policy.json"), policy);
  writeJson(path.join(projectRoot, "authority-lock.json"), fixture.authority);

  const sceneResults = [];
  const mechanisms = [];
  let autoPatches = 0;
  let criticReviewFindings = 0;
  let autoOutputLeaks = 0;

  for (const scene of fixture.scenes) {
    const ledger = readJson(
      path.join(REPO_ROOT, "templates", "beat-gate-ledger.json"),
    );
    Object.assign(ledger, {
      version: policy.version,
      scene_ref: scene.ref,
      execution_mode: "in-context-fallback",
      status: decision ? "accepted" : "deferred_to_batch_boundary",
      stages_completed: decision
        ? [
            "scan",
            "critic",
            "diversity_if_required",
            "writer_decision",
            "commit",
          ]
        : ["scan", "critic", "diversity_if_required"],
      writer_decision: decision
        ? "accept"
        : "deferred_to_batch_boundary",
      current_round: Math.max(
        ...scene.beats.map((beat) => beat.current_round || 1),
      ),
      rolling_review_due: false,
    });

    const beats = scene.beats.map((beat) => {
      const originalResult = applyBeatGateRules({
        policy,
        candidate_text: beat.candidate_text,
      });
      const activeCandidateText =
        decision && beat.accepted_text
          ? beat.accepted_text
          : beat.candidate_text;
      const result = applyBeatGateRules({
        policy,
        candidate_text: activeCandidateText,
      });
      const requiresDiversity =
        !decision &&
        Array.isArray(beat.diversity_alternatives) &&
        beat.diversity_alternatives.length > 0;
      const status = decision
        ? "accepted"
        : requiresDiversity
          ? "awaiting_writer"
          : "deferred_to_batch_boundary";
      const writerDecision = decision
        ? "accept"
        : requiresDiversity
          ? null
          : "deferred_to_batch_boundary";

      mechanisms.push(beat.mechanism);
      autoPatches += result.patches.length;
      criticReviewFindings += beat.critic_findings.length;
      if (/<!--|-->/.test(result.output_text)) {
        autoOutputLeaks += 1;
      }

      const ledgerBeat = {
        beat_ref: beat.ref,
        status,
        candidate_text: beat.candidate_text,
        clean_text: result.output_text,
        detections: [],
        patches: result.patches,
        review_items: [
          ...result.review_items,
          ...beat.critic_findings,
        ],
        reject_items: result.reject_items,
        history: [
          ...(Array.isArray(beat.diversity_alternatives)
            ? ["round_1_meaningful_move", "round_2_diversity_required"]
            : []),
          ...(decision && beat.review_resolution
            ? [`writer_resolution: ${beat.review_resolution}`]
            : []),
          ...(decision && beat.ref === "1-4-3"
            ? [`writer_selected_ending_${decision.selected_ending}`]
            : []),
          ...(decision ? ["in_context_delta_recheck_completed"] : []),
        ],
        rounds: {
          draft:
            (beat.current_round || 1) +
            (decision && beat.accepted_text ? 1 : 0),
          critic: beat.current_round || 1,
          patch: result.patches.length > 0 ? 1 : 0,
          diversity: Array.isArray(beat.diversity_alternatives) ? 1 : 0,
        },
        writer_decision: writerDecision,
        deferred_to_batch_boundary: !decision && !requiresDiversity,
        review_resolution:
          decision && beat.review_resolution
            ? beat.review_resolution
            : null,
      };

      writeText(
        path.join(auditRoot, `${beat.ref}-critic.md`),
        criticReport(beat),
      );
      if (requiresDiversity) {
        writeText(
          path.join(auditRoot, `${beat.ref}-diversity.md`),
          diversityReport(beat),
        );
      }

      return {
        ...beat,
        ...ledgerBeat,
        candidate_clean_text: originalResult.output_text,
      };
    });

    ledger.beats = beats.map((beat) => ({
      beat_ref: beat.beat_ref,
      status: beat.status,
      candidate_text: beat.candidate_text,
      clean_text: beat.clean_text,
      detections: beat.detections,
      patches: beat.patches,
      review_items: beat.review_items,
      reject_items: beat.reject_items,
      history: beat.history,
      rounds: beat.rounds,
      writer_decision: beat.writer_decision,
      deferred_to_batch_boundary: beat.deferred_to_batch_boundary,
      review_resolution: beat.review_resolution,
    }));
    if (!decision && beats.some((beat) => beat.status === "awaiting_writer")) {
      ledger.status = "awaiting_writer";
      ledger.writer_decision = null;
    }

    const ledgerErrors = validateLedger(ledger);
    if (ledgerErrors.length > 0) {
      throw new Error(
        `Invalid ledger for ${scene.ref}: ${ledgerErrors.join("; ")}`,
      );
    }

    writeJson(path.join(auditRoot, `${scene.ref}.json`), ledger);
    writeText(
      path.join(candidateRoot, `${scene.ref}.md`),
      `${beats.map((beat) => beat.candidate_clean_text).join("\n\n")}\n`,
    );
    if (decision) {
      writeText(
        path.join(proseRoot, `${scene.ref}.md`),
        `${beats.map((beat) => beat.clean_text).join("\n\n")}\n`,
      );
    }
    sceneResults.push({
      ...scene,
      beats,
    });
  }

  const protectedPolicy = structuredClone(policy);
  protectedPolicy.term_mappings = [fixture.protected_probe.mapping];
  const protectedProbe = applyBeatGateRules({
    policy: protectedPolicy,
    candidate_text: fixture.protected_probe.candidate_text,
  });
  if (
    protectedProbe.output_text !== fixture.protected_probe.candidate_text ||
    protectedProbe.reject_items.length !== 1
  ) {
    throw new Error("Protected-field probe failed.");
  }

  const alternativeMechanisms = new Set(
    fixture.scenes
      .flatMap((scene) => scene.beats)
      .flatMap((beat) => beat.diversity_alternatives || [])
      .map((alternative) => alternative.mechanism),
  );
  if (decision) {
    writeText(
      path.join(rollingRoot, "1-4-reader.md"),
      rollingReaderReport(fixture, sceneResults),
    );
    writeText(
      path.join(rollingRoot, "1-4-pacing.md"),
      rollingPacingReport(fixture, sceneResults),
    );
    const finalLedgerPath = path.join(auditRoot, "1-4.json");
    const finalLedger = readJson(finalLedgerPath);
    finalLedger.stages_completed.push("rolling_review");
    finalLedger.rolling_review_due = false;
    const finalLedgerErrors = validateLedger(finalLedger);
    if (finalLedgerErrors.length > 0) {
      throw new Error(
        `Invalid final ledger: ${finalLedgerErrors.join("; ")}`,
      );
    }
    writeJson(finalLedgerPath, finalLedger);
  }
  const allBeats = sceneResults.flatMap((scene) => scene.beats);
  const resolvedReviewFindings = allBeats.reduce(
    (total, beat) =>
      total +
      (beat.review_resolution ? beat.critic_findings.length : 0),
    0,
  );
  if (decision && resolvedReviewFindings !== criticReviewFindings) {
    throw new Error(
      `Writer decision left ${criticReviewFindings - resolvedReviewFindings} REVIEW findings unresolved.`,
    );
  }
  const report = {
    status: decision ? "COMMITTED" : "AWAITING_WRITER",
    fixture: path.relative(REPO_ROOT, FIXTURE_PATH),
    project_root: path.relative(workspaceRoot, projectRoot),
    execution_mode: "in-context-fallback",
    metrics: {
      scenes_attempted: fixture.scenes.length,
      beats_attempted: fixture.scenes.reduce(
        (total, scene) => total + scene.beats.length,
        0,
      ),
      auto_patches: autoPatches,
      auto_output_leaks: autoOutputLeaks,
      critic_review_findings: criticReviewFindings,
      protected_probe_rejects: protectedProbe.reject_items.length,
      beats_deferred_to_batch_boundary: allBeats
        .filter((beat) => beat.deferred_to_batch_boundary).length,
      beats_awaiting_writer: allBeats
        .filter((beat) => beat.status === "awaiting_writer").length,
      beats_accepted: allBeats.filter((beat) => beat.status === "accepted")
        .length,
      review_findings_resolved: decision ? resolvedReviewFindings : 0,
      human_decision_points: 1,
      human_decisions_recorded: decision ? 1 : 0,
      mechanism_categories_covered: new Set(mechanisms).size,
      diversity_alternative_mechanisms: alternativeMechanisms.size,
      initial_batch_risk_flags: fixture.batch_observations.length,
      post_commit_residual_risks: decision
        ? fixture.post_commit_observations.filter(
            (observation) => observation.status === "residual",
          ).length
        : null,
      post_commit_resolved_risks: decision
        ? fixture.post_commit_observations.filter(
            (observation) => observation.status === "resolved",
          ).length
        : null,
    },
    compute: {
      runner_invocations:
        fixture.scenes.reduce(
          (total, scene) => total + scene.beats.length,
          0,
        ) + 1,
      isolated_critic_calls: 0,
      in_context_critic_passes: fixture.scenes.reduce(
        (total, scene) => total + scene.beats.length,
        0,
      ),
      diversity_passes: 1,
      rolling_review_passes: decision ? 2 : 0,
    },
    decision: decision
      ? {
          selected_ending: decision.selected_ending,
          decided_at: decision.decided_at,
          decision_source: decision.decision_source,
        }
      : null,
    post_commit_findings: decision
      ? fixture.post_commit_observations
      : [],
    limitations: [
      "The blind critic ran in-context, so drafter-reviewer independence is not proven.",
      "Mechanism categories are fixture labels and do not prove prose-level diversity.",
      ...(decision
        ? [
            "Rolling reader and pacing reviews also ran in-context and are advisory, not independent quality proof.",
          ]
        : [
            "Final aesthetic acceptance and accepted-vs-rejected critic findings remain pending human judgment.",
            "Rolling reader and pacing reviews must wait until the writer commits the scene batch.",
          ]),
    ],
  };

  const reportPath = path.join(workspaceRoot, "dogfood-report.json");
  const reviewPath = path.join(workspaceRoot, "writer-review-package.md");
  writeJson(reportPath, report);
  writeText(
    reviewPath,
    reviewPackage(fixture, sceneResults, report, decision),
  );

  return {
    ...report,
    workspace_root: workspaceRoot,
    report_path: reportPath,
    writer_review_path: reviewPath,
  };
}

function parseArgs(args) {
  let outputDir;
  let applyDecision = true;

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--pending") {
      applyDecision = false;
      continue;
    }
    if (args[index] === "--output" && args[index + 1]) {
      outputDir = args[index + 1];
      index += 1;
      continue;
    }
    throw new Error(
      "Usage: node scripts/run-beat-gate-dogfood.mjs [--pending] [--output <dir>]",
    );
  }

  return { outputDir, applyDecision };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { outputDir, applyDecision } = parseArgs(
      process.argv.slice(2),
    );
    console.log(
      JSON.stringify(
        runBeatGateDogfood({ outputDir, applyDecision }),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
