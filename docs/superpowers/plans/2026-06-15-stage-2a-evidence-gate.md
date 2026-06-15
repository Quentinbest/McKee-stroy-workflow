# Stage 2A Evidence-First Hard Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Protocol V2.1 evidence-first Stage 2A hard validation while preserving exact replay behavior for existing V2.0 runs.

**Architecture:** Keep the workflow in the existing Node.js runner. Separate protocol-major routing from the exact protocol version, then conditionally generate and validate the expanded Stage 2A schema only for `2.1.0`. Use deterministic Unicode normalization, fixed deny lists, exact duplicate detection, and fail-closed role reveal; report evidence-support metrics without inferring them for V2.0.

**Tech Stack:** Node.js ESM, built-in `node:test`, JSON/Markdown artifacts, SHA-256 package binding.

---

## File Map

- `scripts/run-writer-adjudication.mjs`: exact version handling, V2.1 package/template generation, hard validation, and report rendering.
- `tests/writer-adjudication-v2.test.mjs`: unit and end-to-end coverage for V2.1 plus V2.0 replay compatibility.
- `tests/fixtures/writer-adjudication/v2.1-calibration.json`: V2.1 prospective calibration fixture.
- `templates/writer-adjudication-input.json`: default new-run input version.
- `templates/writer-adjudication-variants.json`: default prepared-variant version.
- `tests/writer-adjudication-contract.test.mjs`: documentation and template contract coverage.
- `skills/story-writer-adjudication/SKILL.md`: operator instructions and schema.
- `README.md`, `MANUAL.md`, `MANUAL-ZH.md`: user documentation.
- `benchmarks/writer-adjudication/README.md`: calibration and replay guidance.

### Task 1: Preserve Exact Protocol Versions

**Files:**
- Create: `tests/fixtures/writer-adjudication/v2.1-calibration.json`
- Modify: `tests/writer-adjudication-v2.test.mjs`
- Modify: `scripts/run-writer-adjudication.mjs:18-105`
- Modify: `scripts/run-writer-adjudication.mjs:1210-1335`

- [ ] **Step 1: Create the V2.1 fixture**

Run:

```bash
cp tests/fixtures/writer-adjudication/v2-calibration.json \
  tests/fixtures/writer-adjudication/v2.1-calibration.json
```

Then change only these top-level fields:

```json
{
  "version": "2.1.0",
  "run_id": "writer-adjudication-v2.1-test",
  "title": "Protocol V2.1 evidence-gate fixture"
}
```

- [ ] **Step 2: Write failing exact-version tests**

Add a second fixture URL:

```js
const evidenceGateFixturePath = new URL(
  "./fixtures/writer-adjudication/v2.1-calibration.json",
  import.meta.url,
);
```

Add:

```js
test("V2.1 preserves its exact version while V2.0 remains replayable", () => {
  const v21Dir = tempDir("writer-adjudication-v2.1-version-");
  const v20Dir = tempDir("writer-adjudication-v2.0-version-");

  try {
    const v21Metadata = createAdjudicationRun({
      inputPath: evidenceGateFixturePath,
      outputDir: v21Dir,
      seed: "protocol-v2.1-version",
    });
    assert.equal(v21Metadata.version, "2.1.0");
    assert.equal(v21Metadata.protocol_version, "2.1.0");
    assert.equal(
      readJson(path.join(v21Dir, "sealed-manifest.json")).protocol_version,
      "2.1.0",
    );

    const v20Metadata = createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: v20Dir,
      seed: "protocol-v2.0-version",
    });
    assert.equal(v20Metadata.version, "2.0.0");
    assert.equal(v20Metadata.protocol_version, "2.0.0");
  } finally {
    fs.rmSync(v21Dir, { recursive: true, force: true });
    fs.rmSync(v20Dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
node --test --test-name-pattern="preserves its exact version" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: FAIL because V2.1 is normalized to `2.0.0`.

- [ ] **Step 4: Implement exact supported-version parsing**

Replace the protocol constants and helpers with:

```js
const PROTOCOL_V1 = "1.0.0";
const PROTOCOL_V2 = "2.0.0";
const PROTOCOL_V2_1 = "2.1.0";
const SUPPORTED_V2_PROTOCOLS = new Set([
  PROTOCOL_V2,
  PROTOCOL_V2_1,
]);

