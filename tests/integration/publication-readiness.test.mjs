import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  evaluatePublicationReadiness,
  REQUIRED_GITHUB_RELEASE_SCOPE,
} from "../../scripts/lib/publication-readiness.mjs";

const commit = "a".repeat(40);
const now = new Date("2026-06-11T12:00:00Z");

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "mckee-publication-"));
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(root + "/VERSION", "1.0.0\n");
  writeFileSync(
    root + "/LICENSE",
    "Permission is granted for this test fixture only. This is not a repository license.\n",
  );

  const approval = {
    schemaVersion: 1,
    status: "approved",
    operation: "publication",
    target: "github-release",
    release: "1.0.0",
    releaseRef: "v1.0.0-rc.1",
    sourceCommit: commit,
    scope: REQUIRED_GITHUB_RELEASE_SCOPE,
    task: "TASK-2026-016",
    approvedBy: {
      name: "Release Owner",
      role: "Authorized publisher",
    },
    approvedAt: "2026-06-11T10:00:00Z",
    expiresAt: "2026-06-12T10:00:00Z",
    ...overrides,
  };
  writeFileSync(root + "/reports/publication-approval.json", `${JSON.stringify(approval, null, 2)}\n`);
  return root;
}

function evaluate(root, overrides = {}) {
  return evaluatePublicationReadiness(root, {
    target: "github-release",
    releaseRef: "v1.0.0-rc.1",
    currentCommit: commit,
    now,
    ...overrides,
  });
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function carrierFixture({ extraCarrierFile = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "mckee-publication-carrier-"));
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(root + "/VERSION", "1.0.0\n");
  writeFileSync(
    root + "/LICENSE",
    "Permission is granted for this test fixture only. This is not a repository license.\n",
  );
  git(root, ["init"]);
  git(root, ["config", "user.name", "Publication Test"]);
  git(root, ["config", "user.email", "publication-test@example.invalid"]);
  git(root, ["add", "VERSION", "LICENSE"]);
  git(root, ["commit", "-m", "Create approved source"]);
  const sourceCommit = git(root, ["rev-parse", "HEAD"]);

  const approval = {
    schemaVersion: 1,
    status: "approved",
    operation: "publication",
    target: "github-release",
    release: "1.0.0",
    releaseRef: "v1.0.0-rc.1",
    sourceCommit,
    scope: REQUIRED_GITHUB_RELEASE_SCOPE,
    task: "TASK-2026-019",
    approvedBy: {
      name: "Release Owner",
      role: "Authorized publisher",
    },
    approvedAt: "2026-06-11T10:00:00Z",
    expiresAt: "2026-06-12T10:00:00Z",
  };
  writeFileSync(root + "/reports/publication-approval.json", `${JSON.stringify(approval, null, 2)}\n`);
  if (extraCarrierFile) writeFileSync(root + "/UNAPPROVED.txt", "not approved\n");
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "Record publication approval"]);
  return root;
}

test("publication preflight accepts a fully scoped current approval", () => {
  assert.equal(evaluate(fixture()).status, "ready");
});

test("publication preflight rejects missing and placeholder licenses", () => {
  const missingRoot = fixture();
  rmSync(missingRoot + "/LICENSE");
  assert.match(evaluate(missingRoot).failures.join("\n"), /missing top-level LICENSE/);

  const placeholderRoot = fixture();
  writeFileSync(placeholderRoot + "/LICENSE", "LICENSE REVIEW REQUIRED placeholder placeholder placeholder\n");
  assert.match(evaluate(placeholderRoot).failures.join("\n"), /review notice or placeholder/);
});

test("publication preflight rejects missing approval", () => {
  const root = fixture();
  assert.match(
    evaluate(root, { approvalPath: "reports/missing-approval.json" }).failures.join("\n"),
    /missing publication approval/,
  );
});

test("publication preflight rejects malformed approval JSON", () => {
  const root = fixture();
  writeFileSync(root + "/reports/publication-approval.json", "{not-json\n");
  assert.match(evaluate(root).failures.join("\n"), /not valid JSON/);
});

test("publication preflight rejects expired and mismatched approvals", () => {
  const expired = evaluate(fixture({ expiresAt: "2026-06-11T11:00:00Z" }));
  assert.match(expired.failures.join("\n"), /expired/);

  const wrongTarget = evaluate(fixture({ target: "npm" }));
  assert.match(wrongTarget.failures.join("\n"), /approval target/);

  const wrongRef = evaluate(fixture({ releaseRef: "v1.0.0-rc.2" }));
  assert.match(wrongRef.failures.join("\n"), /approval releaseRef/);

  const wrongCommit = evaluate(fixture({ sourceCommit: "b".repeat(40) }));
  assert.match(wrongCommit.failures.join("\n"), /approval sourceCommit/);

  const futureDated = evaluate(fixture({ approvedAt: "2026-06-11T13:00:00Z" }));
  assert.match(futureDated.failures.join("\n"), /future-dated/);
});

test("publication preflight requires every GitHub release asset in scope", () => {
  const scope = REQUIRED_GITHUB_RELEASE_SCOPE.slice(1);
  const result = evaluate(fixture({ scope }));
  assert.match(result.failures.join("\n"), /approval scope is missing/);
});

test("publication preflight rejects unsafe paths in approval scope", () => {
  const result = evaluate(fixture({ scope: [...REQUIRED_GITHUB_RELEASE_SCOPE, "../secret"] }));
  assert.match(result.failures.join("\n"), /unsafe path/);
});

test("publication preflight accepts a direct approval-only carrier commit", () => {
  const root = carrierFixture();
  const result = evaluatePublicationReadiness(root, {
    target: "github-release",
    releaseRef: "v1.0.0-rc.1",
    now,
  });
  assert.equal(result.status, "ready");
});

test("publication preflight rejects a carrier commit with unrelated changes", () => {
  const root = carrierFixture({ extraCarrierFile: true });
  const result = evaluatePublicationReadiness(root, {
    target: "github-release",
    releaseRef: "v1.0.0-rc.1",
    now,
  });
  assert.match(result.failures.join("\n"), /may change only reports\/publication-approval.json/);
});
