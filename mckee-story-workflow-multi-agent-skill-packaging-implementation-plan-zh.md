# McKee Story Workflow：多 Agent Skills 安装包实施计划

> **文档角色：** 多 Agent Skills 产品化、打包、安装和发布的执行基线  
> **主要读者：** 框架维护者、Claude Code / Codex / Cursor / OpenCode / Pi 适配负责人、测试人员、发布审核人  
> **状态：** Engineering Review Complete  
> **版本：** 1.1  
> **日期：** 2026-06-08  
> **上游架构：** [Cross-Harness AI Agent Implementation Plan](./mckee-story-workflow-cross-harness-agent-implementation-plan.md)  
> **约束：** 本计划不构成外部发布、依赖安装、私有作品访问或 Wiki 写入授权

## 0. 工程审查锁定决策

本节记录 2026-06-08 `/plan-eng-review` 已确认的实施边界。后文如有歧义，以本节为准。

1. 使用各宿主原生 plugin/package 管理；自定义工具只负责 `build`、`inspect`、
   `verify` 和 OpenCode overlay，不实现跨宿主统一安装器。
2. 首个纵向 pilot 只覆盖 `mck-gap-find` 和 `mck-setup-payoff`，目标宿主为
   Claude Code 和 OpenCode。
3. Codex v1 只发布 Skills；specialist Roles 使用 in-context fallback，不安装
   `.codex/agents` overlay。
4. 发行版收敛为 `core`、`workflow`、`wiki-maintainer` 三种。
5. `core` 与 `workflow` 均自包含但互斥；同一 scope 共存时验证失败。
6. 普通发行版必须离线完整运行；外部 Wiki 仅为显式可选增强。
7. 复用现有 `lifecycle.json` 作为故事项目和 artifact 路径的唯一事实来源。
8. Universal package 仅是内存或临时 normalized `PackageModel`，不是发布产物。
9. 权限声明必须标记 `native`、`runtime` 或 `advisory` 执行等级，并有对应测试。
10. 只新增 canonical `src/distribution/packages.json`；依赖图、能力矩阵和权限报告均生成。
11. 增量扩展现有 generator；pilot 阶段最多新增四个生成模块。
12. Pilot 保留现有 canonical frontmatter 和 inline contract，由 generator 投影为宿主格式。
13. Skill resources 按长度、复用和运行时需求提取，不创建机械目录模板。
14. Phase 4 建立跨平台 RC build workflow；stable marketplace 发布保留人工审批。
15. 测试分为 `node:test`、LLM eval 和 native E2E，并要求错误消息可见、可恢复。
16. CI 分为 PR fast gate、nightly/manual RC 和 release gate。
17. LLM eval 设置分层、并发上限、预算上限和安全失败 fail-fast。

## 1. 执行结论

本项目应将现有 34 个 Skills 产品化为：

1. 一个由 canonical source 构建的 normalized `PackageModel`。
2. 五套从同一 `PackageModel` 确定性生成的宿主安装包：
   - Claude Code plugin
   - Codex plugin
   - Cursor plugin
   - OpenCode skills/agents overlay
   - Pi package
3. 三个面向不同用户风险和能力需求的发行版：
   - `core`
   - `workflow`
   - `wiki-maintainer`

不能维护五份手写 `SKILL.md`。`src/skills/`、`src/roles/`、`src/templates/`
和新增的发行清单必须继续作为唯一 canonical source；所有安装包均由脚本生成，并通过
source hash、manifest、契约测试和宿主 smoke test 防止漂移。

### 1.1 最终产品模型

```text
Canonical source
    |
    +-- Validate + normalize
            |
            v
       PackageModel
            |
            +-- Claude Code plugin / marketplace
            +-- Codex plugin
            +-- Cursor plugin / marketplace
            +-- OpenCode skills + agents overlay
            +-- Pi npm/git package
```

### 1.2 关键判断

| 判断 | 结论 |
|---|---|
| Skills 是否可以跨 Agent 共用 | 可以，基础格式已经趋同于 Agent Skills |
| 34 个 Skills 是否可以原样发布 | 不可以，30 个仍依赖固定故事项目路径，26 个包含 Agent 语义 |
| Roles 是否可以统一成一种安装格式 | 不可以，宿主支持时生成原生 agent，否则使用 in-context fallback |
| 是否需要自建运行时服务 | 基线不需要 |
| 是否需要 MCP | 基线不需要；未来仅作为可选增强 |
| 是否应默认安装 `wiki-librarian` | 不应，它是高权限独立包 |
| 是否应直接发布到公共 marketplace | 不应，必须先完成许可、隐私、安全和原生验证 |

## 2. 目标、非目标与假设

### 2.1 目标

- 让用户可以通过宿主原生机制安装、升级和卸载 Skills，并由项目工具构建和验证产物。
- 保证同一 Skill 在不同宿主中具有等价输入、输出、质量门槛和副作用边界。
- 支持宿主原生的用户级和项目级安装。
- 在支持原生 subagent 的宿主中安装专家 Roles。
- 在不支持或未启用 subagent 的环境中提供确定的同上下文降级。
- 保持 Node.js 20+、离线、无第三方运行时依赖的基础验证能力。
- 为安装包生成 checksum、SBOM 风格文件清单、来源版本和卸载清单。
- 不把私有故事、作者人格、凭证或外部 Wiki 内容打入安装包。

### 2.2 非目标

- 强迫五个宿主暴露完全相同的 UI、命令名或 Agent 调度方式。
- 在第一版中开发自定义 MCP Server。
- 让安装脚本自动修改用户 shell 配置、权限、模型或认证配置。
- 实现跨宿主统一安装、更新和卸载状态机。
- 自动下载、修改或重新分发完整 McKee Wiki。
- 将 `wiki-librarian` 的写权限混入普通创作包。
- 用宿主特有功能改变 canonical Skill 的验收标准。

### 2.3 实施假设

- canonical Skills 继续位于 `src/skills/`。
- canonical Roles 继续位于 `src/roles/`。
- 项目基线运行环境为 Node.js 20 或更高版本。
- 宿主能力会变化，因此官方规范快照必须带核验日期。
- 公开发布前需要单独完成许可证、商标和内容授权审查。
- 安装行为必须显式执行；仅生成包不等于已安装。

## 3. 当前基线审计

### 3.1 已有能力

- 34 个 canonical Skills。
- 27 个 canonical Roles。
- 3 个故事项目模板。
- Skill、Role、Artifact、Delegation 等 JSON Schema。
- `.agents/skills/` 和 `.claude/skills/` 生成能力。
- Claude Code 和 OpenCode Role adapter 生成能力。
- 五宿主 smoke 命令。
- source version、source hash 和 generated manifest。
- 完整的安全、任务、验证、回滚和人类审核制度。