function protocolVersion(value) {
  assertNonEmptyString(value, "version");
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) {
    throw new Error("version must use semantic version format");
  }
  if (Number.parseInt(match[1], 10) === 1) {
    return PROTOCOL_V1;
  }
  if (SUPPORTED_V2_PROTOCOLS.has(value)) {
    return value;
  }
  throw new Error(
    `version must use legacy major 1 or one of ${[...SUPPORTED_V2_PROTOCOLS].join(", ")}`,
  );
}

function protocolMajor(value) {
  return Number.parseInt(protocolVersion(value).split(".")[0], 10);
}

function manifestProtocolVersion(manifest) {
  return manifest.protocol_version ?? PROTOCOL_V1;
}

function isProtocolV2(manifest) {
  return protocolMajor(manifestProtocolVersion(manifest)) === 2;
}

function usesEvidenceGate(manifest) {
  return manifestProtocolVersion(manifest) === PROTOCOL_V2_1;
}
```

Keep `validateInput()` comparisons based on protocol major:

```js
const adjudicationProtocol = protocolVersion(input.version);
const isV2 = protocolMajor(adjudicationProtocol) === 2;
```

Use `isV2` for role-leak and V2 calibration checks. Preserve
`adjudicationProtocol` exactly in `manifest.version`,
`manifest.protocol_version`, `metadata.version`, and
`metadata.protocol_version`.

Replace every direct `adjudicationProtocol === PROTOCOL_V2` check in
`validateInput()` and `validateCalibration()` with the protocol-major boolean
so `2.1.0` receives all V2 role-leak and calibration validation.

Change the `prepareAdjudicationInput()` default:

```js
version: variantsSource.version ?? PROTOCOL_V2_1,
```

Legacy `1.x` inputs continue to normalize to `1.0.0`; only supported V2
versions are preserved exactly.

- [ ] **Step 5: Run version and existing V2 tests**

Run:

```bash
node --test --test-name-pattern="exact version|role-leaking|keeps roles hidden" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/run-writer-adjudication.mjs \
  tests/writer-adjudication-v2.test.mjs \
  tests/fixtures/writer-adjudication/v2.1-calibration.json
