import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PREFERENCE_VALUES = new Set(["A", "B", "tie"]);
const DIFFERENCE_VALUES = new Set(["yes", "no", "uncertain"]);
const FINDING_VALUES = new Set(["accept", "reject", "uncertain"]);
const ADOPTION_VALUES = new Set(["yes", "no", "defer"]);
const REPETITION_VALUES = new Set([
  "reduced",
  "unchanged",
  "increased",
  "uncertain",
]);
const CALIBRATION_CONTROL_VALUES = new Set(["none", "weak_challenger"]);

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

function sha256(value) {
  const content = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function stableHash(seed, value) {
  return sha256(`${seed}:${value}`);
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function validateOptionalCount(value, label) {
  if (value !== null && (!Number.isInteger(value) || value < 0)) {
    throw new Error(`${label} must be null or a non-negative integer`);
  }
}

function validatePositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
}

function timestamp(value, label) {
  assertNonEmptyString(value, label);
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${label} must be an ISO-compatible timestamp`);
  }
  return parsed;
}

function durationMinutes(reviewer, label) {
  const startedAt = timestamp(reviewer.started_at, `${label}.started_at`);
  const completedAt = timestamp(
    reviewer.completed_at,
    `${label}.completed_at`,
  );
  if (completedAt < startedAt) {
    throw new Error(`${label}.completed_at must not precede started_at`);
  }
  return Number(((completedAt - startedAt) / 60000).toFixed(1));
}

function validateInput(input) {
  assertNonEmptyString(input.version, "version");
  assertNonEmptyString(input.run_id, "run_id");
  assertNonEmptyString(input.title, "title");
  validateOptionalCount(
    input.process_metrics?.critic_agent_calls ?? null,
    "process_metrics.critic_agent_calls",
  );
  validateOptionalCount(
    input.process_metrics?.variant_generation_agent_calls ?? null,
    "process_metrics.variant_generation_agent_calls",
  );
  if (!Array.isArray(input.comparisons) || input.comparisons.length === 0) {
    throw new Error("comparisons must contain at least one comparison");
  }

  const ids = new Set();
  for (const [index, comparison] of input.comparisons.entries()) {
    const label = `comparisons[${index}]`;
    assertNonEmptyString(comparison.id, `${label}.id`);
    if (ids.has(comparison.id)) {
      throw new Error(`duplicate comparison id: ${comparison.id}`);
    }
    ids.add(comparison.id);
    assertNonEmptyString(comparison.baseline_text, `${label}.baseline_text`);
    assertNonEmptyString(
      comparison.challenger_text,
      `${label}.challenger_text`,
    );
    if (comparison.baseline_text === comparison.challenger_text) {
      throw new Error(`${label} variants must differ`);
    }
    if (
      comparison.authority_attestation?.protected_fields_unchanged !== true
    ) {
      throw new Error(
        `${label}.authority_attestation.protected_fields_unchanged must be true`,
      );
    }
    assertNonEmptyString(
      comparison.finding?.predicate,
      `${label}.finding.predicate`,
    );
    assertNonEmptyString(
      comparison.finding?.evidence,
      `${label}.finding.evidence`,
    );
    assertNonEmptyString(
      comparison.finding?.question,
      `${label}.finding.question`,
    );
    if (comparison.application != null) {
      assertNonEmptyString(
        comparison.application.target_file,
        `${label}.application.target_file`,
      );
      if (
        path.isAbsolute(comparison.application.target_file) ||
        comparison.application.target_file
          .split(/[\\/]/)
          .includes("..")
      ) {
        throw new Error(
          `${label}.application.target_file must stay within the application root`,
        );
      }
    }
  }

  return validateCalibration(input);
}

function validateCalibration(input) {
  const calibration = input.calibration;
  if (calibration == null) {
    if (
      input.comparisons.some(
        (comparison) => comparison.calibration != null,
      )
    ) {
      throw new Error(
        "comparison calibration metadata requires top-level calibration",
      );
    }
    return null;
  }

  if (calibration.mode !== "prospective") {
    throw new Error("calibration.mode must be prospective");
  }
  assertNonEmptyString(calibration.pilot_id, "calibration.pilot_id");
  validatePositiveInteger(
    calibration.minimum_comparisons,
    "calibration.minimum_comparisons",
  );
  validatePositiveInteger(
    calibration.minimum_distinct_scenes,
    "calibration.minimum_distinct_scenes",
  );
  if (
    !Array.isArray(calibration.required_categories) ||
    calibration.required_categories.length === 0
  ) {
    throw new Error(
      "calibration.required_categories must contain at least one category",
    );
  }
  for (const [index, category] of calibration.required_categories.entries()) {
    assertNonEmptyString(
      category,
      `calibration.required_categories[${index}]`,
    );
  }
  if (calibration.control_policy?.type !== "weak_challenger") {
    throw new Error(
      "calibration.control_policy.type must be weak_challenger",
    );
  }
  validatePositiveInteger(
    calibration.control_policy.minimum_count,
    "calibration.control_policy.minimum_count",
  );

  const scenes = new Set();
  const categories = new Set();
  let controlCount = 0;
  for (const [index, comparison] of input.comparisons.entries()) {
    const label = `comparisons[${index}]`;
    assertNonEmptyString(comparison.scene_ref, `${label}.scene_ref`);
    assertNonEmptyString(
      comparison.calibration?.category,
      `${label}.calibration.category`,
    );
    if (
      !CALIBRATION_CONTROL_VALUES.has(
        comparison.calibration?.control_type,
      )
    ) {
      throw new Error(
        `${label}.calibration.control_type must be none or weak_challenger`,
      );
    }
    scenes.add(comparison.scene_ref);
    categories.add(comparison.calibration.category);
    if (comparison.calibration.control_type === "weak_challenger") {
      controlCount += 1;
    }
  }

  if (input.comparisons.length < calibration.minimum_comparisons) {
    throw new Error(
      `prospective calibration requires at least ${calibration.minimum_comparisons} comparisons`,
    );
  }
  if (scenes.size < calibration.minimum_distinct_scenes) {
    throw new Error(
      `prospective calibration requires at least ${calibration.minimum_distinct_scenes} distinct scenes`,
    );
  }
  const missingCategories = calibration.required_categories.filter(
    (category) => !categories.has(category),
  );
  if (missingCategories.length > 0) {
    throw new Error(
      `prospective calibration is missing required categories: ${missingCategories.join(", ")}`,
    );
  }
  if (controlCount < calibration.control_policy.minimum_count) {
    throw new Error(
      `prospective calibration requires at least ${calibration.control_policy.minimum_count} weak challenger controls`,
    );
  }

  return {
    ...calibration,
    distinct_scenes: scenes.size,
    control_count: controlCount,
  };
}

function orderComparisons(comparisons, seed) {
  return [...comparisons].sort((left, right) =>
    stableHash(seed, left.id).localeCompare(stableHash(seed, right.id)),
  );
}

function assignVariants(orderedComparisons, seed) {
  const baselineStartsAsA =
    Number.parseInt(stableHash(seed, "variant-balance").slice(0, 2), 16) %
      2 ===
    0;

  return orderedComparisons.map((comparison, index) => {
    const baselineLabel =
      (index % 2 === 0) === baselineStartsAsA ? "A" : "B";
    const challengerLabel = baselineLabel === "A" ? "B" : "A";
    return {
      comparison,
      public_id: `C${String(index + 1).padStart(2, "0")}`,
      baseline_label: baselineLabel,
      challenger_label: challengerLabel,
      variants: {
        A:
          baselineLabel === "A"
            ? comparison.baseline_text
            : comparison.challenger_text,
        B:
          baselineLabel === "B"
            ? comparison.baseline_text
            : comparison.challenger_text,
      },
    };
  });
}

function renderBlindPackage(input, assignments) {
  const sections = assignments.flatMap((assignment) => {
    const context = assignment.comparison.context;
    return [
      `## ${assignment.public_id}`,
      "",
      ...(context
        ? [
            "### Context",
            "",
            context,
            "",
          ]
        : []),
      "### Variant A",
      "",
      assignment.variants.A,
      "",
      "### Variant B",
      "",
      assignment.variants.B,
      "",
      "Record the choice in `stage-1-decisions.json` before opening any reveal material.",
      "",
    ];
  });

  return `# Blind Writer Comparison: ${input.title}

Run: ${input.run_id}

## Rules

- Read both variants in context.
- Judge the prose, not what you imagine the production process intended.
- Choose \`A\`, \`B\`, or \`tie\`.
- Record confidence from 1 to 5.
- Do not open \`sealed-manifest.json\` before Stage 1 is complete.
- This is procedural blinding, not cryptographic secrecy.

${sections.join("\n")}`;
}

