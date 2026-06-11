import { verifyArchiveArtifacts } from "./lib/archive-artifacts.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const manifest = verifyArchiveArtifacts(frameworkRoot());
console.log(`Archive artifact verification: PASS (${manifest.assets.length} tarballs)`);
