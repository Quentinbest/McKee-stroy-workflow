import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requiredSkill = [
  "purpose",
  "trigger",
  "exclusions",
  "inputs",
  "preconditions",
  "procedure",
  "artifacts",
  "quality_gates",
  "failure_behavior",
  "side_effects",
  "handoff",
  "fixtures",
];
const requiredRole = [
  "purpose",
  "mode",
  "inputs",
  "outputs",
  "allowed_paths",
  "forbidden_actions",
  "verification",
  "handoff",
];

function extractContract(content) {
  const line = content.match(/^contract: (\{.*\})$/m)?.[1];
  if (!line) throw new Error("missing inline contract");
  return JSON.parse(line);
}

function validateRequired(contract, fields) {
  const errors = [];
  for (const field of fields) {
    if (!(field in contract)) errors.push(`missing ${field}`);
  }
  for (const [key, value] of Object.entries(contract)) {
    if (Array.isArray(value) && value.length === 0) errors.push(`${key} is empty`);
  }
  return errors;
}

let failures = 0;
const fixturePath = join(root, "tests/fixtures/contracts/skill-contracts.json");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));
const skillIds = readdirSync(join(root, "src/skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const id of skillIds) {
  const path = join(root, "src/skills", id, "SKILL.md");
  let contract;
  try {
    contract = extractContract(readFileSync(path, "utf8"));
  } catch (error) {
    console.error(`${id}: ${error.message}`);
    failures += 1;
    continue;
  }
  const errors = validateRequired(contract, requiredSkill);
  const fixture = fixtures.skills[id];
  if (!fixture) errors.push("missing positive and negative fixture");
  if (fixture) {
    const positiveErrors = validateRequired(fixture.positive.contract, requiredSkill);
    if (positiveErrors.length) errors.push(`positive fixture: ${positiveErrors.join(", ")}`);
    const negative = structuredClone(fixture.positive.contract);
    delete negative[fixture.negativeMutation.remove];
    if (validateRequired(negative, requiredSkill).length === 0) {
      errors.push("negative fixture unexpectedly passed");
    }
  }
  if (errors.length) {
    console.error(`${id}: ${errors.join("; ")}`);
    failures += 1;
  }
}

for (const filename of readdirSync(join(root, "src/roles")).filter((name) => name.endsWith(".md")).sort()) {
  const id = basename(filename, ".md");
  try {
    const contract = extractContract(readFileSync(join(root, "src/roles", filename), "utf8"));
    const errors = validateRequired(contract, requiredRole);
    if (!["read_only", "scoped_write"].includes(contract.mode)) errors.push("invalid mode");
    if (errors.length) {
      console.error(`${id}: ${errors.join("; ")}`);
      failures += 1;
    }
  } catch (error) {
    console.error(`${id}: ${error.message}`);
    failures += 1;
  }
}

const artifacts = JSON.parse(readFileSync(join(root, "src/artifacts/story-artifacts.json"), "utf8"));
const artifactIds = new Set();
for (const artifact of artifacts.artifacts) {
  const fields = [
    "id",
    "version",
    "required_input_version",
    "producers",
    "consumers",
    "validation",
    "human_checkpoint",
    "allowed_backward_transitions",
    "stop_loss",
  ];
  const missing = fields.filter((field) => !(field in artifact));
  if (missing.length) {
    console.error(`${artifact.id ?? "artifact"}: missing ${missing.join(", ")}`);
    failures += 1;
  }
  if (artifactIds.has(artifact.id)) {
    console.error(`duplicate artifact id: ${artifact.id}`);
    failures += 1;
  }
  artifactIds.add(artifact.id);
}

if (failures) process.exit(1);
console.log(`Contracts: PASS (${skillIds.length} skills, 27 roles, ${artifactIds.size} artifacts)`);
