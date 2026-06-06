import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync("generated-manifest.json", "utf8"));

test("manifest hashes match committed generated files", () => {
  for (const entry of manifest.files) {
    const content = readFileSync(entry.path, "utf8");
    const hash = createHash("sha256").update(content).digest("hex");
    assert.equal(hash, entry.sha256, entry.path);
  }
});
