import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PREFERENCE_VALUES = new Set(["A", "B", "tie"]);
const DIFFERENCE_VALUES = new Set(["yes", "no", "uncertain"]);
const FINDING_VALUES = new Set(["accept", "reject", "uncertain"]);
const EVIDENCE_SUPPORT_VALUES = new Set([
  "supported",
  "contradicted",
  "insufficient",
]);
const ADOPTION_VALUES = new Set(["yes", "no", "defer"]);
const VARIANT_DISPOSITION_VALUES = new Set([
  "keep_baseline",
  "adopt_challenger",
  "defer",
]);
const REPETITION_VALUES = new Set([
  "reduced",
  "unchanged",
  "increased",
  "uncertain",
]);
const CALIBRATION_CONTROL_VALUES = new Set([
  "none",
  "weak_challenger",
  "unsupported_finding",
]);
const PROTOCOL_V1 = "1.0.0";
const PROTOCOL_V2 = "2.0.0";
const PROTOCOL_V2_1 = "2.1.0";
const MIN_EVIDENCE_TEXT_LENGTH = 12;
const SUPPORTED_V2_PROTOCOLS = new Set([
  PROTOCOL_V2,
  PROTOCOL_V2_1,
]);
const GENERIC_EVIDENCE_VALUES = new Set([
  "yes",
  "confirmed",
  "accepted",
  "looks right",
  "是",
  "确认",
  "接受",
  "看起来正确",
]);
const GENERIC_EVIDENCE_PREFIXES = [
  "writer explicitly confirmed",
  "author explicitly confirmed",
  "follow blind preference",
  "用户明确确认",
  "作者明确确认",
  "遵循盲选",
];
const GENERIC_COUNTEREVIDENCE_VALUES = new Set([
  "none",
  "no contrary evidence found",
  "未发现反证",
  "没有反证",
]);

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

function normalizeEvidenceText(value) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();
}

function evidenceTextLength(value) {
  return [...normalizeEvidenceText(value).replace(/\s/gu, "")].length;
}

function validateSpecificEvidenceText(value, label, { counter = false } = {}) {
  if (typeof value !== "string") {
    throw new Error(
      `${label} must contain at least ${MIN_EVIDENCE_TEXT_LENGTH} non-whitespace characters`,
    );
  }
  const normalized = normalizeEvidenceText(value);
  if (evidenceTextLength(value) < MIN_EVIDENCE_TEXT_LENGTH) {
    throw new Error(
      `${label} must contain at least ${MIN_EVIDENCE_TEXT_LENGTH} non-whitespace characters`,
    );
  }
  if (
    GENERIC_EVIDENCE_VALUES.has(normalized) ||
    GENERIC_EVIDENCE_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    throw new Error(`${label} must contain a specific evidence judgment`);
  }
  if (counter && GENERIC_COUNTEREVIDENCE_VALUES.has(normalized)) {
    throw new Error(`${label} must identify what was checked`);
  }
  return normalized;
}

function protocolVersion(value) {
  assertNonEmptyString(value, "version");
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) {
    throw new Error("version must use semantic version format");
  }
  if (Number.parseInt(match[1], 10) === 1) {
    return PROTOCOL_V1;
  }
  if (SUPPORTED_V2_PROTOCOLS.has(value)) {
    return value;
  }
  throw new Error(
    `version must use legacy major 1 or one of ${[...SUPPORTED_V2_PROTOCOLS].join(", ")}`,
  );
}

function protocolMajor(value) {
  return Number.parseInt(protocolVersion(value).split(".")[0], 10);
}

function manifestProtocolVersion(manifest) {
  return manifest.protocol_version ?? PROTOCOL_V1;
}

function isProtocolV2(manifest) {
  return protocolMajor(manifestProtocolVersion(manifest)) === 2;
}

function usesEvidenceGate(manifest) {
  return manifestProtocolVersion(manifest) === PROTOCOL_V2_1;
}

function leaksSealedRole(value) {
  return (
    typeof value === "string" &&
    /\bbaseline\b|\bchallenger\b|weak_challenger|unsupported_finding|基线|挑战版本/i.test(
      value,
    )
  );
}

function validateInput(input) {
  const adjudicationProtocol = protocolVersion(input.version);
  const isV2 = protocolMajor(adjudicationProtocol) === 2;
  assertNonEmptyString(input.run_id, "run_id");
  assertNonEmptyString(input.title, "title");
  if (isV2 && leaksSealedRole(input.title)) {
    throw new Error(
      "title must not leak source roles or calibration controls in protocol V2",
    );
  }
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
    if (
      isV2 &&
      [
        comparison.context,
        comparison.finding.predicate,
        comparison.finding.evidence,
        comparison.finding.question,
      ].some(leaksSealedRole)
    ) {
      throw new Error(
        `${label} writer-facing metadata must not leak source roles or calibration controls in protocol V2`,
      );
    }
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

  return validateCalibration(input, adjudicationProtocol);
}

