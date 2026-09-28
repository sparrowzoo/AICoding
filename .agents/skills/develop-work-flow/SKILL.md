---
name: develop-work-flow
description: 按持续维护的 Markdown 需求、产品与技术文档，以及 Gherkin/YAML 任务 DSL，编排小步研发、红绿测试与提交追溯。用于组织需求设计、实施与验收，或持续迭代研发流程。
---

通过软链接加载时，先解析本文件的真实路径，再以真实目录定位下列相对链接；设计文档唯一来源为源仓库 `design-docs/`。

# AI Coding 研发工作流

先读 [工作流约定](../../../design-docs/workflow.md)。涉及创建、校验或执行计划时再读 [DSL 约定](<../../../design-docs/AI Coding 设计说明.md#dsl>)。它们是所有关联 skill 共用的职责和交接约定，不绑定模型或第三方工作流工具。

1. 按[流程图与分流规则](../../../design-docs/workflow.md#routing)，AI 从需求意图识别简单/复杂，从当前代码、调用关系及测试分析新需求/老需求；不按需求名称或标题分类，在 TRD 记录判断依据。确认实际 projectRoot、需求目录标识（feature，例如 req-r01-profile）、当前授权范围和已有文档。目标为 doc/<需求目录>/；用户只要某阶段就完成该阶段，不自动扩大到业务编码。
2. 所有存量改动按[存量确认](../../../design-docs/workflow.md#existing-confirmation)调查具体代码与接口，提出候选设计，明确模块、类/函数的职责、调用关系、可改与保留范围，通过 `grill-me`（委托 `grilling`）分轮细问并取得本次范围确认；资料完整不能代替确认，已有本次具体细节确认不重复。新需求只询问会影响设计的关键未知。调查、提问和设计草案可以交替完善。
3. 从[统一证据模板](assets/evidence.md)在需求目录创建 `evidence.md`；已有文件原位更新。各阶段执行者按[全链路证据](../../../design-docs/workflow.md#evidence)记录上下文、输入、输出、结果和证据位置。简单需求使用 `mode: lite`，由 [trd-writer](../trd-writer/SKILL.md)维护 TRD＋任务 DSL 两份设计与计划源，使用[轻量模板](assets/lite/)。复杂需求使用 `mode: full`，按 [req-writer](../req-writer/SKILL.md) → [prd-writer](../prd-writer/SKILL.md) → trd-writer 完成需求、产品、技术、验收场景与计划全部文档，使用[完整模板](assets/feature/)。高风险的简单需求补足风险、影响方和措施说明，仍可采用 lite。
4. 文档与计划明确后，按下方[脚本入口](#script-entry)执行 validate、render、check。仅授权规划则交付设计、计划与已有阶段的 evidence.md，实施/验收注明未执行；已授权实施且相关细节明确时交给 [coder](../coder/SKILL.md)执行，不固定追加一次确认。
5. 实施中发现新增逻辑实际改变存量行为，暂停受影响部分并进入存量确认，其余独立部分可继续；内部实现调整自主完成。实施后由 [e2e-validator](../e2e-validator/SKILL.md)核对真实测试、契约与保留行为。风险及相关方影响写入文档，无需外部通知。
6. 最后验收更新 DSL 状态、备注与证据，运行 render、status、check，交付需求目录下独立的四列 task-status.md；报告完成范围、验证证据、未决问题和提交状态。文档持续维护，变更记录保存在 Git；push 与部署按用户明确授权执行。
7. **证：** 汇总需求目录的 `evidence.md`，由 e2e-validator 核对已实施工作的全链路；规划交付由当前执行者核对已发生阶段。缺失、失败和未验证必须显式列出，不能以生成器成功代替证据完整或业务通过。

按宿主可用工具直接工作，独立任务可委派子代理。验证结论以实际执行结果为依据；按任务风险选择审查方式，模型与执行工具由宿主环境决定。

<a id="script-entry"></a>
## 脚本入口

以下入口供执行本工作流的 AI 使用。运行前需具备 Node.js 22+ 和 npm；目标项目的 `.agents` 软链接指向共享源 `.agents`。在目标项目根执行，`--feature` 填完整需求目录，例如 `req-r01-profile`：

```sh
# 同一机器、同一用户首次使用，或锁文件更新、依赖需要修复时执行
node .agents/skills/develop-work-flow/scripts/setup.mjs
# 将 <command> 替换为下述命令，将 <需求目录> 替换为实际目录名
node .agents/skills/develop-work-flow/scripts/workflow.mjs <command> --project "$PWD" --feature <需求目录>
```

**软链接与依赖安装的职责：**

- `.agents` 软链接负责复用共享源中的 skills、agents、模板和脚本；第三方运行依赖另由 `setup.mjs` 准备。
- `setup.mjs` 默认将脚本目录中的 `package.json`、`package-lock.json` 复制到 `${HOME}/.local/share/ai-coding-workflow/`，在该目录执行 `npm ci --ignore-scripts`，按锁文件安装第三方库。其中 `yaml` 解析 `plan.yaml`，`@cucumber/gherkin` 解析 Gherkin 验收场景，`@cucumber/messages` 提供解析所需的 AST ID 生成器。源码与依赖清单、锁文件继续由共享源维护。
- `workflow.mjs` 显式从上述用户级目录加载依赖，负责 DSL 校验与 Markdown 生成。业务项目继续维护自身代码、文档和测试环境；这些工具依赖无需加入业务项目，也不安装到共享 skill 源目录。

**安装时机：** 默认配置下，同一台机器、同一用户的多个项目共用该依赖目录。首次使用脚本、依赖锁文件更新或依赖需要修复时执行 `setup.mjs`；接入新项目或仅修改 skill 文本、模板时通常无需重装。每次调用 `setup.mjs` 都会复制清单并执行安装，是否需要重装由调用方判断。该脚本仅准备工具依赖，Node.js 和 npm 需预先安装，业务实施与测试仍由 AI 调用项目自身工具完成。

测试可用 `AI_CODING_WORKFLOW_DEPS` 指定独立的绝对临时依赖目录，`setup.mjs` 与 `workflow.mjs` 使用同一配置。

- `validate`：按 `plan.yaml` 的 `mode` 检查源文件、DSL 字段、稳定编号、引用、依赖、状态与必要证据。`lite` 读取 technical.md＋plan.yaml，`full`（默认）读取完整文档集；场景分别来自 TRD 的 Gherkin 块或 acceptance.feature。
- `render`：校验后按依赖顺序生成 `plan.md`；拒绝覆盖手写文件。
- `status`：从 DSL 生成同目录 `task-status.md`，仅显示任务编号、名称、状态、备注；不执行验证命令，不改 DSL 或 `plan.md`，拒绝覆盖手写文件。
- `check`：检查 `plan.md` 与已经存在的 `task-status.md` 是否和来源一致；最后验收须先生成状态列表，再执行此检查。

非零返回码表示调用或校验失败。以上命令均不执行业务测试；结构检查通过后仍须执行任务的验证命令，核对业务语义与证据。维护脚本时，在 `scripts/` 执行 `node --test`，测试仅使用临时 fixture。
