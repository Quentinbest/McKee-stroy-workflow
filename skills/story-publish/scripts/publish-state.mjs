import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizedSnapshot(snapshot) {
  return [...(snapshot?.files ?? [])]
    .map((file) => ({ path: file.path, sha256: file.sha256 }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function createSourceSnapshot({ rootDir, sourceFiles }) {
  const root = path.resolve(rootDir);
  return {
    files: sourceFiles.map((sourceFile) => {
      const absolutePath = path.resolve(root, sourceFile);
      if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
        throw new Error(`Source path escapes root: ${sourceFile}`);
      }
      return { path: sourceFile, sha256: sha256(fs.readFileSync(absolutePath)) };
    }).sort((left, right) => left.path.localeCompare(right.path)),
  };
}

export function createExportRecord({
  export_id: exportId,
  created_at: createdAt,
  source_snapshot: sourceSnapshot,
  manuscript_content: manuscriptContent,
}) {
  if (!exportId || !createdAt) {
    throw new Error("export_id and created_at are required");
  }
  return {
    export_id: exportId,
    created_at: createdAt,
    source_snapshot: { files: normalizedSnapshot(sourceSnapshot) },
    manuscript_sha256: sha256(manuscriptContent),
  };
}

export function evaluateExportState({
  previous_export: previousExport = null,
  current_source_snapshot: currentSourceSnapshot,
  current_manuscript_content: currentManuscriptContent = null,
}) {
  if (!previousExport) {
    return { status: "READY_FIRST_EXPORT", blocking: false, reasons: [] };
  }
  const reasons = [];
  if (
    currentManuscriptContent !== null &&
    sha256(currentManuscriptContent) !== previousExport.manuscript_sha256
  ) {
    reasons.push(
      "assembled manuscript changed outside the recorded source-to-export flow",
    );
  }
  const sourcesChanged = JSON.stringify(normalizedSnapshot(currentSourceSnapshot)) !==
    JSON.stringify(normalizedSnapshot(previousExport.source_snapshot));
  if (sourcesChanged) {
    reasons.push("source prose changed after the recorded export");
  }
  if (reasons[0]?.startsWith("assembled manuscript changed")) {
    return { status: "BLOCKED_UNTRACEABLE_MANUSCRIPT_EDIT", blocking: true, reasons };
  }
  if (sourcesChanged) {
    return { status: "READY_REBUILD_FROM_SOURCES", blocking: false, reasons };
  }
  return { status: "READY_IDEMPOTENT_REEXPORT", blocking: false, reasons: [] };
}

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  const inputPath = option(args, "--input");
  const outputPath = option(args, "--output");
  if (command !== "evaluate" || !inputPath || !outputPath) {
    throw new Error("Usage: node publish-state.mjs evaluate --input <json> --output <json>");
  }
  const result = evaluateExportState(
    JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8")),
  );
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`EXPORT_STATE: ${result.status}`);
}
