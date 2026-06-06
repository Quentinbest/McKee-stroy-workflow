import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGeneratedFiles, GENERATED_ROOTS } from "./lib/generator.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const expected = buildGeneratedFiles(root);
const failures = [];

for (const [path, value] of expected) {
  const target = join(root, path);
  if (!existsSync(target)) {
    failures.push(`missing generated file: ${path}`);
  } else if (readFileSync(target, "utf8") !== value.content) {
    failures.push(`stale generated file: ${path}`);
  }
}

function walk(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : [relative(root, child)];
  });
}

const expectedPaths = new Set(expected.keys());
for (const generatedRoot of GENERATED_ROOTS) {
  for (const path of walk(join(root, generatedRoot))) {
    if (!expectedPaths.has(path)) failures.push(`unexpected generated file: ${path}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Generated drift: PASS (${expected.size} files)`);
