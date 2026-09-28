# AI Coding

AI Coding 是一套供团队与 AI 协作使用的研发工作流。通过 Markdown 工程文档、Gherkin 验收场景和 YAML 任务计划，把需求、设计、实现、测试与 Git 提交连接起来，按可独立验收的小功能持续推进。

统一入口为 [develop-work-flow](.agents/skills/develop-work-flow/SKILL.md)。工作流使用目标项目已有的开发与测试工具，不绑定特定模型或代理接口。本文提供概览与接入入口；完整规范维护于 [design-docs/workflow.md](design-docs/workflow.md)，架构与 DSL 契约见 [AI Coding 设计说明](<design-docs/AI Coding 设计说明.md>)。

## 工作方式

AI 根据本轮需求意图选择文档深度，根据当前代码、调用关系和测试判断是否改变存量行为。这两个判断相互独立：

| 文档模式 | 适用范围 | 设计与计划源文件 |
| --- | --- | --- |
| `lite` | 目标集中、规则和实现路径清楚的简单需求 | `technical.md`（TRD，含规则与验收场景）、`plan.yaml` |
| `full` | 存在多组规则、交互分支或复杂模块协作的需求 | `requirement.md`、`product.md`、`technical.md`、`acceptance.feature`、`plan.yaml` |

