import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "reports/human-release-review.json"), "utf8"));
const candidatePath = process.argv[2] ?? review.story?.artifactPath;
const failures = [];

if (!candidatePath) {
  failures.push("human review record does not identify a review candidate");
} else {
  const candidate = isAbsolute(candidatePath)
    ? normalize(candidatePath)
    : join(root, candidatePath);
  const requiredFiles = [
    "README.md",
    "provenance.json",
    "lifecycle.json",
    "seed-and-premise.md",
    "story-contract.md",
    "structure.md",
    "draft.md",
    "audit.md",
    "revision-passes.md",
    "final-story.md",
  ];

  for (const file of requiredFiles) {
    if (!existsSync(join(candidate, file))) failures.push(`missing candidate artifact: ${file}`);
  }

  if (!failures.length) {
    const provenance = JSON.parse(readFileSync(join(candidate, "provenance.json"), "utf8"));
    const lifecycle = JSON.parse(readFileSync(join(candidate, "lifecycle.json"), "utf8"));
    const manuscript = readFileSync(join(candidate, "final-story.md"), "utf8");
    const audit = readFileSync(join(candidate, "audit.md"), "utf8");
    const revisions = readFileSync(join(candidate, "revision-passes.md"), "utf8");
    const expectedStages = [
      "seed",
      "premise-tournament",
      "premise",
      "genre",
      "controlling-idea",
      "setting",
      "cast",
      "spine",
      "act-design",
      "scene-cards",
      "beat-sheets",
      "prose",
      "critic-pass",
      "revision-passes",
      "polished",
    ];
    const actualStages = lifecycle.checkpoints?.map((checkpoint) => checkpoint.stage) ?? [];
    const wordCount = manuscript
      .replace(/^#.*$/gm, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (provenance.syntheticFixture !== false) failures.push("candidate must not be a synthetic fixture");
    if (provenance.containsPrivateUserMaterial !== false) {
      failures.push("candidate provenance must exclude private user material");
    }
    if (provenance.externalPublicationApproved !== false) {
      failures.push("candidate must not claim external publication approval");
    }
    if (lifecycle.lifecycleComplete !== true || lifecycle.state !== "revision-passes") {
      failures.push("candidate lifecycle is not complete through revision-passes");
    }
    if (JSON.stringify(actualStages) !== JSON.stringify(expectedStages)) {
      failures.push("candidate checkpoint order does not match the canonical lifecycle");
    }
    for (const artifact of Object.values(lifecycle.artifacts ?? {})) {
      if (!existsSync(join(candidate, artifact))) failures.push(`missing lifecycle reference: ${artifact}`);
    }
    if (wordCount < 1500) failures.push(`final manuscript is too short for review: ${wordCount} words`);
    for (const id of ["A-01", "A-02", "A-03", "A-04"]) {
      if (!audit.includes(id) || !revisions.includes(`${id}: closed`)) {
        failures.push(`audit finding is not traceably closed: ${id}`);
      }
    }
    if (review.story.synthetic !== false) failures.push("review record marks candidate as synthetic");
    if (review.story.lifecycleComplete !== true) failures.push("review record does not mark lifecycle complete");
    if (normalize(join(root, review.story.artifactPath)) !== candidate) {
      failures.push("review record artifactPath does not match verified candidate");
    }
    if (review.status === "approved" || review.releaseApproval?.stableRelease === true) {
      failures.push("candidate verification cannot substitute for human release approval");
    }

    if (!failures.length) {
      console.log(
        `Review candidate: PASS (${relative(root, candidate)}, ${wordCount} manuscript words, ${actualStages.length} checkpoints)`,
      );
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