function stageOneTemplate(input, assignments, packageHash) {
  return {
    version: "1.0.0",
    run_id: input.run_id,
    stage: "blind_preference",
    status: "AWAITING_WRITER",
    package_sha256: packageHash,
    reviewer: {
      id: null,
      started_at: null,
      completed_at: null,
    },
    comparisons: assignments.map((assignment) => ({
      comparison_id: assignment.public_id,
      preferred_variant: null,
      confidence: null,
      meaningful_difference: null,
      reasons: [],
      notes: "",
    })),
    batch_assessment: {
      overall_homogeneity: null,
      repeated_patterns_noticed: [],
      notes: "",
    },
  };
}

function validateStageOne(stageOne, manifest) {
  if (stageOne.status !== "COMPLETE") {
    throw new Error("Stage 1 status must be COMPLETE before reveal");
  }
  if (stageOne.run_id !== manifest.run_id) {
    throw new Error("Stage 1 run_id does not match the sealed manifest");
  }
  if (stageOne.package_sha256 !== manifest.package_sha256) {
    throw new Error("Stage 1 package hash does not match the sealed manifest");
  }
  assertNonEmptyString(stageOne.reviewer?.id, "reviewer.id");
  durationMinutes(stageOne.reviewer, "reviewer");

  const expectedIds = manifest.comparisons.map(
    (comparison) => comparison.comparison_id,
  );
  const actualIds = stageOne.comparisons?.map(
    (comparison) => comparison.comparison_id,
  );
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error("Stage 1 comparisons do not match the sealed manifest");
  }

  for (const decision of stageOne.comparisons) {
    if (!PREFERENCE_VALUES.has(decision.preferred_variant)) {
      throw new Error(
        `${decision.comparison_id}.preferred_variant must be A, B, or tie`,
      );
    }
    if (
      !Number.isInteger(decision.confidence) ||
      decision.confidence < 1 ||
      decision.confidence > 5
    ) {
      throw new Error(
        `${decision.comparison_id}.confidence must be an integer from 1 to 5`,
      );
    }
    if (!DIFFERENCE_VALUES.has(decision.meaningful_difference)) {
      throw new Error(
        `${decision.comparison_id}.meaningful_difference must be yes, no, or uncertain`,
      );
    }
    if (!Array.isArray(decision.reasons)) {
      throw new Error(`${decision.comparison_id}.reasons must be an array`);
    }
  }
}

function validateBlindPackage(outputDir, manifest) {
  const packagePath = path.join(outputDir, "blind-package.md");
  if (!fs.existsSync(packagePath)) {
    throw new Error("blind-package.md is missing");
  }
  if (sha256(fs.readFileSync(packagePath)) !== manifest.package_sha256) {
    throw new Error("blind-package.md no longer matches the sealed manifest");
  }
}