git commit -m "feat(writer-adjudication): preserve protocol 2.1 version"
```

### Task 2: Generate the Evidence-First Stage 2A Package

**Files:**
- Modify: `tests/writer-adjudication-v2.test.mjs`
- Modify: `scripts/run-writer-adjudication.mjs:665-720`

- [ ] **Step 1: Write failing template and package tests**

Add:

```js
test("V2.1 creates an evidence-first Stage 2A package without role leakage", () => {
  const outputDir = tempDir("writer-adjudication-v2.1-template-");

  try {
    createAdjudicationRun({
      inputPath: evidenceGateFixturePath,
      outputDir,
      seed: "protocol-v2.1-template",
    });
    const stageOnePath = completeStageOne(outputDir);
    revealAdjudicationRun({ outputDir, stageOnePath });

    const stageTwoA = readJson(
      path.join(outputDir, "stage-2a-decisions.json"),
    );
    assert.equal(stageTwoA.version, "2.1.0");
    assert.deepEqual(
      Object.keys(stageTwoA.comparisons[0]),
      [
        "comparison_id",
        "evidence_support",
        "evidence_basis",
        "counterevidence_checked",
        "finding_disposition",
        "rationale",
        "blind_difference_reconciliation",
      ],
    );
    assert.equal(stageTwoA.comparisons[0].evidence_support, null);
    assert.equal(stageTwoA.comparisons[0].evidence_basis, "");
    assert.equal(stageTwoA.comparisons[0].counterevidence_checked, "");

    const findingPackage = fs.readFileSync(
      path.join(outputDir, "finding-package.md"),
      "utf8",
    );
    assert.match(findingPackage, /Judge whether the evidence supports/);
    assert.match(findingPackage, /supported.*contradicted.*insufficient/s);
    assert.match(findingPackage, /Check contrary or weakening textual evidence/);
    assert.doesNotMatch(
      findingPackage,
      /\bbaseline\b|\bchallenger\b|weak_challenger|unsupported_finding/i,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
```

Extend the existing V2.0 test:

```js
const stageTwoA = readJson(
  path.join(outputDir, "stage-2a-decisions.json"),
);
assert.equal(stageTwoA.version, "2.0.0");
assert.equal("evidence_support" in stageTwoA.comparisons[0], false);
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test --test-name-pattern="evidence-first Stage 2A|keeps roles hidden" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: FAIL because the V2.1 template still has the V2.0 shape and wording.

- [ ] **Step 3: Implement conditional package instructions**

Change `renderFindingPackage()` to append the evidence-first instructions only
when `usesEvidenceGate(manifest)`:

```js
const instruction = usesEvidenceGate(manifest)
  ? [
      "Judge whether the evidence supports the predicate before choosing a disposition.",
      "Record `evidence_support` as `supported`, `contradicted`, or `insufficient`.",
      "Check contrary or weakening textual evidence and record what you checked.",
      "Then choose `accept`, `reject`, or `uncertain` using the allowed evidence matrix.",
    ].join(" ")
  : "Judge the finding without opening role-reveal material.";
```

Render:

```js
`${instruction} Record the decision in \`stage-2a-decisions.json\`.`
```

- [ ] **Step 4: Implement the conditional Stage 2A template**

Use the manifest's exact version:

```js
const evidenceFields = usesEvidenceGate(manifest)
  ? {
      evidence_support: null,
      evidence_basis: "",
      counterevidence_checked: "",
    }
  : {};

return {
  version: manifestProtocolVersion(manifest),
  run_id: manifest.run_id,
  stage: "blind_finding_adjudication",
  status: "AWAITING_WRITER",
  stage_1_sha256: stageOneHash,
  finding_package_sha256: findingPackageHash,
  reviewer: {
    id: null,
    started_at: null,
    completed_at: null,
  },
  comparisons: manifest.comparisons.map((comparison) => ({
    comparison_id: comparison.comparison_id,
    ...evidenceFields,
    finding_disposition: null,
    rationale: "",
    blind_difference_reconciliation: "",
  })),
  overall_notes: "",
};
```

Create a fresh object inside the map if later mutation is introduced; do not
share nested mutable state.

Also preserve the exact version in the Stage 2B template:

```js
version: manifestProtocolVersion(manifest),
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
node --test --test-name-pattern="evidence-first Stage 2A|keeps roles hidden" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/run-writer-adjudication.mjs \
  tests/writer-adjudication-v2.test.mjs
git commit -m "feat(writer-adjudication): add evidence-first Stage 2A template"
```

### Task 3: Enforce the Evidence Matrix and Specificity Gate

**Files:**
- Modify: `tests/writer-adjudication-v2.test.mjs`
- Modify: `scripts/run-writer-adjudication.mjs:5-28`
- Modify: `scripts/run-writer-adjudication.mjs:720-775`

- [ ] **Step 1: Add a valid V2.1 completion helper**

Add:

```js
function completeEvidenceGateStageTwoA(outputDir) {
  const manifest = readJson(path.join(outputDir, "sealed-manifest.json"));
  const manifestById = new Map(
    manifest.comparisons.map((comparison) => [
      comparison.comparison_id,
      comparison,
    ]),
  );
  const stageTwoAPath = path.join(outputDir, "stage-2a-decisions.json");
  const stageTwoA = readJson(stageTwoAPath);
  stageTwoA.status = "COMPLETE";
  stageTwoA.reviewer = {
    id: "test-writer",
    started_at: "2026-06-13T04:10:00Z",
    completed_at: "2026-06-13T04:16:00Z",
  };
  for (const decision of stageTwoA.comparisons) {
    const comparison = manifestById.get(decision.comparison_id);
    const unsupported =
      comparison.calibration.control_type === "unsupported_finding";
    decision.evidence_support = unsupported
      ? "contradicted"
      : "supported";
    decision.evidence_basis = unsupported
      ? `${decision.comparison_id}: the displayed prose already states the event the finding claims is absent.`
      : `${decision.comparison_id}: the displayed evidence identifies a concrete missing or repeated prose effect.`;
    decision.counterevidence_checked =
      `${decision.comparison_id}: checked the displayed context and both prose variants for facts weakening that diagnosis.`;
    decision.finding_disposition = unsupported ? "reject" : "accept";
    decision.rationale = unsupported
      ? `${decision.comparison_id}: the diagnostic claim conflicts with the explicit textual fact.`
      : `${decision.comparison_id}: the specific evidence supports the bounded diagnostic claim.`;
    decision.blind_difference_reconciliation = "";
  }
  writeJson(stageTwoAPath, stageTwoA);
  return stageTwoAPath;
}
```

- [ ] **Step 2: Write failing matrix tests**

Add a table-driven test:

```js
test("V2.1 enforces the evidence-support disposition matrix", () => {
  const cases = [
    ["supported", "accept", true],
    ["supported", "uncertain", true],
    ["contradicted", "reject", true],
    ["insufficient", "reject", true],
    ["insufficient", "uncertain", true],
    ["contradicted", "accept", false],
    ["insufficient", "accept", false],
    ["supported", "reject", false],
  ];

  for (const [support, disposition, allowed] of cases) {
    const outputDir = tempDir(`writer-adjudication-v2.1-${support}-`);
    try {
      createAdjudicationRun({
        inputPath: evidenceGateFixturePath,
        outputDir,
        seed: `protocol-v2.1-${support}-${disposition}`,
      });
      const stageOnePath = completeStageOne(outputDir);
      revealAdjudicationRun({ outputDir, stageOnePath });
      const stageTwoAPath = completeEvidenceGateStageTwoA(outputDir);
      const stageTwoA = readJson(stageTwoAPath);
      stageTwoA.comparisons[0].evidence_support = support;
      stageTwoA.comparisons[0].finding_disposition = disposition;
      writeJson(stageTwoAPath, stageTwoA);

      const run = () =>
        revealRolesAdjudicationRun({
          outputDir,
          stageOnePath,
          stageTwoAPath,
        });
      if (allowed) {
        assert.equal(run().status, "AWAITING_ROLE_REVEAL_DECISION");
      } else {
        assert.throws(run, /evidence_support=.*does not allow/);
        assert.equal(
          fs.existsSync(path.join(outputDir, "role-reveal-package.md")),
          false,
        );
        assert.equal(
          fs.existsSync(path.join(outputDir, "stage-2b-decisions.json")),
          false,
        );
      }
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }
});
```

- [ ] **Step 3: Run the matrix test and verify RED**

Run:

```bash
node --test --test-name-pattern="evidence-support disposition matrix" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: FAIL because evidence fields are not validated.

- [ ] **Step 4: Implement evidence enums and matrix validation**

Add:

```js
const EVIDENCE_SUPPORT_VALUES = new Set([
  "supported",
  "contradicted",
  "insufficient",
]);
const EVIDENCE_DISPOSITION_MATRIX = new Map([
  ["supported", new Set(["accept", "uncertain"])],
  ["contradicted", new Set(["reject"])],
  ["insufficient", new Set(["reject", "uncertain"])],
]);
```

Inside `validateStageTwoA()`, after the common comparison checks:

```js
if (usesEvidenceGate(manifest)) {
  if (!EVIDENCE_SUPPORT_VALUES.has(decision.evidence_support)) {
    throw new Error(
      `${decision.comparison_id}.evidence_support must be supported, contradicted, or insufficient`,
    );
  }
  if (
    !EVIDENCE_DISPOSITION_MATRIX
      .get(decision.evidence_support)
      .has(decision.finding_disposition)
  ) {
    throw new Error(
      `${decision.comparison_id}.evidence_support=${decision.evidence_support} does not allow finding_disposition=${decision.finding_disposition}`,
    );
  }
}
```

- [ ] **Step 5: Run the matrix test and verify GREEN**

Run:

```bash
node --test --test-name-pattern="evidence-support disposition matrix" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Write failing specificity and duplicate tests**

Add:

```js
test("V2.1 rejects missing, generic, and duplicated evidence judgments", () => {
  const mutations = [
    {
      name: "missing evidence",
      apply(stageTwoA) {
        stageTwoA.comparisons[0].evidence_basis = "";
      },
      error: /C01\.evidence_basis must contain at least 12/,
    },
    {
      name: "generic delegation",
      apply(stageTwoA) {
        stageTwoA.comparisons[0].rationale =
          "Writer explicitly confirmed acceptance of this finding.";
      },
      error: /C01\.rationale must contain a specific evidence judgment/,
    },
    {
      name: "bare counterevidence conclusion",
      apply(stageTwoA) {
        stageTwoA.comparisons[0].counterevidence_checked =
          "No contrary evidence found";
      },
      error: /C01\.counterevidence_checked must identify what was checked/,
    },
    {
      name: "duplicate basis",
      apply(stageTwoA) {
        stageTwoA.comparisons[1].evidence_basis =
          stageTwoA.comparisons[0].evidence_basis;
      },
      error: /C02\.evidence_basis duplicates C01\.evidence_basis/,
    },
    {
      name: "normalized duplicate rationale",
      apply(stageTwoA) {
        stageTwoA.comparisons[1].rationale =
          `  ${stageTwoA.comparisons[0].rationale.toUpperCase()}  `;
      },
      error: /C02\.rationale duplicates C01\.rationale/,
    },
  ];

  for (const mutation of mutations) {
    const outputDir = tempDir("writer-adjudication-v2.1-specificity-");
    try {
      createAdjudicationRun({
        inputPath: evidenceGateFixturePath,
        outputDir,
        seed: `protocol-v2.1-${mutation.name}`,
      });
      const stageOnePath = completeStageOne(outputDir);
      revealAdjudicationRun({ outputDir, stageOnePath });
      const stageTwoAPath = completeEvidenceGateStageTwoA(outputDir);
      const stageTwoA = readJson(stageTwoAPath);
      mutation.apply(stageTwoA);
      writeJson(stageTwoAPath, stageTwoA);

      assert.throws(
        () =>
          revealRolesAdjudicationRun({
            outputDir,
            stageOnePath,
            stageTwoAPath,
          }),
        mutation.error,
      );
      assert.equal(
        fs.existsSync(path.join(outputDir, "stage-2b-decisions.json")),
        false,
      );
      assert.equal(
        fs.existsSync(path.join(outputDir, "role-reveal-package.md")),
        false,
      );
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }
});
```

- [ ] **Step 7: Run specificity tests and verify RED**

Run:

```bash
node --test --test-name-pattern="missing, generic, and duplicated" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: FAIL because text specificity and duplicate checks do not exist.

- [ ] **Step 8: Implement deterministic text validation**

Add:

```js
const MIN_EVIDENCE_TEXT_LENGTH = 12;
const GENERIC_EVIDENCE_VALUES = new Set([
  "yes",
  "confirmed",
  "accepted",
  "looks right",
  "是",
  "确认",
  "接受",
  "看起来正确",
]);
const GENERIC_EVIDENCE_PREFIXES = [
  "writer explicitly confirmed",
  "author explicitly confirmed",
  "follow blind preference",
  "用户明确确认",
  "作者明确确认",
  "遵循盲选",
];
const GENERIC_COUNTEREVIDENCE_VALUES = new Set([
  "none",
  "no contrary evidence found",
  "未发现反证",
  "没有反证",
]);

function normalizeEvidenceText(value) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLowerCase();
}

function evidenceTextLength(value) {
  return [...normalizeEvidenceText(value).replace(/\s/gu, "")].length;
}

function validateSpecificEvidenceText(value, label, { counter = false } = {}) {
  assertNonEmptyString(value, label);
  const normalized = normalizeEvidenceText(value);
  if (evidenceTextLength(value) < MIN_EVIDENCE_TEXT_LENGTH) {
    throw new Error(
      `${label} must contain at least ${MIN_EVIDENCE_TEXT_LENGTH} non-whitespace characters`,
    );
  }
  if (
    GENERIC_EVIDENCE_VALUES.has(normalized) ||
    GENERIC_EVIDENCE_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    throw new Error(`${label} must contain a specific evidence judgment`);
  }
  if (counter && GENERIC_COUNTEREVIDENCE_VALUES.has(normalized)) {
    throw new Error(`${label} must identify what was checked`);
  }
  return normalized;
}
```

In `validateStageTwoA()`, collect normalized fields:

```js
const evidenceBasisByText = new Map();
const rationaleByText = new Map();
```

For each V2.1 decision:

```js
const evidenceBasis = validateSpecificEvidenceText(
  decision.evidence_basis,
  `${decision.comparison_id}.evidence_basis`,
);
validateSpecificEvidenceText(
  decision.counterevidence_checked,
  `${decision.comparison_id}.counterevidence_checked`,
  { counter: true },
);
const rationale = validateSpecificEvidenceText(
  decision.rationale,
  `${decision.comparison_id}.rationale`,
);
for (const [field, value, seen] of [
  ["evidence_basis", evidenceBasis, evidenceBasisByText],
  ["rationale", rationale, rationaleByText],
]) {
  const previous = seen.get(value);
  if (previous) {
    throw new Error(
      `${decision.comparison_id}.${field} duplicates ${previous}.${field}`,
    );
  }
  seen.set(value, decision.comparison_id);
}
```

Keep V2.0 validation unchanged: it still requires only a non-empty rationale
and reconciliation when applicable.

- [ ] **Step 9: Run all Stage 2A validation tests**

Run:

```bash
node --test --test-name-pattern="V2.1|reconciliation" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add scripts/run-writer-adjudication.mjs \
  tests/writer-adjudication-v2.test.mjs
git commit -m "feat(writer-adjudication): enforce Stage 2A evidence gate"
```

### Task 4: Add Evidence-Support Reporting

**Files:**
- Modify: `tests/writer-adjudication-v2.test.mjs`
- Modify: `scripts/run-writer-adjudication.mjs:1670-1835`
- Modify: `scripts/run-writer-adjudication.mjs:1045-1140`

- [ ] **Step 1: Write a failing report test**

Add:

```js
test("V2.1 reports evidence support without inventing V2.0 data", () => {
  const v21Dir = tempDir("writer-adjudication-v2.1-report-");
  const v20Dir = tempDir("writer-adjudication-v2.0-report-");

  try {
    createAdjudicationRun({
      inputPath: evidenceGateFixturePath,
      outputDir: v21Dir,
      seed: "protocol-v2.1-report",
    });
    const v21StageOne = completeStageOne(v21Dir);
    revealAdjudicationRun({
      outputDir: v21Dir,
      stageOnePath: v21StageOne,
    });
    const v21StageTwoA = completeEvidenceGateStageTwoA(v21Dir);
    revealRolesAdjudicationRun({
      outputDir: v21Dir,
      stageOnePath: v21StageOne,
      stageTwoAPath: v21StageTwoA,
    });
    const v21StageTwoB = completeStageTwoB(v21Dir);
    const v21Report = scoreAdjudicationRun({
      outputDir: v21Dir,
      stageOnePath: v21StageOne,
      stageTwoAPath: v21StageTwoA,
      stageTwoBPath: v21StageTwoB,
    });
    assert.deepEqual(v21Report.evidence_gate, {
      protocol_version: "2.1.0",
      support_counts: {
        supported: 3,
        contradicted: 1,
        insufficient: 0,
      },
      by_disposition: {
        accept: { supported: 3, contradicted: 0, insufficient: 0 },
        reject: { supported: 0, contradicted: 1, insufficient: 0 },
        uncertain: { supported: 0, contradicted: 0, insufficient: 0 },
      },
    });
    assert.match(
      fs.readFileSync(
        path.join(v21Dir, "adjudication-report.md"),
        "utf8",
      ),
      /Evidence gate protocol.*2\.1\.0/,
    );

    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir: v20Dir,
      seed: "protocol-v2.0-report",
    });
    const v20StageOne = completeStageOne(v20Dir);
    revealAdjudicationRun({
      outputDir: v20Dir,
      stageOnePath: v20StageOne,
    });
    const v20StageTwoA = completeStageTwoA(v20Dir);
    revealRolesAdjudicationRun({
      outputDir: v20Dir,
      stageOnePath: v20StageOne,
      stageTwoAPath: v20StageTwoA,
    });
    const v20StageTwoB = completeStageTwoB(v20Dir);
    const v20Report = scoreAdjudicationRun({
      outputDir: v20Dir,
      stageOnePath: v20StageOne,
      stageTwoAPath: v20StageTwoA,
      stageTwoBPath: v20StageTwoB,
    });
    assert.equal(v20Report.evidence_gate, null);
  } finally {
    fs.rmSync(v21Dir, { recursive: true, force: true });
    fs.rmSync(v20Dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the report test and verify RED**

Run:

```bash
node --test --test-name-pattern="reports evidence support" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: FAIL because `evidence_gate` is absent.

- [ ] **Step 3: Add evidence fields to V2.1 comparison records**

In `scoreProtocolV2()`, conditionally spread:

```js
...(usesEvidenceGate(manifest)
  ? {
      evidence_support: findingDecision.evidence_support,
      evidence_basis: findingDecision.evidence_basis,
      counterevidence_checked:
        findingDecision.counterevidence_checked,
    }
  : {}),
```

Set report versions from the manifest:

```js
version: manifestProtocolVersion(manifest),
protocol_version: manifestProtocolVersion(manifest),
```

- [ ] **Step 4: Implement evidence-gate metrics**

Add:

```js
function evidenceGateMetrics(comparisons, manifest) {
  if (!usesEvidenceGate(manifest)) {
    return null;
  }
  const supportValues = ["supported", "contradicted", "insufficient"];
  const dispositions = ["accept", "reject", "uncertain"];
  return {
    protocol_version: manifestProtocolVersion(manifest),
    support_counts: Object.fromEntries(
      supportValues.map((support) => [
        support,
        comparisons.filter(
          (comparison) => comparison.evidence_support === support,
        ).length,
      ]),
    ),
    by_disposition: Object.fromEntries(
      dispositions.map((disposition) => [
        disposition,
        Object.fromEntries(
          supportValues.map((support) => [
            support,
            comparisons.filter(
              (comparison) =>
                comparison.finding_disposition === disposition &&
                comparison.evidence_support === support,
            ).length,
          ]),
        ),
      ]),
    ),
  };
}
```

Attach:

```js
report.evidence_gate = evidenceGateMetrics(comparisons, manifest);
```

- [ ] **Step 5: Render evidence metrics**

Add:

```js
function renderEvidenceGateMetrics(evidenceGate) {
  if (!evidenceGate) {
    return `
## Evidence Gate

Evidence support: not recorded for this protocol version.
`;
  }
  return `
## Evidence Gate

| Metric | Result |
|---|---:|
| Evidence gate protocol | ${evidenceGate.protocol_version} |
| Supported | ${evidenceGate.support_counts.supported} |
| Contradicted | ${evidenceGate.support_counts.contradicted} |
| Insufficient | ${evidenceGate.support_counts.insufficient} |
| Supported / accept | ${evidenceGate.by_disposition.accept.supported} |
| Contradicted / reject | ${evidenceGate.by_disposition.reject.contradicted} |
| Insufficient / uncertain | ${evidenceGate.by_disposition.uncertain.insufficient} |
`;
}
```

Insert `${renderEvidenceGateMetrics(report.evidence_gate)}` before the
calibration section.

- [ ] **Step 6: Run report and full V2 tests**

Run:

```bash
node --test tests/writer-adjudication-v2.test.mjs
```

Expected: all V2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/run-writer-adjudication.mjs \
  tests/writer-adjudication-v2.test.mjs
git commit -m "feat(writer-adjudication): report Stage 2A evidence support"
```

### Task 5: Verify CLI Flow and Legacy Replay

**Files:**
- Modify: `tests/writer-adjudication-v2.test.mjs`

- [ ] **Step 1: Change the main V2 CLI test to V2.1**

Use `evidenceGateFixturePath` in the CLI test and replace:

```js
const stageTwoAPath = completeStageTwoA(outputDir);
```

with:

```js
const stageTwoAPath = completeEvidenceGateStageTwoA(outputDir);
```

After scoring, assert:

```js
assert.equal(
  readJson(path.join(outputDir, "adjudication-report.json"))
    .evidence_gate.protocol_version,
  "2.1.0",
);
```

- [ ] **Step 2: Add an explicit V2.0 replay test**

Add:

```js
test("V2.0 retained decisions replay without evidence-first fields", () => {
  const outputDir = tempDir("writer-adjudication-v2.0-replay-");

  try {
    createAdjudicationRun({
      inputPath: fixturePath,
      outputDir,
      seed: "protocol-v2.0-replay",
    });
    const stageOnePath = completeStageOne(outputDir);
    revealAdjudicationRun({ outputDir, stageOnePath });
    const stageTwoAPath = completeStageTwoA(outputDir);
    revealRolesAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoAPath,
    });
    const stageTwoBPath = completeStageTwoB(outputDir);
    const report = scoreAdjudicationRun({
      outputDir,
      stageOnePath,
      stageTwoAPath,
      stageTwoBPath,
    });

    assert.equal(report.protocol_version, "2.0.0");
    assert.equal(report.evidence_gate, null);
    assert.equal(
      "evidence_support" in report.comparisons[0],
      false,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run CLI and replay tests**

Run:

```bash
node --test --test-name-pattern="CLI runs|retained decisions replay" \
  tests/writer-adjudication-v2.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Run all adjudication tests**

Run:

```bash
node --test tests/writer-adjudication*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/writer-adjudication-v2.test.mjs
git commit -m "test(writer-adjudication): cover V2.1 CLI and V2.0 replay"
```

### Task 6: Update Templates and Operator Documentation

**Files:**
- Modify: `templates/writer-adjudication-input.json`
- Modify: `templates/writer-adjudication-variants.json`
- Modify: `tests/writer-adjudication-contract.test.mjs`
- Modify: `skills/story-writer-adjudication/SKILL.md`
- Modify: `README.md`
- Modify: `MANUAL.md`
- Modify: `MANUAL-ZH.md`
- Modify: `benchmarks/writer-adjudication/README.md`

- [ ] **Step 1: Write failing documentation/template contracts**

Add:

```js
const inputTemplate = JSON.parse(
  fs.readFileSync(
    new URL(
      "../templates/writer-adjudication-input.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const variantsTemplate = JSON.parse(
  fs.readFileSync(
    new URL(
      "../templates/writer-adjudication-variants.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

test("writer adjudication defaults new runs to the V2.1 evidence gate", () => {
  assert.equal(inputTemplate.version, "2.1.0");
  assert.equal(variantsTemplate.version, "2.1.0");
  assert.match(adjudication, /evidence_support/);
  assert.match(adjudication, /supported.*contradicted.*insufficient/s);
  assert.match(adjudication, /Only `supported` may be accepted/);
  assert.match(adjudication, /Existing `2\.0\.0` runs/);
});
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
node --test tests/writer-adjudication-contract.test.mjs
```

Expected: FAIL because templates and skill still document `2.0.0`.

- [ ] **Step 3: Update default template versions**

Change:

```json
"version": "2.1.0"
```

in both template files.

- [ ] **Step 4: Update the skill**

Document the V2.1 Stage 2A fields:

```markdown
- `evidence_support`: `supported`, `contradicted`, or `insufficient`
- `evidence_basis`: the specific displayed fact supporting that judgment
- `counterevidence_checked`: the contrary or weakening text checked
- `finding_disposition`: `accept`, `reject`, or `uncertain`
- `rationale`: why the evidence judgment warrants the disposition

Only `supported` may be accepted. `contradicted` requires rejection.
`insufficient` permits rejection or uncertainty. Generic acknowledgements,
delegated confirmations, and duplicate batch rationales fail closed before
source-role reveal.
```

State:

```markdown
New runs use `2.1.0`. Existing `2.0.0` runs retain their original Stage 2A
schema for reproducible replay.
```

- [ ] **Step 5: Update README and manuals**

In each document, replace the V2.0-only description with:

```markdown
Protocol V2.1 makes Stage 2A evidence-first. The writer must classify the
displayed evidence as `supported`, `contradicted`, or `insufficient`, identify
the evidence and counterevidence checked, and then choose the finding
disposition. Only `supported` can be accepted. Generic or duplicated
rationales block source-role reveal. Existing V2.0 runs remain replayable.
```

Use fluent Chinese in `MANUAL-ZH.md`:

```markdown
Protocol V2.1 将 Stage 2A 改为证据先行：作者先判断 finding 的证据为
`supported`、`contradicted` 或 `insufficient`，记录具体依据和检查过的
反证，再选择处置。只有 `supported` 可以 `accept`；空泛确认或整批重复
理由会在来源角色揭晓前被硬门禁拒绝。已有 V2.0 运行仍可原样回放。
```

- [ ] **Step 6: Update benchmark guidance**

Change “New inputs use `2.0.0`” to “New inputs use `2.1.0`” and add:

```markdown
The fresh Echo Quota V2.0 dogfood run demonstrated why the evidence gate is
needed: all 12 findings were accepted with one generic rationale, both
unsupported controls were accepted, and one finding was accepted after no
meaningful blind difference. V2.1 blocks that submission before Stage 2B.
```

Clarify that retained V2.0 evidence is unchanged and remains replayable.

- [ ] **Step 7: Run contract and documentation checks**

Run:

```bash
node --test tests/writer-adjudication-contract.test.mjs
git diff --check
```

Expected: PASS and no whitespace errors.

- [ ] **Step 8: Commit**

```bash
git add templates/writer-adjudication-input.json \
  templates/writer-adjudication-variants.json \
  tests/writer-adjudication-contract.test.mjs \
  skills/story-writer-adjudication/SKILL.md \
  README.md MANUAL.md MANUAL-ZH.md \
  benchmarks/writer-adjudication/README.md
git commit -m "docs(writer-adjudication): document Stage 2A evidence gate"
```

### Task 7: Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run syntax validation**

Run:

```bash
node --check scripts/run-writer-adjudication.mjs
```

Expected: exit code 0.

- [ ] **Step 2: Run the complete test suite**

Run:

```bash
node --test tests/*.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 3: Run Beat Gate verification**

Run:

```bash
node scripts/verify-beat-gate.mjs
```

Expected:

```text
Beat Gate verification: PASS
```

- [ ] **Step 4: Run repository hygiene checks**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intended tracked changes and the
pre-existing unrelated untracked paths remain.

- [ ] **Step 5: Review requirements**

Confirm:

```text
[x] New runs preserve version 2.1.0
[x] V2.0 replay remains valid
[x] Stage 2A captures evidence support, basis, and counterevidence
[x] Invalid matrix combinations fail before Stage 2B artifacts
[x] Generic and duplicate judgments fail deterministically
[x] V2.1 reports evidence-support metrics
[x] Source roles and control labels remain hidden through Stage 2A
[x] Templates and bilingual docs default to V2.1
```

If verification requires corrections, return to the responsible task's
red-green cycle, rerun its focused tests, and commit the exact files named in
that task before repeating this final verification.