### 3.2 当前耦合

2026-06-07 静态审计结果：

| 指标 | 数量 |
|---|---:|
| Skills 总数 | 34 |
| `SKILL.md` 总行数 | 5509 |
| 依赖固定项目路径或生命周期文件 | 30 |
| 包含 Agent、spawn、delegate 等委派语义 | 26 |
| 直接引用 Wiki | 4 |
| Roles | 27 |

这些数字说明：

- 文件格式已经可移植。
- 运行时语义仍然与当前仓库结构和 Claude 风格委派耦合。
- 现有生成器解决了“放到哪里”，没有完整解决“如何运行”。
- 第一阶段必须先建立依赖图和 capability fallback，再发布安装包。

### 3.3 当前生成器的不足

`scripts/lib/generator.mjs` 当前主要执行：

- 将 canonical Skill 复制到 `.agents/skills/`。
- 将相同内容复制到 `.claude/skills/`。
- 将 Roles 转换到 `.claude/agents/` 和 `.opencode/agents/`。
- 添加 source hash 和 generator metadata。

缺少：

- edition 选择。
- 宿主特有 frontmatter 映射。
- references/scripts/assets 的递归复制。
- Skill 依赖闭包。
- Role 原生与 fallback 映射。
- 包 manifest、checksum 和发布 archive。
- Codex、Cursor、Pi 的原生发行格式。
- 安装后原生发现验证。

## 4. 官方规范基线

本节结论核验于 **2026-06-07**。实施时应把核验日期和链接写入
`docs/agent/compatibility-ledger.md`。

### 4.1 Agent Skills 开放规范

Agent Skills 规范要求：

- 每个 Skill 是一个目录。
- 必须包含 `SKILL.md`。
- frontmatter 至少包含 `name` 和 `description`。
- 可选目录包括 `scripts/`、`references/`、`assets/`。
- `name` 最长 64 个字符，使用小写字母、数字和单连字符，并匹配目录名。
- `description` 最长 1024 个字符。
- 推荐 `SKILL.md` 小于 500 行。
- 文件引用应使用相对于 Skill 根目录的路径。
- `allowed-tools` 仍是实验字段，不能作为跨宿主安全边界。

