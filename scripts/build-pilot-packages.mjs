import { frameworkRoot } from "./lib/package-model.mjs";
import { writePilotPackageArtifacts } from "./lib/package-adapters.mjs";

const root = frameworkRoot();
const summary = writePilotPackageArtifacts(root);

console.log(
  `Pilot packages: PASS (${summary.packages.length} host projections across ${summary.pilotSkillIds.length} skills)`,
);
