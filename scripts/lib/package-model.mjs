import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RECOGNIZED_CLASSIFICATIONS = new Set(["core", "workflow", "wiki-maintainer"]);
const RECOGNIZED_EDITIONS = new Set(["core", "workflow", "wiki-maintainer"]);
const RECOGNIZED_ROLE_MODES = new Set(["fallback-only", "native-or-fallback", "wiki-only"]);
const RECOGNIZED_WIKI_MODES = new Set(["offline-optional", "project-required"]);
const RECOGNIZED_TARGETS = new Set(["claude", "codex", "cursor", "opencode", "pi"]);

export function frameworkRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

export function canonicalSkillIds(root = frameworkRoot()) {
  return readdirSync(join(root, "src/skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function readPackageDistribution(root = frameworkRoot()) {
  const path = join(root, "src/distribution/packages.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validatePackageDistribution(config, skills) {
  const errors = [];
  const skillSet = new Set(skills);
  const catalog = Array.isArray(config.skillCatalog) ? config.skillCatalog : [];
  const packages = Array.isArray(config.packages) ? config.packages : [];
  const packageIds = new Set();
  const catalogIds = new Set();

  if (config.schemaVersion !== 1) errors.push("schemaVersion must equal 1");

  for (const entry of catalog) {
    if (!entry?.id) {
      errors.push("skillCatalog entry missing id");
      continue;
    }
    if (catalogIds.has(entry.id)) errors.push(`duplicate skillCatalog id: ${entry.id}`);
    catalogIds.add(entry.id);
    if (!skillSet.has(entry.id)) errors.push(`unknown canonical skill: ${entry.id}`);
    if (!RECOGNIZED_CLASSIFICATIONS.has(entry.classification)) {
      errors.push(`invalid classification for ${entry.id}: ${entry.classification}`);
    }
  }

  for (const id of skills) {
    if (!catalogIds.has(id)) errors.push(`canonical skill missing from skillCatalog: ${id}`);
  }

  for (const entry of packages) {
    if (!entry?.id) {
      errors.push("package missing id");
      continue;
    }
    if (packageIds.has(entry.id)) errors.push(`duplicate package id: ${entry.id}`);
    packageIds.add(entry.id);
    if (!RECOGNIZED_EDITIONS.has(entry.edition)) errors.push(`invalid edition: ${entry.id}`);
    if (!RECOGNIZED_ROLE_MODES.has(entry.roleMode)) errors.push(`invalid roleMode: ${entry.id}`);
    if (!RECOGNIZED_WIKI_MODES.has(entry.wikiMode)) errors.push(`invalid wikiMode: ${entry.id}`);
    for (const classification of entry.includeClassifications ?? []) {
      if (!RECOGNIZED_CLASSIFICATIONS.has(classification)) {
        errors.push(`invalid includeClassification ${classification} in ${entry.id}`);
      }
    }
    for (const conflict of entry.conflicts ?? []) {
      if (conflict === entry.id) errors.push(`package ${entry.id} cannot conflict with itself`);
    }
    for (const target of entry.targets ?? []) {
      if (!RECOGNIZED_TARGETS.has(target)) errors.push(`invalid target ${target} in ${entry.id}`);
    }
  }

  const packageMap = new Map(packages.map((entry) => [entry.id, entry]));
  for (const entry of packages) {
    for (const conflict of entry.conflicts ?? []) {
      if (!packageMap.has(conflict)) {
        errors.push(`package ${entry.id} conflicts with missing package ${conflict}`);
        continue;
      }
      if (!(packageMap.get(conflict).conflicts ?? []).includes(entry.id)) {
        errors.push(`package conflict must be mutual: ${entry.id} <-> ${conflict}`);
      }
    }
  }

  const requiredPackages = new Set([
    "mckee-story-core",
    "mckee-story-workflow",
    "mckee-story-wiki-maintainer",
  ]);
  for (const id of requiredPackages) {
    if (!packageMap.has(id)) errors.push(`missing required package ${id}`);
  }

  if (packageMap.has("mckee-story-core")) {
    const core = packageMap.get("mckee-story-core");
    if (JSON.stringify(core.includeClassifications) !== JSON.stringify(["core"])) {
      errors.push("mckee-story-core must include only the core classification");
    }
  }
  if (packageMap.has("mckee-story-workflow")) {
    const workflow = packageMap.get("mckee-story-workflow");
    const expected = JSON.stringify(["core", "workflow"]);
    if (JSON.stringify(workflow.includeClassifications) !== expected) {
      errors.push("mckee-story-workflow must include core and workflow classifications");
    }
  }
  if (packageMap.has("mckee-story-wiki-maintainer")) {
    const wiki = packageMap.get("mckee-story-wiki-maintainer");
    if (JSON.stringify(wiki.includeClassifications) !== JSON.stringify(["wiki-maintainer"])) {
      errors.push("mckee-story-wiki-maintainer must include only wiki-maintainer");
    }
  }

  return errors;
}

export function buildPackageModels(root = frameworkRoot()) {
  const config = readPackageDistribution(root);
  const skills = canonicalSkillIds(root);
  const errors = validatePackageDistribution(config, skills);
  if (errors.length) throw new Error(errors.join("\n"));

  const byClassification = new Map();
  for (const entry of config.skillCatalog) {
    const items = byClassification.get(entry.classification) ?? [];
    items.push(entry.id);
    byClassification.set(entry.classification, items);
  }
  for (const items of byClassification.values()) items.sort();

  return config.packages.map((entry) => ({
    ...entry,
    skills: entry.includeClassifications
      .flatMap((classification) => byClassification.get(classification) ?? [])
      .sort(),
  }));
}

export function buildPackageModelsReport(root = frameworkRoot()) {
  const models = buildPackageModels(root);
  const source = readPackageDistribution(root);
  return {
    schemaVersion: 1,
    generatedAt: "package-model-runtime",
    source: "src/distribution/packages.json",
    packageCount: models.length,
    packages: models,
    skillCount: source.skillCatalog.length,
  };
}

export function writePackageModelsReport(root = frameworkRoot()) {
  const report = buildPackageModelsReport(root);
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/package-models.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}
