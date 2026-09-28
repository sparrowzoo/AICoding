# AI Coding 设计说明

AI Coding 以职责清晰的工程文档与任务 DSL 支持团队对齐和 AI 实施。设计文档集中维护在 `design-docs/`：

- [workflow.md](workflow.md)：基本原则、文档职责、研发流程、RIGHT-BICEP 测试与 Git 追溯约定。
- 本文：工作流架构、DSL 契约、使用方式与设计依据。

章节导航：[架构与入口](#architecture) · [DSL 规范与工具](#dsl) · [设计依据](#decisions)

<a id="architecture"></a>
## 1. 架构与入口

自有 skills、agents、模板和脚本维护于 AICoding 的 `.agents` 唯一源，工作流设计文档统一维护于 `design-docs/`。目标项目在 `doc/req-【需求】/`（如 `doc/req-r01-profile/`）持续维护工程文档；第三方 skills 和运行依赖安装在用户家目录。

简单需求用 lite：TRD → DSL 任务 → 实施与验收；复杂需求用 full：需求 → 产品 → TRD 与场景 → DSL 任务 → 实施与验收。两种模式均保留真实测试与 Git 追溯，Markdown 和生成视图支持团队阅读，DSL 明确 AI 的执行契约。

工作流通过文件契约连接各个阶段，使用项目已有工具和测试框架，不绑定模型或第三方工作流。工程文档采用 Markdown；面向发布的文章按用户明确调用的文章流程处理。

工作流入口：[develop-work-flow](../.agents/skills/develop-work-flow/SKILL.md)。起稿模板：[lite](../.agents/skills/develop-work-flow/assets/lite/) · [full](../.agents/skills/develop-work-flow/assets/feature/)。

AI 根据需求意图识别简单或复杂，确定 TRD＋PLAN 或全部文档路径；根据当前代码、调用关系和测试分析新需求或老需求，不按需求名称判断。新需求明确后按计划执行，老需求通过 grill-me 详细询问并确认代码设计边界与职责。简单高风险的风险与相关方影响写入 TRD。流程图及判定规则统一见 [需求分流与执行流程](workflow.md#routing)，具体确认内容见 [老需求确认](workflow.md#existing-confirmation)。

<a id="dsl"></a>
## 2. DSL 规范与工具

DSL 包含 Gherkin 验收场景和 YAML 任务。`plan.yaml` 的 `mode` 指定文档契约：lite 的场景内嵌于 TRD，full 的场景独立存放。工具只负责验证与生成；AI 实施任务，真实测试验证行为。`plan.md` 和最终验收的四列 `task-status.md` 都是生成视图。

### 需求目录

需求放在 `doc/req-r01-profile/` 这类带编号的独立目录。接入该需求时先检查现有目录再确定编号，后续持续维护同一目录。

- `lite`：设计与计划仅 `technical.md` 与 `plan.yaml` 两份编写源。TRD 包含目标、R 编号与业务规则、验收、设计、测试及影响确认。
- `full`：`requirement.md`、`product.md`、`technical.md`、`acceptance.feature`、`plan.yaml` 五份基本编写源，依次落实需求、产品与技术职责。
- 两种模式另维护 `evidence.md`，记录各环节上下文、输入、输出、结果与证据入口；具体职责见[全链路证据](workflow.md#evidence)，使用[统一模板](../.agents/skills/develop-work-flow/assets/evidence.md)。它不改变 DSL 的 mode 文件契约，不重复业务规则或任务状态。
- 两种模式都自动生成 `plan.md` 和 `task-status.md`。模式只控制文件与引用契约，不判断是否影响存量，也不代替授权或细节确认。

DSL 的 `feature` 字段与工具的 `--feature` 参数均填写完整需求目录名。详细职责与编号作用域见 [工作流约定](workflow.md)。

### 标识与场景

R 编号使用独立行、代码块之外的 `<a id="R01"></a>` 声明。lite 在 `technical.md` 声明目标与规则；full 在 `requirement.md` 和 `product.md` 声明同一 R，分别写问题范围与行为规则。编号稳定、不复用。技术设计用同样形式的 `<a id="api-01"></a>` 等显式锚点。

lite 的验收章节使用 `<a id="acceptance"></a>`，并在 TRD 中维护唯一一个语言标记为 `gherkin` 的围栏代码块；生成的场景引用指向 `technical.md#acceptance`。full 将同样的 Gherkin 正文放入独立的 `acceptance.feature`。例如：

```gherkin
@R01
Feature: 显示名称校验
  @S01
  Scenario: 拒绝空名称
    Given 用户正在修改显示名称
    When 提交空字符串
    Then 提示名称不能为空
```

这是格式示例，不是任何项目已经确认的需求。每个 Scenario/Scenario Outline 直接标记一个唯一 `@S数字`（如 @S01），并具有至少一个 `@R数字`；R 可从 Feature/Rule 继承。使用官方 Gherkin 语法，包括中文语法、Examples、数据表等，不自创扩展步骤关键字。

场景是长期维护的验收库，计划只引用当前迭代相关部分。两种模式中，有行为的任务都必须有场景与真实测试，lite 不提供 TDD 豁免。无行为任务须写 `scenarios: []` 和具体 `tdd_exception`，仍关联需求与设计并提供适当验证证据；只有这类任务时，lite 可省略 Gherkin 块。

### 测试维度

按 [RIGHT-BICEP](workflow.md#right-bicep) 设计用例。technical.md 维护各维度的适用性和场景/测试引用；相关任务通过 `design` 引用 `technical.md#test-strategy`，执行结果写入 `evidence`。六个维度都要思考，但记录可用紧凑描述，不强制六行表；不适用项可以合并说明理由。任务按实际交付结果拆分。

### 任务格式

```yaml
schema: 1
mode: lite
feature: req-r01-profile
iteration: "01"
tasks:
  - id: T01
    title: 拒绝空显示名称
    requirements: [R01]
    scenarios: [S01]
    design: [technical.md#api-01, technical.md#test-strategy]
    files: [src/profile.mjs, test/profile.test.mjs]
    depends_on: []
    verify: node --test test/profile.test.mjs
    status: todo
    remark: ""
```

示例命令只示范格式；正式任务必须结合目标项目给出真实入口，不允许把占位符当作可执行计划。

| 字段 | 约定 |
|---|---|
| `schema` | 固定整数 1；未知版本拒绝读取 |
| `mode` | 可选，lite 或 full；未填写按 full 读取 |
| `feature` | 需求目录完整名称，如 req-r01-profile，对应 doc/req-r01-profile/，不增加目录层级 |
| `iteration` | 非空字符串，标识当前迭代，建议写成带引号的编号 |
| `tasks` | 当前迭代任务集合，至少一项 |
| `id`、`title` | 稳定 T 编号（如 T01）和清楚的结果描述 |
| `requirements` | 本任务涉及的 R 编号，至少一个；lite 在 TRD 声明，full 在需求与产品文档声明 |
| `scenarios` | 本任务验收的 S 编号；有场景时任务的 R 与所引场景的 R 集合一致；无行为任务写 [] 并提供 tdd_exception |
| `design` | 至少一个文件与显式锚点，如 technical.md#api-01；文件相对功能文档目录 |
| `files` | 预计新增或修改的文件，相对项目根；允许尚不存在，不允许路径越界或 Git 内部路径 |
| `depends_on` | 本轮前置任务编号，无依赖写 []；不可循环 |
| `verify` | 在项目根执行的实际验证命令；工具不执行此字符串 |
| `status` | todo、doing、done、blocked |
| `remark` | 可选字符串，可为空；任务状态列表的简短备注，未填写显示“—”，不替代 evidence |
| `evidence` | 可选；包含 red、green、review 的简短结果及可定位证据；done 时 green/review 必填，red 或 tdd_exception 至少一个 |
| `tdd_exception` | 可选；没有适用行为测试或新 RED 时的具体理由，不得用来绕过未验证行为 |

证据不粘贴整段日志。例如 `green: "node --test ...：8/8 通过；test/profile.test.mjs 的 S01 用例"`。审查注明独立或自审及结论。日志较长时链接可复核的报告；任务阻塞原因写入 remark；详细审查证据仍放 review。`doing` 与 `done` 都要求依赖已 done，但它仍不自动等于已提交、已部署或所有环境验收完成。

### 验收任务状态文件

最后验收交付 `doc/req-【需求】/task-status.md`，如 `doc/req-r01-profile/task-status.md`。文件仅有任务编号、名称、状态、备注四列，由 plan.yaml 生成，不新增第二份手工任务数据。状态显示与职责见 [任务状态列表](workflow.md#task-status)。生成标记及源摘要使用不可见注释，不增加可见列或额外说明。

### 使用

通过目录软链接跨项目复用同一份 skills。每个项目的 `.agents` 和 `.claude` 都直接指向 AICoding 的 `.agents` 唯一源。以下以 `${user.home}/workspace/AICoding` 为源仓库位置示例；`${user.home}` 表示用户家目录，在 Shell 命令中写作 `${HOME}`。请按实际克隆位置调整路径：

```text
项目/.agents → ${user.home}/workspace/AICoding/.agents
项目/.claude → ${user.home}/workspace/AICoding/.agents
```

**首次接入项目：** 在目标项目根目录执行以下命令。先确认项目根目录下 `.agents` 和 `.claude` 均不存在（含失效软链接）；若已有正确链接则直接复用，若已有目录或其他链接，先核对并保留其中的本地内容，再调整。

```bash
aicoding_source="${HOME}/workspace/AICoding/.agents"
ln -s "$aicoding_source" .agents
ln -s "$aicoding_source" .claude
```

使用 `readlink` 核对两个链接，输出都应为用户家目录展开后的同一个唯一源绝对路径：

```bash
readlink .agents
readlink .claude
```

接入后，按需调用已加载的 `develop-work-flow`、`req-writer`、`prd-writer`、`trd-writer` 等 skills。

**后续维护：** 修改、新增 skills、agents、模板和脚本都回到 AICoding 的 `.agents`，Git 提交与 GitHub 同步也在 AICoding 仓库进行。各项目通过现有目录链接复用源文件，无需复制或逐个建立 skill 链接。工作流设计文档继续维护在 AICoding 的 `design-docs/`，业务文档仍按约定保存在对应项目。唯一源移动或换电脑后，重新核对并调整两个链接的目标。

<a id="decisions"></a>
## 3. 设计依据

本方案服务于两个目标：让团队对需求、行为与接口形成可审阅的共识，让 AI 按明确任务落地并提供可复核的结果。设计取舍围绕这两个目标展开：

| 选择 | 依据与边界 |
|---|---|
| 按复杂度选择文档深度 | 简单需求用两份设计与计划源集中表达，复杂需求按需求、产品、技术分工；风险通过明确影响与措施处理，不强制增加文档。 |
| Markdown 表达问题、规则和设计 | 团队与 AI 都能直接阅读、评审和修改；每类事实只有一个权威位置，通过稳定编号与链接建立关系。 |
| Gherkin 表达验收行为，YAML 表达实施任务 | 场景明确输入、行为与结果，任务明确依赖、范围和验证入口；场景绑定真实测试，AI 按任务调用实施工具，不把文件解析成功视为业务通过。 |
| 从 DSL 生成计划和任务状态视图 | 同一任务数据同时服务 AI 执行与团队阅读，避免手工维护时出现状态分歧；最终状态表固定四列，详细证据留在任务证据及测试报告中。 |
| 全链路证据集中索引 | evidence.md 连接每环节的上下文、输入、输出、实际结果和证据；各阶段维护、e2e 汇总核对，未执行和未验证如实显示。 |
| 文档按需求持续维护，Git 保留版本 | 每项需求有稳定目录，目标、设计、场景、任务与提交可连续追溯；迭代直接更新所属文档，无需复制整套资料。 |
| 独立判断存量影响，确认具体变化 | 技术事实由 AI 调查，业务意图由用户确定；存量改动通过具体证据与分轮确认形成共识，新逻辑在明确且获授权后推进，避免重复确认与整轮返工。 |
| RIGHT-BICEP 配合真实 RED/GREEN 和审查 | 用例选择覆盖正确性、边界及适用风险；验证结果必须来自实际执行，不能以流程步骤齐全代替质量判断。 |
| 通过目录软链接复用唯一源 | 各项目共享同一份自有 skills、模板和脚本，源码与设计文档在 AICoding 统一维护；业务事实归对应项目，第三方依赖由用户级安装管理。 |

具体规范以 [工作流约定](workflow.md) 为准。本节解释选择的依据；规范可根据实践调整，变更同步更新文档、DSL 契约、生成工具与验证用例，保持人类和 AI 都可读、可迭代、可维护。
