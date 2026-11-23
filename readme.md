# AI Coding

AI Coding 是一套供团队与 AI 协作开发的 skills。你可以用它从需求一路推进到独立验收，也可以单独调用某个 skill，例如写产品需求、定义接口或验收已经实现的功能。

[接入业务项目](#onboarding) · [研发流程](#workflow) · [需求文件与计划](#deliverables) · [专项 skills](#specialized-skills) · [维护](#maintenance)

<a id="onboarding"></a>
## 接入业务项目

**1. 安装核心 skills。** 在 AICoding 仓库根目录用 Bash 或 Zsh 运行下面的命令，将六个核心 skill 链接到 Codex 的用户级目录。已有正确链接时可跳过，其他工具使用各自的用户级 skills 目录。

```bash
skills_source="$(pwd -P)/.agents/skills"
skills_target="${CODEX_HOME:-${HOME}/.codex}/skills"
mkdir -p "$skills_target"
ln -s "$skills_source"/{develop-work-flow,prd-writer,trd-writer,api-first,coder,e2e-validator} "$skills_target/"
```

**2. 准备计划工具。** 使用 `plan.mjs` 需要 Node.js 22+ 和 npm。在 AICoding 仓库根目录按锁文件安装依赖，同一用户的业务项目可以共用。已有可用依赖时直接复用。需要更新或修复时，先把旧依赖目录改名留存，再运行下面的命令。

```bash
plan_deps="${HOME}/.local/share/ai-coding-workflow"
mkdir -p "${HOME}/.local/share"
mkdir "$plan_deps" &&
  cp .agents/skills/trd-writer/scripts/package{,-lock}.json "$plan_deps/" &&
  (cd -P "$plan_deps" && npm ci --ignore-scripts --no-audit)
```

**3. 在目标业务项目开新会话。** 确认 Codex 找得到 `develop-work-flow`，直接说清要做的事和本轮范围。例如：

> 使用 develop-work-flow，为当前项目规划用户资料编辑功能。先确认业务规则和验收场景，本轮做到产品需求为止。

<a id="workflow"></a>
## 研发流程

[develop-work-flow](.agents/skills/develop-work-flow/SKILL.md) 负责判断从哪个阶段开始、安排交接和确认下一步范围。业务需求按 **产品需求 → 技术设计与计划 → 编码 → 独立验收** 推进。

| 你要做什么 | Skill | 会交付什么 |
| --- | --- | --- |
| 说清用户问题、业务规则和验收标准 | [prd-writer](.agents/skills/prd-writer/SKILL.md) | 产品需求（PRD）和可观察、可测试的验收场景 |
| 确定系统怎么改、数据怎么读写、先做哪一步 | [trd-writer](.agents/skills/trd-writer/SKILL.md) | 技术方案（TRD）、数据结构与存储设计、实施计划和状态表 |
| 新增、修改或审查接口 | [api-first](.agents/skills/api-first/SKILL.md) | 可审阅的接口签名和类型声明。按项目列出适用的 Controller、Repository、DAO 方法及 Param、Query、DTO、PO 字段 |
| 按已确认的方案写代码并验证 | [coder](.agents/skills/coder/SKILL.md) | 获批范围内的代码、联调和测试结果。编写接口或数据类型声明前也要先使用该 skill |
| 验收做完的功能 | [e2e-validator](.agents/skills/e2e-validator/SKILL.md) | 按场景核对真实测试和证据，列出通过、失败及未验证的事项 |

接口变更可以单独交给 `api-first`，也可以由 TRD 发起。TRD 确定数据的读写行为和字段如何对应到数据库列，并引用 `api-first` 交付的声明或拟议源码差异。

各阶段交付后，先看结果并确认下一步范围。新建或切换 Git 分支、开始写或修订 TRD，都须先取得用户明确同意。复杂需求在实施前须确认具体方案、主要取舍、风险和本次要做的任务。改动已有功能逻辑时，还要确认具体改法和影响。[阶段授权](.agents/skills/develop-work-flow/references/authorization.md#stage-authorization) · [存量设计确认](.agents/skills/trd-writer/references/design-decisions.md#existing-confirmation)

只需要审查时，可以走只读入口。[文档审查](.agents/agents/doc-reviewer/AGENT.md) · [代码审查](.agents/agents/code-reviewer/AGENT.md)

<a id="deliverables"></a>
## 需求文件与计划

业务产物保存在目标项目的 `doc/` 下，每个新需求用独立目录，例如 `doc/req-r01-profile-git-user/`。同一需求继续迭代时沿用原目录和编号。目录后缀取自目标项目实际使用的 Git 用户名。[需求目录命名](.agents/skills/develop-work-flow/references/deliverables.md#requirement-directory-naming)

| 布局 | 从哪里开始 | 维护哪些源文件 |
| --- | --- | --- |
| `full`，新业务需求 | PRD | `product.md`、`acceptance.feature`、`technical.md`、`plan.yaml` |
| `lite`，明确的内部技术需求 | 获准的 TRD | `technical.md`、`plan.yaml`。适用的验收场景写在 TRD 内 |

两种布局都用 `evidence.md` 记录阶段交付、用户确认和验证证据，并从 `plan.yaml` 生成 `plan.md` 和 `task-status.md`。方案和测试要做到多细，取决于需求的复杂度、风险和影响范围。[文件职责与模板](.agents/skills/develop-work-flow/references/deliverables.md#documents)

在目标项目根目录运行 trd-writer 的 `plan.mjs`，将 `--feature` 指向实际需求目录名。

| 命令 | 用途 |
| --- | --- |
| `validate` | 检查计划格式、需求与场景引用、任务依赖、状态和证据字段 |
| `render` | 生成按依赖排序的 `plan.md` |
| `status` | 生成 `task-status.md` |
| `check` | 检查阅读计划和已有的状态表是否与源计划一致 |
| `check --final` | 定稿检查，要求两份生成文件都齐全，并核对本轮需求说明、任务交接和顺序 |

计划定稿时依次执行 `validate`、`render`、`status`、`check --final`。业务行为和测试结果由目标项目的实际测试及独立验收核对。[完整命令示例](.agents/skills/trd-writer/references/planning.md#script-entry)

<a id="specialized-skills"></a>
## 专项 skills

按任务需要选择，安装时使用对应工具的用户级 skills 目录。

| Skill | 适用任务 |
| --- | --- |
| [sparrow-clean-architecture](.agents/skills/sparrow-clean-architecture/SKILL.md) | 为 Sparrow 风格的 Java/Maven 项目添加或合并分层规则 |
| [java-react-form](.agents/skills/java-react-form/SKILL.md) | 根据指定 Java 类生成 React 新增、编辑表单及对应的 TypeScript 类 |
| [my](.agents/skills/my/SKILL.md) | 按用户指定的方式，串行或并行调度多项任务 |
| [write-blog](.agents/skills/write-blog/SKILL.md) | 撰写或修改 sparrowzoo 博客 |
| [write-doc](.agents/skills/write-doc/SKILL.md) | 用户明确点名时，撰写或修改 sparrow-js 主站文档文章 |
| [write-release](.agents/skills/write-release/SKILL.md) | 撰写或更新 sparrow-js 发版记录 |
| [clean-project](.agents/skills/clean-project/SKILL.md) | 用户明确要求清空项目根目录时，列出待删除项并等待确认 |
| [task-monitor](.agents/skills/task-monitor/SKILL.md) | 在以 `claude --dangerously-skip-permissions` 启动并设置 `CLAUDE_UNATTENDED=1` 的 Claude 会话中，按已授权范围发送任务通知 |

<a id="maintenance"></a>
## 维护

`.agents/` 是自有 skills、审查代理、模板和脚本的唯一源码。修改规则时，从负责该项工作的 skill 或审查代理入手，核对它的模板和调用方。通过软链接使用时，从 skill 的真实路径定位配套文件。第三方 skills，例如分轮确认用的 `grilling`，安装在工具的用户级 skills 目录。

修改计划工具后，在 AICoding 仓库根目录用已安装的依赖运行测试：

```sh
node --test .agents/skills/trd-writer/scripts/plan.test.mjs
```

[仓库维护约定](AGENTS.md) · [工作流维护说明](design-docs/workflow.md) · [设计说明](<design-docs/AI Coding 设计说明.md>)