function renderRevealPackage(manifest, stageOne) {
  const decisions = new Map(
    stageOne.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const sections = manifest.comparisons.flatMap((comparison) => {
    const decision = decisions.get(comparison.comparison_id);
    const selectedRole =
      decision.preferred_variant === "tie"
        ? "tie"
        : comparison.variant_roles[decision.preferred_variant];
    return [
      `## ${comparison.comparison_id}`,
      "",
      `- Blind preference: ${decision.preferred_variant}`,
      `- Selected role after reveal: ${selectedRole}`,
      `- Source reference: ${comparison.source_ref}`,
      `- Predicate: ${comparison.finding.predicate}`,
      `- Evidence: ${comparison.finding.evidence}`,
      `- Question: ${comparison.finding.question}`,
      "",
      "Now record whether the finding is accepted, rejected, or uncertain in `stage-2-decisions.json`.",
      "",
    ];
  });

  return `# Writer Adjudication Reveal: ${manifest.title}

Stage 1 was locked before this file was generated.

${sections.join("\n")}`;
}

function stageTwoTemplate(manifest, stageOneHash) {
  return {
    version: "1.0.0",
    run_id: manifest.run_id,
    stage: "finding_adjudication",
    status: "AWAITING_WRITER",
    stage_1_sha256: stageOneHash,
    reviewer: {
      id: null,
      started_at: null,
      completed_at: null,
    },
    comparisons: manifest.comparisons.map((comparison) => ({
      comparison_id: comparison.comparison_id,
      finding_disposition: null,
      adopt_preferred_variant: null,
      rationale: "",
    })),
    batch_effect: {
      cross_scene_repetition: null,
      notes: "",
    },
    overall_notes: "",
  };
}

function validateStageTwo(stageTwo, manifest, stageOneHash) {
  if (stageTwo.status !== "COMPLETE") {
    throw new Error("Stage 2 status must be COMPLETE before scoring");
  }
  if (stageTwo.run_id !== manifest.run_id) {
    throw new Error("Stage 2 run_id does not match the sealed manifest");
  }
  if (stageTwo.stage_1_sha256 !== stageOneHash) {
    throw new Error("Stage 2 is not bound to the supplied Stage 1 decisions");
  }
  assertNonEmptyString(stageTwo.reviewer?.id, "reviewer.id");
  durationMinutes(stageTwo.reviewer, "reviewer");
  if (
    !REPETITION_VALUES.has(
      stageTwo.batch_effect?.cross_scene_repetition,
    )
  ) {
    throw new Error(
      "batch_effect.cross_scene_repetition must be reduced, unchanged, increased, or uncertain",
    );
  }

  const expectedIds = manifest.comparisons.map(
    (comparison) => comparison.comparison_id,
  );
  const actualIds = stageTwo.comparisons?.map(
    (comparison) => comparison.comparison_id,
  );
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error("Stage 2 comparisons do not match the sealed manifest");
  }

  for (const decision of stageTwo.comparisons) {
    if (!FINDING_VALUES.has(decision.finding_disposition)) {
      throw new Error(
        `${decision.comparison_id}.finding_disposition must be accept, reject, or uncertain`,
      );
    }
    if (!ADOPTION_VALUES.has(decision.adopt_preferred_variant)) {
      throw new Error(
        `${decision.comparison_id}.adopt_preferred_variant must be yes, no, or defer`,
      );
    }
  }
}

function percentage(numerator, denominator) {
  return denominator === 0
    ? 0
    : Number(((numerator / denominator) * 100).toFixed(1));
}

function calibrationMetrics(comparisons, manifestCalibration) {
  if (!manifestCalibration) {
    return null;
  }

  const controls = comparisons.filter(
    (comparison) => comparison.control_type === "weak_challenger",
  );
  const nonControls = comparisons.filter(
    (comparison) => comparison.control_type !== "weak_challenger",
  );
  const byCategory = {};
  for (const comparison of comparisons) {
    const category = comparison.calibration_category;
    const current = byCategory[category] ?? {
      comparisons: 0,
      challenger_preferred: 0,
      baseline_preferred: 0,
      ties: 0,
      findings_accepted: 0,
      findings_rejected: 0,
      findings_uncertain: 0,
    };
    current.comparisons += 1;
    if (comparison.preferred_role === "challenger") {
      current.challenger_preferred += 1;
    } else if (comparison.preferred_role === "baseline") {
      current.baseline_preferred += 1;
    } else {
      current.ties += 1;
    }
    if (comparison.finding_disposition === "accept") {
      current.findings_accepted += 1;
    } else if (comparison.finding_disposition === "reject") {
      current.findings_rejected += 1;
    } else {
      current.findings_uncertain += 1;
    }
    byCategory[category] = current;
  }

  const controlBaselinePreferred = controls.filter(
    (comparison) => comparison.preferred_role === "baseline",
  ).length;
  const controlTies = controls.filter(
    (comparison) => comparison.preferred_role === "tie",
  ).length;
  const controlChallengerPreferred = controls.filter(
    (comparison) => comparison.preferred_role === "challenger",
  ).length;

  return {
    mode: manifestCalibration.mode,
    pilot_id: manifestCalibration.pilot_id,
    distinct_scenes: manifestCalibration.distinct_scenes,
    control_count: controls.length,
    control_baseline_preferred: controlBaselinePreferred,
    control_ties: controlTies,
    control_challenger_preferred: controlChallengerPreferred,
    control_resistance_rate_percent: percentage(
      controlBaselinePreferred + controlTies,
      controls.length,
    ),
    control_findings_rejected: controls.filter(
      (comparison) => comparison.finding_disposition === "reject",
    ).length,
    non_control_comparisons: nonControls.length,
    non_control_challenger_preferred: nonControls.filter(
      (comparison) => comparison.preferred_role === "challenger",
    ).length,
    by_category: byCategory,
  };
}

function renderCalibrationMetrics(calibration) {
  if (!calibration) {
    return "";
  }
  return `
## Calibration

| Metric | Result |
|---|---:|
| Pilot | ${calibration.pilot_id} |
| Distinct scenes | ${calibration.distinct_scenes} |
| Weak challenger controls | ${calibration.control_count} |
| Control baseline preferred | ${calibration.control_baseline_preferred} |
| Control ties | ${calibration.control_ties} |
| Control challenger preferred | ${calibration.control_challenger_preferred} |
| Control resistance rate | ${calibration.control_resistance_rate_percent}% |
| Control findings rejected | ${calibration.control_findings_rejected} |
| Non-control challenger preferred | ${calibration.non_control_challenger_preferred}/${calibration.non_control_comparisons} |
`;
}

function renderReport(report) {
  return `# Writer Adjudication Report: ${report.title}

Status: ${report.status}

## Metrics

| Metric | Result |
|---|---:|
| Comparisons | ${report.metrics.comparisons} |
| Challenger preferred | ${report.metrics.challenger_preferred} |
| Baseline preferred | ${report.metrics.baseline_preferred} |
| Ties | ${report.metrics.ties} |
| Challenger win rate excluding ties | ${report.metrics.challenger_win_rate_excluding_ties_percent}% |
| Findings accepted | ${report.metrics.findings_accepted} |
| Findings rejected | ${report.metrics.findings_rejected} |
| Findings uncertain | ${report.metrics.findings_uncertain} |
| Writer-rejected finding rate | ${report.metrics.writer_rejected_finding_rate_percent}% |
| Preferred variants adopted | ${report.metrics.preferred_variants_adopted} |
| Writer review time | ${report.metrics.writer_review_minutes} minutes |
| Critic agent calls | ${report.metrics.critic_agent_calls ?? "not recorded"} |
| Variant-generation agent calls | ${report.metrics.variant_generation_agent_calls ?? "not recorded"} |
| Cross-scene repetition after reveal | ${report.metrics.cross_scene_repetition_effect} |

${renderCalibrationMetrics(report.calibration)}
## Decisions

${report.comparisons
  .map(
    (comparison) =>
      `- ${comparison.comparison_id} / ${comparison.source_ref}: blind preference ${comparison.preferred_variant} (${comparison.preferred_role}); finding ${comparison.finding_disposition}; adoption ${comparison.adopt_preferred_variant}; rationale: ${comparison.finding_rationale || "none"}`,
  )
  .join("\n")}
`;
}

