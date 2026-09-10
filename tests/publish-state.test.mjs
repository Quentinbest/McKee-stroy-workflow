import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  createExportRecord,
  evaluateExportState,
} from "../skills/story-publish/scripts/publish-state.mjs";

const sourceSnapshot = {
  files: [
    { path: "prose/1-1.md", sha256: "a" },
    { path: "prose/1-2.md", sha256: "b" },
  ],
};
const manuscript = "# Story\n\nApproved source prose.\n";

test("first export is ready and repeated export is idempotent", () => {
  assert.equal(evaluateExportState({ current_source_snapshot: sourceSnapshot }).status, "READY_FIRST_EXPORT");
  const record = createExportRecord({
    export_id: "export-1",
    created_at: "2026-09-10T12:00:00Z",
    source_snapshot: sourceSnapshot,
    manuscript_content: manuscript,
  });
  assert.equal(evaluateExportState({
    previous_export: record,
    current_source_snapshot: sourceSnapshot,
    current_manuscript_content: manuscript,
  }).status, "READY_IDEMPOTENT_REEXPORT");
});

test("source edits require rebuilding from authoritative prose", () => {
  const record = createExportRecord({
    export_id: "export-1",
    created_at: "2026-09-10T12:00:00Z",
    source_snapshot: sourceSnapshot,
    manuscript_content: manuscript,
  });
  const changedSources = structuredClone(sourceSnapshot);
  changedSources.files[0].sha256 = "approved-polish";
  const result = evaluateExportState({
    previous_export: record,
    current_source_snapshot: changedSources,
    current_manuscript_content: manuscript,
  });
  assert.equal(result.status, "READY_REBUILD_FROM_SOURCES");
  assert.equal(result.blocking, false);
});

test("independent manuscript edits block overwrite and preserve the discrepancy", () => {
  const record = createExportRecord({
    export_id: "export-1",
    created_at: "2026-09-10T12:00:00Z",
    source_snapshot: sourceSnapshot,
    manuscript_content: manuscript,
  });
  const result = evaluateExportState({
    previous_export: record,
    current_source_snapshot: sourceSnapshot,
    current_manuscript_content: `${manuscript}\nIndependent export-only edit.\n`,
  });
  assert.equal(result.status, "BLOCKED_UNTRACEABLE_MANUSCRIPT_EDIT");
  assert.equal(result.blocking, true);
});

test("publish workflow can invoke the deterministic evaluation CLI", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "publish-state-cli-"));
  const inputPath = path.join(root, "input.json");
  const outputPath = path.join(root, "result.json");
  try {
    fs.writeFileSync(inputPath, JSON.stringify({
      current_source_snapshot: sourceSnapshot,
      current_manuscript_content: null,
    }));
    const result = spawnSync(process.execPath, [
      new URL("../skills/story-publish/scripts/publish-state.mjs", import.meta.url).pathname,
      "evaluate",
      "--input",
      inputPath,
      "--output",
      outputPath,
    ], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /EXPORT_STATE: READY_FIRST_EXPORT/);
    assert.equal(JSON.parse(fs.readFileSync(outputPath)).blocking, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
