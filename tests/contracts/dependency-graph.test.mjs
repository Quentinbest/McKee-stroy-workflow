import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const graph = JSON.parse(readFileSync("src/dependency-graph.json", "utf8"));

test("dependency graph has no unresolved required references", () => {
  assert.deepEqual(graph.unresolved, []);
});

test("legacy wiki aliases resolve to existing canonical files", () => {
  const aliases = graph.edges.filter((edge) => edge.kind === "wiki-alias");
  assert.ok(aliases.length > 0);
  assert.equal(aliases.every((edge) => edge.exists), true);
});
