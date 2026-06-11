import { canonicalSkillIds, frameworkRoot, readPackageDistribution, validatePackageDistribution } from "./lib/package-model.mjs";

const root = frameworkRoot();
const config = readPackageDistribution(root);
const skills = canonicalSkillIds(root);
const errors = validatePackageDistribution(config, skills);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log(
  `Package distribution: PASS (${config.skillCatalog.length} classified skills, ${config.packages.length} packages)`,
);
