import { writePackageArtifacts } from "./lib/package-adapters.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const summary = writePackageArtifacts(frameworkRoot());
process.stdout.write(
  `Package artifacts: PASS (${summary.packages.length} projections across ${summary.packageCount} packages)\n`,
);
