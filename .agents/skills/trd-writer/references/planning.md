# 任务计划、场景与迭代

### 两种模式共用的生成视图

- `plan.md`：从 DSL 生成团队阅读计划，展示任务顺序与追溯关系；生成正文不手改，最末评审区按[评审规则](../../../agents/doc-reviewer/references/review.md#document-review-status)维护。
- `task-status.md`：从规划到验收持续更新的独立状态视图，由当前阶段的协调记录者按[任务状态列表](#task-status)生成。

测试例子须保留必要输入与断言，不因唯一来源原则而删去。两种模式均由 `plan.yaml` 明确任务来源，生成视图不承担业务或任务事实的维护职责。

<a id="script-entry"></a>
## 校验计划与生成状态表

在目标项目根目录运行 [plan.mjs](../scripts/plan.mjs)，`--feature` 填 `doc/` 下实际的需求目录名。依赖由 [trd-writer 安装脚本](../scripts/install.mjs) 一并安装。下面的示例使用 Codex 用户级入口，其他工具从各自用户级 skills 目录下的 `trd-writer/scripts` 调用。

```sh
plan_scripts="${CODEX_HOME:-${HOME}/.codex}/skills/trd-writer/scripts"
plan_feature="req-r01-profile-git-user"
node "$plan_scripts/plan.mjs" validate --project "$PWD" --feature "$plan_feature"
```

同一组项目和需求参数适用于以下命令。定稿时依次执行 `validate`、`render`、`status`、`check --final`。

| 命令 | 做什么 |
| --- | --- |
| `validate` | 按 `plan.yaml` 的模式校验源文件、规则和场景引用、任务依赖、状态及必要证据字段。 |
| `render` | 校验后按依赖顺序生成 `plan.md`。 |
| `status` | 校验后生成 [task-status.md 任务状态表](#task-status)。 |
| `check` | 检查 `plan.md` 及已存在的 `task-status.md` 是否和当前计划一致。 |
| `check --final` | 检查两份生成文件均存在且与本版一致。要求源计划写明本轮理解和每项任务的上下游，并且每项前置任务都已排在使用方之前。 |

`render` 和 `status` 会拒绝覆盖手写文件。检查失败时按报错修正源文件，再运行对应命令。业务验证仍需在目标项目运行每项任务的测试，并核对实际结果。

<a id="dsl"></a>
## DSL 契约

Gherkin 定义验收场景，YAML 定义当前迭代的任务。`plan.yaml` 通过 `mode` 选择文档契约；省略时按 full 读取，不根据文件缺失推断模式。工具只校验与生成，真实测试由项目测试程序执行。

### 任务引用的场景

R 与 S 的编号和 Gherkin 写法见 [PRD 的验收场景规则](../../prd-writer/references/acceptance-scenarios.md)。计划只引用当前迭代的场景。两种模式中，有行为的任务都必须有场景与真实测试，lite 不提供 TDD 豁免。无行为任务须写 `scenarios: []` 和具体 `tdd_exception`，仍关联需求与设计并提供适当验证证据；只有这类任务时，lite 可省略 Gherkin 块。

### 测试维度

按 [RIGHT-BICEP](../../e2e-validator/references/verification.md#right-bicep) 设计用例。technical.md 维护各维度的适用性和场景/测试引用；相关任务通过 `design` 引用 `technical.md#test-strategy`，执行结果写入 `evidence`。六个维度都要思考，但记录可用紧凑描述，不强制六行表；不适用项可以合并说明理由。任务按实际交付结果拆分。

### 任务格式

```yaml
schema: 1
mode: lite
feature: req-r01-profile-git-user
iteration: "01"
understanding: 用户修改显示名称时，空名称应被拒绝。用户能看到原因，原名称保持不变。
tasks:
  - id: T01
    title: 拒绝空显示名称
    handoff: 使用已有的资料更新请求校验名称。拒绝空名称并保留原值，向 T02 提供可识别的校验错误。
    requirements: [R01]
    scenarios: [S01]
    design: [technical.md#api-01, technical.md#test-strategy]
    files: [src/profile.mjs, test/profile.test.mjs]
    depends_on: []
    verify: node --test test/profile.test.mjs
    status: todo
    remark: ""
  - id: T02
    title: 在资料表单提示名称为空
    handoff: 表单读取 T01 返回的校验错误。验收时提交空名称，确认页面提示填写名称且原名称仍可见。
    requirements: [R01]
    scenarios: [S01]
    design: [technical.md#api-01, technical.md#test-strategy]
    files: [src/profile-form.mjs, test/profile-form.test.mjs]
    depends_on: [T01]
    verify: node --test test/profile-form.test.mjs
    status: todo
```

示例命令只示范格式；正式任务必须结合目标项目给出真实入口，不允许把占位符当作可执行计划。

| 字段 | 约定 |
|---|---|
| `schema` | 固定整数 1；未知版本拒绝读取 |
| `mode` | 本轮的文档契约，可选 lite 或 full；未填写按 full 读取；切换按迭代承接规则处理，不能仅改字段 |
| `feature` | 需求目录完整名称，如 req-r01-profile-git-user，对应 doc/req-r01-profile-git-user/，不增加目录层级 |
| `iteration` | 非空字符串，标识当前迭代，建议写成带引号的编号 |
| `understanding` | 定稿必填。用一段话说明对本轮问题、范围和可观察结果的理解，生成在计划的首项任务之前。 |
| `tasks` | 本轮执行任务及必要的已完成前置任务（包含其传递依赖），至少一项；无关历史不累积在当前计划 |
| `id`、`title` | 稳定 T 编号（如 T01）和清楚的结果描述 |
| `handoff` | 每项任务定稿必填。写明实际输入及来源、交付结果和下游用途，末项写明验收结果。 |
| `requirements` | 本任务涉及的 R 编号，至少一个；lite 在 TRD 声明，full 在 PRD 声明 |
| `scenarios` | 本任务验收的 S 编号；有场景时任务的 R 与所引场景的 R 集合一致；无行为任务写 [] 并提供 tdd_exception |
| `design` | 至少一个文件与显式锚点，如 technical.md#api-01；文件相对功能文档目录 |
| `files` | 预计新增或修改的文件，相对项目根；允许尚不存在，不允许路径越界或 Git 内部路径 |
| `depends_on` | 本轮前置任务编号，无依赖写 []；不可循环 |
| `verify` | 在项目根执行的实际验证命令；工具不执行此字符串 |
| `status` | todo、doing、done、blocked |
| `remark` | 可选字符串，可为空；任务状态列表的简短备注，未填写显示“—”；前轮基线或上游打回须写明，不替代 evidence |
| `evidence` | 可选；包含 red、green、review 的简短结果及可定位证据；done 时 green/review 必填，red 或 tdd_exception 至少一个 |
| `tdd_exception` | 可选；没有适用行为测试或新 RED 时的具体理由，不得用来绕过未验证行为 |

证据不粘贴整段日志。例如 `green: "node --test ...：8/8 通过；test/profile.test.mjs 的 S01 用例"`。审查注明独立或自审及结论。日志较长时链接可复核的报告；任务阻塞原因写入 remark；详细审查证据仍放 review。`doing` 与 `done` 都要求依赖已 done，但它仍不自动等于已提交、已部署或所有环境验收完成。上游被打回时，由验收方/协调记录者按[依赖恢复规则](../../e2e-validator/references/verification.md#rework)一并阻塞传递依赖并处理失效证据；CLI 不自动变更状态。跨轮基线保留和退出项处理见[迭代承接](#iteration)，并行写入见[记录归并](../../develop-work-flow/SKILL.md#collaboration)。

### 校验与路径边界

- 仅接受上表定义的字段。顶层必填 schema、feature、iteration、tasks。每项任务必填 id、title、requirements、scenarios、design、files、depends_on、verify、status。understanding 和 handoff 一旦填写必须为非空字符串。已有计划可按原格式读取，本轮定稿时补齐说明并按[定稿顺序](../SKILL.md#plan-walkthrough)排列。evidence 仅允许 red、green、review，已提供的值必须为非空字符串。
- YAML 按 1.2 解析，拒绝重复键、未知字段与解析警告；所有列表元素必须符合各自类型且不重复、不带首尾空格。任务的 requirements、design、files 非空，scenarios、depends_on 可为空；任务编号唯一，标题与 verify 为非空字符串。
- `design` 使用相对需求目录的 `.md#显式锚点`，目标必须存在且仍在项目内；`files` 相对项目根，可列尚未创建的文件；`verify` 在项目根执行，正式计划使用该项目的真实测试入口。跨需求协作在技术文档明确，`depends_on` 只引用同一计划内任务。
- 需求源文件、引用文档、输出和任务文件的路径不能越过项目根或进入 `.git`，现存路径组成部分不能为软链接；这不禁止用共享 `.agents` 软链接加载技能脚本。替换模板中的 `REPLACE_*`、`TBD` 等占位符后再校验。
- 场景大纲和带 Examples 的普通场景都可以在标题、步骤和步骤参数中引用示例列，例如 `<单价>` 或 `<实际单价>`。同一场景内每组含数据行的 Examples 都须提供所引用的列。示例值和文档正文里的模板占位符须填实。full 和 lite 遵循同一规则。
- 每个场景直接声明唯一 S 编号并关联已声明 R；有场景的任务，其 requirements 必须与所引用场景的 R 集合完全一致。场景库允许保留本轮未引用的历史场景。
- 自动校验检查结构、引用和状态条件，不证明业务语义、证据真实性或历史编号未被复用；这些由执行者与审查者核对。

<a id="iteration"></a>
## 迭代承接与文档深度变化

先复用已确认的需求性质，再判断本轮是否改变产品逻辑。技术需求从简单扩大为复杂，仅增加技术设计与验证深度，不因此触发 PRD 或 full 布局。已有产品需求的迭代按下表同步受影响文档；独立技术需求不因技术实现涉及产品而补写 PRD。

先按[新需求独立成文](../../develop-work-flow/references/deliverables.md#requirement-document-boundary)区分独立新需求与同一需求迭代。同一需求沿用原目录、文档布局和 R/S/T 编号；不能因为本轮改动小就将 full 改为 lite，或搬动规则和场景。`mode` 表示文档来源契约，不表示本轮工作量。先核对原需求、PRD（如有）、TRD、未完成任务与代码现状，按实际影响更新。

| 本轮情况 | 编写范围 | 权威来源 |
|---|---|---|
| 同一需求的纯技术小迭代，产品逻辑不变 | 设计文档只更新原 TRD，不新建需求目录，不重写 PRD；任务、状态及证据有变化时同步相关记录 | 产品规则仍以原 PRD（如有）为准，TRD 引用相关章节并说明技术变化 |
| 同一需求的产品逻辑小变更 | 同步更新原 PRD 中受影响的规则；按影响更新场景、TRD、计划和状态，不新建需求目录，业务目标或约束变化时同步 PRD 对应章节 | 已有 PRD 始终维护当前产品规则，不能只在 TRD 写相反规则而把 PRD 留作过期基线 |
| 原需求按规则省略了 PRD，仍符合省略条件 | 继续在原 TRD 更新规则、方案与场景，未变内容引用原章节 | 保持现有 lite 来源，不为一次小改补建 PRD |
| 业务需求复杂度扩大，不再符合 lite，或用户确认采用完整业务文档集 | 在原目录分阶段补齐 PRD、场景和 TRD 内容，未变内容引用；在 evidence.md 记录原 TRD 编号及可复核版本 | PRD 承接整理后的业务输入，TRD 承接技术设计，避免维护两份当前产品规则 |
| 具有独立目标和验收范围的新需求 | 新建需求目录，按需求性质和复杂度确定文档集合 | 引用相关历史章节，不复制整套旧文档 |

TRD 使用稳定文档编号 `TRD-<需求目录>`，例如 `TRD-req-r01-profile-git-user`，在 technical.md 头部标明并使用 `trd` 锚点；它由需求目录派生，不另建编号系统。引用具体版本时同时注明迭代与 Git 基线提交，例如 `TRD-req-r01-profile-git-user` 的迭代 01、基线 `<commit>`；需求子项仍使用 `req-r01-profile-git-user/R01`，文档编号不能代替 R/S/T。

重写同一路径前记录原 TRD 的编号、来源与版本；有 Git 基线时可用 `git show <commit>:doc/req-r01-profile-git-user/technical.md` 复核，不能把指向重写后当前文件的链接当作原版本证据。未提交输入在 evidence.md 中保留必要原文摘录、来源和版本状态，不伪造提交引用，也不为留证擅自提交。

仅在文档职责确实改变且范围已确认时调整布局，不为小迭代主动执行 full → lite。确需切换时保留已有 R/S/T 及可复核来源，核对规则、场景、设计和任务引用完整，必要前置任务仍有有效验证依据。lite → full 后按 full 职责维护当前规则，旧 TRD 版本仅作为历史来源。布局切换不自动改变业务范围或取得实施授权。

### 跨轮任务承接

`plan.yaml` 包含本轮要执行的任务，以及它们所需的已完成前置任务及其传递依赖。未完成任务沿用原编号结转；若决定退出或推迟到本轮之外，先明确范围调整，再在 evidence.md 记录原 ID、原因、确认依据和后续安排，不能静默消失。新增工作使用未使用过的新编号，不将旧 ID 改作另一项工作。

必要前置任务保留原 `done`、设计/场景引用和仍有效的证据，在 remark 标明“前轮依赖基线，非本轮新增成果”；无关历史留给 Git。当前模式必须能解析计划中每项保留任务的 R/S/设计引用，不能留下悬空依赖。新工作依赖它们，不等于必须重做它们；先核对基线与当前代码/契约是否匹配，仅在变化、失效或覆盖疑点时复验。

任务状态表列出本轮计划全部条目，包括已标注来源的必要前置基线。切换 iteration 前确认未完成项的去向与引用闭合，更新本轮上下文、证据和生成视图。

<a id="execution"></a>
## 可执行的含义

AI 读取 `plan.yaml`、引用设计和场景，用宿主已有工具实施。Gherkin 场景绑定真实测试代码/步骤，由项目测试程序执行。生成器只读文件并生成 Markdown，**不会运行 YAML 中的命令、调用模型或自动改业务代码**。

测试框架按项目实际情况选择，不强制安装 Cucumber。使用其他框架时，场景 ID 必须映射到可定位、可执行的测试；仅把 Gherkin 解析成功或让 AI 阅读，不能称为验收通过。缺少测试基础设施时，将最小测试入口列入任务，不假设命令已存在。

若文档与 DSL 语义冲突，先按职责所属文档查明意图并修正；涉及已确认业务、范围或外部契约变化时只对齐相关差异。所有阶段遵循 stage-authorization；历史逻辑的代码设计变化还需具体确认，不能以“内部实现调整”代替，新功能不得凭笼统实施授权跨环节推进。

<a id="task-status"></a>
## 规划至验收：任务状态列表

在需求目录生成独立的 `task-status.md`，路径为 `doc/req-【需求】/task-status.md`，例如 `doc/req-r01-profile-git-user/task-status.md`。它与该需求的 plan.yaml 放在同一目录，不集中存放多个需求的任务。

任务状态正文只显示以下四列，不增加表格标题、统计、执行日志或其他任务字段；文件最末另设[评审结论](../../../agents/doc-reviewer/references/review.md#document-review-status)：

| 任务编号 | 名称 | 状态 | 备注 |
|---|---|---|---|
| T01 | 实现输入校验 | 未开始 | — |

上表仅为格式示例。实际文件由生成器读取本轮 `plan.yaml` 的全部任务，按依赖顺序生成；四列依次来自 id、title、status、remark，缺少备注显示“—”。状态显示为：todo → 未开始，doing → 进行中，done → 已完成，blocked → 受阻。

规划阶段任务初始状态为 todo，不把方案获批标为任务完成；实施和验收阶段由当前记录者依据真实结果更新 DSL：未执行或未通过的任务不能标记已完成；失败、受阻及待验证事项在 remark 中简短说明原因与下一步，详细证据引用实际测试报告；全链路记录、手工验收和审查结论统一汇入 `evidence.md`，引用真实来源。即使未全部通过，也应如实生成该状态列表。

随后运行 `render`、`status`、`check`。任务列表不手工维护；末尾评审区由协调记录者按实际结果更新。后续任务状态或备注变化时重新生成，并复核评审状态。CLI 的 check 仅在列表存在时检查它是否过期，因此每次计划交付必须先运行 status，再 check，并核对文件存在；不能把 check 单独通过当作交付齐全。状态表是任务结果摘要，不代替业务验收和测试证据。
