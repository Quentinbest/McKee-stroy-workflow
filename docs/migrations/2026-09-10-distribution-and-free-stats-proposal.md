# Distribution and `free-stats` compatibility proposal

Date: 2026-09-10
Status: aesthetic rule decided; migration remains proposal-only — no installation, distribution release, or story-file mutation performed

## Distribution source map

| Surface | Observed source | Identity / evidence | Compatibility status |
|---|---|---|---|
| Current Pi `story-scene` | `/Users/quentin/.pi/agent/skills/story-scene` → `/Users/quentin/GitHub/quentin-skills/variants/story-scene/faff1d734e27` | SHA-256 `fafbb6df…` | Independent installed variant; not this repository source |
| Current Pi `story-audit` and `story-publish` | symlinks under `/Users/quentin/.pi/agent/skills/` to `quentin-skills` | SHA-256 values differ from repository and RC | Independent installed sources |
| Canonical repository | `skills/`, `agents/`, `templates/` at implementation baseline `d41f9a5…` plus this revision | Repository source of W1–W7 changes | Revised source; not installed or published |
| Existing Pi RC | `dist/pi/mckee-story-workflow/` | `provenance.json` says source commit `c977578…`; skill hashes differ from current source | Historical RC; does not contain the new audit/publish helper scripts |

Historical Pi sessions explicitly recorded skill locations under
`/Users/quentin/.pi/agent/skills/`. The current symlinks therefore identify the
actual load surface more reliably than the untracked `dist/` directory. No
software version can be inferred for old `free-stats` records that lack a
version marker; record them as `source version unknown`.

### Limited distribution migration

1. Keep the current Pi symlinks and existing RC unchanged until an installation
   and publication target is explicitly selected.
2. Build a fresh candidate from the revised repository source in a new staging
   directory. Do not reuse the existing RC's `sourceCommit`.
3. Require the candidate to include each referenced helper, especially
   `story-audit/scripts/audit-state.mjs` and
   `story-publish/scripts/publish-state.mjs`, plus updated lifecycle and policy
   templates.
4. Generate a source-to-package manifest with hashes, validate every relative
   Skill reference from inside the candidate, and run the repository tests
   against the staged artifact.
5. Install only after showing a diff against the active Pi symlink targets and
   choosing whether the central `quentin-skills` variants remain separate or
   are superseded.

## `free-stats` correction inventory

Read-only source inspected:
`/Users/quentin/workspace/pi/writing-story/drafts/free-stats/`.

| Finding | Evidence | Proposed treatment |
|---|---|---|
| Lifecycle conflict | `state: "critic_passed"`, but `locked.critic_passed`, `locked.prose`, and `locked.beat_sheets` are `false` | Mark effective status `conflicted / unverified`; do not auto-advance |
| Act pass presented near a global gate | `audit-report.md` scope is Act 1, Scenes 1.1–1.19; later scene cards and 80 chapter files exist | Preserve the Act 1 PASS as local evidence only; create no global PASS without a current full-work scope and hashes |
| Voice rule conflict | `voice-anchors.md` R1 bans all “不是 X … 是 Y” forms, while approved prose includes examples such as `prose/1.1.md` (“不是清嗓。是要开口”) and the derived chapters contain further uses | Apply the resolved exception criteria below during copy-only review; do not rewrite prose automatically |
| Stale and duplicate character state | `state.json` has both `characters["段琮"]` and `characters["duan-zong"]`, both anchored at Scene 1.10, while the audit records appearances through 1.18 | In a copy, merge only after choosing the authoritative record; retain an alias/migration note and verify every later appearance |
| Source / chapter relationship unknown | 19 prose files total 756,219 bytes; 80 chapters total 732,689 bytes; `Ch080.md` is newer than `prose/1.19.md` | Treat `chapters/` as potentially independently approved derivatives. Do not regenerate them from `prose/` or designate either as authoritative without a diff review |

### Aesthetic decision — resolved 2026-09-10

Decision: **explicit exception**. R1 remains the default prohibition, but an
approved construction may be retained when it performs concrete contrast or
sensory correction.

An R1 exception is valid only when all of these are true:

1. Both sides identify observable actions, objects, sounds, bodily sensations,
   or other scene-local evidence.
2. The construction corrects a character's immediate perception or draws a
   materially useful concrete distinction; it does not announce theme,
   emotion, morality, or authorial interpretation.
3. Removing the contrast would reduce factual or sensory precision, rather
   than merely change rhythm.
4. The exact occurrence is approved and recorded with source path, content
   hash, reason, approver, and approval date. Approval of one occurrence does
   not authorize similar phrasing elsewhere.

R1 continues to reject abstract reversals, rhetorical thesis statements,
narrator explanations, emotional summaries, and repeated contrast scaffolds.
For example, the existing `prose/1.1.md` construction “不是清嗓。是要开口” is
an exception candidate because it corrects an immediately observed sound/action;
it is not automatically approved until it appears in the copy-only review
ledger.

### Copy-only migration sequence after approval

1. Copy `free-stats` to a new migration workspace and record full hashes.
2. Add the new lifecycle arrays without changing legacy claims; record old
   audit scope/version as unverified or Act-1-only.
3. Resolve lifecycle locks from evidence, not from the existing `state` label.
4. Reconcile the two 段琮 records and validate Scenes 1.12–1.18.
5. Classify every R1 match in the copy as `exception-candidate` or
   `prohibited`; record approved candidates in a per-occurrence exception
   ledger and produce, but do not apply, a diff for prohibited uses.
6. Diff `prose/` against `chapters/` at the scene/chapter map boundary and ask
   which approved changes are authoritative.
7. Run audit-state and export-state checks in the copy; present the final diff
   before any real-work write.

---

# 分发与 `free-stats` 兼容提案

日期：2026-09-10
状态：审美规则已确认；迁移仍仅为提案——未执行安装、分发发布或真实作品修改

## 结论

Pi 的实际加载面是 `/Users/quentin/.pi/agent/skills/` 下指向
`quentin-skills` 的符号链接，并非本仓库未跟踪的 `dist/` RC。当前安装、
本仓库主源码和 Pi RC 三者哈希均不同；RC 还缺少本次新增的审查与导出判定
脚本。因此，在明确安装／发布目标前，应保留三者现状，不能自动覆盖。

`free-stats` 的现有审查只能证明第一幕 1.1–1.19 的局部结果，不能证明整部
计划作品通过。生命周期字段互相冲突；段琮存在陈旧且重复的状态记录；
`chapters/` 比源场景更新，且体量不同，应视为可能包含独立批准修改的派生产物。
这些内容只能先在副本中迁移并展示差异。

作者已确认：R1 继续作为默认禁止规则，但允许逐条批准的“对照／感知校正”
表达作为明确例外。例外必须同时满足：两侧都是场景内可观察事实；用于纠正即时
感知或建立必要的具体区别；删除后会损失事实或感官精度；并记录源路径、内容哈希、
理由、批准者和批准日期。单条例外不自动授权其他相似句式。抽象翻转、主题宣告、
叙述者解释、情绪总结和重复对照脚手架仍受 R1 禁止。

下一步仍需单独授权：在 `free-stats` 副本中建立逐条例外台账并生成差异；确认前
不修改真实作品。
