# Stage 2A Evidence-First Hard Gate

Date: 2026-06-14
Status: Approved design
Scope: Writer Adjudication Protocol V2.1

## English

### Problem

Protocol V2.0 requires a non-empty Stage 2A rationale, but it does not require
the writer to judge whether the cited evidence supports the finding. A single
generic sentence can be copied across a batch.

The Echo Quota prospective pilot exposed the consequence:

- all 12 findings were accepted with the same generic rationale;
- both unsupported-finding controls were accepted;
- one finding was accepted after Stage 1 reported no meaningful difference;
- weak-challenger resistance was 33.3%;
- calibration correctly returned `FAIL`, but only after Stage 2B.

The workflow needs to prevent unsupported or mechanically accepted findings
from reaching source-role reveal, rather than merely reporting the failure
afterward.

### Goals

1. Make Stage 2A evidence-first: judge support before disposition.
2. Reject logically inconsistent decisions before generating Stage 2B.
3. Reject generic or duplicated batch rationales deterministically.
4. Preserve replay and scoring compatibility for completed `2.0.0` runs.
5. Keep source roles and calibration-control identities hidden through Stage
   2A.

### Non-Goals

- No semantic-similarity model or AI scoring of human prose.
- No automatic correction of writer decisions.
- No changes to Stage 1 preference or Stage 2B authority boundaries.
- No reopening of Premise, character desire, causality, world rules, or final
  aesthetic authority.
- No retroactive mutation of retained `2.0.0` evidence.

### Protocol Versioning

New inputs use:

```json
{ "version": "2.1.0" }
```

The runner must preserve the exact supported version in generated metadata and
manifests. It must no longer normalize every `2.x` input to `2.0.0`.

Version checks have two separate responsibilities:

- V2 behavior is selected by protocol major `2`.
- The evidence-first Stage 2A schema is selected by version `>=2.1.0`.

Existing `2.0.0` runs retain the current Stage 2A schema and validation rules.
Existing `1.x` legacy runs retain their combined Stage 2 behavior.

### Stage 2A Decision Schema

Each `2.1.0` comparison contains:

```json
{
  "comparison_id": "C01",
  "evidence_support": "supported",
  "evidence_basis": "Specific fact from the displayed evidence and prose.",
  "counterevidence_checked": "Specific contrary or weakening evidence checked.",
  "finding_disposition": "accept",
  "rationale": "Why the evidence judgment warrants this disposition.",
  "blind_difference_reconciliation": ""
}
```

Allowed `evidence_support` values:

- `supported`
- `contradicted`
- `insufficient`

Disposition matrix:

| Evidence support | Allowed disposition |
|---|---|
| `supported` | `accept`, `uncertain` |
| `contradicted` | `reject` |
| `insufficient` | `reject`, `uncertain` |

An `accept` is valid only with `evidence_support: supported`.

### Writer-Facing Package

The `2.1.0` finding package keeps the existing predicate, evidence, question,
and Stage 1 meaningful-difference value. It adds instructions in this order:

1. Check whether the stated evidence supports the predicate.
2. Record contrary or weakening textual evidence.
3. Choose the finding disposition.
4. Reconcile an acceptance with `meaningful_difference: no`, when applicable.

It must not include:

- baseline/challenger roles;
- source references;
- weak-challenger labels;
- unsupported-finding labels;
- calibration categories or expected answers.

### Hard Validation

Before `reveal-roles` creates any Stage 2B artifact, every `2.1.0` decision
must pass all checks.

#### Structural Checks

- `evidence_support` is one of the three allowed values.
- `evidence_basis`, `counterevidence_checked`, and `rationale` are non-empty.
- `finding_disposition` satisfies the disposition matrix.
- An accepted finding after `meaningful_difference: no` has a non-empty
  `blind_difference_reconciliation`.

#### Specificity Checks

Normalize text with Unicode NFKC, trim leading/trailing whitespace, collapse
internal whitespace, and lowercase for comparison. Length checks count
non-whitespace Unicode code points after normalization.

Each of `evidence_basis`, `counterevidence_checked`, and `rationale` must
contain at least 12 non-whitespace code points. Reject fields that are:

- generic acknowledgements such as `yes`, `confirmed`, `accepted`,
  `looks right`, `是`, `确认`, `接受`, or `看起来正确`;
- prefixed by generic delegation phrases such as
  `writer explicitly confirmed`, `author explicitly confirmed`,
  `follow blind preference`, `用户明确确认`, `作者明确确认`, or `遵循盲选`;
- generic counterevidence statements such as `none`,
  `no contrary evidence found`, `未发现反证`, or `没有反证`;
- exactly duplicated across different comparisons for `evidence_basis` or
  `rationale`.

`counterevidence_checked` may explicitly state that no contrary evidence was
found, but it must identify the textual feature or claim that was checked. A
bare conclusion that no counterevidence exists is invalid.

The validator does not attempt semantic similarity. Exact normalized
duplication is the deterministic boundary.

#### Fail-Closed Behavior

If any decision fails:

- `reveal-roles` exits with an error;
- no `role-reveal-package.md` is created;
- no `stage-2b-decisions.json` is created;
- existing Stage 2A content remains available for correction;
- the error names the comparison and field.

Examples:

```text
C07.evidence_basis must contain a specific evidence judgment
C10 accept requires evidence_support=supported
C08.rationale duplicates C03.rationale
```

### Data Flow

1. `create` preserves input version `2.1.0` in run metadata and manifest.
2. Stage 1 remains unchanged.
3. `reveal` detects `2.1.0`, renders evidence-first instructions, and creates
   the expanded Stage 2A template.
