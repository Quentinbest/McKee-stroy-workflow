# 使用 McKee Story Workflow 写完一部小说：入门教程

本教程面向第一次使用本项目的作者。目标不是介绍所有 Skill 和 Role，而是带你
沿着一条最短、可恢复、可检查的路径，把一个故事种子推进为完整稿件。

## 目录

1. [开始前要理解的三件事](#1-开始前要理解的三件事)
2. [准备运行环境](#2-准备运行环境)
3. [准备你的故事种子](#3-准备你的故事种子)
4. [第一阶段：从种子到 Premise](#4-第一阶段从种子到-premise)
5. [第二阶段：锁定四项基础合同](#5-第二阶段锁定四项基础合同)
6. [第三阶段：从 Cast 构建 Story Spine](#6-第三阶段从-cast-构建-story-spine)
7. [第四阶段：分幕与分场](#7-第四阶段分幕与分场)
8. [第五阶段：逐场写正文](#8-第五阶段逐场写正文)
9. [第六阶段：阶段性检查与恢复](#9-第六阶段阶段性检查与恢复)
10. [第七阶段：全书审计与七轮修订](#10-第七阶段全书审计与七轮修订)
11. [第八阶段：组装 Manuscript](#11-第八阶段组装-manuscript)
12. [一套可直接复用的会话节奏](#12-一套可直接复用的会话节奏)
13. [常见错误](#13-常见错误)
14. [最小完成标准](#14-最小完成标准)

完整路径如下：

```text
故事种子
  -> Premise + Genre Contract
  -> Controlling Idea
  -> Setting
  -> Cast
  -> Story Spine
  -> Act Design
  -> Scene Cards + Beat Sheets
  -> Prose
  -> Audit
  -> Revision
  -> Publication Checks
  -> Manuscript
```

其中最重要的顺序约束是：

> **先锁定人物压力系统（Cast），再构建故事脊柱（Story Spine）。**

人物不是填入既有情节的名字。人物之间的欲望、矛盾和压力先被定义，故事脊柱
再把这些压力转化为事件。

---

## 1. 开始前要理解的三件事

### 1.1 你负责判断，智能体负责执行

项目会生成候选、检查结构、起草场景和运行批评，但以下决定必须由作者确认：

- 哪个故事值得写；
- 哪个 Premise 最接近你真正关心的问题；
- 哪些人物、事件和结局属于这部小说；
- 何时锁定一个阶段，何时回退重做；
- 稿件何时可以导出或发布。

不要把“文件已经生成”误认为“创作决定已经完成”。每个锁定点都应由你明确
批准。

### 1.2 不要一次生成整部小说

可靠的工作粒度是：

```text
一项基础合同 -> 一幕 -> 一个段落（Sequence）-> 一个场景（Scene）
```

正文阶段默认一次只写一个场景。需要加速时，可以按一个 Sequence 批量起草，
但仍要逐场执行潜台词、鸿沟、转折和连续性检查。

### 1.3 故事文件应与公开框架分开

本仓库保存公开的 Skill、Role、模板和验证工具。你的正文、研究资料和已填写的
作者人格（Author Persona）属于私有数据，建议放在一个单独的本地或私有 Git
仓库中。不要把私人稿件提交到本框架仓库。

---

## 2. 准备运行环境

### 2.1 前置条件

你需要：

- Git；
- Node.js 20 或更高版本；
- 一个受支持的智能体运行环境（Harness）：Claude Code、Cursor、Pi、
  OpenCode 或 Codex；
- 本项目的本地检出；
- 可选但推荐：本地检出的
  [LLM-Wiki-Story](https://github.com/Quentinbest/LLM-Wiki-Story)。

先验证框架本身：

```bash
git clone https://github.com/Quentinbest/McKee-stroy-workflow.git
git clone https://github.com/Quentinbest/LLM-Wiki-Story.git

export MCKEE_WORKFLOW_ROOT=/absolute/path/to/McKee-stroy-workflow
export MCKEE_WIKI_ROOT=/absolute/path/to/LLM-Wiki-Story

cd "$MCKEE_WORKFLOW_ROOT"
npm run agents:verify
```

基线工具没有第三方运行时依赖，不需要执行 `npm install`。

### 2.2 创建独立的故事仓库

```bash
mkdir my-novel
cd my-novel
git init
```

不要急着添加公开远端。先确认这个仓库的隐私策略，再决定是否推送到私有 Git
托管服务。

### 2.3 安装当前 Harness 需要的 Adapter

Cursor、Pi、OpenCode 和 Codex 共用 `.agents/skills/`：

```bash
mkdir -p .agents
cp -R "$MCKEE_WORKFLOW_ROOT/.agents/skills" .agents/
```

再复制跨 Harness 的公共模板、生命周期契约和 Role 回退源：

```bash
mkdir -p templates .story-workflow/roles
cp "$MCKEE_WORKFLOW_ROOT"/src/templates/* templates/
cp "$MCKEE_WORKFLOW_ROOT"/src/roles/*.md .story-workflow/roles/
cp "$MCKEE_WORKFLOW_ROOT"/src/artifacts/story-artifacts.json .story-workflow/
cp "$MCKEE_WORKFLOW_ROOT"/src/control-plane/story-lifecycle.json .story-workflow/
```

`templates/state.json` 是正文连续性跟踪的必需输入。`.story-workflow/roles/`
让没有原生 Role 调用能力的 Harness 能够在当前上下文中执行同一职责。

然后根据 Harness 补充对应文件：

```bash
# Claude Code
mkdir -p .claude
cp -R "$MCKEE_WORKFLOW_ROOT/.claude/skills" .claude/
cp -R "$MCKEE_WORKFLOW_ROOT/.claude/agents" .claude/

# Cursor
mkdir -p .cursor
cp -R "$MCKEE_WORKFLOW_ROOT/.cursor/rules" .cursor/

# OpenCode
mkdir -p .opencode
cp -R "$MCKEE_WORKFLOW_ROOT/.opencode/agents" .opencode/
```

Pi 和 Codex 使用前面的 `.agents/skills/` 即可。不同 Harness 的原生委派能力
不同，但生命周期、输入、工件和验收标准相同。没有原生 Role 或并行 Critic
时，工作流会回退到单智能体顺序执行。

框架升级后，重新复制对应 Adapter。不要在故事仓库中手动修改这些生成文件；
需要定制创作规则时，应写在故事仓库自己的 `AGENTS.md` 中。

### 2.4 为故事仓库写最小规则

在故事仓库根目录创建 `AGENTS.md`：

```markdown
# Story Project Instructions

- This repository contains one private fiction project.
- Treat `drafts/**`, populated personas, research, and manuscript files as private.
- Write story artifacts only under `drafts/{slug}/`.
- Resolve `wiki/...` references through `${MCKEE_WIKI_ROOT}/wiki/...`.
- The external McKee wiki is read-only.
- Public runtime templates live under `templates/`.
- If the Harness cannot invoke a native Role, read
  `.story-workflow/roles/{role}.md` and execute that Role in the current context.
- Do not publish, upload, push, or disclose story material without explicit approval.
- Before changing a locked upstream artifact, explain the invalidation cascade and ask for approval.
- Follow this lifecycle:
  Premise + Genre -> Controlling Idea -> Setting -> Cast -> Spine ->
  Act -> Scene -> Audit -> Revision -> Publication Checks -> Export.
```

Claude Code 用户还应在根目录创建最小 `CLAUDE.md`：

```markdown
@AGENTS.md
```

OpenCode 用户可在根目录创建最小 `opencode.jsonc`，显式加载故事规则：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md"]
}
```

每次开始创作会话时，明确本次授权范围：

```text
本次任务授权你在当前私有故事仓库中读取和写入 drafts/**。
禁止联网、发布、上传或推送。请使用项目中的 story-* 与 mck-* 技能，
每到需要作者批准的锁定点就停下。
```

### 2.5 验证 Skill 是否被发现

在故事仓库中启动 Harness，然后输入：

```text
请使用 story-status 检查当前故事项目。现在还没有项目时，只报告未找到项目，
不要自行创建文件。
```

能够识别 `story-status` 并报告没有活动项目，说明基础发现正常。

---

## 3. 准备你的故事种子

故事种子不需要是完整梗概。它可以是一幅画面、一段关系、一个矛盾、一句听来的
话，或者一种迟迟挥之不去的情绪。

教程使用这个示例：

> 一位钟表匠造出会倒着走的钟，试图追回已经失去的女儿。

启动前最好再准备四项约束：

| 项目 | 示例 |
|---|---|
| 语言 | 简体中文 |
| 体量 | 约 8 万汉字 |
| 类型倾向 | 奇幻 / 家庭剧情 |
| 不可改变的核心 | 结局不能真的让时间倒流 |

未知项可以留空。不要为了“准备充分”而先写几十页设定；工作流会在需要时要求
补齐。

---

## 4. 第一阶段：从种子到 Premise

输入：

```text
请使用 story-new 开始一个新故事。

故事种子：一位钟表匠造出会倒着走的钟，试图追回已经失去的女儿。
语言：简体中文。
目标体量：约 8 万汉字。
类型倾向：奇幻 / 家庭剧情。
硬约束：结局不能真的让时间倒流。

先提炼这个种子最让我放不下的情感核心（haunt），等我确认后再继续。
生成候选 Premise 后停下，不要替我锁定。
```

`story-new` 会：

1. 提炼 haunt；
2. 创建 `drafts/{slug}/`；
3. 初始化 `lifecycle.json`、世界设定和正文目录；
4. 生成多个 Premise 候选；
5. 在你选择后写入 `premise-card.md`。

### 如何选择 Premise

不要只选“最酷”的候选。优先选择同时满足以下条件的版本：

- 主角有清晰、可行动的欲望对象（Object of Desire）；
- 对抗力量足以持续一部长篇；
- 激励事件能真正打破主角生活的平衡；
- 故事中包含你愿意反复追问的价值冲突；
- 结局不是从开头就能机械推导出来。

锁定时输入：

```text
我选择候选 2，但把主角的目标从“复活女儿”改为“证明女儿从未真正离开”。
请据此修订 Premise Card，列出变化带来的代价。等我确认后再锁定。
```

通过标准：

- `drafts/{slug}/premise-card.md` 存在；
- Premise 已由你明确确认；
- `lifecycle.json` 中 `locked.premise` 为 `true`。

---

## 5. 第二阶段：锁定四项基础合同

在进入 Story Spine 前，依次锁定 Genre Contract、Controlling Idea、
Setting 和 Cast。

### 5.1 Genre Contract

输入：

```text
请使用 genre-cartographer，根据已锁定的 Premise 生成 Genre Contract。
列出主要类型、次要类型、必须兑现的类型惯例、必备场景和不能误用的陈词滥调。
先给我审核，不要自动锁定。
```

你需要确认：

- 类型承诺与读者预期一致；
- 必备场景确实会进入后续结构；
- “颠覆类型”没有变成拒绝兑现类型承诺。

输出通常写入：

```text
drafts/{slug}/genre-contract.md
```

### 5.2 Controlling Idea

控制思想（Controlling Idea）不是宣传语，而是故事最终通过行动证明的
“价值 + 原因”。

输入：

```text
请使用 mck-controlling-idea，为当前故事生成 3 个 Controlling Idea 候选：
一个正向、一个负向、一个反讽。每个候选都必须写成“价值 + 原因”，并说明
它将如何被高潮中的行动证明。不要替我选择。
```

选择后可用 `mck-honesty` 检验它是否只是漂亮口号：

```text
请使用 mck-honesty TEST 检验我选择的 Controlling Idea。
重点判断：它是否来自具体的人类观察，对立思想是否得到公平而强大的表达。
```

通过标准：

- `controlling-idea.md` 明确写出核心价值、原因和 Counter-Idea；
- 它能够被事件证明，而不需要角色在结尾说出来；
- `locked.controlling_idea` 为 `true`。

### 5.3 Setting

输入：

```text
请使用 setting-surveyor 锁定当前故事的 Setting。
至少覆盖时代、故事持续时间、地点、冲突层级、世界规则和研究目标。
所有可能影响情节因果或人物能力的规则必须明确，未知项列为 research target。
```

通过标准：

- `world-bible.md` 或 Setting Survey 已填写；
- 关键地点、时间规则和超自然规则没有互相冲突；
- `locked.setting` 为 `true`。

### 5.4 Cast：先设计压力系统

现在才进入人物设计：

```text
请使用 story-cast 设计完整 Cast。
把人物当作作用于主角的压力系统，而不是人物名单。
必须覆盖内在、个人和外部三个层级的对抗力量；检查人物功能重复。
先提交人物压力矩阵和删、并、增建议，等我批准后再锁定 Cast。
```

检查重点：

- 每个主要人物施加一种不可替代的压力；
- 至少有角色迫使主角暴露其 True Character；
- 主要对立者拥有可信的 Counter-Idea，不是纯粹工具人；
- 没有两个人物只是在不同场景重复同一功能；
- 人物系统能够支撑 Genre Contract 要求的角色与场景。

通过标准：

- `characters/`、`cast-design.md` 和 `cast-roster.md` 已建立；
- 你明确批准了人物压力矩阵；
- `locked.cast` 为 `true`。

---

## 6. 第三阶段：从 Cast 构建 Story Spine

只有 Cast 锁定后，才运行：

```text
请使用 story-spine，根据已锁定的 Premise、Genre Contract、
Controlling Idea、Setting 和 Cast 构建 Story Spine。

目标体量：约 8 万汉字。
要求：
1. 每次递进复杂化都由人物选择或对抗力量引起；
2. 危机必须是真正的两难困境；
3. 高潮必须由危机中的决定因果地产生；
4. 结局展示高潮之后的新平衡；
5. 逐项运行 McKee predicates 和 Gap 检查。

先给我审核，不要自动锁定。
```

你应重点审查五个节点：

| 节点 | 必须回答的问题 |
|---|---|
| 激励事件（Inciting Incident） | 是否真正打破主角生活平衡并提出主要戏剧问题？ |
| 递进复杂化（Progressive Complications） | 是否越来越难，并迫使主角改变策略？ |
| 危机（Crisis） | 是否没有无代价的正确答案？ |
| 高潮（Climax） | 是否由主角的危机决定引发，而不是巧合？ |
| 结局（Resolution） | 是否展示价值变化后的世界？ |

如果危机只是一个“很难但答案明显”的选择：

```text
请使用 mck-crisis-dilemma 修复当前 Crisis。
保留人物欲望和世界规则，把它强化为不可调和的价值两难。
```

如果事件只是“然后发生了另一件事”，要求运行 `mck-gap-find`，把连接改为
“因此”或“但是”的因果链。

通过标准：

- `spine.md` 的关键节点全部通过断言；
- 所有主要人物压力都在 Spine 中获得结构职责；
- 你明确批准后，`locked.spine` 才变为 `true`。

可选但推荐：在写第一幕前运行 `mck-surprise-plant DESIGN`，从高潮向前设计
可双重解读的误导与植入。惊奇结构很难在完整初稿后无痕补上。

---

## 7. 第四阶段：分幕与分场

### 7.1 先确定篇幅预算

让智能体根据故事内容选择幕数，而不是机械套用三幕：

```text
请根据已锁定的 Story Spine 设计全书的 Act 结构。
目标总量约 8 万汉字，并为每一幕分配篇幅预算。
说明为什么选择这个幕数，以及少一幕或多一幕会损失什么。
每幕结尾必须是不可逆的事件转折。
```

确认 Act Design 后，逐幕运行 `story-act`：

```text
请使用 story-act 规划 Act 1。
先定义本幕的开场价值电荷、结束价值电荷和幕末转折，再拆成 Sequence 和 Scene。
为每个 Scene Card 分配篇幅预算。完成后运行节奏检查并停下。
```

按顺序完成所有幕：

```text
请使用 story-act 规划 Act 2。
请使用 story-act 规划 Act 3。
```

### 7.2 检查 Scene Card

每张 Scene Card 至少应包含：

- POV 人物的场景目标；
- 具体对抗；
- 转折点；
- 开场和结尾的价值电荷；
- 铺垫与兑现；
- 意象或母题；
- 目标篇幅。

如果一个场景“提供信息但没有价值变化”，它还不是可写的场景。先改 Scene
Card，不要靠漂亮正文掩盖结构空缺。

### 7.3 建立连续性状态

在开始正文前，确认 `state.json` 已由 `story-act` 建立并填写：

- 人物当前位置、知识和持有物；
- 地理关系和世界状态；
- 时间线；
- 意象系统；
- 铺垫与兑现台账。

没有 `state.json` 仍可写作，但连续性、意象和铺垫检查会进入降级模式。

---

## 8. 第五阶段：逐场写正文

### 8.1 第一个场景

输入：

```text
请使用 story-scene 起草 Scene 1.1。
严格读取 Scene Card、相关人物文件、world-bible、persona、state.json。
在写正文前先展示五层潜台词表和本场景的 Gap，等我确认。
按节拍起草，完成后运行 cliché、subtext 和 continuity 三项检查。
修订通过后再写入 prose 文件。
```

`story-scene` 的标准循环是：

```text
读取 Scene Card
  -> 填写五层潜台词
  -> 确认预期与结果之间的 Gap
  -> 按 Beat 起草
  -> 检查 Turning Point
  -> 运行 Critic
  -> 局部修订
  -> 写入 prose
  -> 更新 state.json
```

### 8.2 你在每个场景需要判断什么

重点判断：

- 人物的行为是否符合其欲望、恐惧和策略；
- 对话是否在做事，而不是解释人物内心；
- 场景结果是否偏离 POV 人物的预期；
- 转折是否发生在行动中，而不是一段总结性台词中；
- 细节是否属于这个世界和这个 POV；
- 这一场是否改变了下一场的条件。

### 8.3 单场模式与批量模式

第一次写作建议使用单场模式：

```text
请使用 story-scene 写 Scene 1.2，完成后停下。
```

熟悉工作流后，可按 Sequence 批量：

```text
请使用 story-scene 批量起草 Sequence 1.2（Scenes 1.4-1.6）。
每个场景仍执行完整工作流，只在承重转折场景后暂停。
遇到 Critical 问题、连续性冲突或需要回退上游时立即停下。
```

不要直接要求“继续写完剩下所有章节”。批量越大，作者越难在错误固化前纠偏。

### 8.4 场景反复修不好时

同一个问题连续三轮失败，不要继续换词。要求启动回退诊断：

```text
这个场景的同一项断言已经连续失败 3 次。
请停止正文层修补，使用 Backtracking Protocol 定位是 Scene Card、
人物欲望、state.json 还是 Spine 造成的问题。
先说明建议修改的上游字段和失效范围，等我批准后再改。
```

修改锁定的上游工件会使下游内容失效。必须先知道哪些 Scene Card、人物弧光或
正文需要重新检查。

---

## 9. 第六阶段：阶段性检查与恢复

### 9.1 随时查看状态

每次新会话先运行：

```text
请使用 story-status。
列出当前 lifecycle 状态、已锁定工件、缺失工件、阻塞问题和唯一推荐的下一步。
不要在状态检查中修改故事。
```

### 9.2 每幕写完做一次轻量审计

```text
请使用 story-audit 审计 Act 1。
重点检查结构转折、对抗升级、潜台词、陈词滥调、节奏、铺垫与兑现。
把每个 Critic 的完整报告先写入 audit/，再汇总。
```

幕级审计可以更早发现“中段没有升级”或“人物压力没有进入事件”等问题，
避免到全书完成后才重写整幕。

### 9.3 会话中断后如何继续

不要让智能体凭聊天记忆猜进度。重新启动后输入：

```text
请使用 story-status 恢复项目。
读取 lifecycle.json、state.json、已有 Scene Cards、prose 和 audit 报告。
只重跑缺失步骤，不要覆盖已经完成且通过检查的工件。
```

---

## 10. 第七阶段：全书审计与七轮修订

所有场景完成后：

```text
请使用 story-audit 对全书运行完整审计。
使用当前 Harness 支持的最高 Critic 能力层级。
每个 Critic 先落盘完整报告，再返回摘要。
最后生成按 Critical、Major、Minor 排序的 audit-report.md。
```

全书审计至少覆盖：

- 对抗力量是否在全书持续升级；
- Crisis 是否是真两难；
- Climax 是否由决定产生并回答主要戏剧问题；
- Genre Contract 是否兑现；
- 每个场景是否发生有意义的价值变化；
- 潜台词、陈词滥调和声音漂移；
- 意象、铺垫与兑现；
- 实际篇幅与 Act 预算是否严重偏离。

然后运行：

```text
请使用 story-revise，采用 audit-driven 模式执行全部七轮修订。
每轮只修一个维度，并在 revision-log.md 记录修改文件、结果和遗留问题。
同一问题达到 stop-loss 上限时停止并报告，不要无限重写。
```

七轮修订顺序：

1. Structure；
2. Cliché；
3. Subtext；
4. Image System；
5. Voice；
6. Specificity；
7. Reader Simulation。

每轮只处理一个维度。把所有问题同时修，通常会在修好结构时破坏声音，或在
润色句子时掩盖场景没有转折。

---

## 11. 第八阶段：组装 Manuscript

当 `story-revise` 将项目标记为 `polished` 后：

```text
请使用 story-publish 进行最终组装。
先检查缺失场景、作者标注泄漏、实际篇幅与预算、未闭合支线和铺垫。
任何阻塞问题都先报告，不要强行导出。
通过后生成 manuscript.md 和 colophon.md，但不要上传或对外发布。
```

`story-publish` 在这里的含义是“生成可交付稿件”，不是自动公开发布。最终文件
通常位于：

```text
drafts/{slug}/manuscript.md
drafts/{slug}/colophon.md
```

发布后仍可继续修改。正文文件一旦比 `manuscript.md` 更新，稿件就会被
`story-status` 标记为 stale；完成修改后重新运行 `story-publish` 即可。

---

## 12. 一套可直接复用的会话节奏

### 会话 A：奠基

```text
story-new
-> 选择并锁定 Premise
-> genre-cartographer
-> mck-controlling-idea
-> setting-surveyor
-> story-cast
```

### 会话 B：结构

```text
story-status
-> story-spine
-> 可选 mck-surprise-plant DESIGN
-> story-act 逐幕规划
```

### 会话 C 以后：正文循环

```text
story-status
-> story-scene 写一个 Scene 或 Sequence
-> 检查 state.json
-> 幕末运行 story-audit
```

### 完稿会话

```text
story-audit 全书
-> story-revise
-> story-publish
-> story-status 确认 done
```

---

## 13. 常见错误

### 错误一：先写 Spine，再补人物

结果通常是人物只为情节服务，决定缺乏可信动机。

修复：回到 `story-cast`，先锁定压力系统，再让 `story-spine` 重建事件因果。

### 错误二：锁定点全部自动通过

结果是候选方案未经作者判断就成为项目事实。

修复：在提示中写明“先给我审核，不要自动锁定”。

### 错误三：一次生成整幕甚至整本书

结果是转折、声音和连续性问题成批固化。

修复：默认逐场；熟练后最多按 Sequence 批量，并在承重场景暂停。

### 错误四：用漂亮句子修补无效场景

场景没有 Gap 或 Turning Point 时，句子再漂亮也不能让它成立。

修复：回到 Scene Card，重写目标、冲突或结果。

### 错误五：跳过 `state.json`

结果是人物位置、知识、物件、地理和时间线在后期冲突。

修复：重新运行 `story-act` 的状态初始化步骤，再继续正文。

### 错误六：把 `story-publish` 理解为自动公开

本 Skill 只组装本地稿件。上传、推送、投稿和公开发布始终需要单独明确授权。

---

## 14. 最小完成标准

一部小说在本工作流中达到“完成”，至少满足：

- [ ] Premise、Genre Contract、Controlling Idea 和 Setting 已锁定；
- [ ] Cast 在 Story Spine 之前锁定；
- [ ] Story Spine 的 Crisis 和 Climax 通过因果检查；
- [ ] 每幕以不可逆转折结束；
- [ ] 每个 Scene 都有冲突、Gap、Turning Point 和价值变化；
- [ ] 所有正文场景都已落盘并更新连续性状态；
- [ ] 全书审计没有未处理的 Critical 问题；
- [ ] 七轮修订已完成或明确记录跳过理由；
- [ ] 篇幅与结构预算已经核对；
- [ ] 稿件中没有元数据或作者标注泄漏；
- [ ] `manuscript.md` 已重新组装且不是 stale；
- [ ] 任何对外发布都经过作者单独批准。

到这里，你得到的不是一次聊天生成的长文本，而是一套可以解释、回退、检查和
继续修订的小说工程。
