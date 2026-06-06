import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildGeneratedFiles,
  GENERATED_ROOTS,
  GENERATOR_VERSION,
} from "./lib/generator.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const path of GENERATED_ROOTS) {
  rmSync(join(root, path), { recursive: true, force: true });
}
for (const [path, value] of buildGeneratedFiles(root)) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value.content);
}
console.log(`Harness adapters synchronized with generator ${GENERATOR_VERSION}.`);