function findingKey(value) {
  return `${value.beat_ref}::${value.predicate}`;
}

function unresolvedFindings(source) {
  const findings = Array.isArray(source.findings)
    ? source.findings
    : (source.scene_reviews ?? []).flatMap((review) =>
        (review.findings ?? []).map((finding) => ({
          scene_ref: review.scene_ref,
          ...finding,
        })),
      );
  return findings.filter(
    (finding) => {
      if (finding.assessment != null) {
        return finding.assessment === "requires_fresh_human_review";
      }
      if (finding.status != null) {
        return finding.status === "unresolved";
      }
      return finding.classification === "REVIEW";
    },
  );
}

function uniqueByFindingKey(values, label) {
  const result = new Map();
  for (const value of values) {
    assertNonEmptyString(value.beat_ref, `${label}.beat_ref`);
    assertNonEmptyString(value.predicate, `${label}.predicate`);
    const key = findingKey(value);
    if (result.has(key)) {
      throw new Error(`Duplicate ${label} key: ${key}`);
    }
    result.set(key, value);
  }
  return result;
}

export function prepareAdjudicationInput({
  findingsPath,
  variantsPath,
  outputPath,
  runId,
  title,
  createdAt,
}) {
  assertNonEmptyString(runId, "runId");
  assertNonEmptyString(title, "title");
  assertNonEmptyString(createdAt, "createdAt");
  const findingsSource = readJson(findingsPath);
  const variantsSource = readJson(variantsPath);
  const findings = unresolvedFindings(findingsSource);
  if (findings.length === 0) {
    throw new Error("No unresolved findings found");
  }
  if (!Array.isArray(variantsSource.variants)) {
    throw new Error("variants must be an array");
  }
  const findingsByKey = uniqueByFindingKey(findings, "finding");
  const variantsByKey = uniqueByFindingKey(
    variantsSource.variants,
    "variant",
  );
  const unmatchedVariantKeys = [...variantsByKey.keys()].filter(
    (key) => !findingsByKey.has(key),
  );
  if (unmatchedVariantKeys.length > 0) {
    throw new Error(
      `Variants have no unresolved finding: ${unmatchedVariantKeys.join(", ")}`,
    );
  }

  const comparisons = [...findingsByKey].map(([key, finding]) => {
    const variant = variantsByKey.get(key);
    if (!variant) {
      throw new Error(`Missing variant for unresolved finding: ${key}`);
    }
    return {
      id: variant.id,
      scene_ref: variant.scene_ref ?? finding.scene_ref,
      source_ref: variant.source_ref ?? finding.beat_ref,
      authority_attestation: variant.authority_attestation,
      context: variant.context,
      baseline_text: variant.baseline_text,
      challenger_text: variant.challenger_text,
      calibration: variant.calibration ?? null,
      application: variant.application ?? null,
      finding: {
        predicate: finding.predicate,
        evidence: finding.evidence,
        question: finding.question,
      },
    };
  });
  const prepared = {
    version: "1.0.0",
    run_id: runId,
    title,
    created_at: createdAt,
    calibration: variantsSource.calibration ?? null,
    process_metrics: variantsSource.process_metrics ?? {
      critic_agent_calls: null,
      variant_generation_agent_calls: null,
      notes: "",
    },
    comparisons,
  };
  validateInput(prepared);
  writeJson(outputPath, prepared);
  return prepared;
}

export function createAdjudicationRun({ inputPath, outputDir, seed }) {
  const input = readJson(inputPath);
  const calibration = validateInput(input);
  assertNonEmptyString(seed, "seed");
  const inputHash = sha256(fs.readFileSync(inputPath));
  const metadataPath = path.join(outputDir, "run-metadata.json");
  const existingArtifacts = [
    "blind-package.md",
    "stage-1-decisions.json",
    "sealed-manifest.json",
    "run-metadata.json",
  ];

  if (fs.existsSync(metadataPath)) {
    const metadata = readJson(metadataPath);
    if (
      metadata.run_id !== input.run_id ||
      metadata.seed !== seed ||
      metadata.input_sha256 !== inputHash
    ) {
      throw new Error(
        "Output directory belongs to a different adjudication input or seed",
      );
    }
    const missing = existingArtifacts.filter(
      (fileName) => !fs.existsSync(path.join(outputDir, fileName)),
    );
    if (missing.length > 0) {
      throw new Error(
        `Existing adjudication run is incomplete: missing ${missing.join(", ")}`,
      );
    }
    return metadata;
  }
  if (
    fs.existsSync(outputDir) &&
    fs.readdirSync(outputDir).some((entry) => existingArtifacts.includes(entry))
  ) {
    throw new Error(
      "Output directory contains adjudication artifacts without run metadata",
    );
  }

  const assignments = assignVariants(
    orderComparisons(input.comparisons, seed),
    seed,
  );
  const blindPackage = renderBlindPackage(input, assignments);
  const packageHash = sha256(blindPackage);
  const manifest = {
    version: "1.0.0",
    run_id: input.run_id,
    title: input.title,
    created_at: input.created_at ?? null,
    seed,
    input_sha256: inputHash,
    package_sha256: packageHash,
    process_metrics: input.process_metrics ?? {
      critic_agent_calls: null,
      variant_generation_agent_calls: null,
      notes: "",
    },
    calibration,
    warning:
      "Do not open before Stage 1 is complete. This file provides procedural, not cryptographic, blinding.",
    comparisons: assignments.map((assignment) => ({
      comparison_id: assignment.public_id,
      source_id: assignment.comparison.id,
      source_ref: assignment.comparison.source_ref ?? assignment.comparison.id,
      scene_ref: assignment.comparison.scene_ref ?? null,
      authority_attestation: assignment.comparison.authority_attestation,
      calibration: assignment.comparison.calibration ?? null,
      application: assignment.comparison.application ?? null,
      variant_roles: {
        [assignment.baseline_label]: "baseline",
        [assignment.challenger_label]: "challenger",
      },
      finding: assignment.comparison.finding,
    })),
  };
  const metadata = {
    version: "1.0.0",
    run_id: input.run_id,
    title: input.title,
    status: "AWAITING_BLIND_REVIEW",
    comparison_count: assignments.length,
    seed,
    package_sha256: packageHash,
    input_sha256: inputHash,
    process_metrics: input.process_metrics ?? {
      critic_agent_calls: null,
      variant_generation_agent_calls: null,
      notes: "",
    },
    calibration,
    human_evidence_recorded: false,
  };

  writeText(path.join(outputDir, "blind-package.md"), blindPackage);
  writeJson(
    path.join(outputDir, "stage-1-decisions.json"),
    stageOneTemplate(input, assignments, packageHash),
  );
  writeJson(path.join(outputDir, "sealed-manifest.json"), manifest);
  writeJson(path.join(outputDir, "run-metadata.json"), metadata);
  return metadata;
}

