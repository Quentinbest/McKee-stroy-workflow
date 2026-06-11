import { buildArchiveArtifacts } from "./lib/archive-artifacts.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const manifest = buildArchiveArtifacts(frameworkRoot());
console.log(`Archive artifacts: PASS (${manifest.assets.length} tarballs)`);
