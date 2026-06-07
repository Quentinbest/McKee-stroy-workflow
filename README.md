# McKee Story Workflow

[![简体中文](https://img.shields.io/badge/语言-简体中文-red)](README.md)
[![English](https://img.shields.io/badge/Language-English-blue)](README_EN.md)

一个稳定、原生支持 McKee 方法论的 Skill + Role 框架，可通过 Claude Code、
Cursor、Pi、OpenCode 和 Codex 完成故事策划、起草、审计、修订与导出。

当前版本：**1.0.0**（`v1.0.0`）。

> **注意：**仓库名称 `McKee-stroy-workflow` 中存在拼写错误
>（`stroy` -> `story`）。远程 URL 仍沿用该拼写；可在方便时重命名 GitHub
> 仓库并更新本地 clone 的 remote。

本项目基于 Robert McKee 的 *Story* 方法论。规范实施计划位于
`mckee-story-workflow-cross-harness-agent-implementation-plan.md`。

## 发布状态

- 跨 Harness 实施计划的 Phase 0-10 已全部完成。
- 34 个 Skill、27 个 Role 和 15 个故事产物契约全部通过验证。
- 25 个确定性 Harness/场景 Pilot 全部通过。
- Pi、OpenCode 和 Codex 原生 Pilot 通过；Claude Code 和 Cursor 使用仓库中
  已记录并获批的能力例外。
- 安全、漂移、Clean Checkout、生命周期和发布治理检查全部通过。
- 文学质量与运营可用性的授权人工评审已批准。
- 外部发布仍需单独审批。

机器可读证据位于 `reports/acceptance-audit.json`、
`reports/release-evidence.json` 和 `reports/human-release-review.json`。

## 架构

规范 Skill 和 Role 位于 `src/`。Harness 发现文件会生成到 `.agents/`、
`.claude/`、`.cursor/` 和 `.opencode/`；请勿手动编辑这些生成文件。基线采用
单 Agent、离线执行模式。原生 Subagent、Critic、Hook、Extension 和 Plugin
均为可选加速能力。

```text
AGENTS.md              通用执行与安全规则
src/skills/            规范方法论与生命周期 Skill
src/roles/             规范且边界明确的专家 Role
src/artifacts/         版本化故事产物契约
src/control-plane/     生命周期与编排契约
src/templates/         规范故事项目模板
.agents/               Cursor、Pi 和 Codex 共用的 Adapter
.claude/               Claude Code Skill、Role 与局部规则
.cursor/               Cursor 项目规则
.opencode/             OpenCode Role Adapter
scripts/               生成、验证、证据与发布工具
tests/                 契约、集成、E2E 与安全测试
```

修改框架前，请先阅读 `AGENTS.md` 和 `docs/agent/README.md`。必须先修改规范
文件，再运行 `npm run agents:sync`；直接编辑生成的 Adapter 会导致漂移验证
失败。

## 快速开始

环境要求：

- Git
- Node.js 20 或更高版本
- 本地已检出
  [LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story)

```bash
git clone https://github.com/Quentinbest/McKee-stroy-workflow.git
cd McKee-stroy-workflow

export MCKEE_WIKI_ROOT=/absolute/path/to/LLM-Wiki-Story
npm run agents:verify
```

基线工具没有第三方运行时依赖，无需执行 package install。

开始创作时，请让当前 Harness 使用 `story-new` 处理故事种子：

```text
使用 story-new 处理以下故事种子：
“一位钟表匠造出了会倒着走的钟。”
```

随后依次使用 `story-premise`、`story-spine`、`story-cast`、`story-act`、
`story-scene`、`story-audit`、`story-revise` 和 `story-publish`。可随时使用
`story-status` 查看生命周期状态。

## Harness 支持

| Harness | 根级指导文件 | Skill | 原生 Role |
|---|---|---|---|
| Claude Code | `CLAUDE.md` -> `AGENTS.md` | `.claude/skills/` | `.claude/agents/` |
| Cursor | `AGENTS.md`、`.cursor/rules/` | `.agents/skills/` | 单 Agent 回退 |
| Pi | `AGENTS.md` | `.agents/skills/` | 单 Agent 回退 |
| OpenCode | `AGENTS.md`、`opencode.jsonc` | `.agents/skills/` | `.opencode/agents/` |
| Codex | `AGENTS.md`、`.codex/config.toml` | `.agents/skills/` | 单 Agent 回退 |

等价支持是指各 Harness 具有相同目标、规范输入、必需产物、验收标准、安全
边界和可比验证证据，并不要求它们提供完全相同的可选委派功能。

---

## Skill

### 方法论 Skill（`/mck-*`）

生成的 Adapter 会让各受支持 Harness 发现这些 Skill。

**V1 - 核心**

| Skill | 用途 |
|---|---|
| `mck-subtext-5layer` | 以五层结构创作对白（Wound -> Want -> Fear -> Tactic -> Text），是最重要的单项 Skill |
| `mck-controlling-idea` | 锻造故事的“价值 + 原因”句式 |
| `mck-beat-to-prose` | 将 Beat Sheet 转化为成熟正文 |
| `mck-crisis-dilemma` | 将艰难选择强化为真正的两难困境 |
| `mck-arc-walk` | 沿 Story Spine 映射角色弧光 |
| `mck-gap-find` | 在任意 Beat 或 Scene 中寻找 Gap（预期与结果之间的差距） |

**V2 - 长篇与打磨**

| Skill | 用途 |
|---|---|
| `mck-image-thread` | 盘点意象、审计节奏、验证 Key Image 位置并设计新增植入 |
| `mck-setup-payoff` | 构建设置-回报台账，发现悬空设置和无依据回报 |
| `mck-specificity-forge` | 扫描泛化语言，并从 World Bible 中锻造具体细节 |
| `mck-voice-first` | 起草前锁定 Voice Anchor，生成 `voice-anchors.md` |
| `mck-exposition-ammo` | 将信息堆砌转化为“作为弹药的说明”，让每条信息在冲突中发挥作用 |
| `mck-negation-of-negation` | 将核心价值推至 Corner 4（正向价值的腐化），检验 Crisis 深度 |

**V3 - 追求卓越**

| Skill | 用途 |
|---|---|
| `mck-honesty` | Honesty Engine：根据作者的 Truth Library 对 Controlling Idea 执行 TEST / STRESS / REPAIR，区分扎实观念与空洞口号 |
| `mck-surprise-plant` | 惊奇架构：DESIGN（误导计划）、PLANT（双重解读植入）、AUDIT（调用 `surprise-auditor`） |
| `story-tournament` | 对 CONTROLLING-IDEA / INCITING-INCIDENT / PROTAGONIST / CRISIS / CLIMAX 进行锦标赛式生成，强制多样性并盲评 |

### 工作流 Skill（`/story-*`）

覆盖从故事种子到 Manuscript 的完整生命周期。

| Skill | 用途 |
|---|---|
| `story-new` | 从任意种子开始新项目，如梦境、画面、新闻或情绪 |
| `story-status` | 显示已锁定内容和下一步的状态面板 |
| `story-premise` | 生成并锁定 Premise Card |
| `story-spine` | 构建故事骨架（Inciting Incident -> Crisis -> Climax） |
| `story-cast` | 将完整角色阵容设计为压力系统 |
| `story-act` | 规划单个 Act 的 Scene 序列 |
| `story-scene` | 起草或修订单个 Scene，是最常用的 Skill |
| `story-audit` | 运行完整 McKee Critic 套件 |
| `story-revise` | 多轮修订编排器 |
| `story-publish` | 最终组装并导出 Manuscript |

### 重构后的 Skill（原 Agent）

| Skill | 用途 |
|---|---|
| `arc-tracer` | 在主上下文中迭代规划角色弧光 |
| `act-designer` | 设计 Act 结构与节奏 |
| `exposition-smuggler` | 将信息堆砌转化为“作为弹药的说明” |
| `key-image-curator` | 识别 Key Image 并将其贯穿故事 |
| `composition-conductor` | 跨 Scene 工艺审计，包括节奏、设置和意象线索 |
| `controlling-idea-architect` | 使用 FORGE / STRESS-TEST / TRACE / REPAIR 模式锻造或审计 Controlling Idea |
| `wiki-librarian` | 在主上下文中执行 McKee Wiki 的 INGEST / LINT / MIGRATE / REGEN，支持双语 |

### 基础设施 Skill

| Skill | 用途 |
|---|---|
| `story-stop-loss` | Stop-loss 收敛协议，包括迭代上限、三次失败升级和回退深度限制 |
| `story-persona` | Author Persona 的 FORGE / LOAD / APPLY 模式，为所有审美选择提供决策过滤器 |
| `story-tournament` | 对高风险创意决策执行锦标赛式生成，也列于 V3 方法论 Skill |

---

## Role

规范 Role 契约会生成 Claude 和 OpenCode 原生 Role Adapter。所有 Role 也支持
单 Agent 回退。

### Generator Agent（生成产物）

- `premise-prospector` - 生成五个候选 Premise
- `character-forger` - 生成包含 True Character 与 Dimensions 的 Character File
- `structure-skeleton` - 生成 Spine 文档
- `scene-architect` - 生成 Scene Card
- `beat-miner` - 生成 Beat Sheet
- `prose-drafter` - 根据 Beat Sheet 生成长篇正文

### Critic Agent（以全新视角审计）

- `cliche-hunter` - 审查陈词滥调与类型惯例
- `antagonism-stress-tester` - 审查对抗力量平衡
- `crisis-climax-auditor` - 审查 Dilemma 真实性与 Climax 因果关系
- `subtext-whisperer` - 审查 Text、Subtext 与 Desire 是否各不相同
- `continuity-supervisor` - 审查世界规则、角色知识和物理连续性
- `tournament-judge` - 对 N 个候选方案进行盲评
- `voice-drift-detector` - 根据 Voice Anchor 审查逐行声音一致性
- `specificity-auditor` - 结合 World Bible 标记泛化名词与动词
- `reader-simulator` - 盲读并生成参与度曲线和困惑点
- `pacing-analyst` - 审查 Scene 长度、节奏分布和收益递减规律
- `surprise-auditor` - 将首次阅读与误导计划交叉比对，验证双重解读植入和 Climax 重读效果

### Specialist Agent

- `cast-balancer` - 生成角色压力矩阵
- `genre-cartographer` - 生成 Genre Contract
- `setting-surveyor` - 设计四维 Setting 与世界规则
- `wiki-librarian` - 维护 McKee Wiki

---

## 使用方式

开始或恢复故事：

```text
使用 story-new：“我梦见一位钟表匠造出了会倒着走的钟。”
使用 story-status 查看当前项目。
```

处理单个 Scene：

```text
使用 story-scene，根据已锁定的 Scene Card 和 Beat Sheet 起草 Scene 2.3。
```

为对白应用 Subtext 纪律：

```text
对 Scene 2.3 中的对峙使用 mck-subtext-5layer。
```

运行完整 Critic 套件：

```text
对当前完整草稿使用 story-audit。
```

部分支持 Slash Command 的 Harness 也可接受 `/story-new` 或 `/story-audit`
等形式；通过自然语言选择 Skill 是可跨 Harness 移植的方式。

## 开发与验证

常用命令：

```bash
# 重新生成所有已提交的 Harness Adapter。
npm run agents:sync

# 当生成文件与规范源不一致时失败。
npm run agents:check-drift

# 运行契约、安全、Conformance、生命周期、人工评审和发布检查。
MCKEE_WIKI_ROOT=/absolute/path/to/LLM-Wiki-Story npm run agents:verify

# 运行单个 Harness 的发现 Smoke Check。
npm run agents:smoke:codex
```

仓库支持离线确定性验证。原生模型执行属于独立证据，不会静默替代确定性基线。

## 安全边界

- 外部 Wiki 为只读依赖，通过 `MCKEE_WIKI_ROOT` 解析。
- 除非明确纳入任务范围，否则禁止访问私人 Manuscript、凭据和未发布 Persona。
- 破坏性操作、权限升级和外部披露需要明确批准。
- 故事外部发布与框架版本发布是不同的审批事项。
- 必须保留 Dirty Worktree 中已有的用户改动。

详见 `docs/agent/safety-and-permissions.md` 和
`config/security-policy.json`。

## 架构决策

**Skill 是主干，Agent 是边界明确的执行单元。**

- Skill 在主上下文中运行：可见、可迭代、可组合、可移植。
- Role 是用于隔离生成、对抗式评审或重读取分析的边界工作单元。
- 每个 Role 都有单 Agent 顺序执行回退方案。

已实现架构详见 `docs/agent/architecture.md`；完整设计理由与验收模型详见规范
实施计划。

## 文档

- `AGENTS.md`：通用 Agent 策略
- `docs/agent/README.md`：规范上下文索引
- `docs/agent/repository-map.md`：路径所有权
- `docs/agent/development-workflow.md`：贡献工作流
- `docs/agent/testing-and-verification.md`：测试策略
- `docs/agent/harness-compatibility.md`：Harness 能力
- `docs/agent/current-state.md`：当前发布状态
- `CHANGELOG.md`：发布历史

---

## 理论基础

Robert McKee，*Story: Substance, Structure, Style and the Principles of
Screenwriting*（1997）。

本系统查询的 McKee Wiki 位于
[LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story)。
