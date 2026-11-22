# AI Coding

AI Coding 是一套供团队与 AI 协作使用的研发工作流。通过 Markdown 工程文档、Gherkin 验收场景和 YAML 任务计划，把需求、设计、实现、测试与 Git 提交连接起来，按可独立验收的小功能持续推进。

[develop-work-flow](.agents/skills/develop-work-flow/SKILL.md) 安排各阶段的顺序、交付和用户确认。每项专业规则由负责这项工作的 skill 维护，其他 skill 在需要时直接引用。技能执行所需的材料来自 `.agents/` 和目标业务项目。维护者可另查阅[工作流维护说明](design-docs/workflow.md)与[设计依据](<design-docs/AI Coding 设计说明.md>)。

初次使用请从[接入业务项目](#onboarding)开始。

## 工作方式

业务需求由 PRD 说明用户问题、业务规则和验收场景。TRD 将这些规则落实为系统方案、API 和数据结构定义，以及实施计划。新增或变更的 API 由 api-first 设计，交付方法签名以及适用的写入参数（Param）、查询条件（Query）、返回数据（DTO）的字段定义。交付覆盖本次用到的请求入口（Controller）、仓储接口（Repository）、数据访问接口（DAO）和持久化对象（PO）。TRD 确定各步读写什么数据、PO 的字段如何映射到表列，引用同一份声明源码或拟应用的差异。

TRD 把方案和计划一起交给用户，逐步说明业务目的、前后依赖及完成条件。用户批准本版方案及实施批次后，实际编写代码的代理必须先使用 [coder](.agents/skills/coder/SKILL.md)，按其规范实现业务、联调和测试，随后按授权交给 e2e-validator 独立验收。

AI 根据本轮需求意图选择文档深度，根据当前代码、调用关系和测试判断是否改变存量行为。这两个判断相互独立：

| 文档模式 | 适用范围 | 设计与计划源文件 |
| --- | --- | --- |
| `lite` | 获准单独开展的内部技术需求，以及延续已有布局的迭代 | `technical.md`（TRD，含目标、设计及适用的验收场景）、`plan.yaml` |
| `full` | 以 PRD 记录业务规则与验收场景的产品需求 | `product.md`、`technical.md`、`acceptance.feature`、`plan.yaml` |

新需求澄清关键未知后，按已授权范围推进。**涉及历史功能逻辑变更时，无论 full/lite，都必须先展示具体代码设计并取得用户确认，才能实施**；一般开发授权、文档完整或“内部调整”不能替代代码设计确认。通过 `grill-me`（可委托 `grilling`）确认具体改法、边界、职责与保留行为。仅规划时交付文档与计划。判定细节见[分流规则](.agents/skills/develop-work-flow/SKILL.md#routing)与[确认要求](.agents/skills/trd-writer/references/design-decisions.md#existing-confirmation)。

业务产物保存在目标项目的需求目录中，例如 `doc/req-r01-profile-git-user/`。新目录末尾使用目标项目的 Git 用户名。两种模式都维护 `evidence.md`，记录各阶段的上下文、输入、输出、实际结果和可定位证据；从 `plan.yaml` 生成阅读计划 `plan.md`，从首次计划交付起生成并刷新[任务状态表](.agents/skills/trd-writer/references/planning.md#task-status)。

涉及行为的任务保留真实 RED/GREEN 与审查证据，按 [RIGHT-BICEP](.agents/skills/e2e-validator/references/verification.md#right-bicep) 考虑适用测试维度。需求、场景、任务使用稳定的 R/S/T 编号，跨轮承接与 Git 追溯遵循[迭代约定](.agents/skills/trd-writer/references/planning.md#iteration)。

<a id="onboarding"></a>
## 接入业务项目

准备好 Git、Node.js 22+ 和 npm。在本仓库根目录，用 Bash 或 Zsh 将研发流程的六个 skill 链接到 Codex 的用户级目录。已有正确链接的机器可跳过这一步。其他工具使用各自的用户级 skills 目录。

```bash
skills_source="$(pwd -P)/.agents/skills"
skills_target="${CODEX_HOME:-${HOME}/.codex}/skills"
mkdir -p "$skills_target"
ln -s "$skills_source"/{develop-work-flow,prd-writer,trd-writer,api-first,coder,e2e-validator} "$skills_target/"
```

首次使用计划工具时，在本仓库根目录用 npm 按锁文件安装依赖。同一用户的多个项目共用这份安装。

```bash
plan_deps="${HOME}/.local/share/ai-coding-workflow"
mkdir -p "${HOME}/.local/share"
mkdir "$plan_deps" &&
  cp .agents/skills/trd-writer/scripts/package{,-lock}.json "$plan_deps/" &&
  (cd -P "$plan_deps" && npm ci --ignore-scripts --no-audit)
```

已有可用依赖时直接复用。需要更新锁定版本或修复安装时，先将原依赖目录改名留存，再运行上面的命令。分轮访谈使用的第三方 `grilling` 单独装在工具的用户级 skills 目录。

在目标业务项目打开新的 Codex 会话，确认技能列表中能看到 `develop-work-flow`，就可以说明任务和允许执行的范围。

```text
使用 develop-work-flow，为当前项目规划用户资料编辑功能；本次仅规划。
```

AI 调查后选择文档模式、分配需求目录并完善计划；后续实施和验收继续维护同一目录。

## 校验与生成

在目标项目准备好需求文件后，按 [trd-writer 的计划工具用法](.agents/skills/trd-writer/references/planning.md#script-entry)运行 `plan.mjs`，`--feature` 填本次需求目录的实际完整名称。

| 命令 | 职责 |
| --- | --- |
| `validate` | 检查 DSL 结构、编号、引用、依赖、状态及必要证据字段 |
| `render` | 校验后生成按依赖排序的 `plan.md` |
| `status` | 从任务数据生成 `task-status.md` |
| `check` | 检查 `plan.md` 和已存在的 `task-status.md` 是否与来源一致 |

最后验收更新任务状态与证据后，依次运行 `render`、`status`、`check`。这些工具不执行任务中的验证命令，也不自动核验 `evidence.md` 的完整性或真实性；业务测试、审查和证据核对由 AI 使用项目自身工具完成。

## 文档与技能导航

| 入口 | 内容 |
| --- | --- |
| [develop-work-flow](.agents/skills/develop-work-flow/SKILL.md) | 选择阶段、安排交接、确认下一步授权范围 |
| [prd-writer](.agents/skills/prd-writer/SKILL.md) | 编写 PRD，说明用户、痛点、竞品、业务规则和验收场景。见[产品模板与场景模板](.agents/skills/prd-writer/templates/) |
| [trd-writer](.agents/skills/trd-writer/SKILL.md) | 汇总接口定义，完成概要、数据结构和数据库设计，讲解每一步的目的、顺序与完成条件。见[技术与计划模板](.agents/skills/trd-writer/templates/) |
| [api-first](.agents/skills/api-first/SKILL.md#layer-contracts) | 设计 API 方法及协议类型，明确各层接口的输入、输出、失败及兼容行为，交付可审阅的接口与数据声明源码或拟应用的源码差异 |
| [coder](.agents/skills/coder/SKILL.md) | 按获批方案和任务实现业务代码、联调、测试。设计阶段可按 [接口声明模式](.agents/skills/coder/SKILL.md#interface-code)编写已确定的声明 |
| [e2e-validator](.agents/skills/e2e-validator/SKILL.md) | 核验场景、测试和证据，列出通过、失败和未验证项。见[证据模板](.agents/skills/e2e-validator/templates/evidence.md) |
| [doc-reviewer](.agents/agents/doc-reviewer/AGENT.md) 与 [code-reviewer](.agents/agents/code-reviewer/AGENT.md) | 分别对文档和代码进行只读审查 |

## 维护与验证

自有 skills、审查代理、脚本和模板的源码都在 `.agents/`。维护某项规则时，修改负责方目录内的正文，核对其调用方和模板。业务代码与业务文档归目标项目，第三方 skills 和运行依赖安装在用户家目录。通过软链接加载时，先解析真实路径以定位包内资源。

维护计划工具后，在 AICoding 根目录运行测试（依赖需已准备）：

```sh
node --test .agents/skills/trd-writer/scripts/plan.test.mjs
```

测试使用临时 fixture。维护约定见 [AGENTS.md](AGENTS.md)；业务项目实施仍以该项目的具体授权范围为准。
