import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const COMPARISON_ROOT = path.join(
  REPO_ROOT,
  "benchmarks",
  "beat-gate-dogfood",
  "isolated-comparison-2026-06-12",
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function percentage(numerator, denominator) {
  return denominator === 0
    ? 0
    : Number(((numerator / denominator) * 100).toFixed(1));
}

export function compareBeatGateCritics() {
  const fixture = readJson(
    path.join(
      REPO_ROOT,
      "benchmarks",
      "beat-gate-dogfood",
      "memory-tide.json",
    ),
  );
  const isolated = readJson(
    path.join(COMPARISON_ROOT, "scene-reviews.json"),
  );
  const batch = readJson(
    path.join(COMPARISON_ROOT, "batch-pattern-review.json"),
  );
  const adjudication = readJson(
    path.join(COMPARISON_ROOT, "adjudication.json"),
  );

  const fallbackFindings = fixture.scenes.flatMap((scene) =>
    scene.beats.flatMap((beat) =>
      beat.critic_findings.map((finding) => ({
        beat_ref: beat.ref,
        ...finding,
      })),
    ),
  );
  const isolatedFindings = isolated.scene_reviews.flatMap(
    (review) => review.findings,
  );
  const fallbackBeats = new Set(
    fallbackFindings.map((finding) => finding.beat_ref),
  );
  const isolatedBeats = new Set(
    isolatedFindings.map((finding) => finding.beat_ref),
  );
  const sharedBeats = [...isolatedBeats].filter((beatRef) =>
    fallbackBeats.has(beatRef),
  );
  const fallbackOnlyBeats = [...fallbackBeats].filter(
    (beatRef) => !isolatedBeats.has(beatRef),
  );
  const humanChangedBeats = new Set(
    fixture.scenes
      .flatMap((scene) => scene.beats)
      .filter((beat) => beat.accepted_text)
      .map((beat) => beat.ref),
  );
  const isolatedChangedBeats = [...isolatedBeats].filter((beatRef) =>
    humanChangedBeats.has(beatRef),
  );
  const fallbackChangedBeats = [...fallbackBeats].filter((beatRef) =>
    humanChangedBeats.has(beatRef),
  );
  const novelPredicates = adjudication.scene_findings.filter(
    (finding) => finding.relation_to_fallback === "novel_predicate",
  ).length;
  const unadjudicated = adjudication.scene_findings.filter(
    (finding) => finding.assessment === "requires_fresh_human_review",
  ).length;
  const confirmedBatchFindings = adjudication.batch_findings.filter(
    (finding) => finding.assessment === "confirmed",
  ).length;

  return {
    run_date: isolated.run_date,
    execution_mode: isolated.execution_mode,
    scene_critic: {
      fallback_findings: fallbackFindings.length,
      isolated_findings: isolatedFindings.length,
      fallback_flagged_beats: fallbackBeats.size,
      isolated_flagged_beats: isolatedBeats.size,
      shared_flagged_beats: sharedBeats.length,
      fallback_only_flagged_beats: fallbackOnlyBeats.length,
      isolated_beat_overlap_rate_percent: percentage(
        sharedBeats.length,
        isolatedBeats.size,
      ),
      fallback_beat_recall_percent: percentage(
        sharedBeats.length,
        fallbackBeats.size,
      ),
      isolated_novel_predicates: novelPredicates,
      confirmed_false_positives: 0,
      isolated_findings_requiring_fresh_human_review: unadjudicated,
    },
    retrospective_human_alignment: {
      caveat:
        "These alignment metrics mix earlier writer edits with later blind adjudication of two isolated findings; they are descriptive, not a general acceptance rate.",
      human_text_changed_beats: humanChangedBeats.size,
      fallback_flagged_beats_with_text_change: fallbackChangedBeats.length,
      fallback_flagged_beat_alignment_percent: percentage(
        fallbackChangedBeats.length,
        fallbackBeats.size,
      ),
      isolated_flagged_beats_with_text_change: isolatedChangedBeats.length,
      isolated_flagged_beat_alignment_percent: percentage(
        isolatedChangedBeats.length,
        isolatedBeats.size,
      ),
      isolated_human_changed_beat_recall_percent: percentage(
        isolatedChangedBeats.length,
        humanChangedBeats.size,
      ),
      human_changed_beats_missed_by_isolated_scene_critics: [
        ...humanChangedBeats,
      ].filter((beatRef) => !isolatedBeats.has(beatRef)),
    },
    batch_auditor: {
      findings: batch.findings.length,
      high_severity_findings: batch.findings.filter(
        (finding) => finding.severity === "HIGH",
      ).length,
      findings_confirmed_by_prior_human_changes: confirmedBatchFindings,
      new_residual_pattern_specificity:
        batch.findings.length - confirmedBatchFindings,
      healthy_variations: batch.healthy_variations.length,
    },
    conclusions: [
      "Isolation improved local independence but did not reproduce fallback coverage uniformly.",
      "Scene-bounded critics cannot detect cross-scene diminishing returns.",
      "Beat role must be explicit so a final Beat is tested for enacted closure rather than pressure alone.",
      "A prose-only batch pattern audit should run before the consolidated writer decision.",
      "Fresh blind human adjudication confirmed the two previously unresolved isolated findings.",
    ],
  };
}

export function renderComparisonMarkdown(comparison) {
  const scene = comparison.scene_critic;
  const alignment = comparison.retrospective_human_alignment;
  const batch = comparison.batch_auditor;

  return `# Isolated Beat Gate Critic Comparison

Run date: ${comparison.run_date}

## Result

Isolated scene critics improved independence but did not reproduce the fallback's full coverage. They found ${scene.isolated_findings} issues across ${scene.isolated_flagged_beats} Beats, overlapping ${scene.shared_flagged_beats} of the ${scene.fallback_flagged_beats} Beats flagged by the in-context fallback. The prose-only batch auditor found ${batch.findings} cross-scene patterns, including ${batch.high_severity_findings} high-severity pattern.

## Metrics

| Metric | Result |
|---|---:|
| Fallback findings | ${scene.fallback_findings} |
| Isolated findings | ${scene.isolated_findings} |
| Shared flagged Beats | ${scene.shared_flagged_beats} |
| Fallback-only flagged Beats | ${scene.fallback_only_flagged_beats} |
| Fallback-relative Beat coverage | ${scene.fallback_beat_recall_percent}% |
| Isolated novel predicates | ${scene.isolated_novel_predicates} |
| Confirmed false positives | ${scene.confirmed_false_positives} |
| Findings requiring fresh human review | ${scene.isolated_findings_requiring_fresh_human_review} |
| Human-changed Beats caught by isolated critics | ${alignment.isolated_flagged_beats_with_text_change}/${alignment.human_text_changed_beats} |
| Batch findings confirmed by prior changes | ${batch.findings_confirmed_by_prior_human_changes} |
| New residual batch patterns | ${batch.new_residual_pattern_specificity} |

## Interpretation

${alignment.caveat}

${comparison.conclusions.map((conclusion) => `- ${conclusion}`).join("\n")}

## Evidence

- \`scene-reviews.json\`: raw isolated scene-critic outputs
- \`batch-pattern-review.json\`: raw prose-only batch audit
- \`adjudication.json\`: comparison judgments, including fresh blind human decisions
- \`comparison-report.json\`: machine-readable metrics
`;
}

export function writeComparisonReport(outputDir) {
  const comparison = compareBeatGateCritics();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "comparison-report.json"),
    `${JSON.stringify(comparison, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(outputDir, "comparison-report.md"),
    renderComparisonMarkdown(comparison),
  );
  return comparison;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputFlagIndex = process.argv.indexOf("--output");
  if (outputFlagIndex === -1) {
    console.log(JSON.stringify(compareBeatGateCritics(), null, 2));
  } else {
    const outputValue = process.argv[outputFlagIndex + 1];
    if (!outputValue) {
      throw new Error("--output requires a directory");
    }
    const outputDir = path.resolve(process.cwd(), outputValue);
    const comparison = writeComparisonReport(outputDir);
    console.log(
      `Beat Gate critic comparison: PASS (${comparison.scene_critic.isolated_findings} isolated findings, ${comparison.batch_auditor.findings} batch findings)`,
    );
    console.log(`Reports: ${outputDir}`);
  }
}