来源：[Agent Skills Specification](https://agentskills.io/specification)

### 4.2 Claude Code

官方能力：

- 项目 Skill：`.claude/skills/<name>/SKILL.md`。
- 用户 Skill：`~/.claude/skills/<name>/SKILL.md`。
- 项目 subagent：`.claude/agents/`。
- 用户 subagent：`~/.claude/agents/`。
- plugin 可同时包含 `skills/`、`agents/`、hooks、MCP 和其他组件。
- plugin 使用 `.claude-plugin/plugin.json`。
- marketplace 支持安装、更新、卸载和用户/项目/local scope。
- plugin Skill 使用命名空间，降低全局命令冲突。

来源：

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents](https://code.claude.com/docs/en/subagents)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)

### 4.3 Codex

官方能力：

- 项目 Skill：从当前目录向仓库根扫描 `.agents/skills/`。
- 用户 Skill：`~/.agents/skills/`。
- Skill 采用渐进披露。
- 初始 Skill 列表约受模型上下文 2% 或未知上下文下 8000 字符预算限制。
- plugin 是可复用 Skills 的推荐发行单元。
- plugin 使用 `.codex-plugin/plugin.json`，Skills 位于 plugin 的 `skills/`。
- 项目 custom agents 位于 `.codex/agents/*.toml`。
- 用户 custom agents 位于 `~/.codex/agents/*.toml`。
- subagent 当前只在用户显式要求时生成。
- custom agent 可设置 `sandbox_mode`、模型、MCP 和 Skill 开关。

来源：

- [Codex Agent Skills](https://developers.openai.com/codex/skills)
- [Codex Plugins](https://developers.openai.com/codex/plugins)
- [Build Codex Plugins](https://developers.openai.com/codex/plugins/build)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Codex Permissions](https://developers.openai.com/codex/permissions)

### 4.4 Cursor

官方能力：

- 从 2.4 起支持 Agent Skills 和 custom subagents。
- 项目 Skill 推荐使用 `.cursor/skills/<name>/SKILL.md`。
- plugin 可包含 Skills、subagents、rules、hooks 和 MCP。
- plugin 使用 `.cursor-plugin/plugin.json`。
- marketplace 安装命令为 `/add-plugin`。
- Skills 可自动匹配，也可通过 slash command 显式调用。

来源：

- [Cursor Agent Skills](https://cursor.com/docs/context/skills)
- [Cursor 2.4: Subagents and Skills](https://cursor.com/changelog/2-4)
- [Cursor 2.5: Plugins](https://cursor.com/changelog/2-5/)
- [Cursor Official Plugin Repository](https://github.com/cursor/plugins)
- [Cursor Marketplace](https://cursor.com/marketplace)

注意：Cursor 在 2026 年仍出现过 `.agents/skills` 发现和注入差异。因此第一版安装包
应以 `.cursor/skills` 或 Cursor plugin 为主要路径，把 `.agents/skills` 仅作为兼容
fallback，并通过真实版本 smoke test 验证。

### 4.5 OpenCode

官方能力：

- 原生发现 `.opencode/skills/`、`.claude/skills/` 和 `.agents/skills/`。
- 用户级发现 `~/.config/opencode/skills/`、`~/.claude/skills/` 和
  `~/.agents/skills/`。
- custom agents 位于项目 `.opencode/agents/` 或用户
  `~/.config/opencode/agents/`。
- Skills 由原生 `skill` tool 按需加载。
- 可以按 Skill 名称配置 `allow`、`ask`、`deny`。
- Agent 可分别配置 Skill 权限和文件/命令权限。

来源：

- [OpenCode Agent Skills](https://opencode.ai/docs/skills/)
- [OpenCode Agents](https://opencode.ai/docs/agents/)
- [OpenCode Permissions](https://opencode.ai/docs/permissions/)

### 4.6 Pi

官方代码仓库文档说明：

- 用户 Skill：`~/.pi/agent/skills/` 或 `~/.agents/skills/`。
- 项目 Skill：`.pi/skills/` 或 `.agents/skills/`。
- 可通过 `--skill` 显式加载。
- 支持 Agent Skills 格式及 `/skill:<name>`。
- Pi package 可以通过 npm 或 Git 安装。
- `package.json` 可声明 package 中的 Skills。
- extension 具备完整系统能力，风险高于纯 Skills。

来源：

- [Pi Skills](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)
- [Pi Coding Agent README](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md)
- [Pi SDK Skills Example](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/sdk/04-skills.ts)

## 5. 发行版设计

每个宿主均生成以下发行版。发行版是自包含集合，不依赖用户先安装另一个发行版。
`core` 与 `workflow` 在同一宿主 scope 中互斥；验证工具检测到共存时必须失败，并提供
替换说明。

### 5.1 `core`

用途：只需要 McKee 创作方法，不需要完整故事项目生命周期的用户。

目标包含 20 个 craft Skills：

- `act-designer`
- `arc-tracer`
- `composition-conductor`
- `controlling-idea-architect`
- `exposition-smuggler`
- `key-image-curator`
- `mck-arc-walk`
- `mck-beat-to-prose`
- `mck-controlling-idea`
- `mck-crisis-dilemma`
- `mck-exposition-ammo`
- `mck-gap-find`
- `mck-honesty`
- `mck-image-thread`
- `mck-negation-of-negation`
- `mck-setup-payoff`
- `mck-specificity-forge`
- `mck-subtext-5layer`
- `mck-surprise-plant`
- `mck-voice-first`

发布前要求：

- 不要求 `drafts/{slug}` 存在。
- 可对用户提供的文本直接返回结构化分析。
- 项目写入必须是可选行为。
- 不要求原生 Agent。

### 5.2 `workflow`

用途：使用完整故事生命周期，但接受单 Agent / in-context 执行。

包含：

- `core` 的 20 个 Skills。
- 13 个 `story-*` Skills：
  - `story-act`
  - `story-audit`
  - `story-cast`
  - `story-new`
  - `story-persona`
  - `story-premise`
  - `story-publish`
  - `story-revise`
  - `story-scene`
  - `story-spine`
  - `story-status`
  - `story-stop-loss`
  - `story-tournament`
- 故事项目模板和 artifact schema。
- 27 个 Roles 的只读 reference cards，用于 in-context fallback。

不注册原生 specialist agents。

宿主支持原生 specialist agents 时，`workflow` 包可包含对应 Role adapters；否则必须
包含等价的 reference-card fallback。原生能力差异不再形成额外 edition。

### 5.3 `wiki-maintainer`

用途：维护外部双语 McKee Wiki。

包含：

- `wiki-librarian`。
- Wiki 操作 references。
- 必要的确定性脚本。
- 独立权限说明和显式写入确认流程。

要求：

- 不作为 `core` 或 `workflow` 的依赖。
- 默认不授予 Wiki 写权限。
- 安装不等于授权。
- 每次写操作仍必须满足目标仓库的任务范围和审批规则。

## 6. 统一包架构

### 6.1 新增 canonical 发行清单

```text
src/
├── skills/
├── roles/
├── templates/
├── prompts/
└── distribution/
    └── packages.json
```

`packages.json` 只声明 package ID、edition、成员 Skills、是否包含原生 Roles、互斥包
和发布目标。Skill/Role 依赖继续来自现有 inline contracts 与
`src/dependency-graph.json`；安全意图来自 `config/security-policy.json`；宿主能力来自
adapter code。它们被组合成生成报告，不再维护平行的手写 JSON。

### 6.2 Skill resources 规则

```text
src/skills/<skill-id>/
├── SKILL.md
├── references/   # 仅离线方法摘要或运行时必需资料
├── assets/       # 仅 Skill 运行时直接使用的模板
└── scripts/      # 仅确定性、离线、可审计的 helper
```

提取门槛：

- `SKILL.md` 超过 300 行或约 5000 tokens 时才考虑拆分。
- 两个以上 Skills 共用的内容进入 `src/prompts/` 或 `src/templates/`。
- eval fixtures 统一放在 `tests/`，不在 34 个 Skill 目录复制测试框架。
- 普通发行版内置经许可的最小方法摘要，保证无 Wiki 时离线完整运行。

### 6.3 Normalized `PackageModel`

Universal package 不作为可安装或公开发行产物。构建器在内存或临时目录创建 normalized
`PackageModel`，五个宿主 adapter 从同一模型生成：

```text
canonical Skills/roles/templates
            |
            v
validate + normalize
            |
            v
PackageModel (memory/temp)
   |       |       |       |       |
Claude   Codex   Cursor  OpenCode   Pi
```

### 6.4 产物 manifest

新增 `schemas/install-package.schema.json`，至少包含：

```json
{
  "schemaVersion": 1,
  "packageId": "mckee-story-workflow",
  "version": "1.1.0",
  "edition": "workflow",
  "target": "codex",
  "sourceCommit": "<git-sha>",
  "generatorVersion": "2.0.0",
  "skills": [],
  "roles": [],
  "resources": [],
  "permissions": {
    "network": { "intent": "deny", "enforcement": "runtime" },
    "externalWrite": { "intent": "deny", "enforcement": "native" },
    "publication": { "intent": "deny", "enforcement": "advisory" }
  },
  "files": [],
  "conflicts": ["mckee-story-core"]
}
```

每个 `skills[]` 项必须声明：

- canonical ID。
- installed name。
- source path 和 source hash。
- package edition。
- required/optional Skill 依赖。
- required/optional Role 依赖。
- required artifact 类型。
- path mode：`none`、`optional-project`、`required-project`。
- delegation mode：`none`、`optional`、`required-with-fallback`。
- side effects。
- network requirement。
- runtime resources。
- fallback strategy。
- 权限执行等级：`native`、`runtime` 或 `advisory`。

`advisory` 不得被描述为已强制执行。每个高风险权限必须有宿主配置或 runtime refusal
测试；无执行机制时必须在文档和验证报告中明确暴露。

## 7. Canonical Skill 改造

### 7.1 Frontmatter 标准化

Pilot 期间保留现有 canonical frontmatter 和 inline contract。生成器在输出阶段将其
投影为开放规范和宿主字段：

```yaml
---
name: story-scene
description: Draft or revise a story scene...
license: SEE-LICENSE-IN-LICENSES.md
compatibility: Works in Agent Skills hosts; full workflow requires a story project.
metadata:
  mckee.id: story-scene
  mckee.version: "1.1.0"
  mckee.contract-version: "1.0.0"
  mckee.edition: workflow
---
```

处理原则：

- `name` 与目录名一致。
- `description` 前置最重要的触发词，控制长度。
- 输出包将 `id`、`version`、`contract-version` 映射到 namespaced metadata 或 manifest。
- `allowed-tools` 不作为跨宿主强制控制。
- inline `contract` 继续由现有 verifier 读取；源格式迁移是独立后续任务。

### 7.2 路径抽象

把固定 `drafts/{slug}` 依赖改为读取现有 `lifecycle.json` 的 artifact locator。

解析顺序：

1. 用户显式指定路径。
2. 当前目录或父目录中的 `lifecycle.json`。
3. 当前仓库 `drafts/*/lifecycle.json` 的唯一匹配。
4. 多个匹配时停止并要求用户选择。
5. 无项目时进入 standalone response 模式。

禁止 Skill 自行猜测绝对路径。`lifecycle.json` 继续作为项目位置、生命周期和 artifact
路径的唯一事实来源，不新增 `.mckee-story/project.json`。

### 7.3 委派抽象

canonical Skill 不直接写“使用 Claude Agent tool”。改用 capability ladder：

1. `native-specialist`：宿主已安装并允许目标 Role。
2. `isolated-review`：宿主提供通用 subagent，但没有专用 Role。
3. `in-context`：同一 Agent 按 Role reference card 顺序执行。

统一语义：

```text
invoke_specialist(
  role,
  inputs,
  allowed_paths,
  output_contract,
  verification
)
```

它是文档级能力接口，不要求第一版实现实际 API。

### 7.4 Resources 拆分

- 按第 6.2 节的阈值提取，不机械创建目录。
- 普通发行版必须包含经许可的最小方法摘要。
- 外部 Wiki 只作为可选增强；缺失时显示可见提示但不得降低基本可用性。
- 只有确定性、可离线、可审计的逻辑进入 `scripts/`。
- 引用深度不超过一层。

### 7.5 Trigger 预算

Codex 会限制初始 Skill 列表，因此建立以下预算：

- 单个 `description` 建议不超过 220 个字符。
- `core` 全部 descriptions 总量不超过 5000 个字符。
- `workflow` 的 33 个 Skill descriptions 总量不超过 7000 个字符。
- Role descriptions 不进入 Skills 列表。
- 自动触发高冲突的 Skills 必须增加排除语义。

## 8. 各宿主安装包

所有宿主安装包均由 `PackageModel` 生成。Claude、Codex、Cursor 和 Pi 使用宿主原生
plugin/package 安装、更新和卸载；OpenCode 使用项目生成的 overlay 目录和手动合并说明。

### 8.1 Claude Code

#### 发行格式

```text
dist/claude/<package-name>/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── <skill-id>/...
├── agents/                 # 仅 workflow 且宿主支持原生 Role 时生成
│   └── <role-id>.md
├── package-manifest.json
├── LICENSE
└── README.md
```

#### 定制规则

- `core` 不生成 `agents/`。
- `workflow` 可生成 27 个 subagents；宿主能力不可用时改用 Role reference cards。
- 审计型 Role 默认只读。
- 写入型 Role 默认不从 plugin 获得额外权限。
- Skill 命令采用 plugin namespace。
- `core` 与 `workflow` 同一 scope 共存时，verify/doctor 必须失败。

#### 安装与验证

开发验证：

```bash
claude --plugin-dir ./dist/claude/mckee-story-workflow
```

正式发行使用 Claude 原生 marketplace。验证必须证明 `/plugin` 可见、pilot Skill 可调用、
Role fallback 或原生 Role 可用，且未授权外部写入被拒绝。

### 8.2 Codex

#### 发行格式

```text
dist/codex/<package-name>/
├── .codex-plugin/
│   └── plugin.json
├── skills/
│   └── <skill-id>/...
├── package-manifest.json
├── LICENSE
└── README.md
```

#### 定制规则

- v1 只发布 plugin Skills。
- 不生成 `.codex/agents/*.toml` overlay。
- specialist Roles 始终通过 in-context fallback 执行。
- `agents/openai.yaml` 仅在官方 schema 要求或确有 UI metadata 价值时生成到对应 Skill
  子目录，不作为 Role 安装机制。
- subagent/custom-agent 原生安装作为后续 TODO，等待官方可靠包管理机制。

#### 安装与验证

安装使用 Codex 原生 plugin 流程。验证必须证明 Skills selector 可见目标 Skill、description
预算未超限、Role fallback 可执行，且父会话 sandbox 不被扩大。

### 8.3 Cursor

#### 发行格式

```text
dist/cursor/<package-name>/
├── .cursor-plugin/
│   └── plugin.json
├── skills/
│   └── <skill-id>/...
├── agents/                 # 仅 workflow 且 Cursor 当前 schema 支持时生成
│   └── <role-id>.md
├── rules/
│   └── mckee-story-workflow.mdc
├── package-manifest.json
├── LICENSE
└── README.md
```

#### 定制规则

- 使用 Cursor plugin 作为首选发行方式。
- 手动 fallback 使用 `.cursor/skills/`，不以 `.agents/skills/` 为唯一发现路径。
- `rules/` 仅包含短小的项目入口、安全和 artifact locator 说明。
- hooks 第一版默认不启用。
- plugin manifest 从 Cursor 官方 schema 和官方 scaffold 生成，不手写未验证字段。

#### 安装与验证

安装使用 `/add-plugin` 或 Cursor 官方 local plugin 流程。验证必须在真实 Cursor 版本中执行
正例调用，而不是只查询 Skills 列表。

### 8.4 OpenCode

#### 发行格式

```text
dist/opencode/<package-name>/
├── .agents/
│   └── skills/<skill-id>/...
├── .opencode/
│   └── agents/<role-id>.md   # 仅 workflow 且需要原生 Roles 时生成
├── opencode.fragment.json
├── package-manifest.json
├── LICENSE
└── README.md
```

#### 定制规则

- Skills 使用 `.agents/skills/`，保持与 Codex/Pi 的共享兼容。
- Roles 使用 `.opencode/agents/`。
- 审计 Role 配置只读或 `edit: deny`。
- `wiki-maintainer` 为独立 package，并将高风险权限设为 `ask` 或 runtime refusal。
- 不直接覆盖用户 `opencode.json`；只输出可审查的配置片段和合并说明。
- 未安装原生 Roles 时使用 reference-card fallback。

#### 安装与验证

OpenCode v1 overlay 通过项目工具构建和验证，但用户或维护者手动复制/合并。验证必须证明
`skill` tool 列出目标 Skills、`@<role>` 可调用目标 subagent、权限规则生效，且配置合并不
覆盖用户 provider/model 设置。

### 8.5 Pi

#### 发行格式

```text
dist/pi/<package-name>/
├── package.json
├── skills/
│   └── <skill-id>/...
├── references/
│   └── roles/<role-id>.md
├── package-manifest.json
├── LICENSE
└── README.md
```

#### 定制规则

- `package.json` 使用 Pi package 的 Skills 声明。
- 第一版不捆绑 executable extension。
- specialist Roles 使用 reference cards 和 in-context fallback。
- 原生 extension 支持作为后续独立、显式 opt-in 安全评估，不是 v1 基线。
- 所有 Skill 使用相对路径。
- 支持 npm 和 Git 两种安装源。

#### 安装与验证

```bash
pi install git:<owner>/<repo>@v1.1.0
pi install -l git:<owner>/<repo>@v1.1.0
```

验证必须证明 `pi list` 可见、`/skill:<name>` 可显式调用、自动发现正例通过、
`--no-skills` 生效，以及未 trust 的项目不读取项目 Skills。

## 9. Build / Inspect / Verify CLI

新增 dependency-free CLI，但不承担 Claude、Codex、Cursor 或 Pi 的安装、更新和卸载。

```bash
node scripts/mckee-skills.mjs <command> [options]
```

### 9.1 命令

```text
build      # 生成目标 package 或 RC artifact
inspect    # 展示 PackageModel、文件清单、权限执行等级和冲突
verify     # 验证 source hash、manifest、description 预算、edition 互斥和资源完整性
doctor     # 检查当前工作区是否出现 core/workflow 共存、宿主配置片段缺失等问题
```

OpenCode 可额外支持受限的 overlay helper：

```text
opencode-overlay --dry-run
opencode-overlay --write-project
```

该 helper 只能写项目内 `.agents/skills/`、`.opencode/agents/` 和配置片段；不得写用户
home 目录，不得修改全局配置。

### 9.2 示例

```bash
node scripts/mckee-skills.mjs build --target claude --edition workflow
node scripts/mckee-skills.mjs inspect --target opencode --edition core
node scripts/mckee-skills.mjs verify --target all --edition workflow
node scripts/mckee-skills.mjs doctor --scope project
```

### 9.3 安全规则

- 默认不写入宿主安装目录。
- 所有写操作必须先支持 `--dry-run`。
- 不修改 shell rc、Git config、认证文件、模型设置或用户 home 目录。
- 不自动执行 package 中的脚本。
- 不自动访问网络。
- OpenCode 配置输出为片段和说明，人工合并或受限 project write。

## 10. 生成器增量扩展

### 10.1 模块

在现有 `scripts/lib/generator.mjs` 上增量扩展。pilot 阶段最多新增：

```text
scripts/
├── mckee-skills.mjs
└── lib/
    ├── package-model.mjs
    ├── package-adapters.mjs
    ├── package-validation.mjs
    └── release-artifacts.mjs
```

只有当某个宿主 adapter 超过约 200 行或出现独立测试边界时，再拆成专用文件。

### 10.2 生成流程

1. 读取 `src/distribution/packages.json`。
2. 从现有 Skill/Role contracts、`src/dependency-graph.json`、安全策略和 adapter code
   生成 `PackageModel`。
3. 检测未知 Skill、重复 Skill、循环依赖、缺失资源、跨 edition 越界和 `core/workflow`
   共存。
4. 保留 canonical source 原格式，仅在输出阶段投影为 Agent Skills/宿主格式。
5. 应用宿主 adapter。
6. 生成 package manifest、checksums 和 provenance。
7. 在临时目录重复生成两次，验证幂等。
8. 输出兼容性、预算、权限执行等级和失败恢复报告。

### 10.3 新增 npm scripts

```json
{
  "scripts": {
    "skills:build": "node scripts/mckee-skills.mjs build --all",
    "skills:lint": "node scripts/mckee-skills.mjs verify --static",
    "skills:test:contracts": "node scripts/mckee-skills.mjs verify --contracts",
    "skills:test:pilot": "node scripts/mckee-skills.mjs verify --pilot",
    "skills:check-drift": "node scripts/mckee-skills.mjs verify --drift",
    "skills:verify:fast": "npm run skills:lint && npm run skills:test:contracts && npm run skills:test:pilot",
    "skills:verify": "npm run skills:verify:fast && npm run skills:build && npm run skills:check-drift"
  }
}
```

## 11. 测试与验证

### 11.1 静态测试

- Agent Skills frontmatter 合规。
- Skill 名称与目录名一致。
- descriptions 长度和总预算。
- 相对引用存在。
- 不允许绝对机器路径。
- 不包含凭证、私有作品或填充后的 Author Persona。
- 不允许普通包包含 Wiki 写入脚本。
- license 和 source provenance 完整。
- `core` 与 `workflow` 同一 scope 共存会失败。
- 普通包离线可运行，且不把外部 Wiki 作为必需依赖。
- 每个高风险权限声明 `native`、`runtime` 或 `advisory`。

### 11.2 契约测试

- 每个 Skill contract 完整。
- `src/distribution/packages.json` schema 合规。
- package dependency closure 完整。
- Role fallback 存在。
- artifact producer/consumer 对齐。
- side effects 与 permission profile 对齐。
- `wiki-maintainer` 不被其他 edition 隐式依赖。
- unknown/duplicate Skill ID、循环依赖、缺失 resource 均有负例。

### 11.3 生成测试

- 同输入生成相同字节。
- 全部 generated file 带 source hash。
- checksums 覆盖所有安装文件。
- RC archive 解包后与 manifest 一致。
- 五宿主 package 不包含未声明文件。
- 宿主 metadata 不污染 canonical source。

### 11.4 Locator 与失败恢复测试

用 `node:test` 覆盖：

- 用户显式 `lifecycle.json`。
- 当前目录或父目录 `lifecycle.json`。
- 唯一 `drafts/*/lifecycle.json`。
- 无项目进入 standalone。
- 多项目匹配输出用户可见选择提示。
- malformed `lifecycle.json` 输出恢复动作。
- artifact path escapes story root 被拒绝。
- missing artifact 输出下一步，例如先运行 `/story-spine` 或切换 standalone。

每个失败分支必须断言：

1. 结构化错误码。
2. 用户可见错误消息。
3. 可执行恢复动作。

### 11.5 Pilot Skill 行为 eval

Pilot 范围：

- `mck-gap-find`
- `mck-setup-payoff`

比较基线：

- 修改前 canonical Skill。
- 修改后宿主 projection。
- Claude Code native。
- OpenCode native。

`mck-gap-find` 至少覆盖：

- 2 个应触发正例。
- 2 个不应触发负例。
- 1 个缺少输入的失败例。
- 1 个输出结构质量评分。

`mck-setup-payoff` 至少覆盖：

- standalone 模式。
- lifecycle 项目模式。
- 多项目歧义。
- 缺少 artifact。
- specialist unavailable → in-context fallback。
- Wiki 不可用。
- 未授权写入拒绝。

主观文学质量由人类评分；结构、路径、文件、副作用和契约由程序检查。

### 11.6 原生宿主 smoke 与 E2E

| 宿主 | 最低原生证据 |
|---|---|
| Claude Code | plugin install/local load、Skill 调用、Role 调用、拒绝越权 |
| Codex | plugin Skill、Role fallback、sandbox 继承 |
| Cursor | marketplace/local plugin、editor、CLI、Skill、subagent |
| OpenCode | Skill tool、`@agent`、权限规则、配置合并 |
| Pi | `pi install`、`pi list`、`/skill:name`、project trust |

若宿主 CLI 或认证不可用，必须记录 capability exception，不能用文件存在性冒充原生通过。

### 11.7 验证分层与 eval 预算

```text
PR fast gate (<10 min)
├── schema/static/package model
├── pilot projection tests
├── permission classification
└── no native CLI / no LLM eval

Nightly / manual RC
├── full target matrix
├── cross-platform paths
├── native host smoke
└── pilot LLM eval

Release gate
├── all RC checks
├── checksums/provenance
├── human quality + license review
└── draft release approval
```

LLM eval 分层：

- PR：不跑 LLM eval。
- Pilot：2 Skills × 全案例 × Claude/OpenCode。
- Nightly：抽样 20% Skills + 全部高风险 Skills。
- Release：全 Skills、全案例、设定并发上限和预算上限。
- 任一 P0 安全、拒绝或隐私 eval 失败即中止。

## 12. 安全、隐私与许可

### 12.1 默认权限

| 能力 | 默认 |
|---|---|
| 读取当前故事项目 | 用户任务范围内允许 |
| 写当前故事项目 | workflow 按任务允许 |
| 读取外部 Wiki | 路径存在且任务需要时允许 |
| 写外部 Wiki | 拒绝；仅 wiki-maintainer + 显式授权 |
| 网络访问 | 拒绝 |
| 发布作品 | 拒绝 |
| 安装依赖 | 询问 |
| 执行 bundled scripts | 检查后、任务需要时执行 |
| 修改用户全局配置 | 仅显式 user scope |

### 12.2 供应链控制

- 发布 archive 包含 SHA-256。
- manifest 记录 source commit 和 generator version。
- 不提交 minified/opaque executable。
- scripts 必须是源码、短小、可审计。
- 不使用 install-time lifecycle scripts。
- Pi package 不在第一版包含 extension。
- marketplace 发布前运行 secret scan、path traversal test 和 archive inspection。
- 外部依赖必须固定版本并进入许可证清单；第一版应保持零运行时依赖。

### 12.3 许可门槛

公开发布前必须确认：

- 仓库代码和文档许可证。
- McKee 术语、引用和改写内容的可发行范围。
- 第三方示例、模板和 Wiki 内容是否允许再分发。
- package 名称、描述和视觉资源不存在商标误导。
- 隐私政策和 terms URL 是否为 marketplace 必需字段。

未完成审查时只允许内部、本地和私有仓库安装。

## 13. 分阶段实施路线

### Phase 0：决策冻结与任务拆分

目标：批准产品边界，避免实现过程中反复改变 package 模型。

交付物：

- ADR：多 Agent Skills 发行架构。
- 发行版清单。
- 许可审查 owner。
- 五宿主 owner。
- `TASK-2026-004` 及后续阶段任务。

验收：

- [ ] 批准三个 edition。
- [ ] 批准 plugin/overlay/package 的宿主策略。
- [ ] 明确 public release 是否在本轮范围内。
- [ ] 冻结 v1 package IDs。

回滚：删除未实施的任务和 ADR，不修改 canonical Skills。

### Phase 1：官方规范快照和兼容性契约

目标：把本文的网页研究转化为可维护的版本化兼容性记录。

交付物：

- 更新 `docs/agent/compatibility-ledger.md`。
- 每个宿主的 discovery、plugin、agent、permission、install scope 记录。
- Cursor 实际版本差异说明。
- Agent Skills spec 版本快照。

验收：

- [ ] 每个关键结论有官方链接和核验日期。
- [ ] 未验证字段不进入生成器。
- [ ] 记录变更监控和季度复核 owner。

验证：

```bash
npm run agents:lint
```

### Phase 2：Package 清单和依赖验证

目标：用最少 canonical 配置定义发行版，并从现有 contracts 生成依赖和能力报告。

交付物：

- `src/distribution/packages.json`。
- 新 schema 和 fixtures。
- 生成的依赖闭包、宿主能力和权限执行等级报告。

验收：

- [ ] 34 个 Skills 全部且仅出现一次于 package 分类。
- [ ] 27 个 Roles 全部有原生或 fallback 策略。
- [ ] 没有循环依赖。
- [ ] `wiki-librarian` 与普通 edition 隔离。
- [ ] `core` 与 `workflow` 互斥关系可被验证。

验证：

```bash
npm run agents:test:contracts
node scripts/mckee-skills.mjs verify --contracts
```

### Phase 3：纵向 Pilot 与 Canonical Skills 可移植化

目标：消除宿主和固定路径假设。

实施顺序：

1. 先改造 `mck-gap-find`、`mck-setup-payoff` 作为 pilots。
2. 用 Claude Code 和 OpenCode 完成 build → native install/load → invoke → cleanup。
3. Pilot 通过后分批完成 `core`。
4. 再完成 `workflow`。
5. 最后隔离 `wiki-librarian`。

交付物：

- 输出阶段 frontmatter 投影。
- artifact locator。
- capability ladder。
- 必要 references/assets。
- pilot eval baseline 和跨宿主 eval。

验收：

- [ ] `core` Skills 在无故事项目时可运行。
- [ ] workflow Skills 在无原生 Agent 时可运行。
- [ ] 没有 Claude-only 指令。
- [ ] 所有引用为包内相对路径或显式外部 dependency。
- [ ] 外部 Wiki 不可用时普通包仍离线可运行。
- [ ] 当前仓库现有 workflow 回归测试通过。

验证：

```bash
npm run agents:test:contracts
npm run agents:sync
npm run agents:check-drift
npm run agents:test
```

### Phase 4：PackageModel、生成器增量扩展和 RC 流水线

目标：先证明 `PackageModel`、两个 pilot 宿主产物和 RC build/release workflow 可复现。

交付物：

- package schema。
- `PackageModel` builder。
- manifest/checksum 生成。
- archive inspection。
- GitHub Actions RC build workflow。

验收：

- [ ] 三个 editions 的 `PackageModel` 可构建。
- [ ] 连续构建字节一致。
- [ ] 无未声明文件。
- [ ] 无绝对机器路径。
- [ ] archive 可离线验证。
- [ ] tag `vX.Y.Z-rc.N` 触发跨平台 build matrix。
- [ ] 成功时创建 GitHub Release draft；stable/marketplace 仍需人工审批。

验证：

```bash
npm run skills:build
npm run skills:lint
npm run skills:check-drift
```

### Phase 5：五宿主 adapters

目标：生成并静态验证五套原生 package。

实施顺序：

1. Claude Code。
2. OpenCode。
3. Codex。
4. Pi。
5. Cursor。

排序依据：

- Claude/OpenCode 与现有 adapters 最接近。
- Codex v1 只需 plugin Skills 和 fallback。
- Pi 需要 package manifest。
- Cursor 需要对快速变化的 plugin schema 做最后核验。

验收：

- [ ] 每个 target × edition 均可生成。
- [ ] manifest 符合宿主当前 schema。
- [ ] Skills 和 Roles 数量符合 edition。
- [ ] fallback 可用。
- [ ] 宿主特有 metadata 不污染 canonical source。

验证：

```bash
node scripts/mckee-skills.mjs build --all
npm run skills:test:contracts
```

### Phase 6：OpenCode Overlay 和 Doctor

目标：只为缺少 marketplace 的 OpenCode 提供受限 overlay helper，并提供跨宿主只读 doctor。

交付物：

- OpenCode overlay dry-run。
- OpenCode project write helper。
- core/workflow 共存检测。
- 权限执行等级报告。
- doctor 和 verify。

验收：

- [ ] 不写用户 home 目录。
- [ ] 不覆盖用户 `opencode.json`。
- [ ] 配置片段可审查。
- [ ] edition 共存明确报错。
- [ ] 所有失败都有用户可见消息和恢复动作。

验证：

```bash
npm run skills:verify:fast
```

### Phase 7：行为 eval 和安全测试

目标：证明 Skills 不仅能被发现，而且能正确触发并遵守边界。

交付物：

- pilot Skill 的 baseline 与跨宿主 eval fixtures。
- trigger benchmark。
- fallback equivalence fixtures。
- package security tests。
- 合成故事项目 E2E。

验收：

- [ ] pilot Skills 全部有正负例、缺失输入和项目/standalone 模式。
- [ ] 误触发率满足批准阈值。
- [ ] native/fallback 产物契约等价。
- [ ] 无私有数据和越权写入。
- [ ] stop-loss 生效。
- [ ] eval 有预算、并发和 fail-fast 规则。

验证：

```bash
npm run skills:verify
npm run agents:test:security
```

### Phase 8：原生安装 pilots

目标：在真实宿主中安装并执行，而非只检查文件结构。

场景：

1. Claude 安装 `core`，运行 `mck-gap-find` standalone。
2. OpenCode overlay 安装 `core`，运行 `mck-gap-find` standalone。
3. Claude 安装 `workflow`，运行 `mck-setup-payoff` lifecycle 项目模式。
4. OpenCode overlay 安装 `workflow`，运行 `mck-setup-payoff` lifecycle 项目模式。
5. 尝试未授权 Wiki 写入并确认拒绝。
6. 检测 `core/workflow` 共存并确认失败消息可恢复。

验收：

- [ ] Claude 和 OpenCode 完成真实安装或 overlay 与 Skill 调用。
- [ ] 两个 pilot Skills 都完成修改前 baseline 与修改后 native eval。
- [ ] Role fallback 在 `mck-setup-payoff` 中可用。
- [ ] 所有 capability exception 有 owner 和复核日期。

### Phase 9：文档、RC 与发布

目标：生成内部可安装 RC；公共发布仍需额外审批。

交付物：

- 宿主安装指南。
- edition 选择指南。
- 安全说明。
- 迁移指南。
- changelog。
- release archives。
- checksums。
- conformance report。
- GitHub Release draft。

发布门槛：

- [ ] `npm run agents:verify` 通过。
- [ ] `npm run skills:verify` 通过。
- [ ] clean checkout 重建一致。
- [ ] 五宿主原生证据完成或 exception 获批。
- [ ] 许可审查完成。
- [ ] 安全审查完成。
- [ ] 回滚演练完成。
- [ ] 外部发布获得明确批准。

## 14. 建议任务拆分

| Task | 内容 | 依赖 |
|---|---|---|
| TASK-2026-004 | ADR、edition、兼容性快照 | 无 |
| TASK-2026-005 | `packages.json`、schema、PackageModel | 004 |
| TASK-2026-006 | 双 Skill/双宿主纵向 pilot | 005 |
| TASK-2026-007 | Pilot baseline、eval、安全和原生 E2E | 006 |
| TASK-2026-008 | 跨平台 RC build/release workflow | 006 |
| TASK-2026-009 | Core Skills 分批可移植化 | 007-008 |
| TASK-2026-010 | Workflow Skills、Roles 和 fallback | 009 |
| TASK-2026-011 | Codex/Pi/Cursor adapters | 009 |
| TASK-2026-012 | OpenCode overlay helper 和 doctor | 010-011 |
| TASK-2026-013 | 全量 eval、五宿主 conformance | 010-012 |
| TASK-2026-014 | 文档、迁移、回滚和 RC | 013 |
| TASK-2026-015 | 许可、安全和人类发布审核 | 014 |
| TASK-2026-016 | 外部发布决策 | 015 |

并行规则：

- 007 和 008 可在 pilot package 结构冻结后部分并行。
- 009-012 可使用独立 worktree 并行。
- 生成器公共模块只能由单一 owner 集成。
- 013 必须等五宿主路径稳定后完成。
- 不得用模拟证据替代原生证据。

## 15. What Already Exists

| 已有能力 | 复用方式 |
|---|---|
| `scripts/lib/generator.mjs` | 增量扩展，不创建平行生成框架 |
| Skill/Role inline contracts | 继续作为依赖和行为事实来源 |
| `src/dependency-graph.json` | 扩展生成逻辑，不维护第二份手写依赖图 |
| `config/security-policy.json` | 生成权限意图和执行等级报告 |
| `src/templates/lifecycle.json` | 作为项目和 artifact locator 的唯一事实来源 |
| `generated-manifest.json` 与 drift tests | 扩展到 package manifests 和 release artifacts |
| Node `node:test` 测试体系 | 覆盖纯逻辑、错误分支和 projection |
| 五宿主 smoke/conformance 体系 | 扩展为 package native pilots |
| 现有 CI `.github/workflows/agent-framework.yml` | 增加 PR fast 与 RC matrix，不另建 CI 平台 |

## 16. NOT in Scope

- 跨宿主统一安装、更新和卸载器：宿主原生 package manager 已解决大部分问题。
- Codex custom-agent overlay：v1 使用 in-context fallback，等待官方可靠安装机制。
- Pi executable extension：权限面过大，需独立威胁模型和显式 opt-in。
- Universal zip 公开发行：normalized `PackageModel` 只是内部中间模型。
- MCP Server：普通 Skills 和本地 artifacts 已足以支持 v1。
- 自动下载或再分发完整 McKee Wiki：普通包只含经许可的最小离线摘要。
- Stable marketplace 全自动发布：RC 自动构建，stable 保留人工审批。
- Canonical inline contract 格式迁移：pilot 仅做输出投影，源格式迁移独立处理。
- 首批同时迁移 34 个 Skills：必须先通过双 Skill/双宿主 pilot。

## 17. 时间与资源估算

以下是单一 senior maintainer 加有限审核资源的估算：

| 阶段 | 预计时间 |
|---|---:|
| Phase 0-2 | 3-5 个工作日 |
| Phase 3 pilot | 5-8 个工作日 |
| Phase 4 | 4-6 个工作日 |
| Phase 5-6 | 7-10 个工作日 |
| Phase 7 | 6-10 个工作日 |
| Phase 8 | 4-6 个工作日 |
| Phase 9 | 3-5 个工作日 |
| Core/Workflow 批量迁移 | 10-15 个工作日 |
| 合计 | 42-65 个工作日 |

多人并行可缩短日历时间，但不能跳过宿主原生验证和人类发布门槛。

## 18. 风险登记

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| 五宿主 plugin schema 快速变化 | 高 | 中 | 兼容性 ledger、季度复核、adapter 隔离 |
| Skill descriptions 超出 Codex 预算 | 中 | 高 | 字符预算测试、Role 不注册为 Skills |
| Cursor discovery 行为版本不一致 | 中 | 中 | plugin 主路径、真实版本 smoke |
| OpenCode overlay 覆盖用户配置 | 低 | 高 | 只输出片段、project-only helper、dry-run |
| `core/workflow` 同时安装 | 中 | 高 | 互斥 manifest、doctor、用户可见恢复说明 |
| Roles 扩大写权限 | 中 | 高 | read-only 默认、继承父权限、fallback |
| Wiki 写入混入普通包 | 低 | 严重 | 独立 edition、依赖图禁止、权限测试 |
| 私有故事进入 fixtures/package | 低 | 严重 | synthetic fixtures、secret/privacy scan |
| McKee 内容许可不适合公开分发 | 中 | 高 | 发布前法律/许可审核、内部 RC |
| 五份生成内容漂移 | 低 | 高 | 单一 canonical source、hash、drift CI |
| Pi extension 任意代码风险 | 中 | 高 | 第一版不发布 extension |
| LLM eval 成本或速率限制 | 中 | 中 | 分层抽样、并发和预算上限、fail-fast |
| RC 部分发布 | 低 | 高 | matrix 全绿后才创建 draft release |

## 19. Failure Modes

| Codepath | 生产失败 | 测试 | 错误处理 | 用户体验 |
|---|---|---|---|---|
| PackageModel | unknown/duplicate Skill | `node:test` 负例 | 构建中止 | 显示 Skill ID 和修复文件 |
| PackageModel | dependency cycle | graph 测试 | 构建中止 | 显示完整循环 |
| Locator | 多个 lifecycle 匹配 | locator 测试 | 不猜测路径 | 列出候选并要求选择 |
| Locator | malformed lifecycle | parser 测试 | 不写 artifact | 显示文件与解析错误 |
| Locator | path escapes root | security 测试 | 拒绝路径 | 显示安全原因 |
| Projection | missing resource | generator 测试 | 不生成部分包 | 显示 source Skill 和资源路径 |
| Projection | host schema 变化 | adapter fixture | 目标构建失败 | 显示宿主和不兼容字段 |
| Permission | advisory 被误称 enforced | contract 测试 | 验证失败 | 显示实际执行等级 |
| Edition | core/workflow 共存 | doctor/E2E | 阻止验证通过 | 给出卸载其中一个的步骤 |
| Wiki | 外部 Wiki 不可用 | eval | 使用离线摘要 | 可见提示可选增强缺失 |
| Role | specialist 不可用 | eval | in-context fallback | 明确说明降级模式 |
| RC | 任一 matrix job 失败 | workflow test | 不创建 draft release | Actions 显示失败 target |

任何出现“无测试 + 无错误处理 + 静默失败”的新路径都属于 P0，禁止进入 RC。

## 20. Inline Diagram Maintenance

以下实现文件应在流程复杂时加入并维护 ASCII 注释：

- `scripts/lib/package-model.mjs`：canonical → normalize → validate 数据流。
- `scripts/lib/package-adapters.mjs`：一个 `PackageModel` 到五宿主产物的 fan-out。
- `scripts/lib/package-validation.mjs`：互斥、依赖、权限和资源验证状态。
- locator helper：显式路径 → ancestor → unique drafts match → standalone/ambiguous。
- RC workflow：tag → matrix → provenance → draft release → human approval。

简单 serializer、纯映射和单分支 helpers 不需要图，避免注释噪音。

## 21. Definition of Done

项目只有在以下条件全部满足时，才能宣称“Skills 已完成多 Agent 安装包产品化”：

- [ ] 34 个 Skills 全部符合 Agent Skills 标准。
- [ ] 34 个 Skills 全部具有机器可读依赖和 edition 分类。
- [ ] 27 个 Roles 全部具有五宿主 adapter 或 fallback。
- [ ] 三个 editions 均能生成 normalized `PackageModel`。
- [ ] 五个宿主均能生成对应 package。
- [ ] Claude/Codex/Cursor/Pi 使用原生 package manager；OpenCode overlay 有 dry-run。
- [ ] 生成可重复且 drift-free。
- [ ] package 不包含绝对机器路径、私有数据或秘密。
- [ ] 普通 editions 不包含 Wiki 写权限。
- [ ] 每个 Skill 有正例、负例和失败例。
- [ ] 五宿主原生安装证据完成或例外获批。
- [ ] `core/workflow` 共存被检测并给出恢复步骤。
- [ ] 权限 intent 与 enforcement 等级可验证。
- [ ] PR、nightly/manual RC 和 release 三层验证生效。
- [ ] RC tag 可生成跨平台 draft release 和 provenance。
- [ ] clean checkout 的完整验证通过。
- [ ] 文档、迁移、回滚和维护流程完成。
- [ ] 许可和安全审查完成。
- [ ] 外部发布获得明确的人类批准。

## 22. 首批执行队列

批准本计划后，立即执行：

1. 创建 `TASK-2026-004` 和 ADR。
2. 更新五宿主官方文档快照和 compatibility ledger。
3. 新增 `src/distribution/packages.json` 和 schema。
4. 从现有 contracts 生成 dependency、capability 和 permission reports。
5. 以 `mck-gap-find` 和 `mck-setup-payoff` 作为 pilots。
6. 构建 normalized `PackageModel`。
7. 生成 Claude Code 和 OpenCode 两个 package pilots。
8. 完成修改前 baseline 和修改后跨宿主 eval。
9. 在两个真实宿主中完成 load/install、调用和 cleanup。
10. 建立跨平台 RC draft-release workflow。
11. 评审 pilot 后再批量改造剩余 Skills。

不得先批量复制 34 个 Skills 到五个新目录。只有 package model、依赖图和两个 pilot
验证通过后，才能扩大迁移范围。

## 23. 最终实施原则

> **方法论只维护一次；安装格式按宿主生成；能力缺失必须降级；权限不能随安装扩大；完成必须由真实安装和行为证据证明。**

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean | 20 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |

- **UNRESOLVED:** 0
- **VERDICT:** ENG CLEARED — ready to implement.
