import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildPackageDoctorReport } from "./lib/package-doctor.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const root = frameworkRoot();
const report = buildPackageDoctorReport(root);

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(join(root, "reports/package-doctor.json"), `${JSON.stringify(report, null, 2)}\n`);

console.log(`Package doctor: PASS (${report.scopes.length} evaluated scopes)`);
