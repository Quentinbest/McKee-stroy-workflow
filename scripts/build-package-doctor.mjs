import { writePackageDoctorReport } from "./lib/package-doctor.mjs";
import { frameworkRoot } from "./lib/package-model.mjs";

const root = frameworkRoot();
const report = writePackageDoctorReport(root);

console.log(`Package doctor: PASS (${report.scopes.length} evaluated scopes)`);
