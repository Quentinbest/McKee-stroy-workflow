import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildPackageModels, frameworkRoot, readPackageDistribution } from "./lib/package-model.mjs";

const root = frameworkRoot();
const models = buildPackageModels(root);
const source = readPackageDistribution(root);
const output = {
  schemaVersion: 1,
  generatedAt: "package-model-runtime",
  source: "src/distribution/packages.json",
  packageCount: models.length,
  packages: models,
};

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(join(root, "reports/package-models.json"), `${JSON.stringify(output, null, 2)}\n`);

console.log(`Package models: PASS (${models.length} packages from ${source.skillCatalog.length} skills)`);
