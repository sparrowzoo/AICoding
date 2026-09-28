---
name: prd-writer
description: 将已确认需求转成产品行为规则和 Gherkin 验收场景；用于功能设计或行为调整，交接技术设计与可执行计划。
---

共享执行规则来自 [develop-work-flow](../develop-work-flow/SKILL.md)。通过软链接加载时，先解析本文件的真实路径，仅用于定位技能包内的 skill、agents、脚本和模板；执行时不回源仓库读取设计文档。目标业务项目的需求、产品、技术、代码与证据仍是必要任务输入，应按本次范围读取。首次写入前执行主工作流的[需求分支准备](../develop-work-flow/SKILL.md#requirement-branch)，续做或阶段交接时核对并复用对应分支；只读审查不切换工作区。

# 产品设计

开始前读取[公共工作流](../develop-work-flow/SKILL.md)。按[迭代承接](../develop-work-flow/SKILL.md#iteration)确定本轮模式。轻量模式由 [trd-writer](../trd-writer/SKILL.md)在 TRD 写本轮规则变化与 Gherkin 场景；已有产品/场景文件保留作基线；存在基线时，当前有效规则为原基线加 TRD 明确变更，不为小改重写全文。以下规则用于完整模式，输入为当前用户授权及目标项目的 `doc/<需求目录>/requirement.md`；缺少需求文档时先整理最小需求，不另建一套平行来源。

沿用上游需求目录（如 req-r01-profile），维护 `doc/<需求目录>/product.md` 和 `acceptance.feature`。lite 转 full 时重新编写完整产品和场景，引用原 `TRD-<需求目录>` 编号与可核实的基线版本（未提交来源按公共规则留证），保留 R/S 编号、新编号递增；不能只引用已被覆盖的当前 TRD。完整模式的职责为：

- `product.md` 用 `R01` 等稳定标识链接需求，定义用户可见行为、规则、状态变化及适用约束；引用需求背景，不重述问题、目标和范围。
- `acceptance.feature` 是场景的唯一正文，使用 Gherkin 描述可观察行为并保留稳定场景标识。只覆盖与功能相关的正常、边界、异常或并发条件，不机械凑类别和数量。
- 将场景落实到现有测试入口或明确的待实施绑定；文字场景和仅通过语法检查都不等于测试已经运行。

先核对产品行为与接口事实，再设计本次可完成的功能切片。存量细问前按[接入约定](../develop-work-flow/SKILL.md#onboarding)核对用户级 grilling。涉及历史功能逻辑变更时，无论 `lite` 或 `full`、风险高低，都按[存量确认](../develop-work-flow/SKILL.md#existing-confirmation)核对改变与保留范围，将结论交给技术阶段细化代码和接口方案。调查和可审阅草案可自主完成；取得用户对具体代码设计的确认前不得修改受影响的历史逻辑。一般实施授权、文档完整或“内部调整”不能代替具体方案确认；已确认的同一具体方案不重复，超出该方案的新设计再确认。不涉及历史逻辑的新功能按明确文档和授权推进，纯文档修改不因此增加代码设计确认。

按公共规范完成适度审查，交接实际文件、规则与场景关联以及未决项。新建或修改 DSL 时读取 [DSL 规范](../develop-work-flow/SKILL.md#dsl)，不手写 `plan.md`，不因产品方案完成自动开始编码。

每次交接前按[全链路证据](../develop-work-flow/SKILL.md#evidence)记录到同目录 `evidence.md`；并行时按[归并规则](../develop-work-flow/SKILL.md#collaboration)只回传给指定协调记录者：记录本阶段上下文、需求与确认输入、产品规则/场景输出、实际结果及可定位来源；不把场景文字当作已执行测试。
