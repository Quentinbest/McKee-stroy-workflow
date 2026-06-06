import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name.startsWith(".")) return [];
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

const markdown = walk(root).filter((path) => extname(path) === ".md");
for (const file of markdown) {
  const content = readFileSync(file, "utf8");
  const relativePath = relative(root, file);
  const requiresHeading = (
    relativePath.startsWith("docs/")
    || relativePath.startsWith("tasks/")
    || ["README.md", "MANUAL.md", "MANUAL-ZH.md", "AGENTS.md"].includes(relativePath)
  );
  if (requiresHeading && !/^# /m.test(content)) {
    failures.push(`${relativePath}: missing H1 heading`);
  }
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(?:https?:|mailto:)/.test(target) || target.includes("{")) continue;
    if (!existsSync(resolve(dirname(file), target))) {
      failures.push(`${relative(root, file)}: broken link ${target}`);
    }
  }
}

for (const path of walk(root).filter((file) => extname(file) === ".html")) {
  const content = readFileSync(path, "utf8");
  if (!/<html[\s>]/i.test(content) || !/<head[\s>]/i.test(content) || !/<body[\s>]/i.test(content)) {
    failures.push(`${relative(root, path)}: malformed HTML shell`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Documentation: PASS (${markdown.length} Markdown files)`);
