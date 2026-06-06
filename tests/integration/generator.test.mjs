import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildGeneratedFiles } from "../../scripts/lib/generator.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("generator is deterministic", () => {
  const first = buildGeneratedFiles(root);
  const second = buildGeneratedFiles(root);
  assert.deepEqual([...first], [...second]);
});

test("one canonical skill change updates only its adapters and manifest", () => {
  const temp = mkdtempSync(join(tmpdir(), "mckee-generator-"));
  try {
    cpSync(join(root, "AGENTS.md"), join(temp, "AGENTS.md"));
    cpSync(join(root, "src"), join(temp, "src"), { recursive: true });
    const before = buildGeneratedFiles(temp);
    const source = join(temp, "src/skills/mck-gap-find/SKILL.md");
    writeFileSync(source, `${readFileSync(source, "utf8")}\n<!-- fixture change -->\n`);
    const after = buildGeneratedFiles(temp);
    const changed = [...before.keys()].filter(
      (path) => before.get(path).content !== after.get(path).content,
    );
    assert.deepEqual(changed.sort(), [
      ".agents/skills/mck-gap-find/SKILL.md",
      ".claude/skills/mck-gap-find/SKILL.md",
      "generated-manifest.json",
    ]);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