新需求澄清关键未知后，按已授权范围推进；改变既有行为的需求先调查代码，通过 `grill-me`（可委托 `grilling`）详细确认边界、职责与保留行为。仅授权规划时交付文档与计划，实施授权明确后再进入编码与验收。判定细节见[分流规则与流程图](design-docs/workflow.md#routing)。

业务产物在目标项目的 `doc/req-rNN-name/` 持续维护，例如 `doc/req-r01-profile/`。两种模式都维护 `evidence.md`，记录各阶段的上下文、输入、输出、实际结果和可定位证据；从 `plan.yaml` 生成阅读计划 `plan.md`，最终验收生成仅含任务编号、名称、状态、备注的 `task-status.md`。

涉及行为的任务保留真实 RED/GREEN 与审查证据，按 [RIGHT-BICEP](design-docs/workflow.md#right-bicep) 考虑适用测试维度。需求、场景、任务使用稳定的 R/S/T 编号，跨轮承接与 Git 追溯遵循[迭代约定](design-docs/workflow.md#iteration)。

## 接入业务项目

准备本仓库的本地副本，以及 Node.js 22+、npm、Git 和可加载 skills 的 AI 工具。访谈使用的第三方 `grilling` 安装在对应工具的用户级 skills 目录，已有可用安装直接复用；它不随软链接或 `setup.mjs` 安装。完整前置条件见[接入约定](<design-docs/AI Coding 设计说明.md#onboarding>)。

### 1. 链接共享源

以下以 `${HOME}/workspace/AICoding` 为源仓库位置，请按实际路径调整。在**目标业务项目根目录**执行；先确认 `.agents`、`.claude` 均不存在（含失效软链接）。已有正确链接可直接复用；已有目录或其他链接时，先核对并保留本地内容再调整。

```sh
aicoding_source="${HOME}/workspace/AICoding/.agents"
ln -s "$aicoding_source" .agents
ln -s "$aicoding_source" .claude
readlink .agents
readlink .claude
```

两个链接应指向同一份共享源。skills、agents、模板和脚本在源仓库统一维护，业务项目通过链接复用。

### 2. 准备脚本依赖

同一台机器、同一用户首次使用脚本，或依赖锁文件更新、依赖需要修复时执行：

```sh
node .agents/skills/develop-work-flow/scripts/setup.mjs
```

软链接提供工作流源码；`setup.mjs` 按锁文件将 YAML/Gherkin 解析库安装到 `${HOME}/.local/share/ai-coding-workflow/`，供多个项目共享。接入新项目或仅修改 skill 文本、模板通常无需重装。Node.js 和 npm 需预先具备；脚本不安装业务依赖。具体职责与测试目录配置见 [SKILL.md 的脚本入口](.agents/skills/develop-work-flow/SKILL.md#script-entry)。

### 3. 调用工作流

在 AI 工具中调用已加载的 `develop-work-flow`，说明需求及授权范围。例如：

```text
使用 develop-work-flow，为当前项目规划用户资料编辑功能；本次仅规划。
```

AI 调查后选择文档模式、分配需求目录并完善计划；后续实施和验收继续维护同一目录。

## 校验与生成

以下命令在目标项目根执行，需求源文件须已由对应阶段准备完成。将示例需求目录替换为实际名称；`--feature` 填 `req-r01-profile` 这样的完整目录名，不带 `doc/` 前缀。

```sh
workflow_feature="req-r01-profile"
node .agents/skills/develop-work-flow/scripts/workflow.mjs validate --project "$PWD" --feature "$workflow_feature"
node .agents/skills/develop-work-flow/scripts/workflow.mjs render --project "$PWD" --feature "$workflow_feature"
node .agents/skills/develop-work-flow/scripts/workflow.mjs check --project "$PWD" --feature "$workflow_feature"
```

| 命令 | 职责 |
| --- | --- |
| `validate` | 检查 DSL 结构、编号、引用、依赖、状态及必要证据字段 |
| `render` | 校验后生成按依赖排序的 `plan.md` |
| `status` | 从任务数据生成四列 `task-status.md` |
| `check` | 检查 `plan.md` 和已存在的 `task-status.md` 是否与来源一致 |

最后验收更新任务状态与证据后，依次运行 `render`、`status`、`check`。这些工具不执行任务中的验证命令，也不自动核验 `evidence.md` 的完整性或真实性；业务测试、审查和证据核对由 AI 使用项目自身工具完成。

## 文档与技能导航

| 入口 | 内容 |
| --- | --- |
| [工作流约定](design-docs/workflow.md) | 分流、文档职责、测试、迭代承接、证据与 Git 追溯 |
| [设计说明](<design-docs/AI Coding 设计说明.md>) | 架构、DSL 字段、接入方式和设计依据 |
| [develop-work-flow](.agents/skills/develop-work-flow/SKILL.md) | 统一编排与脚本使用说明 |
| [req-writer](.agents/skills/req-writer/SKILL.md) / [prd-writer](.agents/skills/prd-writer/SKILL.md) | 需求梳理、产品行为与验收场景 |
| [trd-writer](.agents/skills/trd-writer/SKILL.md) | 技术设计与任务 DSL |
| [coder](.agents/skills/coder/SKILL.md) / [e2e-validator](.agents/skills/e2e-validator/SKILL.md) | 按任务实施、测试、审查与最终验收 |
| [lite 模板](.agents/skills/develop-work-flow/assets/lite/) / [full 模板](.agents/skills/develop-work-flow/assets/feature/) / [证据模板](.agents/skills/develop-work-flow/assets/evidence.md) | 需求目录起稿模板 |
| [doc-reviewer](.agents/agents/doc-reviewer/AGENT.md) / [code-reviewer](.agents/agents/code-reviewer/AGENT.md) | 文档与代码的只读审查 |

## 维护与验证

自有 skills、agents、脚本和模板的唯一源为 `.agents/`；本仓库的设计正文统一维护于 `design-docs/`。业务代码与业务文档归目标项目，第三方 skills 和运行依赖安装在用户家目录。通过软链接读取相对文档时，先解析真实源路径。

维护脚本后，在 AICoding 根目录运行测试（依赖需已准备）：

```sh
node --test .agents/skills/develop-work-flow/scripts/workflow.test.mjs
```

测试使用临时 fixture。维护约定见 [AGENTS.md](AGENTS.md)；业务项目实施仍以该项目的具体授权范围为准。
