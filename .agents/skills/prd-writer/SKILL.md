---
name: prd-writer
description: 编写产品需求和验收场景。召回关键词：写 PRD、整理产品需求、梳理业务规则、明确功能范围、给需求补验收标准、编写 Gherkin 场景。说清目标用户遇到的问题、竞品或现有做法，以及用户操作后应当看到的结果。
---

# 产品需求与验收场景

业务需求默认从本阶段开始。根据用户诉求、业务资料、现有产品和已确认的范围编写 `doc/<需求目录>/product.md` 与 `acceptance.feature`。业务依据、产品规则和验收目标在 PRD 中统一维护，以稳定的 R 编号关联业务来源与产品行为。已有历史论证或评审材料时引用仍有效的结论、来源和编号。

## 开始条件

先按[分流规则](../develop-work-flow/SKILL.md#requirement-kind)判断需求性质。独立的新技术需求使用自己的需求目录，经用户同意后交给 [TRD](../trd-writer/SKILL.md) 设计。同一需求内的纯技术迭代沿用原目录及已有设计。业务需求按[阶段授权](../develop-work-flow/references/authorization.md#stage-authorization)核实本轮产品设计范围，涉及立项、跨团队责任或范围取舍时，在 PRD 写明依据、选择和决定人。变更存量产品行为时，先核实当前表现及受影响用户。

新需求使用[独立需求目录](../develop-work-flow/references/deliverables.md#requirement-document-boundary)，同一需求按[迭代承接](../trd-writer/references/planning.md#iteration)保留编号及历史依据。旧 lite 需求扩为 full 时，在证据记录定位原 TRD 的编号及可复核版本，在 PRD 中承接有效业务事实。首次写入前按[分支规则](../develop-work-flow/references/authorization.md#requirement-branch)处理；通过软链接调用时，按真实路径定位技能包。

<a id="prd-template"></a>
## PRD 要讲清的内容

按[指定 PRD 模板](templates/product.md)保留标题、顺序与层级。将下列问题放入已有的需求背景、项目评估、业务需求、功能需求和验证方式等章节。

1. **现状与立项理由。** 谁在业务流程的哪一步遇到了什么问题，今天用什么方法处理，有何代价，为什么值得现在投入？给出访谈、业务记录、数据或已确认判断的来源，交代项目在整体业务中的位置、本轮范围和成功标准；存在关键的外部服务或数据依赖时，核实提供方、归属、可用程度及其对本轮的影响。缺少基线时写清待核实之处。
2. **目标用户与使用场景。** 说明使用者、受益者及相关方，区分其目标、权限、痛点和当前做法。把痛点落到具体任务和可观察后果；相关团队与职责按[相关人确认](references/stakeholders.md#stakeholder-confirmation)核实。
3. **竞调与竞品分析。** 指出同一用户完成同一任务时可选的竞品或替代方案，包括现有人工流程。依据可定位的资料或实际观察，比较关键步骤、限制与使用结果，说明对本次产品取舍的影响。无直接竞品时说明所比较的替代方案；资料不足时标明未知，避免编造竞品能力、市场数据或用户反馈。
4. **业务规则与产品行为。** 沿业务流程逐步写明谁可以操作、前置条件、输入的业务含义、允许和拒绝的条件、状态变化、可观察结果及交接责任。对本次相关的失败、重复操作、权限差异和边界给出明确预期；涉及存量时标明改变和保留的行为。
5. **验收与效果衡量。** 每项可验收需求在详细需求中以独立行声明稳定锚点（如 `<a id="R01"></a>`）。同一需求迭代保留已有编号。按[场景规范](references/acceptance-scenarios.md)用[验收场景模板](templates/acceptance.feature)在 `acceptance.feature` 编写具体输入、操作和预期结果，并在 PRD 中按 S 编号引用。产品指标说明计算口径、数据来源与评估时机；场景记录产品承诺，验收阶段核实真实运行结果。

<a id="requirement-review-boundary"></a>
## 产品与技术的交接边界

技术阶段由 TRD 确定概要设计、物理表结构和执行计划。需要新增或改变接口时，由 [api-first](../api-first/SKILL.md) 定义签名与协议。PRD 说明业务数据的含义、来源、归属、用途和风险，以及依赖的外部能力不可用时用户会看到什么。后续 TRD 引用 PRD，产品规则和范围在产品阶段确定。指标、看板与附录按本次适用性填写，保留已有 PRD 的有效批准依据。在需求访谈和评审中，若技术选择会改变用户可见结果、范围、数据归属、权限或成本，说明业务影响后请用户决定。锁、算法、接口内部处理等纯技术选择连同已确认的目标和约束交接给 TRD。PRD 的评审依据是业务规则、可观察行为和验收条件。

## 产品评审与交接

单独评审已有 PRD 时，将文档和用户已指定的评分项交给 [doc-reviewer](../../agents/doc-reviewer/AGENT.md#doc-review-report)，只读核对业务规则与验收场景。与 TRD、Workflow 联审时，按同一份[评分口径](../../agents/doc-reviewer/references/review.md#scoring-rubric)汇总。

对照[模板结构](../../agents/doc-reviewer/references/document-quality.md#template-structure)和[全链路逻辑审查](../../agents/doc-reviewer/references/review.md#logic-review)核对业务依据、竞调结论、R 规则与 S 场景能否互相追溯，检查异常和存量行为。将已确认的决定按[同步规则](../../agents/doc-reviewer/references/document-quality.md#decision-sync)落实到正文和场景，引用已有事实，按[存量确认](../trd-writer/references/design-decisions.md#existing-confirmation)指出技术阶段须进一步核实的影响。重大且尚未决定的业务取舍按[阶段授权规则](../develop-work-flow/references/authorization.md#stage-authorization)分轮确认。

向用户交付本版 PRD、验收场景、实际核实的资料及仍影响设计的决定。按[证据记录](../e2e-validator/references/verification.md#evidence)与[评审结论](../../agents/doc-reviewer/references/review.md#document-review-status)记录版本、状态和用户原始答复。确认本版产品结论后，说明拟编写 TRD 的理由、位置和范围，取得明确同意后交给 [trd-writer](../trd-writer/SKILL.md)。
