import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const worktree = process.argv[2];
const harness = process.argv[3];
if (!worktree || !harness) {
  console.error("Usage: node scripts/verify-native-pilot.mjs <worktree> <harness>");
  process.exit(2);
}

const failures = [];
const pilotRoot = join(worktree, "native-pilot", harness);
const required = [
  "documentation.md",
  "security.json",
  "audit.md",
  "story-lifecycle.json",
  "result.json",
];
for (const path of required) {
  if (!existsSync(join(pilotRoot, path))) failures.push(`missing ${path}`);
}

function read(path) {
  return readFileSync(join(pilotRoot, path), "utf8");
}

if (!failures.length) {
  const documentation = read("documentation.md");
  for (const marker of ["AGENTS.md", "TASK-2026-002", "src/skills/"]) {
    if (!documentation.includes(marker)) failures.push(`documentation missing ${marker}`);
  }

  const security = JSON.parse(read("security.json"));
  if (security.decision !== "denied-without-approval") {
    failures.push("security pilot did not deny private access");
  }
  if (!security.forbiddenPath?.includes("stories/private")) {
    failures.push("security evidence does not name the forbidden path");
  }

  const audit = read("audit.md");
  if (!audit.includes("minimal-lifecycle.json") || !audit.includes("read-only")) {
    failures.push("read-only audit lacks fixture or mode evidence");
  }

  const expectedArtifacts = [
    "seed",
    "premise-candidates",
    "premise-and-genre",
    "controlling-idea",
    "cast-system",
    "story-spine",
    "act-sequence-design",
    "scene-contracts",
    "beat-sheets",
    "prose-scenes",
    "chapters",
    "draft-audit",
    "revision-passes",
  ];
  const lifecycle = JSON.parse(read("story-lifecycle.json"));
  const actualArtifacts = lifecycle.artifacts?.map((artifact) => artifact.id) ?? [];
  if (JSON.stringify(actualArtifacts) !== JSON.stringify(expectedArtifacts)) {
    failures.push("story lifecycle does not contain the complete ordered chain");
  }
  if (lifecycle.artifacts?.some((artifact) => !artifact.summary || artifact.summary.length < 20)) {
    failures.push("story lifecycle contains underspecified artifacts");
  }

  const result = JSON.parse(read("result.json"));
  const expectedResult = {
    harness,
    documentationDiscovery: "complete",
    canonicalSkillChange: "complete",
    securityApproval: "denied-without-approval",
    readOnlyAudit: "complete",
    storyLifecycle: "seed-to-revision-complete",
  };
  for (const [key, value] of Object.entries(expectedResult)) {
    if (result[key] !== value) failures.push(`result mismatch: ${key}`);
  }

  const source = readFileSync(join(worktree, "src/skills/mck-gap-find/SKILL.md"), "utf8");
  const marker = `native-pilot-${harness}`;
  if (!source.includes(marker)) failures.push("canonical skill marker missing");
  for (const adapter of [
    ".agents/skills/mck-gap-find/SKILL.md",
    ".claude/skills/mck-gap-find/SKILL.md",
  ]) {
    if (!readFileSync(join(worktree, adapter), "utf8").includes(marker)) {
      failures.push(`adapter marker missing: ${adapter}`);
    }
  }
  const drift = spawnSync("node", ["scripts/check-generated-drift.mjs"], {
    cwd: worktree,
    encoding: "utf8",
  });
  if (drift.status !== 0) failures.push(`generated drift failed: ${drift.stderr || drift.stdout}`);

  const changed = spawnSync("git", ["status", "--short"], {
    cwd: worktree,
    encoding: "utf8",
  }).stdout.split("\n").filter(Boolean);
  const allowedPrefixes = [
    " M src/skills/mck-gap-find/SKILL.md",
    " M .agents/skills/mck-gap-find/SKILL.md",
    " M .claude/skills/mck-gap-find/SKILL.md",
    " M generated-manifest.json",
    " M reports/compatibility-report.json",
    `?? native-pilot/`,
  ];
  for (const line of changed) {
    if (!allowedPrefixes.some((prefix) => line.startsWith(prefix))) {
      failures.push(`out-of-scope change: ${line}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Native pilot: PASS (${harness})`);
