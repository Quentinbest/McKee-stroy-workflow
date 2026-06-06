import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requiredKeys = [
  "id",
  "title",
  "status",
  "priority",
  "owner",
  "created",
  "updated",
  "risk",
  "approval_required",
  "scope",
  "depends_on",
];
const requiredSections = [
  "Goal",
  "Context",
  "Inputs",
  "Constraints",
  "Deliverables",
  "Acceptance Criteria",
  "Verification",
  "Evidence",
  "Rollback",
  "Handoff",
];
const states = new Set([
  "proposed",
  "ready",
  "in_progress",
  "verification",
  "review",
  "blocked",
  "done",
  "cancelled",
  "stale",
]);
const levels = new Set(["low", "medium", "high", "critical"]);

function parseScalar(value) {
  if (value === "[]") return [];
  return value.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("missing YAML frontmatter");
  const result = {};
  const stack = [{ indent: -1, value: result }];
  for (const raw of match[1].split("\n")) {
    if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).value;
    if (line.startsWith("- ")) {
      if (!Array.isArray(parent)) throw new Error(`unexpected list item: ${line}`);
      parent.push(parseScalar(line.slice(2)));
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) throw new Error(`invalid frontmatter line: ${line}`);
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1).trim();
    if (value) {
      parent[key] = parseScalar(value);
      continue;
    }
    const next = match[1].split("\n");
    const child = key === "scope" ? {} : [];
    parent[key] = child;
    stack.push({ indent, value: child });
  }
  return { data: result, body: text.slice(match[0].length) };
}

function validateTask(path) {
  const errors = [];
  let parsed;
  try {
    parsed = parseFrontmatter(readFileSync(path, "utf8"));
  } catch (error) {
    return [error.message];
  }
  const { data, body } = parsed;
  for (const key of requiredKeys) {
    if (!(key in data)) errors.push(`missing frontmatter key: ${key}`);
  }
  if (!/^TASK-\d{4}-\d{3}$/.test(data.id ?? "")) {
    errors.push("id must match TASK-YYYY-NNN");
  }
  if (!states.has(data.status)) errors.push(`invalid status: ${data.status}`);
  if (!levels.has(data.priority)) errors.push(`invalid priority: ${data.priority}`);
  if (!levels.has(data.risk)) errors.push(`invalid risk: ${data.risk}`);
  if (!Array.isArray(data.approval_required)) {
    errors.push("approval_required must be a list");
  }
  if (!Array.isArray(data.depends_on)) errors.push("depends_on must be a list");
  if (!data.scope || Array.isArray(data.scope)) {
    errors.push("scope must be a mapping");
  } else {
    if (!Array.isArray(data.scope.allowed) || data.scope.allowed.length === 0) {
      errors.push("scope.allowed must contain at least one path");
    }
    if (!Array.isArray(data.scope.forbidden) || data.scope.forbidden.length === 0) {
      errors.push("scope.forbidden must contain at least one path");
    }
  }
  if (data.status !== "proposed") {
    for (const section of requiredSections) {
      if (!new RegExp(`^# ${section}$`, "m").test(body)) {
        errors.push(`missing section: ${section}`);
      }
    }
    if (!/^- \[[ x]\] .+/m.test(body)) {
      errors.push("acceptance criteria require at least one checkbox");
    }
    if (!/```(?:bash|sh)\n[\s\S]+?\n```/.test(body)) {
      errors.push("verification requires a shell command block");
    }
  }
  return errors;
}

function markdownFiles(directory) {
  return readdirSync(directory)
    .filter((name) => /^TASK-\d{4}-\d{3}.*\.md$/.test(name))
    .sort()
    .map((name) => join(directory, name));
}

let failures = 0;
for (const path of markdownFiles(join(root, "tasks"))) {
  const errors = validateTask(path);
  if (errors.length) {
    failures += 1;
    console.error(`${basename(path)}:\n- ${errors.join("\n- ")}`);
  }
}

const validFixture = join(root, "tests/fixtures/tasks/valid-task.md");
const invalidFixture = join(root, "tests/fixtures/tasks/invalid-task.md");
const validErrors = validateTask(validFixture);
const invalidErrors = validateTask(invalidFixture);
if (validErrors.length) {
  failures += 1;
  console.error(`valid fixture failed:\n- ${validErrors.join("\n- ")}`);
}
if (invalidErrors.length === 0) {
  failures += 1;
  console.error("invalid fixture unexpectedly passed");
}

if (failures) process.exit(1);
console.log("Task contracts: PASS");