function validateCalibration(input, adjudicationProtocol) {
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
  const isV2 = protocolMajor(adjudicationProtocol) === 2;
  if (isV2) {
    validatePositiveInteger(
      calibration.control_policies?.weak_challenger?.minimum_count,
      "calibration.control_policies.weak_challenger.minimum_count",
    );
    validatePositiveInteger(
      calibration.control_policies?.unsupported_finding?.minimum_count,
      "calibration.control_policies.unsupported_finding.minimum_count",
    );
    const successGates = calibration.success_gates;
    if (
      typeof successGates?.minimum_weak_challenger_resistance_percent !==
        "number" ||
      successGates.minimum_weak_challenger_resistance_percent < 0 ||
      successGates.minimum_weak_challenger_resistance_percent > 100
    ) {
      throw new Error(
        "calibration.success_gates.minimum_weak_challenger_resistance_percent must be from 0 to 100",
      );
    }
    for (const key of [
      "maximum_unsupported_findings_accepted",
      "maximum_acceptances_without_meaningful_difference",
    ]) {
      const value = successGates[key];
      if (!Number.isInteger(value) || value < 0) {
        throw new Error(
          `calibration.success_gates.${key} must be a non-negative integer`,
        );
      }
    }
  } else {
    if (calibration.control_policy?.type !== "weak_challenger") {
      throw new Error(
        "calibration.control_policy.type must be weak_challenger",
      );
    }
    validatePositiveInteger(
      calibration.control_policy.minimum_count,
      "calibration.control_policy.minimum_count",
    );
  }

  const scenes = new Set();
  const categories = new Set();
  const controlCounts = {
    weak_challenger: 0,
    unsupported_finding: 0,
  };
  for (const [index, comparison] of input.comparisons.entries()) {
    const label = `comparisons[${index}]`;
    assertNonEmptyString(comparison.scene_ref, `${label}.scene_ref`);
    assertNonEmptyString(
      comparison.calibration?.category,
      `${label}.calibration.category`,
    );
    const controlType = comparison.calibration?.control_type;
    if (!CALIBRATION_CONTROL_VALUES.has(controlType)) {
      throw new Error(
        `${label}.calibration.control_type must be none, weak_challenger, or unsupported_finding`,
      );
    }
    if (!isV2 && controlType === "unsupported_finding") {
      throw new Error(
        `${label}.calibration.control_type unsupported_finding requires protocol V2`,
      );
    }
    scenes.add(comparison.scene_ref);
    categories.add(comparison.calibration.category);
    if (controlType !== "none") {
      controlCounts[controlType] += 1;
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
  const weakMinimum = isV2
    ? calibration.control_policies.weak_challenger.minimum_count
    : calibration.control_policy.minimum_count;
  if (controlCounts.weak_challenger < weakMinimum) {
    throw new Error(
      `prospective calibration requires at least ${weakMinimum} weak challenger controls`,
    );
  }
  if (isV2) {
    const unsupportedMinimum =
      calibration.control_policies.unsupported_finding.minimum_count;
    if (controlCounts.unsupported_finding < unsupportedMinimum) {
      throw new Error(
        `prospective calibration requires at least ${unsupportedMinimum} unsupported finding controls`,
      );
    }
  }

  return {
    ...calibration,
    distinct_scenes: scenes.size,
    control_count: controlCounts.weak_challenger,
    weak_challenger_control_count: controlCounts.weak_challenger,
    unsupported_finding_control_count:
      controlCounts.unsupported_finding,
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
    version: protocolVersion(input.version),
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

function validateGeneratedPackage(
  outputDir,
  fileName,
  expectedHash,
  label,
) {
  assertNonEmptyString(expectedHash, `${label}.sha256`);
  const packagePath = path.join(outputDir, fileName);
  if (!fs.existsSync(packagePath)) {
    throw new Error(`${fileName} is missing`);
  }
  if (sha256(fs.readFileSync(packagePath)) !== expectedHash) {
    throw new Error(`${fileName} no longer matches ${label}`);
  }
}

function renderLegacyRevealPackage(manifest, stageOne) {
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

function legacyStageTwoTemplate(manifest, stageOneHash) {
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

function validateLegacyStageTwo(stageTwo, manifest, stageOneHash) {
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

function renderFindingPackage(manifest, stageOne) {
  const decisions = new Map(
    stageOne.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const instruction = usesEvidenceGate(manifest)
    ? "Judge whether the evidence supports the predicate before choosing a disposition. Record `evidence_support` as `supported`, `contradicted`, or `insufficient`. Check contrary or weakening textual evidence and record what you checked. Then choose `accept`, `reject`, or `uncertain` using the allowed evidence matrix."
    : "Judge the finding without opening role-reveal material.";
  const sections = manifest.comparisons.flatMap((comparison) => {
    const decision = decisions.get(comparison.comparison_id);
    return [
      `## ${comparison.comparison_id}`,
      "",
      `- Meaningful blind difference: ${decision.meaningful_difference}`,
      `- Predicate: ${comparison.finding.predicate}`,
      `- Evidence: ${comparison.finding.evidence}`,
      `- Question: ${comparison.finding.question}`,
      "",
      `${instruction} Record the decision in \`stage-2a-decisions.json\`.`,
      "",
    ];
  });

  return `# Blind Finding Adjudication: ${manifest.title}

Stage 1 was locked before this file was generated. Source roles remain hidden
until Stage 2A is complete.

${sections.join("\n")}`;
}

function stageTwoATemplate(
  manifest,
  stageOneHash,
  findingPackageHash,
) {
  const evidenceFields = usesEvidenceGate(manifest)
    ? {
        evidence_support: null,
        evidence_basis: "",
        counterevidence_checked: "",
      }
    : {};
  return {
    version: manifestProtocolVersion(manifest),
    run_id: manifest.run_id,
    stage: "blind_finding_adjudication",
    status: "AWAITING_WRITER",
    stage_1_sha256: stageOneHash,
    finding_package_sha256: findingPackageHash,
    reviewer: {
      id: null,
      started_at: null,
      completed_at: null,
    },
    comparisons: manifest.comparisons.map((comparison) => ({
      comparison_id: comparison.comparison_id,
      ...evidenceFields,
      finding_disposition: null,
      rationale: "",
      blind_difference_reconciliation: "",
    })),
    overall_notes: "",
  };
}

function validateStageTwoA(stageTwoA, manifest, stageOne, stageOneHash) {
  if (stageTwoA.status !== "COMPLETE") {
    throw new Error("Stage 2A status must be COMPLETE before role reveal");
  }
  if (stageTwoA.run_id !== manifest.run_id) {
    throw new Error("Stage 2A run_id does not match the sealed manifest");
  }
  if (stageTwoA.stage_1_sha256 !== stageOneHash) {
    throw new Error("Stage 2A is not bound to the supplied Stage 1 decisions");
  }
  assertNonEmptyString(
    stageTwoA.finding_package_sha256,
    "stage_2a.finding_package_sha256",
  );
  assertNonEmptyString(stageTwoA.reviewer?.id, "stage_2a.reviewer.id");
  durationMinutes(stageTwoA.reviewer, "stage_2a.reviewer");

  const expectedIds = manifest.comparisons.map(
    (comparison) => comparison.comparison_id,
  );
  const actualIds = stageTwoA.comparisons?.map(
    (comparison) => comparison.comparison_id,
  );
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error("Stage 2A comparisons do not match the sealed manifest");
  }
  const stageOneById = new Map(
    stageOne.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const evidenceBasisByText = new Map();
  const rationaleByText = new Map();
  for (const decision of stageTwoA.comparisons) {
    if (!FINDING_VALUES.has(decision.finding_disposition)) {
      throw new Error(
        `${decision.comparison_id}.finding_disposition must be accept, reject, or uncertain`,
      );
    }
    if (usesEvidenceGate(manifest)) {
      if (!EVIDENCE_SUPPORT_VALUES.has(decision.evidence_support)) {
        throw new Error(
          `${decision.comparison_id}.evidence_support must be supported, contradicted, or insufficient`,
        );
      }
      const allowedDispositions =
        decision.evidence_support === "supported"
          ? new Set(["accept", "uncertain"])
          : decision.evidence_support === "contradicted"
            ? new Set(["reject"])
            : new Set(["reject", "uncertain"]);
      if (!allowedDispositions.has(decision.finding_disposition)) {
        throw new Error(
          `${decision.comparison_id}.evidence_support=${decision.evidence_support} does not allow finding_disposition=${decision.finding_disposition}`,
        );
      }
      const evidenceBasis = validateSpecificEvidenceText(
        decision.evidence_basis,
        `${decision.comparison_id}.evidence_basis`,
      );
      validateSpecificEvidenceText(
        decision.counterevidence_checked,
        `${decision.comparison_id}.counterevidence_checked`,
        { counter: true },
      );
      const rationale = validateSpecificEvidenceText(
        decision.rationale,
        `${decision.comparison_id}.rationale`,
      );
      for (const [field, value, seen] of [
        ["evidence_basis", evidenceBasis, evidenceBasisByText],
        ["rationale", rationale, rationaleByText],
      ]) {
        const previous = seen.get(value);
        if (previous) {
          throw new Error(
            `${decision.comparison_id}.${field} duplicates ${previous}.${field}`,
          );
        }
        seen.set(value, decision.comparison_id);
      }
    } else {
      assertNonEmptyString(
        decision.rationale,
        `${decision.comparison_id}.rationale`,
      );
    }
    const blindDecision = stageOneById.get(decision.comparison_id);
    if (
      decision.finding_disposition === "accept" &&
      blindDecision.meaningful_difference === "no"
    ) {
      assertNonEmptyString(
        decision.blind_difference_reconciliation,
        `${decision.comparison_id}.blind_difference_reconciliation must explain acceptance after no meaningful blind difference`,
      );
    }
  }
}

function renderRoleRevealPackage(manifest, stageOne, stageTwoA) {
  const stageOneById = new Map(
    stageOne.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const stageTwoAById = new Map(
    stageTwoA.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const sections = manifest.comparisons.flatMap((comparison) => {
    const blindDecision = stageOneById.get(comparison.comparison_id);
    const findingDecision = stageTwoAById.get(comparison.comparison_id);
    const baselineVariant = Object.entries(comparison.variant_roles).find(
      ([, role]) => role === "baseline",
    )[0];
    const challengerVariant = baselineVariant === "A" ? "B" : "A";
    return [
      `## ${comparison.comparison_id}`,
      "",
      `- Blind preference: ${blindDecision.preferred_variant}`,
      `- Baseline variant: ${baselineVariant}`,
      `- Challenger variant: ${challengerVariant}`,
      `- Finding disposition locked in Stage 2A: ${findingDecision.finding_disposition}`,
      `- Source reference: ${comparison.source_ref}`,
      "",
      "Choose `keep_baseline`, `adopt_challenger`, or `defer` in `stage-2b-decisions.json`.",
      "",
    ];
  });

  return `# Source-Role Reveal: ${manifest.title}

Stage 1 preference and Stage 2A finding judgment were locked before source
roles were revealed. Calibration control labels remain sealed until scoring.

${sections.join("\n")}`;
}

function stageTwoBTemplate(
  manifest,
  stageOneHash,
  stageTwoAHash,
  roleRevealPackageHash,
) {
  return {
    version: PROTOCOL_V2,
    run_id: manifest.run_id,
    stage: "role_reveal_disposition",
    status: "AWAITING_WRITER",
    stage_1_sha256: stageOneHash,
    stage_2a_sha256: stageTwoAHash,
    role_reveal_package_sha256: roleRevealPackageHash,
    reviewer: {
      id: null,
      started_at: null,
      completed_at: null,
    },
    comparisons: manifest.comparisons.map((comparison) => ({
      comparison_id: comparison.comparison_id,
      variant_disposition: null,
      rationale: "",
    })),
    batch_effect: {
      cross_scene_repetition: null,
      notes: "",
    },
    overall_notes: "",
  };
}

function validateStageTwoB(
  stageTwoB,
  manifest,
  stageOneHash,
  stageTwoAHash,
) {
  if (stageTwoB.status !== "COMPLETE") {
    throw new Error("Stage 2B status must be COMPLETE before scoring");
  }
  if (stageTwoB.run_id !== manifest.run_id) {
    throw new Error("Stage 2B run_id does not match the sealed manifest");
  }
  if (stageTwoB.stage_1_sha256 !== stageOneHash) {
    throw new Error("Stage 2B is not bound to the supplied Stage 1 decisions");
  }
  if (stageTwoB.stage_2a_sha256 !== stageTwoAHash) {
    throw new Error("Stage 2B is not bound to the supplied Stage 2A decisions");
  }
  assertNonEmptyString(
    stageTwoB.role_reveal_package_sha256,
    "stage_2b.role_reveal_package_sha256",
  );
  assertNonEmptyString(stageTwoB.reviewer?.id, "stage_2b.reviewer.id");
  durationMinutes(stageTwoB.reviewer, "stage_2b.reviewer");
  if (
    !REPETITION_VALUES.has(
      stageTwoB.batch_effect?.cross_scene_repetition,
    )
  ) {
    throw new Error(
      "batch_effect.cross_scene_repetition must be reduced, unchanged, increased, or uncertain",
    );
  }

  const expectedIds = manifest.comparisons.map(
    (comparison) => comparison.comparison_id,
  );
  const actualIds = stageTwoB.comparisons?.map(
    (comparison) => comparison.comparison_id,
  );
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error("Stage 2B comparisons do not match the sealed manifest");
  }
  for (const decision of stageTwoB.comparisons) {
    if (!VARIANT_DISPOSITION_VALUES.has(decision.variant_disposition)) {
      throw new Error(
        `${decision.comparison_id}.variant_disposition must be keep_baseline, adopt_challenger, or defer`,
      );
    }
    assertNonEmptyString(
      decision.rationale,
      `${decision.comparison_id}.rationale`,
    );
  }
}

function percentage(numerator, denominator) {
  return denominator === 0
    ? 0
    : Number(((numerator / denominator) * 100).toFixed(1));
}

function evidenceGateMetrics(comparisons, manifest) {
  if (!usesEvidenceGate(manifest)) {
    return null;
  }
  const supportValues = ["supported", "contradicted", "insufficient"];
  const dispositions = ["accept", "reject", "uncertain"];
  return {
    protocol_version: manifestProtocolVersion(manifest),
    support_counts: Object.fromEntries(
      supportValues.map((support) => [
        support,
        comparisons.filter(
          (comparison) => comparison.evidence_support === support,
        ).length,
      ]),
    ),
    by_disposition: Object.fromEntries(
      dispositions.map((disposition) => [
        disposition,
        Object.fromEntries(
          supportValues.map((support) => [
            support,
            comparisons.filter(
              (comparison) =>
                comparison.finding_disposition === disposition &&
                comparison.evidence_support === support,
            ).length,
          ]),
        ),
      ]),
    ),
  };
}

function calibrationMetrics(comparisons, manifestCalibration) {
  if (!manifestCalibration) {
    return null;
  }

  const weakChallengerControls = comparisons.filter(
    (comparison) => comparison.control_type === "weak_challenger",
  );
  const unsupportedFindingControls = comparisons.filter(
    (comparison) => comparison.control_type === "unsupported_finding",
  );
  const nonControls = comparisons.filter(
    (comparison) => comparison.control_type === "none",
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

  const controlBaselinePreferred = weakChallengerControls.filter(
    (comparison) => comparison.preferred_role === "baseline",
  ).length;
  const controlTies = weakChallengerControls.filter(
    (comparison) => comparison.preferred_role === "tie",
  ).length;
  const controlChallengerPreferred = weakChallengerControls.filter(
    (comparison) => comparison.preferred_role === "challenger",
  ).length;
  const weakChallengerResistanceRate = percentage(
    controlBaselinePreferred + controlTies,
    weakChallengerControls.length,
  );
  const unsupportedFindingsAccepted = unsupportedFindingControls.filter(
    (comparison) => comparison.finding_disposition === "accept",
  ).length;
  const acceptancesWithoutMeaningfulDifference = comparisons.filter(
    (comparison) =>
      comparison.finding_disposition === "accept" &&
      comparison.meaningful_difference === "no",
  ).length;
  const metrics = {
    mode: manifestCalibration.mode,
    pilot_id: manifestCalibration.pilot_id,
    distinct_scenes: manifestCalibration.distinct_scenes,
    control_count: weakChallengerControls.length,
    control_baseline_preferred: controlBaselinePreferred,
    control_ties: controlTies,
    control_challenger_preferred: controlChallengerPreferred,
    control_warning: controlChallengerPreferred > 0,
    control_resistance_rate_percent: weakChallengerResistanceRate,
    control_findings_accepted: weakChallengerControls.filter(
      (comparison) => comparison.finding_disposition === "accept",
    ).length,
    control_findings_rejected: weakChallengerControls.filter(
      (comparison) => comparison.finding_disposition === "reject",
    ).length,
    control_preferred_variants_adopted: weakChallengerControls.filter(
      (comparison) => comparison.adopt_preferred_variant === "yes",
    ).length,
    weak_challenger_variants_adopted: weakChallengerControls.filter(
      (comparison) =>
        comparison.variant_disposition === "adopt_challenger" ||
        (comparison.preferred_role === "challenger" &&
          comparison.adopt_preferred_variant === "yes"),
    ).length,
    weak_challenger_control_count: weakChallengerControls.length,
    weak_challenger_resistance_rate_percent:
      weakChallengerResistanceRate,
    unsupported_finding_control_count: unsupportedFindingControls.length,
    unsupported_findings_accepted: unsupportedFindingsAccepted,
    unsupported_findings_rejected: unsupportedFindingControls.filter(
      (comparison) => comparison.finding_disposition === "reject",
    ).length,
    non_control_comparisons: nonControls.length,
    non_control_challenger_preferred: nonControls.filter(
      (comparison) => comparison.preferred_role === "challenger",
    ).length,
    by_category: byCategory,
  };
  if (manifestCalibration.success_gates) {
    const gates = manifestCalibration.success_gates;
    const weakChallengerGatePassed =
      weakChallengerResistanceRate >=
      gates.minimum_weak_challenger_resistance_percent;
    const unsupportedFindingGatePassed =
      unsupportedFindingsAccepted <=
      gates.maximum_unsupported_findings_accepted;
    const blindDifferenceGatePassed =
      acceptancesWithoutMeaningfulDifference <=
      gates.maximum_acceptances_without_meaningful_difference;
    metrics.gates = {
      minimum_weak_challenger_resistance_percent:
        gates.minimum_weak_challenger_resistance_percent,
      weak_challenger_resistance_passed: weakChallengerGatePassed,
      maximum_unsupported_findings_accepted:
        gates.maximum_unsupported_findings_accepted,
      unsupported_finding_acceptance_passed:
        unsupportedFindingGatePassed,
      maximum_acceptances_without_meaningful_difference:
        gates.maximum_acceptances_without_meaningful_difference,
      blind_difference_consistency_passed: blindDifferenceGatePassed,
    };
    metrics.status =
      !unsupportedFindingGatePassed || !blindDifferenceGatePassed
        ? "FAIL"
        : weakChallengerGatePassed
          ? "PASS"
          : "WARN";
    metrics.gate_passed = metrics.status === "PASS";
  }
  return metrics;
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
${calibration.status ? `| Calibration status | ${calibration.status} |` : ""}
| Distinct scenes | ${calibration.distinct_scenes} |
| Weak challenger controls | ${calibration.control_count} |
| Control baseline preferred | ${calibration.control_baseline_preferred} |
| Control ties | ${calibration.control_ties} |
| Control challenger preferred | ${calibration.control_challenger_preferred} |
| Control warning | ${calibration.control_warning ? "YES - weak challengers won; do not generalize critic quality" : "no"} |
| Control resistance rate | ${calibration.control_resistance_rate_percent}% |
| Control findings accepted | ${calibration.control_findings_accepted} |
| Control findings rejected | ${calibration.control_findings_rejected} |
| Control preferred variants adopted | ${calibration.control_preferred_variants_adopted} |
${calibration.weak_challenger_variants_adopted != null ? `| Weak challenger variants adopted | ${calibration.weak_challenger_variants_adopted} |` : ""}
${calibration.unsupported_finding_control_count != null ? `| Unsupported finding controls | ${calibration.unsupported_finding_control_count} |
| Unsupported findings accepted | ${calibration.unsupported_findings_accepted} |
| Calibration gate passed | ${calibration.gate_passed ? "yes" : "no"} |` : ""}
| Non-control challenger preferred | ${calibration.non_control_challenger_preferred}/${calibration.non_control_comparisons} |
`;
}

function renderEvidenceGateMetrics(evidenceGate) {
  if (!evidenceGate) {
    return `
## Evidence Gate

Evidence support: not recorded for this protocol version.
`;
  }
  return `
## Evidence Gate

| Metric | Result |
|---|---:|
| Evidence gate protocol | ${evidenceGate.protocol_version} |
| Supported | ${evidenceGate.support_counts.supported} |
| Contradicted | ${evidenceGate.support_counts.contradicted} |
| Insufficient | ${evidenceGate.support_counts.insufficient} |
| Supported / accept | ${evidenceGate.by_disposition.accept.supported} |
| Contradicted / reject | ${evidenceGate.by_disposition.reject.contradicted} |
| Insufficient / uncertain | ${evidenceGate.by_disposition.uncertain.insufficient} |
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
| Findings accepted without meaningful blind difference | ${report.metrics.findings_accepted_without_meaningful_blind_difference} |
| Writer-rejected finding rate | ${report.metrics.writer_rejected_finding_rate_percent}% |
| Preferred variants adopted | ${report.metrics.preferred_variants_adopted} |
${report.metrics.challenger_variants_adopted != null ? `| Challenger variants adopted | ${report.metrics.challenger_variants_adopted} |
| Baselines kept | ${report.metrics.baselines_kept} |
| Post-reveal preference reversals | ${report.metrics.post_reveal_preference_reversals} |` : ""}
| Writer review time | ${report.metrics.writer_review_minutes} minutes |
| Critic agent calls | ${report.metrics.critic_agent_calls ?? "not recorded"} |
| Variant-generation agent calls | ${report.metrics.variant_generation_agent_calls ?? "not recorded"} |
| Cross-scene repetition after reveal | ${report.metrics.cross_scene_repetition_effect} |

${renderEvidenceGateMetrics(report.evidence_gate)}
${renderCalibrationMetrics(report.calibration)}
## Decisions

${report.comparisons
  .map(
    (comparison) =>
      `- ${comparison.comparison_id} / ${comparison.source_ref}: blind preference ${comparison.preferred_variant} (${comparison.preferred_role}); finding ${comparison.finding_disposition}; disposition ${comparison.variant_disposition ?? comparison.adopt_preferred_variant}; rationale: ${comparison.finding_rationale || "none"}`,
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
    version: variantsSource.version ?? PROTOCOL_V2_1,
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
  const adjudicationProtocol = protocolVersion(input.version);
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
    version: adjudicationProtocol,
    protocol_version: adjudicationProtocol,
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
    version: adjudicationProtocol,
    protocol_version: adjudicationProtocol,
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
  const metadataPath = path.join(outputDir, "run-metadata.json");
  const metadata = readJson(metadataPath);

  if (isProtocolV2(manifest)) {
    const stageTwoAPath = path.join(outputDir, "stage-2a-decisions.json");
    const findingPackagePath = path.join(outputDir, "finding-package.md");
    const findingPackage = renderFindingPackage(manifest, stageOne);
    const findingPackageHash = sha256(findingPackage);
    if (fs.existsSync(stageTwoAPath)) {
      const stageTwoA = readJson(stageTwoAPath);
      if (stageTwoA.stage_1_sha256 !== stageOneHash) {
        throw new Error(
          "Existing Stage 2A decisions belong to different Stage 1 content",
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
      if (!fs.existsSync(findingPackagePath)) {
        writeText(findingPackagePath, findingPackage);
      }
      validateGeneratedPackage(
        outputDir,
        "finding-package.md",
        stageTwoA.finding_package_sha256,
        "Stage 2A decisions",
      );
      if (stageTwoA.finding_package_sha256 !== findingPackageHash) {
        throw new Error(
          "Existing Stage 2A decisions belong to different finding package content",
        );
      }
      const status =
        metadata.status === "COMPLETE"
          ? "COMPLETE"
          : metadata.status === "AWAITING_ROLE_REVEAL_DECISION"
            ? "AWAITING_ROLE_REVEAL_DECISION"
            : "AWAITING_BLIND_FINDING_ADJUDICATION";
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

    writeText(findingPackagePath, findingPackage);
    writeJson(
      stageTwoAPath,
      stageTwoATemplate(
        manifest,
        stageOneHash,
        findingPackageHash,
      ),
    );
    writeJson(metadataPath, {
      ...metadata,
      status: "AWAITING_BLIND_FINDING_ADJUDICATION",
      stage_1_sha256: stageOneHash,
    });
    return {
      status: "AWAITING_BLIND_FINDING_ADJUDICATION",
      stage_1_sha256: stageOneHash,
    };
  }

  const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");

  if (fs.existsSync(stageTwoPath)) {
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
      writeText(
        revealPath,
        renderLegacyRevealPackage(manifest, stageOne),
      );
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
    renderLegacyRevealPackage(manifest, stageOne),
  );
  writeJson(
    stageTwoPath,
    legacyStageTwoTemplate(manifest, stageOneHash),
  );
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

export function revealRolesAdjudicationRun({
  outputDir,
  stageOnePath,
  stageTwoAPath,
}) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  if (!isProtocolV2(manifest)) {
    throw new Error("Role reveal is available only for protocol V2 runs");
  }
  validateBlindPackage(outputDir, manifest);
  const stageOne = readJson(stageOnePath);
  validateStageOne(stageOne, manifest);
  const stageOneHash = sha256(fs.readFileSync(stageOnePath));
  const stageTwoA = readJson(stageTwoAPath);
  validateStageTwoA(stageTwoA, manifest, stageOne, stageOneHash);
  validateGeneratedPackage(
    outputDir,
    "finding-package.md",
    stageTwoA.finding_package_sha256,
    "Stage 2A decisions",
  );
  if (
    Date.parse(stageTwoA.reviewer.started_at) <
    Date.parse(stageOne.reviewer.completed_at)
  ) {
    throw new Error(
      "Stage 2A reviewer.started_at must not precede Stage 1 completion",
    );
  }
  const stageTwoAHash = sha256(fs.readFileSync(stageTwoAPath));
  const stageTwoBPath = path.join(outputDir, "stage-2b-decisions.json");
  const roleRevealPath = path.join(outputDir, "role-reveal-package.md");
  const roleRevealPackage = renderRoleRevealPackage(
    manifest,
    stageOne,
    stageTwoA,
  );
  const roleRevealPackageHash = sha256(roleRevealPackage);
  const metadataPath = path.join(outputDir, "run-metadata.json");
  const metadata = readJson(metadataPath);

  if (fs.existsSync(stageTwoBPath)) {
    const stageTwoB = readJson(stageTwoBPath);
    if (
      stageTwoB.stage_1_sha256 !== stageOneHash ||
      stageTwoB.stage_2a_sha256 !== stageTwoAHash
    ) {
      throw new Error(
        "Existing Stage 2B decisions belong to different prior-stage content",
      );
    }
    if (!fs.existsSync(roleRevealPath)) {
      writeText(roleRevealPath, roleRevealPackage);
    }
    validateGeneratedPackage(
      outputDir,
      "role-reveal-package.md",
      stageTwoB.role_reveal_package_sha256,
      "Stage 2B decisions",
    );
    if (
      stageTwoB.role_reveal_package_sha256 !== roleRevealPackageHash
    ) {
      throw new Error(
        "Existing Stage 2B decisions belong to different role reveal content",
      );
    }
    const status =
      metadata.status === "COMPLETE"
        ? "COMPLETE"
        : "AWAITING_ROLE_REVEAL_DECISION";
    writeJson(metadataPath, {
      ...metadata,
      status,
      stage_1_sha256: stageOneHash,
      stage_2a_sha256: stageTwoAHash,
    });
    return {
      status,
      stage_1_sha256: stageOneHash,
      stage_2a_sha256: stageTwoAHash,
    };
  }

  writeText(roleRevealPath, roleRevealPackage);
  writeJson(
    stageTwoBPath,
    stageTwoBTemplate(
      manifest,
      stageOneHash,
      stageTwoAHash,
      roleRevealPackageHash,
    ),
  );
  writeJson(metadataPath, {
    ...metadata,
    status: "AWAITING_ROLE_REVEAL_DECISION",
    stage_1_sha256: stageOneHash,
    stage_2a_sha256: stageTwoAHash,
  });
  return {
    status: "AWAITING_ROLE_REVEAL_DECISION",
    stage_1_sha256: stageOneHash,
    stage_2a_sha256: stageTwoAHash,
  };
}

function scoreProtocolV2({
  outputDir,
  manifest,
  stageOne,
  stageOneHash,
  stageTwoAPath,
  stageTwoBPath,
}) {
  if (!stageTwoAPath || !stageTwoBPath) {
    throw new Error(
      "Protocol V2 scoring requires stageTwoAPath and stageTwoBPath",
    );
  }
  const stageTwoA = readJson(stageTwoAPath);
  validateStageTwoA(stageTwoA, manifest, stageOne, stageOneHash);
  validateGeneratedPackage(
    outputDir,
    "finding-package.md",
    stageTwoA.finding_package_sha256,
    "Stage 2A decisions",
  );
  const stageTwoAHash = sha256(fs.readFileSync(stageTwoAPath));
  const stageTwoB = readJson(stageTwoBPath);
  validateStageTwoB(
    stageTwoB,
    manifest,
    stageOneHash,
    stageTwoAHash,
  );
  validateGeneratedPackage(
    outputDir,
    "role-reveal-package.md",
    stageTwoB.role_reveal_package_sha256,
    "Stage 2B decisions",
  );
  const stageOneMinutes = durationMinutes(
    stageOne.reviewer,
    "stage_1.reviewer",
  );
  const stageTwoAMinutes = durationMinutes(
    stageTwoA.reviewer,
    "stage_2a.reviewer",
  );
  const stageTwoBMinutes = durationMinutes(
    stageTwoB.reviewer,
    "stage_2b.reviewer",
  );
  if (
    Date.parse(stageTwoA.reviewer.started_at) <
    Date.parse(stageOne.reviewer.completed_at)
  ) {
    throw new Error(
      "Stage 2A reviewer.started_at must not precede Stage 1 completion",
    );
  }
  if (
    Date.parse(stageTwoB.reviewer.started_at) <
    Date.parse(stageTwoA.reviewer.completed_at)
  ) {
    throw new Error(
      "Stage 2B reviewer.started_at must not precede Stage 2A completion",
    );
  }

  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const stageTwoAById = new Map(
    stageTwoA.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const stageTwoBById = new Map(
    stageTwoB.comparisons.map((decision) => [
      decision.comparison_id,
      decision,
    ]),
  );
  const comparisons = stageOne.comparisons.map((blindDecision) => {
    const mapping = manifestById.get(blindDecision.comparison_id);
    const findingDecision = stageTwoAById.get(
      blindDecision.comparison_id,
    );
    const variantDecision = stageTwoBById.get(
      blindDecision.comparison_id,
    );
    const preferredRole =
      blindDecision.preferred_variant === "tie"
        ? "tie"
        : mapping.variant_roles[blindDecision.preferred_variant];
    const adoptPreferredVariant =
      variantDecision.variant_disposition === "defer"
        ? "defer"
        : variantDecision.variant_disposition === "adopt_challenger" &&
            preferredRole === "challenger"
          ? "yes"
          : "no";
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
      ...(usesEvidenceGate(manifest)
        ? {
            evidence_support: findingDecision.evidence_support,
            evidence_basis: findingDecision.evidence_basis,
            counterevidence_checked:
              findingDecision.counterevidence_checked,
          }
        : {}),
      finding_disposition: findingDecision.finding_disposition,
      finding_rationale: findingDecision.rationale,
      blind_difference_reconciliation:
        findingDecision.blind_difference_reconciliation,
      variant_disposition: variantDecision.variant_disposition,
      variant_rationale: variantDecision.rationale,
      adopt_preferred_variant: adoptPreferredVariant,
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
  const challengerVariantsAdopted = comparisons.filter(
    (comparison) =>
      comparison.variant_disposition === "adopt_challenger",
  ).length;
  const baselinesKept = comparisons.filter(
    (comparison) =>
      comparison.variant_disposition === "keep_baseline",
  ).length;
  const postRevealPreferenceReversals = comparisons.filter(
    (comparison) =>
      (comparison.preferred_role === "baseline" &&
        comparison.variant_disposition === "adopt_challenger") ||
      (comparison.preferred_role === "challenger" &&
        comparison.variant_disposition === "keep_baseline"),
  ).length;
  const report = {
    version: manifestProtocolVersion(manifest),
    protocol_version: manifestProtocolVersion(manifest),
    run_id: manifest.run_id,
    title: manifest.title,
    status: "COMPLETE",
    stage_1_sha256: stageOneHash,
    stage_2a_sha256: stageTwoAHash,
    stage_2b_sha256: sha256(fs.readFileSync(stageTwoBPath)),
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
      findings_accepted_without_meaningful_blind_difference:
        comparisons.filter(
          (comparison) =>
            comparison.finding_disposition === "accept" &&
            comparison.meaningful_difference === "no",
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
      challenger_variants_adopted: challengerVariantsAdopted,
      baselines_kept: baselinesKept,
      post_reveal_preference_reversals: postRevealPreferenceReversals,
      writer_review_minutes: Number(
        (
          stageOneMinutes +
          stageTwoAMinutes +
          stageTwoBMinutes
        ).toFixed(1),
      ),
      critic_agent_calls:
        manifest.process_metrics?.critic_agent_calls ?? null,
      variant_generation_agent_calls:
        manifest.process_metrics?.variant_generation_agent_calls ?? null,
      cross_scene_repetition_effect:
        stageTwoB.batch_effect.cross_scene_repetition,
    },
    batch_assessment: stageOne.batch_assessment,
    batch_effect: stageTwoB.batch_effect,
    stage_2a_overall_notes: stageTwoA.overall_notes,
    overall_notes: stageTwoB.overall_notes,
    comparisons,
  };
  report.evidence_gate = evidenceGateMetrics(comparisons, manifest);
  report.calibration = calibrationMetrics(
    comparisons,
    manifest.calibration,
  );

  writeJson(path.join(outputDir, "adjudication-report.json"), report);
  writeText(
    path.join(outputDir, "adjudication-report.md"),
    renderReport(report),
  );
  const metadataPath = path.join(outputDir, "run-metadata.json");
  const metadata = readJson(metadataPath);
  writeJson(metadataPath, {
    ...metadata,
    status: "COMPLETE",
    human_evidence_recorded: true,
    stage_1_sha256: report.stage_1_sha256,
    stage_2a_sha256: report.stage_2a_sha256,
    stage_2b_sha256: report.stage_2b_sha256,
    calibration_status: report.calibration?.status ?? null,
  });
  return report;
}

export function scoreAdjudicationRun({
  outputDir,
  stageOnePath,
  stageTwoPath,
  stageTwoAPath,
  stageTwoBPath,
}) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  validateBlindPackage(outputDir, manifest);
  const stageOne = readJson(stageOnePath);
  validateStageOne(stageOne, manifest);
  const stageOneHash = sha256(fs.readFileSync(stageOnePath));
  if (isProtocolV2(manifest)) {
    return scoreProtocolV2({
      outputDir,
      manifest,
      stageOne,
      stageOneHash,
      stageTwoAPath,
      stageTwoBPath,
    });
  }
  const stageTwo = readJson(stageTwoPath);
  validateLegacyStageTwo(stageTwo, manifest, stageOneHash);
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
      findings_accepted_without_meaningful_blind_difference:
        comparisons.filter(
          (comparison) =>
            comparison.finding_disposition === "accept" &&
            comparison.meaningful_difference === "no",
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
  if (isProtocolV2(manifest)) {
    const stageTwoAPath = path.join(outputDir, "stage-2a-decisions.json");
    const stageTwoBPath = path.join(outputDir, "stage-2b-decisions.json");
    const stageTwoA = readJson(stageTwoAPath);
    validateStageTwoA(stageTwoA, manifest, stageOne, stageOneHash);
    validateGeneratedPackage(
      outputDir,
      "finding-package.md",
      stageTwoA.finding_package_sha256,
      "Stage 2A decisions",
    );
    const stageTwoAHash = sha256(fs.readFileSync(stageTwoAPath));
    const stageTwoB = readJson(stageTwoBPath);
    validateStageTwoB(
      stageTwoB,
      manifest,
      stageOneHash,
      stageTwoAHash,
    );
    validateGeneratedPackage(
      outputDir,
      "role-reveal-package.md",
      stageTwoB.role_reveal_package_sha256,
      "Stage 2B decisions",
    );
    if (
      stageOneHash !== report.stage_1_sha256 ||
      stageTwoAHash !== report.stage_2a_sha256 ||
      sha256(fs.readFileSync(stageTwoBPath)) !== report.stage_2b_sha256
    ) {
      throw new Error(
        "Completed adjudication decisions no longer match report",
      );
    }
    validateReportDecisionBinding({
      report,
      manifest,
      stageOne,
      stageTwoA,
      stageTwoB,
    });
  } else {
    const stageTwoPath = path.join(outputDir, "stage-2-decisions.json");
    const stageTwo = readJson(stageTwoPath);
    validateLegacyStageTwo(stageTwo, manifest, stageOneHash);
    if (
      stageOneHash !== report.stage_1_sha256 ||
      sha256(fs.readFileSync(stageTwoPath)) !== report.stage_2_sha256
    ) {
      throw new Error(
        "Completed adjudication decisions no longer match report",
      );
    }
    validateReportDecisionBinding({
      report,
      manifest,
      stageOne,
      stageTwo,
    });
  }
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
  stageTwoA,
  stageTwoB,
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
  const stageTwoById = stageTwo
    ? new Map(
        stageTwo.comparisons.map((decision) => [
          decision.comparison_id,
          decision,
        ]),
      )
    : null;
  const stageTwoAById = stageTwoA
    ? new Map(
        stageTwoA.comparisons.map((decision) => [
          decision.comparison_id,
          decision,
        ]),
      )
    : null;
  const stageTwoBById = stageTwoB
    ? new Map(
        stageTwoB.comparisons.map((decision) => [
          decision.comparison_id,
          decision,
        ]),
      )
    : null;
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
    const findingDecision = (stageTwoAById ?? stageTwoById).get(
      comparison.comparison_id,
    );
    const variantDecision = stageTwoBById?.get(comparison.comparison_id);
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
      (variantDecision
        ? comparison.variant_disposition !==
          variantDecision.variant_disposition
        : comparison.adopt_preferred_variant !==
          findingDecision.adopt_preferred_variant);
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
    const adoptsChallenger =
      decision.variant_disposition != null
        ? decision.variant_disposition === "adopt_challenger"
        : decision.adopt_preferred_variant === "yes" &&
          decision.preferred_role === "challenger";
    if (!adoptsChallenger) {
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
    version: report.protocol_version ?? PROTOCOL_V1,
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
| Findings accepted without meaningful blind difference | ${aggregate.metrics.findings_accepted_without_meaningful_blind_difference} |
| Preferred variants adopted | ${aggregate.metrics.preferred_variants_adopted} |
| Challenger variants adopted | ${aggregate.metrics.challenger_variants_adopted} |
| Baselines kept | ${aggregate.metrics.baselines_kept} |
| Post-reveal preference reversals | ${aggregate.metrics.post_reveal_preference_reversals} |
| Writer review time | ${aggregate.metrics.writer_review_minutes} minutes |
| V2 calibration status | ${aggregate.calibration.status} |
| Weak challenger controls | ${aggregate.calibration.control_count} |
| Control warning | ${aggregate.calibration.control_warning ? "YES - weak challengers won; do not generalize critic quality" : "no"} |
| Control resistance rate | ${aggregate.calibration.control_resistance_rate_percent}% |
| Control findings accepted | ${aggregate.calibration.control_findings_accepted} |
| Control preferred variants adopted | ${aggregate.calibration.control_preferred_variants_adopted} |
| Weak challenger variants adopted | ${aggregate.calibration.weak_challenger_variants_adopted} |
| Unsupported finding controls | ${aggregate.calibration.unsupported_finding_control_count} |
| Unsupported findings accepted | ${aggregate.calibration.unsupported_findings_accepted} |

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
    "findings_accepted_without_meaningful_blind_difference",
    "preferred_variants_adopted",
    "challenger_variants_adopted",
    "baselines_kept",
    "post_reveal_preference_reversals",
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
  const calibrationStatusCounts = {
    PASS: reports.filter(
      ({ report }) => report.calibration?.status === "PASS",
    ).length,
    WARN: reports.filter(
      ({ report }) => report.calibration?.status === "WARN",
    ).length,
    FAIL: reports.filter(
      ({ report }) => report.calibration?.status === "FAIL",
    ).length,
  };
  const aggregate = {
    version: PROTOCOL_V2,
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
      control_findings_accepted: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "control_findings_accepted",
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
      control_preferred_variants_adopted: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "control_preferred_variants_adopted",
          ),
        0,
      ),
      weak_challenger_variants_adopted: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "weak_challenger_variants_adopted",
          ),
        0,
      ),
      unsupported_finding_control_count: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "unsupported_finding_control_count",
          ),
        0,
      ),
      unsupported_findings_accepted: reports.reduce(
        (total, { report }) =>
          total +
          aggregateMetric(
            report,
            "calibration",
            "unsupported_findings_accepted",
          ),
        0,
      ),
      control_resistance_rate_percent: percentage(
        controlBaselinePreferred + controlTies,
        controlCount,
      ),
      status_counts: calibrationStatusCounts,
    },
    runs: reports.map(({ reportPath, report }) => ({
      run_id: report.run_id,
      comparisons: report.metrics.comparisons,
      report_path: path.relative(path.resolve(runsDir), reportPath),
    })),
  };
  aggregate.calibration.control_warning =
    aggregate.calibration.control_challenger_preferred > 0;
  aggregate.calibration.status =
    calibrationStatusCounts.FAIL > 0
      ? "FAIL"
      : calibrationStatusCounts.WARN > 0
        ? "WARN"
        : calibrationStatusCounts.PASS > 0
          ? "PASS"
          : "LEGACY_ONLY";

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
    "  node scripts/run-writer-adjudication.mjs reveal-roles --output <dir> --stage-1 <file> --stage-2a <file>",
    "  node scripts/run-writer-adjudication.mjs score --output <dir> --stage-1 <file> (--stage-2 <file> | --stage-2a <file> --stage-2b <file>)",
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
  } else if (command === "reveal-roles") {
    const stageOneValue = option(args, "--stage-1");
    const stageTwoAValue = option(args, "--stage-2a");
    if (!stageOneValue || !stageTwoAValue) {
      throw new Error(usage());
    }
    const result = revealRolesAdjudicationRun({
      outputDir,
      stageOnePath: path.resolve(process.cwd(), stageOneValue),
      stageTwoAPath: path.resolve(process.cwd(), stageTwoAValue),
    });
    console.log(`Writer adjudication: ${result.status}`);
  } else if (command === "score") {
    const stageOneValue = option(args, "--stage-1");
    const stageTwoValue = option(args, "--stage-2");
    const stageTwoAValue = option(args, "--stage-2a");
    const stageTwoBValue = option(args, "--stage-2b");
    if (
      !stageOneValue ||
      (!stageTwoValue && (!stageTwoAValue || !stageTwoBValue))
    ) {
      throw new Error(usage());
    }
    const result = scoreAdjudicationRun({
      outputDir,
      stageOnePath: path.resolve(process.cwd(), stageOneValue),
      stageTwoPath: stageTwoValue
        ? path.resolve(process.cwd(), stageTwoValue)
        : null,
      stageTwoAPath: stageTwoAValue
        ? path.resolve(process.cwd(), stageTwoAValue)
        : null,
      stageTwoBPath: stageTwoBValue
        ? path.resolve(process.cwd(), stageTwoBValue)
        : null,
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
