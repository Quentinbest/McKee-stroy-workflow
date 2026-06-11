import { writeRcArtifacts } from "./lib/release-artifacts.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const summary = writeRcArtifacts(frameworkRoot());
console.log(`RC artifacts: PASS (${summary.artifacts.length} installable directories)`);
