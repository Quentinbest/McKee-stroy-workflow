import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultWiki = "/Users/quentin/Writing/LLM-Wiki-Story";
const siblingWiki = resolve(root, "../LLM-Wiki-Story");
const wikiRoot = process.env.MCKEE_WIKI_ROOT
  ?? (existsSync(join(siblingWiki, "wiki/CANONICAL.md")) ? siblingWiki : defaultWiki);
const aliases = {
  "wiki/en/concepts/convention-vs-cliche.md": "wiki/en/comparisons/convention-vs-cliche.md",
  "wiki/en/concepts/subtext.md": "wiki/en/concepts/text-and-subtext.md",
};

function contractFrom(content) {
  const json = content.match(/^contract: (\{.*\})$/m)?.[1];
  return json ? JSON.parse(json) : null;
}

function wikiReferences(content) {
  return [...content.matchAll(/`(wiki\/[^`\n]+)`/g)]
    .map((match) => match[1])
    .filter((path) => (
      path.endsWith(".md")
      && !path.includes("*")
      && !path.includes("{")
      && !path.includes("}")
    ))
    .filter((path, index, all) => all.indexOf(path) === index)
    .sort();
}

const nodes = [];
const edges = [];
const unresolved = [];

for (const entry of readdirSync(join(root, "src/skills"), { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))) {
  const id = entry.name;
  const path = join(root, "src/skills", id, "SKILL.md");
  const content = readFileSync(path, "utf8");
  const contract = contractFrom(content);
  nodes.push({ id: `skill:${id}`, kind: "skill", path: relative(root, path) });
  for (const target of contract?.handoff ?? []) {
    if (target === "return control to the primary agent") continue;
    edges.push({ from: `skill:${id}`, to: `capability:${target}`, kind: "handoff" });
  }
  for (const artifact of contract?.artifacts ?? []) {
    edges.push({ from: `skill:${id}`, to: `artifact-path:${artifact}`, kind: "produces" });
  }
  for (const reference of wikiReferences(content)) {
    const resolvedReference = aliases[reference] ?? reference;
    const exists = existsSync(join(wikiRoot, resolvedReference));
    edges.push({
      from: `skill:${id}`,
      to: `wiki:${resolvedReference}`,
      kind: aliases[reference] ? "wiki-alias" : "wiki-read",
      sourceReference: reference,
      exists,
    });
    if (!exists) unresolved.push({ source: `skill:${id}`, reference, resolvedReference });
  }
}

for (const filename of readdirSync(join(root, "src/roles")).filter((name) => name.endsWith(".md")).sort()) {
  const id = basename(filename, ".md");
  const path = join(root, "src/roles", filename);
  const content = readFileSync(path, "utf8");
  const contract = contractFrom(content);
  nodes.push({ id: `role:${id}`, kind: "role", path: relative(root, path) });
  for (const target of contract?.handoff ?? []) {
    if (target === "primary-agent") continue;
    edges.push({ from: `role:${id}`, to: `capability:${target}`, kind: "handoff" });
  }
  for (const reference of wikiReferences(content)) {
    const resolvedReference = aliases[reference] ?? reference;
    const exists = existsSync(join(wikiRoot, resolvedReference));
    edges.push({
      from: `role:${id}`,
      to: `wiki:${resolvedReference}`,
      kind: aliases[reference] ? "wiki-alias" : "wiki-read",
      sourceReference: reference,
      exists,
    });
    if (!exists) unresolved.push({ source: `role:${id}`, reference, resolvedReference });
  }
}

const graph = {
  schemaVersion: 1,
  generatedAt: "2026-06-06",
  wiki: {
    environmentVariable: "MCKEE_WIKI_ROOT",
    verifiedRoot: wikiRoot,
    readOnly: true,
    aliases,
  },
  nodes,
  edges,
  unresolved,
};
writeFileSync(
  join(root, "src/dependency-graph.json"),
  `${JSON.stringify(graph, null, 2)}\n`,
);

if (unresolved.length) {
  for (const item of unresolved) {
    console.error(`${item.source}: missing ${item.reference} -> ${item.resolvedReference}`);
  }
  process.exit(1);
}
console.log(`Dependency graph: PASS (${nodes.length} nodes, ${edges.length} edges)`);
