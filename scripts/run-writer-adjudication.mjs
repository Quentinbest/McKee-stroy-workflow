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
  }
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

## Decisions

${report.comparisons
  .map(
    (comparison) =>
      `- ${comparison.comparison_id} / ${comparison.source_ref}: blind preference ${comparison.preferred_variant} (${comparison.preferred_role}); finding ${comparison.finding_disposition}; adoption ${comparison.adopt_preferred_variant}; rationale: ${comparison.finding_rationale || "none"}`,
  )
  .join("\n")}
`;
}

export function createAdjudicationRun({ inputPath, outputDir, seed }) {
  const input = readJson(inputPath);
  validateInput(input);
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
    warning:
      "Do not open before Stage 1 is complete. This file provides procedural, not cryptographic, blinding.",
    comparisons: assignments.map((assignment) => ({
      comparison_id: assignment.public_id,
      source_id: assignment.comparison.id,
      source_ref: assignment.comparison.source_ref ?? assignment.comparison.id,
      authority_attestation: assignment.comparison.authority_attestation,
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
      source_ref: mapping.source_ref,
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

function usage() {
  return [
    "Usage:",
    "  node scripts/run-writer-adjudication.mjs create --input <file> --output <dir> --seed <value>",
    "  node scripts/run-writer-adjudication.mjs reveal --output <dir> --stage-1 <file>",
    "  node scripts/run-writer-adjudication.mjs score --output <dir> --stage-1 <file> --stage-2 <file>",
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

  if (command === "create") {
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
  } else {
    throw new Error(usage());
  }
}
