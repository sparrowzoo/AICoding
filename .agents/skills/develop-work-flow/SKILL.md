---
name: develop-work-flow
description: 协调研发阶段与交付。召回关键词：走完整开发流程、按标准研发流程推进需求、开发到了哪一步、阶段交接、把工作交给下一阶段。组织 PRD、TRD 与实施计划、编码和独立验收，展示各阶段结果并确认下一步范围。
---

# 研发工作流

<a id="runtime-boundary"></a>
## 适用范围

本 skill 管流程。先看用户要的是产品方案、技术方案、单独的接口定义、代码实施，还是只读审查。已有同一事项的授权直接复用；普通问答和只读 review 按本次范围进行。新的开发或修改任务按[执行方式确认](references/authorization.md#execution-choice)处理。独立的接口任务可直接进入 [api-first](../api-first/SKILL.md)。通过软链接使用时，从当前文件的真实路径查找负责该项工作的 skill，只读本次用到的章节。业务事实取自目标项目。

用户问“开发到了哪一步”时，只读当前需求的 `task-status.md`，核对已完成和剩余任务；再查 `evidence.md` 最近一次阶段交付及其后的用户答复，说明当前阶段和下一步是否获准。比如本批任务全部完成、验收还在等授权时，答“本批实施已完成，独立验收待授权”。记录缺失或相互矛盾时，说明能确认的进度和缺少的依据。

<a id="steps"></a>
## 阶段职责与交付

业务需求按 **PRD → TRD 与 PLAN → CODER → 独立验收** 交接。每个阶段只处理获准的那部分工作。用户直接调用某个 skill 时，该 skill 也核对自己的输入和授权。

| 当前阶段 | 负责的决定 | 交给下一阶段的结果 |
| --- | --- | --- |
| [PRD · 产品设计](../prd-writer/SKILL.md) | 为什么要做，目标用户在现有流程遇到什么问题，竞品或替代办法如何处理，本产品采用哪些业务规则 | 产品规格和可观察的验收场景。用户能判断做什么、给谁用、怎样算做对 |
| [TRD · 技术设计与计划](../trd-writer/SKILL.md) | 确定模块协作、API、数据结构、存储、验证及实施顺序。TRD 确定内部数据结构、读写语义及表列映射，把涉及的 API 和协议类型（Param、Query、DTO）、各层方法与 PO 字段声明交给 [api-first](../api-first/SKILL.md#layer-contracts) | 技术方案引用[接口与协议定义](../api-first/SKILL.md#design-source-delivery)，交付[数据结构与持久化设计](../trd-writer/SKILL.md#data-structure-design)、完整计划及状态表。向用户逐步讲解每一步的业务目的、前提、动作、结果和后续依赖 |
| [CODER · 编码实施](../coder/SKILL.md) | 写代码的代理必须先读取并使用 coder，严格遵守其适用规范，在本批授权内实现业务逻辑、接通调用方、测试并修正代码。需要变更公共接口时交给 api-first，业务规则交给 PRD，技术方案交给 TRD，待对应变更获准后再改受影响的代码 | 实际代码、影响范围、验证命令和结果、未验证事项。批次交付时说明还需要哪些检查 |
| [独立验收](../e2e-validator/SKILL.md) | 按已确认的产品场景、技术约束及真实证据核验行为 | 通过项、失败项、未验证范围和证据。返工、提交及发布分别取得相应授权 |

<a id="routing"></a>
<a id="requirement-kind"></a>
## 从哪里开始

- **业务或产品需求**直接进入获准的 PRD 阶段，业务依据和产品规则统一维护在 `product.md`。新业务需求采用 `full` 布局；规模决定设计和验证深度。已有 PRD 的小迭代沿用原目录，只更新受影响的规则、场景和下游设计。
- **明确的内部技术需求**可以直接进入获准的 TRD 阶段，采用 `lite` 布局，在 TRD 记录目标、约束和验收。已有 lite 需求和历史编号按[迭代规则](../trd-writer/references/planning.md#iteration)承接。复杂技术需求仍要评估具体方案、取舍和风险。
- 写文档前核实需求性质、已有系统与当前授权；性质未明确时询问用户。新需求按[目录规则](references/deliverables.md#requirement-directory-naming)定位产物。每次新建或切换分支，先说明仓库、当前与目标分支、原因和未提交修改影响，得到明确同意后执行。

## 何时等待用户

1. 产品阶段交付产品规则、场景和未决业务问题。每轮开始编写或修订 TRD 前，说明理由、具体文件和本轮范围，取得明确同意。
2. 技术阶段完成[逐步计划讲解](../trd-writer/SKILL.md#plan-walkthrough)并报告主要取舍、风险与操作范围。在交付记录中定位本版讲解、方案与对应答复。设计期间需要编写已定的接口或类型声明时，编写者必须先使用 [coder 的声明模式](../coder/SKILL.md#interface-code)，按获准范围写入。业务实现等用户确认具体方案和执行批次后再开始。
3. 编码者先核对批准的版本和任务。发现需要改变设计时，按 [CODER 的实施范围](../coder/SKILL.md#implementation-scope)向用户报告并等待决定。产品取舍交回 PRD，技术方案交回 TRD，接口定义由 api-first 承接。
4. 批次或验收结束，报告产物、验证情况、未决项以及下一步范围。[阶段授权细则](references/authorization.md#stage-authorization)适用于阶段交接、环境操作和后续交付。

<a id="collaboration"></a>
<a id="doc-review-parallel"></a>
## 执行与审查分工

用户要求 review、评审或复审文档时，工作流直接交给 [doc-reviewer](../../agents/doc-reviewer/AGENT.md#doc-review-report)，一并传入本轮审查对象和已约定的[评分口径](../../agents/doc-reviewer/references/review.md#scoring-rubric)。例如，“只关注 PRD、TRD、Workflow”只缩小审查对象，主审交付前仍按原评分项逐行核对。

短任务由主代理完成。可以独立推进、分工收益明确时，按模块或审查维度并行，并指定一人归并任务计划、状态与证据。多名审查者使用同一版本和范围，覆盖跨文档关系，主审汇总去重；缺少独立审查时如实注明自审。文档审查交给 [doc-reviewer](../../agents/doc-reviewer/AGENT.md)，代码审查交给 [code-reviewer](../../agents/code-reviewer/AGENT.md)。只读审查的结果交付给用户，由获准的编写者实施修订。

校验计划、生成任务状态表时，按[trd-writer 的计划工具用法](../trd-writer/references/planning.md#script-entry)执行。
