import { frameworkRoot, writePackageModelsReport } from "./lib/package-model.mjs";

const root = frameworkRoot();
const report = writePackageModelsReport(root);

console.log(`Package models: PASS (${report.packageCount} packages from ${report.skillCount} skills)`);