export function revealAdjudicationRun({ outputDir, stageOnePath }) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  validateBlindPackage(outputDir, manifest);
  const stageOne = readJson(stageOnePath);
  validateStageOne(stageOne, manifest);
  const stageOneHash = sha256(fs.readFileSync(stageOnePath));
  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");
  const metadataPath = path.join(outputDir, "run-metadata.json");

  if (fs.existsSync(stageTwoPath)) {
    const metadata = readJson(metadataPath);
    const stageTwo = readJson(stageTwoPath);
    if (stageTwo.stage_1_sha256 !== stageOneHash) {
      throw new Error(
        "Existing Stage 2 decisions belong to different Stage 1 content",
      );
    }
    if (
      metadata.stage_1_sha256 &&
      metadata.stage_1_sha256 !== stageOneHash
    ) {
      throw new Error(
        "Run metadata belongs to different Stage 1 content",
      );
    }
    const revealPath = path.join(outputDir, "reveal-package.md");
    if (!fs.existsSync(revealPath)) {
      writeText(revealPath, renderRevealPackage(manifest, stageOne));
    }
    const status =
      metadata.status === "COMPLETE"
        ? "COMPLETE"
        : "AWAITING_FINDING_ADJUDICATION";
    if (
      metadata.status !== status ||
      metadata.stage_1_sha256 !== stageOneHash
    ) {
      writeJson(metadataPath, {
        ...metadata,
        status,
        stage_1_sha256: stageOneHash,
      });
    }
    return {
      status,
      stage_1_sha256: stageOneHash,
    };
  }

  writeText(
    path.join(outputDir, "reveal-package.md"),
    renderRevealPackage(manifest, stageOne),
  );
  writeJson(
    stageTwoPath,
    stageTwoTemplate(manifest, stageOneHash),
  );
  const metadata = readJson(metadataPath);
  writeJson(metadataPath, {
    ...metadata,
    status: "AWAITING_FINDING_ADJUDICATION",
    stage_1_sha256: stageOneHash,
  });
  return {
    status: "AWAITING_FINDING_ADJUDICATION",
    stage_1_sha256: stageOneHash,
  };
}

export function scoreAdjudicationRun({
  outputDir,
  stageOnePath,
  stageTwoPath,
}) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  validateBlindPackage(outputDir, manifest);
  const stageOne = readJson(stageOnePath);
  validateStageOne(stageOne, manifest);
  const stageOneHash = sha256(fs.readFileSync(stageOnePath));
  const stageTwo = readJson(stageTwoPath);
  validateStageTwo(stageTwo, manifest, stageOneHash);
  const stageOneMinutes = durationMinutes(stageOne.reviewer, "stage_1.reviewer");
  const stageTwoMinutes = durationMinutes(stageTwo.reviewer, "stage_2.reviewer");
  if (
    Date.parse(stageTwo.reviewer.started_at) <
    Date.parse(stageOne.reviewer.completed_at)
  ) {
    throw new Error(
      "Stage 2 reviewer.started_at must not precede Stage 1 completion",
    );
  }

  const stageTwoById = new Map(
    stageTwo.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const comparisons = stageOne.comparisons.map((blindDecision) => {
    const mapping = manifestById.get(blindDecision.comparison_id);
    const adjudication = stageTwoById.get(blindDecision.comparison_id);
    const preferredRole =
      blindDecision.preferred_variant === "tie"
        ? "tie"
        : mapping.variant_roles[blindDecision.preferred_variant];
    return {
      comparison_id: blindDecision.comparison_id,
      source_id: mapping.source_id,
      source_ref: mapping.source_ref,
      scene_ref: mapping.scene_ref,
      calibration_category: mapping.calibration?.category ?? null,
      control_type: mapping.calibration?.control_type ?? "none",
      preferred_variant: blindDecision.preferred_variant,
      preferred_role: preferredRole,
      confidence: blindDecision.confidence,
      meaningful_difference: blindDecision.meaningful_difference,
      blind_reasons: blindDecision.reasons,
      blind_notes: blindDecision.notes,
      finding_disposition: adjudication.finding_disposition,
      adopt_preferred_variant: adjudication.adopt_preferred_variant,
      finding_rationale: adjudication.rationale,
    };
  });
  const challengerPreferred = comparisons.filter(
    (comparison) => comparison.preferred_role === "challenger",
  ).length;
  const baselinePreferred = comparisons.filter(
    (comparison) => comparison.preferred_role === "baseline",
  ).length;
  const ties = comparisons.filter(
    (comparison) => comparison.preferred_role === "tie",
  ).length;
  const report = {
    version: "1.0.0",
    run_id: manifest.run_id,
    title: manifest.title,
    status: "COMPLETE",
    stage_1_sha256: stageOneHash,
    stage_2_sha256: sha256(fs.readFileSync(stageTwoPath)),
    metrics: {
      comparisons: comparisons.length,
      challenger_preferred: challengerPreferred,
      baseline_preferred: baselinePreferred,
      ties,
      challenger_win_rate_excluding_ties_percent: percentage(
        challengerPreferred,
        challengerPreferred + baselinePreferred,
      ),
      findings_accepted: comparisons.filter(
        (comparison) => comparison.finding_disposition === "accept",
      ).length,
      findings_rejected: comparisons.filter(
        (comparison) => comparison.finding_disposition === "reject",
      ).length,
      findings_uncertain: comparisons.filter(
        (comparison) => comparison.finding_disposition === "uncertain",
      ).length,
      writer_rejected_finding_rate_percent: percentage(
        comparisons.filter(
          (comparison) => comparison.finding_disposition === "reject",
        ).length,
        comparisons.filter(
          (comparison) =>
            comparison.finding_disposition === "accept" ||
            comparison.finding_disposition === "reject",
        ).length,
      ),
      preferred_variants_adopted: comparisons.filter(
        (comparison) => comparison.adopt_preferred_variant === "yes",
      ).length,
      writer_review_minutes: Number(
        (stageOneMinutes + stageTwoMinutes).toFixed(1),
      ),
      critic_agent_calls:
        manifest.process_metrics?.critic_agent_calls ?? null,
      variant_generation_agent_calls:
        manifest.process_metrics?.variant_generation_agent_calls ?? null,
      cross_scene_repetition_effect:
        stageTwo.batch_effect.cross_scene_repetition,
    },
    batch_assessment: stageOne.batch_assessment,
    batch_effect: stageTwo.batch_effect,
    overall_notes: stageTwo.overall_notes,
    comparisons,
  };
  report.calibration = calibrationMetrics(
    comparisons,
    manifest.calibration,
  );

  writeJson(path.join(outputDir, "adjudication-report.json"), report);
  writeText(path.join(outputDir, "adjudication-report.md"), renderReport(report));
  const metadata = readJson(path.join(outputDir, "run-metadata.json"));
  writeJson(path.join(outputDir, "run-metadata.json"), {
    ...metadata,
    status: "COMPLETE",
    human_evidence_recorded: true,
    stage_1_sha256: report.stage_1_sha256,
    stage_2_sha256: report.stage_2_sha256,
  });
  return report;
}

