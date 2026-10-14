---
name: prd-writer
description: 按指定产品需求规格说明书模板编写完整 PRD 和 Gherkin 验收场景；用于产品设计或需求调整，交接技术设计与可执行计划。
---

共享执行规则来自 [develop-work-flow](../develop-work-flow/SKILL.md)。通过软链接加载时，先解析本文件的真实路径，仅用于定位技能包内的 skill、agents、脚本和模板；执行时不回源仓库读取设计文档。目标业务项目的需求、产品、技术、代码与证据仍是必要任务输入，应按本次范围读取。首次写入前执行主工作流的[需求分支准备](../develop-work-flow/SKILL.md#requirement-branch)，续做或阶段交接时核对并复用对应分支；只读审查不切换工作区。

# 产品设计

开始前读取[公共工作流](../develop-work-flow/SKILL.md)，按[阶段授权](../develop-work-flow/SKILL.md#stage-authorization)核对需求阶段结论、当前产物与进入产品设计的授权，直接调用本 skill 也遵守相同门禁。按[迭代承接](../develop-work-flow/SKILL.md#iteration)确定本轮模式。轻量模式由 [trd-writer](../trd-writer/SKILL.md)在 TRD 写本轮规则变化与 Gherkin 场景；已有产品/场景文件保留作基线；存在基线时，当前有效规则为原基线加 TRD 明确变更，不为小改重写全文。以下规则用于完整模式，输入为当前用户授权及目标项目的 `doc/<需求目录>/requirement.md`；缺少需求产物或确认时先报告缺口，按公共规则补齐需求阶段与交接，不以整理最小需求为由绕过授权，也不另建一套平行来源。

沿用上游需求目录（如 req-r01-profile），维护 `doc/<需求目录>/product.md` 和 `acceptance.feature`。lite 转 full 时，从 REQ 已整理的业务输入承接并编写完整产品和场景；原 TRD 的编号、版本及历史来源由 REQ/evidence.md 留证，PRD 不直接引用旧/新 TRD。保留 R/S 编号，新编号递增。完整模式的职责为：

- `product.md` 的职责、格式和内容严格遵循 [PRD：产品需求规格说明书模板](../develop-work-flow/assets/feature/product.md)。编写前完整读取模板，按公共工作流的 [PRD 模板规则](../develop-work-flow/SKILL.md#prd-template)保留全部章节、子章节、表格、附录及要求，并填写本项目实际内容；不得改成只含行为规则的精简 PRD。第 9.3.1 节按需求添加 `R01` 等稳定正文锚点，链接 REQ 输入。
- 遵守公共规则的单向依赖：PRD 先完成业务说明，后续 TRD 引用 PRD 做技术设计；PRD 不引用 TRD，也不以等待技术方案为模板章节的完成条件。第 7、14 章分别说明风险的业务影响和相关业务数据，不提前编写技术方案。
- `acceptance.feature` 是场景的唯一正文，使用 Gherkin 描述可观察行为并保留稳定场景标识。只覆盖与功能相关的正常、边界、异常或并发条件，不机械凑类别和数量。
- 将场景落实到现有测试入口或明确的待实施绑定；文字场景和仅通过语法检查都不等于测试已经运行。

在已授权产品阶段内先核对产品行为与接口事实，再设计本次可完成的功能切片；需用户判断的决定按[接入约定](../develop-work-flow/SKILL.md#onboarding)使用用户级 grilling 分轮确认。新旧功能及纯文档均遵守阶段授权，自主执行例外仅按公共规则判断并留证。涉及历史功能逻辑变更时，无论 `lite` 或 `full`、风险高低，还须按[存量确认](../develop-work-flow/SKILL.md#existing-confirmation)核对改变与保留范围，将结论交给技术阶段细化代码和接口方案。产品确认不替代具体代码设计和实施范围的授权；已明确批准的同一对象和范围不重复，超出范围的决定重新确认。

交付前逐节对照原模板检查结构、内容、必选要求及待确认事项，按公共规范完成本阶段必要审查，交接实际文件、结论、规则与场景关联以及未决项；不能以 DSL 校验代替模板完整性检查。按[阶段授权](../develop-work-flow/SKILL.md#stage-authorization)报告后等待用户授权进入 TRD 与计划阶段，不因产品方案完成自动进入技术设计或编码。阶段边界按既定可独立交付范围确定，不临时合并阶段绕过授权。新建或修改 DSL 时读取 [DSL 规范](../develop-work-flow/SKILL.md#dsl)，不手写 `plan.md`。

每次交接前按[全链路证据](../develop-work-flow/SKILL.md#evidence)记录到同目录 `evidence.md`；并行时按[归并规则](../develop-work-flow/SKILL.md#collaboration)只回传给指定协调记录者：记录本阶段上下文、需求与确认输入、产品规则/场景输出、实际结果及可定位来源；不把场景文字当作已执行测试。
