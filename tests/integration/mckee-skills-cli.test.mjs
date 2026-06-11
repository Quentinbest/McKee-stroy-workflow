import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { frameworkRoot } from "../../scripts/lib/package-model.mjs";

const root = frameworkRoot();

function run(args) {
  return spawnSync(process.execPath, ["scripts/mckee-skills.mjs", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

test("inspect filters full artifacts by host and edition", () => {
  const result = run(["inspect", "--target", "opencode", "--edition", "workflow"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.artifacts.length, 1);
  assert.equal(payload.artifacts[0].host, "opencode");
  assert.equal(payload.artifacts[0].edition, "workflow");
});

test("verify passes for a valid full-package filter", () => {
  const result = run(["verify", "--target", "claude", "--edition", "core"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /verify: PASS/);
});

test("doctor emits project-scope JSON report", () => {
  const result = run(["doctor", "--scope", "project"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.ok(Array.isArray(payload.scopes));
  assert.ok(payload.scopes.length >= 1);
});

test("archive builds and verifies local release tarballs", () => {
  const result = run(["archive"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /archive: PASS/);
});

test("verify fails on an unknown target", () => {
  const result = run(["verify", "--target", "unknown-host"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown target/);
});