function countOccurrences(content, needle) {
  let count = 0;
  let offset = 0;
  while (true) {
    const index = content.indexOf(needle, offset);
    if (index === -1) {
      return count;
    }
    count += 1;
    offset = index + needle.length;
  }
}

function completedRunArtifacts(outputDir, inputPath) {
  const metadata = readJson(path.join(outputDir, "run-metadata.json"));
  const report = readJson(path.join(outputDir, "adjudication-report.json"));
  if (metadata.status !== "COMPLETE" || report.status !== "COMPLETE") {
    throw new Error("Adjudication run must be COMPLETE before application");
  }
  const inputContent = fs.readFileSync(inputPath);
  const inputHash = sha256(inputContent);
  const stageOnePath = path.join(outputDir, "stage-1-decisions.json");
  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  if (
    inputHash !== metadata.input_sha256 ||
    inputHash !== manifest.input_sha256
  ) {
    throw new Error(
      "Adjudication input no longer matches run metadata and manifest",
    );
  }
  if (
    metadata.run_id !== manifest.run_id ||
    report.run_id !== manifest.run_id
  ) {
    throw new Error("Completed adjudication run_id values do not match");
  }
  validateBlindPackage(outputDir, manifest);
  const stageOne = readJson(stageOnePath);
  validateStageOne(stageOne, manifest);
  const stageOneHash = sha256(fs.readFileSync(stageOnePath));
  const stageTwo = readJson(stageTwoPath);
  validateStageTwo(stageTwo, manifest, stageOneHash);
  if (
    stageOneHash !== report.stage_1_sha256 ||
    sha256(fs.readFileSync(stageTwoPath)) !== report.stage_2_sha256
  ) {
    throw new Error("Completed adjudication decisions no longer match report");
  }
  validateReportDecisionBinding({ report, manifest, stageOne, stageTwo });
  return {
    input: JSON.parse(inputContent.toString("utf8")),
    report,
  };
}

