import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPublicationReadiness } from "./lib/publication-readiness.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const options = {};

for (let index = 0; index < args.length; index += 1) {
  const token = args[index];
  if (!token.startsWith("--")) continue;
  const key = token.slice(2);
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    options[key] = true;
  } else {
    options[key] = value;
    index += 1;
  }
}

try {
  verifyPublicationReadiness(root, {
    target: options.target,
    releaseRef: options.ref,
    approvalPath: options.approval,
  });
  process.stdout.write(`Publication preflight: PASS (${options.target}, ${options.ref})\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
