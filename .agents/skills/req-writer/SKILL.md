---
name: req-writer
description: 编写 BRD／需求依据，讲清全景业务架构、项目或需求定位、核心痛点、业务解决方案及依赖的人员团队、服务和数据；用于新需求梳理或调整，为完整 PRD 提供依据。
---

文档首先遵守[清楚、适量、复用原则](../develop-work-flow/SKILL.md#documentation-principle)：仅展开本次需求及变化，未变内容引用既有章节；full/lite 仅表示文档布局，不表示需求性质、复杂度或篇幅，模板不要求机械填满。

共享执行规则来自 [develop-work-flow](../develop-work-flow/SKILL.md)。通过软链接加载时，先解析本文件的真实路径，仅用于定位技能包内的 skill、agents、脚本和模板；执行时不回源仓库读取设计文档。目标业务项目的需求、产品、技术、代码与证据仍是必要任务输入，应按本次范围读取。首次写入前执行主工作流的[需求分支准备](../develop-work-flow/SKILL.md#requirement-branch)，续做或阶段交接时核对并复用对应分支；只读审查不切换工作区。

# 需求编写

先按[新需求独立成文](../develop-work-flow/SKILL.md#requirement-document-boundary)确定文档归属：每次新需求在独立需求目录重新编写当前阶段文档，重复内容用适用说明与具体章节链接复用。下文沿用目录、保留编号、原位更新与跨轮承接仅限同一需求的修订和继续执行，不适用于后续新需求；不能因为属于同一产品或修改存量功能而并入旧文档。

编写前按[需求性质确认](../develop-work-flow/SKILL.md#requirement-kind)决定文档集合，按[迭代承接](../develop-work-flow/SKILL.md#iteration)决定更新范围。未明确性质先询问，已有确认直接复用；独立技术需求可省略 BRD/PRD。已有产品需求的迭代：纯技术改动只更新原 TRD，产品逻辑变化才同步原 PRD。

交付遵守[产物内容边界](../develop-work-flow/SKILL.md#artifact-relevance)：skill 规则变更对业务文档透明，直接维护当前有效内容；不在正文、评审区或业务 evidence 中记录规则调整、旧文档问题及重构过程。真实业务变化、授权与验证记录仍须保留。

文档中的人员、团队与职责按[相关人确认](../develop-work-flow/SKILL.md#stakeholder-confirmation)核实；缺少必要信息时集中询问用户，不用“未指定”或其他占位词替代确认，已确认的角色／团队及后置安排按实际范围复用。

编写、评审及 grilling 遵守[需求评审边界](../develop-work-flow/SKILL.md#requirement-review-boundary)：聚焦业务目标、范围、约束和可观察的验收结果；纯技术机制交接到 TRD，不逐项追问或作为本阶段完成前置。

开始前读取[公共工作流](../develop-work-flow/SKILL.md)，按[阶段授权](../develop-work-flow/SKILL.md#stage-authorization)核对本次需求编写的对象、范围与授权；直接调用本 skill 也遵守相同门禁。当前项目约定与用户明确要求优先；进入本阶段不自动授权产品设计、技术设计或业务实施。自主执行例外仅按公共规则判断并留证，不以新功能或纯文档为由绕过。

先按[分流规则](../develop-work-flow/SKILL.md#routing)分别确认需求性质、评估复杂度、确定文档布局，并遵循[迭代承接](../develop-work-flow/SKILL.md#iteration)。lite 布局由 [trd-writer](../trd-writer/SKILL.md)维护本轮 TRD；同一需求沿用原目录和布局，纯技术小迭代无需改写 REQ/PRD；产品逻辑小变更须同步原 PRD，业务目标或约束变化时同步 REQ。未变内容引用，不为小改全文重写。以下产物规则用于 full 布局。

在目标项目维护 `doc/<需求目录>/requirement.md`，同一需求继续使用原目录。lite 转 full 时补齐本需求业务依据，未变内容引用基线，引用原 `TRD-<需求目录>` 编号与可核实的基线版本（未提交来源按公共规则留证）；保留已有 R 编号，新编号递增，不把同路径当前文件当历史来源。同一需求的其余完整模式修订按实际范围原位更新；新需求重新编写独立文档。本文承担 [BRD 业务职责](../develop-work-flow/SKILL.md#brd-business-context)，编写前读取[需求模板](../develop-work-flow/assets/feature/requirement.md)，讲清全景业务架构、当前项目／需求的位置与定位、核心痛点、业务解决方案及依赖的人员团队、服务和数据，保留原始诉求、来源、确认输入及稳定的 `R01` 等需求 anchor，作为 PRD 编制依据；当前完整产品规格由 `product.md` 按[指定 PRD 模板](../develop-work-flow/SKILL.md#prd-template)承接，不在 REQ 并行维护第二套产品规格。场景正文交给 `acceptance.feature`。

1. 读取用户本轮诉求、适用项目约定、指定的全局业务资料及现有需求，按 [BRD 业务职责](../develop-work-flow/SKILL.md#brd-business-context)核实全景业务架构及当前项目／需求的位置和定位。区分已确认事实、假设和待决问题；不把参考案例变成当前功能。
2. 先检查现有 doc/ 目录，为新用户需求分配项目内唯一、稳定的 req-rNN-name 目录（如 req-r01-profile）；同一需求迭代沿用原目录。目录编号与内部 R01 子项标识的区别见公共规范。按可独立交付的功能切出本次小迭代，说明要解决的问题、可观察的目标及范围外事项。沿用已有需求标识，不因排序变化重编号。
3. 在已授权需求阶段内调查事实、形成可审阅草案，按关键决定的依赖分轮澄清，不把未确认假设写成用户决定。新旧功能均遵守阶段授权；涉及历史功能逻辑变更时，无论 `lite` 或 `full`、风险高低，还须按[存量确认](../develop-work-flow/SKILL.md#existing-confirmation)说明改变与保留范围。将需求层结论交接至 TRD 的具体代码与接口方案，需求确认不替代具体方案的实施授权。已明确批准的同一对象和范围不重复询问，超出范围的决定重新确认。
4. 逐项核对全景业务架构、当前项目／需求定位、核心痛点、业务解决方案及其依赖的人员团队、服务和数据是否清楚，及每条需求能否在下游关联行为和验收；人员、服务或数据缺口标明对当前／后续范围的影响。不能以技术链路替代业务方案，也不预先规定技术实现或编造外部能力。复杂或高风险内容按公共规范选择独立审查；普通内容完成自审即可，如实说明审查方式。

交接实际项目根、feature、需求文件、结论和仍影响设计的未决问题，明确下一阶段为产品设计；按[阶段授权](../develop-work-flow/SKILL.md#stage-authorization)报告后等待用户授权，再交给 prd-writer。澄清决定时按[接入约定](../develop-work-flow/SKILL.md#onboarding)核对用户级 grilling，分轮取得共识；缺少非必需工具不阻断已授权写作，但不能略过用户决定或伪称调用了其他 skill、通过了独立审查。阶段边界按公共规则确定，不把每次工具调用当作阶段，也不临时合并需求和产品阶段绕过授权。

每次交接前按[全链路证据](../develop-work-flow/SKILL.md#evidence)记录到需求目录的 `evidence.md`；并行时按[归并规则](../develop-work-flow/SKILL.md#collaboration)只回传给指定协调记录者：记录本阶段上下文、诉求与确认输入、需求产物、实际结果及来源，缺失资料标为未核实。

所有本次交付文档最末按[文档评审状态](../develop-work-flow/SKILL.md#document-review-status)维护“评审结论”，记录实际审查、用户确认及下一环节授权；取得答复或发生影响结论的修改后同步更新，不能沿用失效批准。生成视图只维护独立评审区，机器可读文件用末尾注释，不改变任务或场景契约。