function validateReportDecisionBinding({
  report,
  manifest,
  stageOne,
  stageTwo,
}) {
  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const stageOneById = new Map(
    stageOne.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const stageTwoById = new Map(
    stageTwo.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const reportIds = report.comparisons?.map(
    (comparison) => comparison.comparison_id,
  );
  const expectedIds = stageOne.comparisons.map(
    (comparison) => comparison.comparison_id,
  );
  if (JSON.stringify(reportIds) !== JSON.stringify(expectedIds)) {
    throw new Error("Completed report comparison order no longer matches decisions");
  }

  for (const comparison of report.comparisons) {
    const mapping = manifestById.get(comparison.comparison_id);
    const blindDecision = stageOneById.get(comparison.comparison_id);
    const findingDecision = stageTwoById.get(comparison.comparison_id);
    const preferredRole =
      blindDecision.preferred_variant === "tie"
        ? "tie"
        : mapping.variant_roles[blindDecision.preferred_variant];
    const mismatch =
      (comparison.source_id !== undefined &&
        comparison.source_id !== mapping.source_id) ||
      comparison.source_ref !== mapping.source_ref ||
      comparison.preferred_variant !== blindDecision.preferred_variant ||
      comparison.preferred_role !== preferredRole ||
      comparison.finding_disposition !==
        findingDecision.finding_disposition ||
      comparison.adopt_preferred_variant !==
        findingDecision.adopt_preferred_variant;
    if (mismatch) {
      throw new Error(
        `Completed report no longer matches decisions: ${comparison.comparison_id}`,
      );
    }
  }
}

function resolveApplicationTarget(rootDir, targetFile) {
  const root = path.resolve(rootDir);
  const target = path.resolve(root, targetFile);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Application target escapes root: ${targetFile}`);
  }
  return target;
}

function resolveSourceComparison(decision, inputById, inputBySourceRef) {
  if (decision.source_id) {
    return inputById.get(decision.source_id);
  }
  const matches = inputBySourceRef.get(decision.source_ref) ?? [];
  if (matches.length > 1) {
    throw new Error(
      `Legacy report source_ref is ambiguous: ${decision.source_ref}`,
    );
  }
  return matches[0];
}

export function applyAdjudicationRun({
  outputDir,
  inputPath,
  rootDir,
  write = false,
}) {
  const { input, report } = completedRunArtifacts(outputDir, inputPath);
  const inputById = new Map(
    input.comparisons.map((comparison) => [comparison.id, comparison]),
  );
  const inputBySourceRef = new Map();
  for (const comparison of input.comparisons) {
    const sourceRef = comparison.source_ref ?? comparison.id;
    const matches = inputBySourceRef.get(sourceRef) ?? [];
    matches.push(comparison);
    inputBySourceRef.set(sourceRef, matches);
  }
  const internalOperations = [];

  for (const decision of report.comparisons) {
    if (
      decision.adopt_preferred_variant !== "yes" ||
      decision.preferred_role !== "challenger"
    ) {
      continue;
    }
    const comparison = resolveSourceComparison(
      decision,
      inputById,
      inputBySourceRef,
    );
    if (!comparison) {
      throw new Error(
        `Completed report references unknown source comparison: ${decision.source_id ?? decision.source_ref}`,
      );
    }
    if (!comparison.application) {
      internalOperations.push({
        comparison_id: decision.comparison_id,
        source_id: comparison.id,
        target_file: null,
        status: "SKIPPED_NO_TARGET",
      });
      continue;
    }

    const targetPath = resolveApplicationTarget(
      rootDir,
      comparison.application.target_file,
    );
    if (!fs.existsSync(targetPath)) {
      internalOperations.push({
        comparison_id: decision.comparison_id,
        source_id: comparison.id,
        target_file: comparison.application.target_file,
        target_path: targetPath,
        status: "MISSING_TARGET",
        baseline_occurrences: 0,
        baseline_text: comparison.baseline_text,
        challenger_text: comparison.challenger_text,
      });
      continue;
    }
    const content = fs.readFileSync(targetPath, "utf8");
    const realRoot = fs.realpathSync(rootDir);
    const realTarget = fs.realpathSync(targetPath);
    if (
      realTarget !== realRoot &&
      !realTarget.startsWith(`${realRoot}${path.sep}`)
    ) {
      throw new Error(
        `Application target resolves outside root: ${comparison.application.target_file}`,
      );
    }
    const occurrences = countOccurrences(content, comparison.baseline_text);
    internalOperations.push({
      comparison_id: decision.comparison_id,
      source_id: comparison.id,
      target_file: comparison.application.target_file,
      target_path: targetPath,
      status: occurrences === 1 ? "READY" : "STALE_SOURCE",
      baseline_occurrences: occurrences,
      baseline_text: comparison.baseline_text,
      challenger_text: comparison.challenger_text,
    });
  }

  const blocked = internalOperations.filter(
    (operation) =>
      operation.status === "MISSING_TARGET" ||
      operation.status === "STALE_SOURCE",
  );
  if (write && blocked.length > 0) {
    throw new Error(
      `Approved baseline must occur exactly once in every target; blocked: ${blocked
        .map(
          (operation) =>
            `${operation.source_id} (${operation.baseline_occurrences})`,
        )
        .join(", ")}`,
    );
  }

  if (write) {
    const plannedFiles = new Map();
    for (const operation of internalOperations.filter(
      (candidate) => candidate.status === "READY",
    )) {
      const content =
        plannedFiles.get(operation.target_path) ??
        fs.readFileSync(operation.target_path, "utf8");
      if (countOccurrences(content, operation.baseline_text) !== 1) {
        throw new Error(
          `Approved baseline must occur exactly once after planned replacements: ${operation.source_id}`,
        );
      }
      plannedFiles.set(
        operation.target_path,
        content.replace(
          operation.baseline_text,
          operation.challenger_text,
        ),
      );
    }
    for (const [targetPath, content] of plannedFiles) {
      fs.writeFileSync(targetPath, content);
    }
    for (const operation of internalOperations) {
      if (operation.status === "READY") {
        operation.status = "APPLIED";
      }
    }
  }

  const plan = {
    version: "1.0.0",
    run_id: report.run_id,
    status: write ? "APPLIED" : "DRY_RUN",
    operations: internalOperations.map((operation) => ({
      comparison_id: operation.comparison_id,
      source_id: operation.source_id,
      target_file: operation.target_file,
      status: operation.status,
      baseline_occurrences: operation.baseline_occurrences ?? null,
      baseline_sha256: operation.baseline_text
        ? sha256(operation.baseline_text)
        : null,
      challenger_sha256: operation.challenger_text
        ? sha256(operation.challenger_text)
        : null,
    })),
  };
  writeJson(path.join(outputDir, "application-plan.json"), plan);
  return plan;
}

function findReports(rootDir) {
  const reports = [];
  const stack = [path.resolve(rootDir)];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.name === "adjudication-report.json") {
        reports.push(entryPath);
      }
    }
  }
  return reports.sort();
}

function renderAggregateReport(aggregate) {
  return `# Writer Adjudication Aggregate

## Metrics

| Metric | Result |
|---|---:|
| Completed runs | ${aggregate.metrics.completed_runs} |
| Comparisons | ${aggregate.metrics.comparisons} |
| Challenger preferred | ${aggregate.metrics.challenger_preferred} |
| Baseline preferred | ${aggregate.metrics.baseline_preferred} |
| Ties | ${aggregate.metrics.ties} |
| Findings accepted | ${aggregate.metrics.findings_accepted} |
| Findings rejected | ${aggregate.metrics.findings_rejected} |
| Preferred variants adopted | ${aggregate.metrics.preferred_variants_adopted} |
| Writer review time | ${aggregate.metrics.writer_review_minutes} minutes |
| Weak challenger controls | ${aggregate.calibration.control_count} |
| Control resistance rate | ${aggregate.calibration.control_resistance_rate_percent}% |

## Runs

${aggregate.runs.map((run) => `- ${run.run_id}: ${run.comparisons} comparisons`).join("\n")}
`;
}

function aggregateMetric(report, group, key) {
  const value = report[group]?.[key] ?? 0;
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      `${report.run_id}.${group}.${key} must be a non-negative number`,
    );
  }
  return value;
}

export function aggregateAdjudicationRuns({ runsDir, outputDir = null }) {
  const reports = findReports(runsDir)
    .map((reportPath) => ({
      reportPath,
      report: readJson(reportPath),
    }))
    .filter(({ report }) => report.status === "COMPLETE");
  if (reports.length === 0) {
    throw new Error("No completed adjudication reports found");
  }
  const runIds = reports.map(({ report }) => report.run_id);
  const duplicateRunIds = runIds.filter(
    (runId, index) => runIds.indexOf(runId) !== index,
  );
  if (duplicateRunIds.length > 0) {
    throw new Error(
      `Duplicate adjudication run_id values: ${[...new Set(duplicateRunIds)].join(", ")}`,
    );
  }

  const metricKeys = [
    "comparisons",
    "challenger_preferred",
    "baseline_preferred",
    "ties",
    "findings_accepted",
    "findings_rejected",
    "findings_uncertain",
    "preferred_variants_adopted",
    "writer_review_minutes",
  ];
  const metrics = { completed_runs: reports.length };
  for (const key of metricKeys) {
    metrics[key] = Number(
      reports
        .reduce(
          (total, { report }) =>
            total + aggregateMetric(report, "metrics", key),
          0,
        )
        .toFixed(1),
    );
  }

  const controlCount = reports.reduce(
    (total, { report }) =>
      total + aggregateMetric(report, "calibration", "control_count"),
    0,
  );
  const controlBaselinePreferred = reports.reduce(
    (total, { report }) =>
      total +
      aggregateMetric(
        report,
        "calibration",
        "control_baseline_preferred",
      ),
    0,
  );
  const controlTies = reports.reduce(
    (total, { report }) =>
      total + aggregateMetric(report, "calibration", "control_ties"),
    0,
  );
  const aggregate = {
    version: "1.0.0",
    status: "COMPLETE",
    metrics,
    calibration: {
      control_count: controlCount,
      control_baseline_preferred: controlBaselinePreferred,
      control_ties: controlTies,
      control_challenger_preferred: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "control_challenger_preferred",
          ),
        0,
      ),
      control_findings_rejected: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "control_findings_rejected",
          ),
        0,
      ),
      control_resistance_rate_percent: percentage(
        controlBaselinePreferred + controlTies,
        controlCount,
      ),
    },
    runs: reports.map(({ reportPath, report }) => ({
      run_id: report.run_id,
      comparisons: report.metrics.comparisons,
      report_path: path.relative(path.resolve(runsDir), reportPath),
    })),
  };

  if (outputDir) {
    writeJson(path.join(outputDir, "aggregate-report.json"), aggregate);
    writeText(
      path.join(outputDir, "aggregate-report.md"),
      renderAggregateReport(aggregate),
    );
  }
  return aggregate;
}

function usage() {
  return [
    "Usage:",
    "  node scripts/run-writer-adjudication.mjs prepare --findings <file> --variants <file> --output <file> --run-id <id> --title <title> --created-at <date>",
    "  node scripts/run-writer-adjudication.mjs create --input <file> --output <dir> --seed <value>",
    "  node scripts/run-writer-adjudication.mjs reveal --output <dir> --stage-1 <file>",
    "  node scripts/run-writer-adjudication.mjs score --output <dir> --stage-1 <file> --stage-2 <file>",
    "  node scripts/run-writer-adjudication.mjs apply --input <file> --output <dir> --root <dir> [--write]",
    "  node scripts/run-writer-adjudication.mjs aggregate --runs <dir> --output <dir>",
  ].join("\n");
}

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, ...args] = process.argv.slice(2);
  const outputValue = option(args, "--output");
  if (!command || !outputValue) {
    throw new Error(usage());
  }
  const outputDir = path.resolve(process.cwd(), outputValue);

  if (command === "prepare") {
    const findingsValue = option(args, "--findings");
    const variantsValue = option(args, "--variants");
    const runId = option(args, "--run-id");
    const title = option(args, "--title");
    const createdAt = option(args, "--created-at");
    if (
      !findingsValue ||
      !variantsValue ||
      !runId ||
      !title ||
      !createdAt
    ) {
      throw new Error(usage());
    }
    const result = prepareAdjudicationInput({
      findingsPath: path.resolve(process.cwd(), findingsValue),
      variantsPath: path.resolve(process.cwd(), variantsValue),
      outputPath: outputDir,
      runId,
      title,
      createdAt,
    });
    console.log(
      `Writer adjudication input: PREPARED (${result.comparisons.length} comparisons)`,
    );
  } else if (command === "create") {
    const inputValue = option(args, "--input");
    const seed = option(args, "--seed");
    if (!inputValue || !seed) {
      throw new Error(usage());
    }
    const result = createAdjudicationRun({
      inputPath: path.resolve(process.cwd(), inputValue),
      outputDir,
      seed,
    });
    console.log(
      `Writer adjudication: ${result.status} (${result.comparison_count} comparisons)`,
    );
  } else if (command === "reveal") {
    const stageOneValue = option(args, "--stage-1");
    if (!stageOneValue) {
      throw new Error(usage());
    }
    const result = revealAdjudicationRun({
      outputDir,
      stageOnePath: path.resolve(process.cwd(), stageOneValue),
    });
    console.log(`Writer adjudication: ${result.status}`);
  } else if (command === "score") {
    const stageOneValue = option(args, "--stage-1");
    const stageTwoValue = option(args, "--stage-2");
    if (!stageOneValue || !stageTwoValue) {
      throw new Error(usage());
    }
    const result = scoreAdjudicationRun({
      outputDir,
      stageOnePath: path.resolve(process.cwd(), stageOneValue),
      stageTwoPath: path.resolve(process.cwd(), stageTwoValue),
    });
    console.log(
      `Writer adjudication: ${result.status} (${result.metrics.comparisons} comparisons)`,
    );
  } else if (command === "apply") {
    const inputValue = option(args, "--input");
    const rootValue = option(args, "--root");
    if (!inputValue || !rootValue) {
      throw new Error(usage());
    }
    const result = applyAdjudicationRun({
      outputDir,
      inputPath: path.resolve(process.cwd(), inputValue),
      rootDir: path.resolve(process.cwd(), rootValue),
      write: args.includes("--write"),
    });
    console.log(
      `Writer adjudication application: ${result.status} (${result.operations.length} operations)`,
    );
  } else if (command === "aggregate") {
    const runsValue = option(args, "--runs");
    if (!runsValue) {
      throw new Error(usage());
    }
    const result = aggregateAdjudicationRuns({
      runsDir: path.resolve(process.cwd(), runsValue),
      outputDir,
    });
    console.log(
      `Writer adjudication aggregate: COMPLETE (${result.metrics.completed_runs} runs)`,
    );
  } else {
    throw new Error(usage());
  }
}