4. The writer completes evidence support and finding disposition while roles
   remain hidden.
5. `reveal-roles` validates package hashes, temporal ordering, the evidence
   matrix, specificity, duplication, and reconciliation.
6. Only a valid Stage 2A unlocks Stage 2B.
7. `score` records evidence-support metrics alongside existing metrics.

### Reporting

Protocol `2.1.0` reports add:

- counts for `supported`, `contradicted`, and `insufficient`;
- evidence-support by finding disposition;
- acceptances by evidence-support value, expected to contain only
  `supported`;
- an evidence-gate protocol marker.

Protocol `2.0.0` reports remain reproducible. New fields are absent or rendered
as `not recorded`; they are not fabricated from old rationales.

### Tests

Test-first implementation must cover:

1. `supported + accept` succeeds.
2. `supported + uncertain` succeeds.
3. `contradicted + reject` succeeds.
4. `insufficient + reject` and `insufficient + uncertain` succeed.
5. `contradicted + accept` fails.
6. `insufficient + accept` fails.
7. Missing evidence fields fail.
8. Generic acknowledgement text fails.
9. Exact normalized duplicate `evidence_basis` fails.
10. Exact normalized duplicate `rationale` fails.
11. Bare `none` counterevidence fails.
12. Acceptance after no meaningful difference still requires reconciliation.
13. Failure creates no Stage 2B artifacts.
14. A retained `2.0.0` fixture still replays end to end.
15. A `2.1.0` CLI run completes `create → reveal → reveal-roles → score`.
16. Existing package tamper and role-leak tests remain green.

### Documentation

Update:

- `README.md`
- `MANUAL.md`
- `MANUAL-ZH.md`
- `benchmarks/writer-adjudication/README.md`
- `skills/story-writer-adjudication/SKILL.md`
- `templates/writer-adjudication-input.json`

The documentation must distinguish legacy `2.0.0` replay from the default
`2.1.0` evidence-first workflow.

## 中文

### 问题

Protocol V2.0 只要求 Stage 2A 的 `rationale` 非空，没有要求作者先判断
finding 中的证据是否真的支持诊断，也允许整批复制同一句泛化理由。

《回声配额》前瞻性实测因此出现：

- 12 项 finding 使用同一句理由全部接受；
- 2 个 unsupported-finding 控制项全部被接受；
- 1 项在盲评认为“无显著差异”后仍接受 finding；
- 弱 challenger 抵抗率仅 33.3%；
- 系统虽最终正确给出 `FAIL`，但失败直到 Stage 2B 后才被发现。

### 目标

Stage 2A 改为“证据先行”的硬门禁：先判断证据支持度，再决定
`accept | reject | uncertain`；逻辑冲突、空泛理由或整批重复理由在来源
角色揭示前被拒绝。

### 版本与兼容

- 新运行使用 `2.1.0`。
- manifest 和 metadata 必须保存精确版本，不能再把所有 `2.x` 归一化为
  `2.0.0`。
- major version `2` 决定使用 V2 三阶段流程。
- `>=2.1.0` 决定启用 evidence-first Stage 2A。
- 已完成的 `2.0.0` 继续按旧 schema 重放和评分。
- `1.x` 继续使用 legacy combined Stage 2。

### Stage 2A 字段

每项新增：

- `evidence_support`: `supported | contradicted | insufficient`
- `evidence_basis`: 指出支持或不支持判断的具体文本事实
- `counterevidence_checked`: 说明检查过的反证或削弱诊断的证据
- `finding_disposition`
- `rationale`
- 必要时填写 `blind_difference_reconciliation`

逻辑矩阵：

| 证据支持度 | 允许的处置 |
|---|---|
| `supported` | `accept`, `uncertain` |
| `contradicted` | `reject` |
| `insufficient` | `reject`, `uncertain` |

只有 `supported` 可以搭配 `accept`。

### 硬门禁

`reveal-roles` 在生成任何 Stage 2B 文件前必须检查：

- 新字段完整且枚举合法；
- disposition 与 evidence support 符合逻辑矩阵；
- 三个说明字段不是 `yes`、`confirmed`、`looks right`、`是`、`确认`
  等泛化确认；
- 所有说明字段经过 Unicode NFKC、trim、空白折叠后，至少包含 12 个
  非空白 Unicode 字符；
- 拒绝以 `writer explicitly confirmed`、`follow blind preference`、
  `用户明确确认`、`作者明确确认`、`遵循盲选` 等泛化委托短语开头的文本；
- 规范化后的 `evidence_basis` 和 `rationale` 不能跨 comparison 完全重复；
- `counterevidence_checked` 不能只写 `none`、`未发现反证` 或同类结论，
  必须指出检查了哪个文本特征或主张；
- `meaningful_difference: no` 后接受 finding 仍必须单独对账。

校验采用确定性的 trim、空白折叠、lowercase、最小长度和完全重复检查，
不引入语义相似度模型或 AI 判分。

任一项失败时：

- `reveal-roles` 报错并精确指出 comparison/field；
- 不生成 role reveal package；
- 不生成 Stage 2B 决策模板；
- 保留 Stage 2A 文件供作者修正。

### 报告与测试

`2.1.0` 报告新增 evidence support 分布及其与 disposition 的交叉统计。
`2.0.0` 不伪造这些字段，显示未记录或保持字段缺失。

测试必须覆盖合法矩阵组合、非法组合、缺失字段、泛化文本、重复理由、
无差异接受对账、失败不生成 Stage 2B、`2.0.0` 回放兼容、`2.1.0` CLI
全链路，以及现有 hash 防篡改和角色隐藏测试。
