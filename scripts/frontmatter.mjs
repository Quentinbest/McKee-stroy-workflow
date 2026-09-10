import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const REQUIRED_FIELDS = {
  skill: ["name", "description", "allowed-tools", "triggers"],
  agent: ["name", "description", "tools", "model"],
};

export class FrontmatterError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "FrontmatterError";
    Object.assign(this, details);
  }
}

function meaningful(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

function inferKind(filePath) {
  const normalized = filePath.split(path.sep).join("/");
  if (normalized.includes("/skills/")) return "skill";
  if (normalized.includes("/agents/")) return "agent";
  throw new FrontmatterError(`Cannot infer prompt kind from path: ${filePath}`, {
    code: "UNKNOWN_PROMPT_KIND",
    filePath,
  });
}

export function parseFrontmatter(text, options = {}) {
  const filePath = options.filePath ?? "<input>";
  const kind = options.kind ?? (filePath === "<input>" ? null : inferKind(filePath));
  if (typeof text !== "string") {
    throw new FrontmatterError("Prompt must be a string", { code: "INVALID_INPUT", filePath });
  }
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    throw new FrontmatterError("Prompt is missing the opening frontmatter fence", {
      code: "MISSING_OPENING_FENCE",
      filePath,
    });
  }
  const closingIndex = lines.slice(1).findIndex((line) => line.trim() === "---");
  if (closingIndex < 0) {
    throw new FrontmatterError("Prompt is missing the closing frontmatter fence", {
      code: "MISSING_CLOSING_FENCE",
      filePath,
    });
  }
  const yamlText = lines.slice(1, closingIndex + 1).join("\n");
  let data;
  try {
    data = YAML.parse(yamlText, { strict: true, uniqueKeys: true });
  } catch (error) {
    throw new FrontmatterError(`Invalid YAML frontmatter: ${error.message}`, {
      code: "INVALID_YAML",
      filePath,
      cause: error,
    });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new FrontmatterError("Frontmatter must be a YAML mapping", {
      code: "INVALID_MAPPING",
      filePath,
    });
  }

  if (!REQUIRED_FIELDS[kind]) {
    throw new FrontmatterError(`Unknown prompt kind: ${kind ?? "<missing>"}`, {
      code: "UNKNOWN_PROMPT_KIND",
      filePath,
    });
  }

  for (const field of REQUIRED_FIELDS[kind] ?? []) {
    if (!Object.prototype.hasOwnProperty.call(data, field) || !meaningful(data[field])) {
      throw new FrontmatterError(`Missing or empty required field: ${field}`, {
        code: "MISSING_REQUIRED_FIELD",
        field,
        filePath,
      });
    }
  }

  const expectedName = kind === "skill"
    ? path.basename(path.dirname(filePath))
    : path.basename(filePath, path.extname(filePath));
  if (data.name !== expectedName) {
    throw new FrontmatterError(
      `Frontmatter name '${data.name}' does not match path name '${expectedName}'`,
      { code: "NAME_PATH_MISMATCH", expectedName, filePath },
    );
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name)) {
    throw new FrontmatterError(`Prompt name must be kebab-case: ${data.name}`, {
      code: "INVALID_NAME",
      filePath,
    });
  }

  return { data, filePath, kind, closingIndex: closingIndex + 1 };
}

export function validateFrontmatterFile(filePath, kind = inferKind(filePath)) {
  return parseFrontmatter(fs.readFileSync(filePath, "utf8"), { filePath, kind });
}

export function discoverPromptFiles(repoRoot) {
  const prompts = [];
  const skillsRoot = path.join(repoRoot, "skills");
  const agentsRoot = path.join(repoRoot, "agents");
  if (fs.existsSync(skillsRoot)) {
    for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const filePath = path.join(skillsRoot, entry.name, "SKILL.md");
      if (fs.existsSync(filePath)) prompts.push({ filePath, kind: "skill" });
    }
  }
  if (fs.existsSync(agentsRoot)) {
    for (const entry of fs.readdirSync(agentsRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      prompts.push({ filePath: path.join(agentsRoot, entry.name), kind: "agent" });
    }
  }
  return prompts.sort((a, b) => a.filePath.localeCompare(b.filePath));
}
