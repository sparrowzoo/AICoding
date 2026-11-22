---
name: trd-writer
description: 编写技术设计和实施计划。召回关键词：写 TRD、出技术方案、评审技术设计、设计数据库表结构、设计 DAO 读写和 PO 映射、把方案拆成实施步骤、梳理任务上下游、按依赖顺序定稿 plan。确定模块调用和数据结构，委托 api-first 设计接口及协议字段，向用户讲解计划和验证办法。
---

# 技术设计与实施计划

用户单独要求“评审技术设计”“review TRD”或复审已有方案时，直接按 [doc-reviewer 的报告要求](../../agents/doc-reviewer/AGENT.md#doc-review-report)只读审查并交付[五项评分](../../agents/doc-reviewer/references/review.md#trd-scoring)。下列编写、定稿和回写步骤在用户授权修订时执行。

技术设计者负责回答“怎样在现有系统中实现并验证已确认的业务行为”。本阶段交付 `technical.md`、涉及变更的设计源码或可审阅的源码差异、`plan.yaml` 及生成的 `plan.md`、`task-status.md`。方案应让实施者能从业务场景找到具体 API 方法、输入输出类型、内部数据结构，以及适用的 DAO 方法和 PO 字段。产品规则有歧义时，列出受影响的场景并请产品阶段澄清。

## 输入与授权

- 新任务先核对[执行方式](../develop-work-flow/references/authorization.md#execution-choice)与[阶段授权](../develop-work-flow/references/authorization.md#stage-authorization)。每轮编写或修订 TRD 前，向用户说明为什么需要写、文件位置和本轮范围，等明确同意再写。同一轮同一文件及范围已有明确授权时直接复用。首次写入前核对[分支准备](../develop-work-flow/references/authorization.md#requirement-branch)。
- 业务需求读取本次 PRD、已确认的业务规则和验收场景。独立技术需求按[需求分流](../develop-work-flow/SKILL.md#routing)读取已确认的技术目标、影响范围及技术验收条件。既有技术轻量布局可继续在 TRD 维护规则 R 锚点及验收场景；有产品文档的需求以同一版本的产品规则为准。
- 用户级软链接调用时，按当前 skill 的真实位置查找规则。读取项目当前源码、相关调用方、运行配置、既有接口与数据库事实。按[需求目录归属](../develop-work-flow/references/deliverables.md#requirement-document-boundary)和[迭代承接](references/planning.md#iteration)区分新需求及同一需求的修订，保留稳定的 R/S/T 编号、待完成任务和仍需引用的前置基线。记录实际版本；未提交的输入按当前内容留证。
- 重大设计先按[设计边界](references/design-decisions.md#design-boundary)呈交现有能力、拟新增职责、取舍和影响。已获准的技术细节由设计者核实。改变业务效果、成本承诺、数据归属或权限时，交回对应决策者确认。涉及存量逻辑时按[存量设计确认](references/design-decisions.md#existing-confirmation)说明历史文件、方法、调用关系、拟保留及改变的行为，以及需要的回归检查。

## 概要设计、API 与数据结构

按[TRD 模板](templates/technical.md)的章节、顺序和层级写作，按[模板职责](references/trd-template.md#trd-template)放置 `trd`、接口、测试、授权和验收锚点。保留 `TRD-<需求目录>`、版本、相关人、迭代和来源。按实际范围复用既有说明，遵守[模板结构](../../agents/doc-reviewer/references/document-quality.md#template-structure)、[清楚易读](../../agents/doc-reviewer/references/document-quality.md#human-readable)和[相关人确认](../prd-writer/references/stakeholders.md#stakeholder-confirmation)。

1. **概要设计。** 从业务场景说明现状、本次变化、复用与新增的模块、各自职责与依赖、关键调用次序和数据流。写清关键取舍以及失败、重试、并发、恢复对最终结果的影响。举例或图示应能回答一次实际请求如何完成。
2. **API 设计。** 说明哪个场景需要什么能力、谁调用谁、为何复用或变更接口、返回或失败后业务如何继续。按[接口交接](#api-first)取得方法签名和配套协议类型的字段定义，在 `api-01` 等锚点关联场景、任务与定义。
3. **数据结构设计。** TRD 定义本次涉及的内部类型、数据访问方法和持久化对象，按[数据结构、DAO 与 PO](#data-structure-design)交付可审阅的方法和字段定义。沿一次实际读写说明这些定义怎样配合。
4. **数据库设计。** 对实际变更的表说明业务含义、读写方、关系、主键、索引理由、字段约束、并发一致性和生命周期。链接实体映射，补充代码无法表达的存储约束；确需列字段时写清中文含义、完整类型、可空性和默认值。涉及已有数据时说明兼容、迁移、验证及恢复方式。没有存储变化时注明沿用的定义。执行任何库表、字段、索引、约束变更及数据迁移或清理，须另行取得用户对具体对象、操作、数据影响与恢复方式的明确授权，本地测试库及自动迁移同样适用。
5. **验证与环境。** 在 `test-strategy` 锚点按 [RIGHT-BICEP](../e2e-validator/references/verification.md#right-bicep) 核对适用维度，写明可观察结果、边界、异常、受影响调用方、回归与未决项。性能目标标明负载、环境及阈值依据。按[环境授权](../develop-work-flow/references/authorization.md#environment-authorization)列出需要用户评估的操作组及清理恢复范围。

<a id="business-flow"></a>
### 沿业务场景核对设计

有 PRD 时，从已确认的产品场景出发。独立技术需求从本轮技术目标、现有系统行为和技术验收条件出发。沿适用的成功、失败或重复执行场景核对每一步的输入、状态变化、输出及后续使用方，按[业务链路审查](../../agents/doc-reviewer/references/review.md#logic-review)修正。发现外部能力未证实，列出依据、影响的接口和任务、何时必须解决。业务规则和验收结果有变化时，取得相应确认并同步权威文档。

<a id="api-first"></a>
## 接口先行与设计源码

先核对现有调用方、接口版本与用户最新修改。能满足业务的既有接口直接引用源码，说明复用依据。接口、消息或协议需要新增或变更时，TRD 将场景、调用双方和兼容要求交给 [api-first](../api-first/SKILL.md)，由它设计 API 方法及配套的写入参数（Param）、查询条件（Query）和返回数据（DTO）。项目采用 Controller、Repository、DAO 或 PO 时，由 api-first 按 TRD 的调用与存储设计交付[各层的方法和字段声明](../api-first/SKILL.md#layer-contracts)。TRD 按[声明分工](../api-first/SKILL.md#declaration-owner)指定编写方，将[接口与协议定义](../api-first/SKILL.md#design-source-delivery)纳入同一版方案，核对调用方能否构造请求、识别结果和处理失败。

<a id="data-structure-design"></a>
### 数据结构、DAO 与 PO

- **内部数据结构。** 对本次新增或变更的业务对象、查询条件等，明确由哪个模块维护、谁创建和读取。字段定义给出名称、业务含义、完整类型、可空性和适用的默认值、单位或取值范围。复用已有类型时引用具体声明。
- **DAO（数据访问接口）。** TRD 明确每项查询或写入的用途、输入和结果。例如，列表查询要能确定筛选条件、排序和分页结果，条件更新要能判断是否实际更新。引用 api-first 交付或复用的具体方法签名、参数或存储查询类型和返回类型。
- **PO（持久化对象）。** 定义对象对应的表、主键、各持久化字段的类型和列映射，核对可空性、默认值及适用的存储约束。说明协议对象或内部类型如何转换为查询条件、PO 或返回结果，写清异名、异型及由服务端生成的字段。沿用现有表时，仍需设计本次变化的 DAO 方法与对象映射。

<a id="design-source-delivery"></a>
### 交付可审阅的真实文件

- TRD 按场景汇总 API 和数据结构的交付。每项定位到已有声明、本轮已写入的文件或基于真实文件的拟议差异，覆盖适用的 API、协议类型、内部数据结构、DAO 方法和 PO 映射。需要 Java PO 时先确认基准包和目标模块，其他包名按确认的映射推导。参照 [Java 持久化约定](../coder/references/java-persistence.md)核对 DAO 和 PO，实际编写已定声明的代理必须先使用 [coder 的声明模式](../coder/SKILL.md#interface-code)。外部协议、字段取值等缺少事实时列为待决项。
- 文档链接每组设计文件或拟议差异及其基线，概述接口用途、调用关系以及源码以外的重要约束。记录用户实际审阅的版本或文件内容摘要，未提交源码同样要可核对。必要类型检查或编译在已有授权范围内完成，如实写已验证与缺失项。用户明确本轮只允许文稿时，将未交付的设计源码列为具体缺口。
- 设计源码、正文、接口样例、场景与任务的引用必须对应同一版设计。仅有签名草稿、伪代码或通用字段表时，注明缺什么、影响哪一步，不能交接为实施就绪。用户调整设计后核对上述受影响项并更新版本记录。

<a id="plan-walkthrough"></a>
## 执行前逐步讲解计划并确认

先在 `plan.yaml` 的 `understanding` 用自己的话写清谁遇到了什么问题、本轮要做到哪一步、怎样看出目标已经达到。再按实际依赖拆分任务。生成的 `plan.md` 先展示这段理解，再逐项展示任务。每一步用任务编号和业务名称开头。

- **业务目的和做法。** 标题写明这一步要达成的结果，在 `design` 引用的 TRD 段落中说明它支持哪个业务动作、具体做法及判断做对的依据。
- **上下游。** 每项任务的 `handoff` 说明开工需要谁提供的什么结果、这一步产出什么、交给哪个后续任务做什么。没有前置任务时写实际起点，没有后续任务时写谁能验收什么结果。多个前置分别说明，可并行的工作指出为何能独立开始。
- **定稿顺序。** 将 `plan.yaml` 中的任务逐项排好，所有前置都在使用其结果的任务之前。新计划先排顺序再连续编号，已有任务保留原编号。可并行任务也按选定的展示次序列出，只在有真实依赖时填写 `depends_on`。

按本轮布局选用[full 计划模板](templates/full/plan.yaml)或[lite 计划模板](templates/lite/plan.yaml)，按[任务文件格式](references/planning.md#dsl)维护 `plan.yaml` 的稳定编号、R/S/设计引用、项目相对路径、依赖及真实验证命令。完整布局的场景来自 `acceptance.feature`，轻量布局按约定读取 TRD 内的 Gherkin；无行为任务说明验证例外和替代证据。每个任务通过对应的设计段落，引用它实际使用的 API、协议类型、内部数据结构、DAO 方法或 PO 映射。对需同步迁移的接口，把应用差异、更新受影响的实现与调用方、整批编译或协议验证安排在同一个待批准实施批次。排期表只按 T 编号链接任务，未知工期和人员不猜测，不在 DSL 增加排期字段。

定稿时由记录者按[计划工具用法](references/planning.md#script-entry)依次运行 `validate`、`render`、`status`、`check --final`。由评审者对照已确认的目标，从首项输入推演到各项验收结果，核对每个上游产出是否足够下游使用。核对模板、调用链、相关源码、实际验证与风险，复杂或高风险设计按当前规则进行必要审查。报告区分自审和独立审查。TRD 评审按 [doc-reviewer 的五项评分规则](../../agents/doc-reviewer/references/review.md#trd-scoring)给分，记录者在本版 TRD 末尾填写实际总分并链接详细报告。

**向用户展示本版完整逐步计划。** 先修正评审发现的业务误解、动作遗漏和顺序错误，再讲解方案、关键取舍、风险和待决项。将讲解位置、本版文档和源码、用户原始答复、获准任务批次记入[交付证据](../e2e-validator/references/verification.md#evidence)，并维护[文末评审状态](../../agents/doc-reviewer/references/review.md#document-review-status)。等用户明确批准对应计划和实施范围后交给 coder。
