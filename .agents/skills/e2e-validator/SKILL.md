---
name: e2e-validator
description: 对已完成的功能做独立验收。召回关键词：验收已做完的功能、跑端到端验收（E2E）、逐条核对需求有没有实现、核对 Gherkin 场景和测试证据、复验被打回的功能。对照产品规则与实际执行结果，报告通过、失败和未验证的场景。
---

文档处理统一遵循[清楚、适量、复用](../../agents/doc-reviewer/references/document-quality.md#documentation-principle)、[模板结构](../../agents/doc-reviewer/references/document-quality.md#template-structure)及[最新结论与同步](../../agents/doc-reviewer/references/document-quality.md#decision-sync)；自查和评审按[全链路逻辑审查](../../agents/doc-reviewer/references/review.md#logic-review)执行当前阶段适用项。

通过软链接调用时，从本文件的真实路径定位引用的规则和工具。从目标项目读取本次需要的需求、方案、源码与验证记录。首次写入前执行主工作流的[需求分支准备](../develop-work-flow/references/authorization.md#requirement-branch)，续做或阶段交接时核对并复用对应分支；只读审查不切换工作区。

# 功能验收

按[新需求独立成文](../develop-work-flow/references/deliverables.md#requirement-document-boundary)读取本次需求自己的文档与计划；跨需求仅按章节引用读取所需基线，不合并旧需求文档、任务或证据。下述编号延续和跨轮承接仅限同一需求。

开始前按[阶段授权](../develop-work-flow/references/authorization.md#stage-authorization)核对实施批次结论、当前产物与进入独立 e2e 验收的授权；直接调用本 skill 也遵守相同门禁。环境动作另按[环境授权](../develop-work-flow/references/authorization.md#environment-authorization)核对 TRD 中成组批准的对象与范围，范围内复用环境授权不替代本阶段授权。核对计划与场景时再读取 [DSL 规范](../trd-writer/references/planning.md#dsl)的对应章节。输入为目标项目 `doc/<需求目录>/` 下按 mode 维护的权威规则、场景、TRD、任务 DSL、`evidence.md` 及实际实现和测试结果：按[迭代承接](../trd-writer/references/planning.md#iteration)读取本轮 mode：lite 读取 technical.md，存在原文档基线时读取引用；已有 PRD 的产品规则以同步后的 PRD 为准，TRD 与其冲突时报告文档不一致，Gherkin 在 TRD；full 使用产品和独立场景文件，有承接来源时核对原 TRD 编号与可复核版本；不要求 lite 补齐完整文档集。沿用 `R01`、`S01`、`T01` 等现有标识，不重新编号或另造一套场景。

1. 检查本迭代每个已承诺场景与真实测试实现、执行命令和结果的关联。Gherkin 场景内容存在、测试代码存在或命令退出成功但没有执行目标场景，都不足以证明验收通过。
2. 按 [RIGHT-BICEP](references/verification.md#right-bicep) 核对适用维度的用例与证据，检查反向/交叉验证是否独立有效、错误是否实际触发、性能是否按约定条件测量；不适用理由合理且未跳过已承诺目标。运行公共 `validate`/`check`，并核实任务证据对应当前实现。自动结果只能证明它实际覆盖的行为；按风险执行必要的集成或端到端验证，不机械要求每条规则凑齐固定类别。
3. 对失败给出规则/场景、触发条件、实际结果和证据位置；对环境限制、未执行项和不确定结论明确标注。未受影响且仍有效的测试结果可复用；发生相关修改、失败或覆盖疑点时补充执行。返工链中的旧 green/review 不得复用，按下述规则重新验证。
4. 核对各阶段产物、结论报告、授权对象与范围的证据链，特别是 TRD 与计划交付、用户具体批准和实际实施批次的先后与范围。新旧功能及纯文档均适用阶段门禁；自主执行例外须有满足阶段授权条件的依据，不能因产物完整、测试通过、任务独立或泛泛的实施授权倒推门禁已满足。历史功能逻辑变更无论 `lite` 或 `full`、风险高低，还应有实施前的具体代码方案确认；实际文件/函数/接口、改变与保留行为、模块职责和调用关系须与获批设计一致。已明确批准的同一对象和范围无需重复，超出范围须重新确认。验证原有调用方及约定回归用例，新旧判断需有代码分析依据；高风险改动的风险、影响角色和措施应在文档中可见，通知按[通知规则](../task-monitor/references/notifications.md#notify)执行。未经确认的实施不能用验证结果补作授权。发现问题按[返工规则](references/verification.md#rework)，由验收方定位、协调记录者统一将被打回任务及全部直接/间接依赖任务设为 blocked，备注上游打回待复验；旧结果在 evidence.md 保留并注明失效，清除相关任务 DSL 中已失效的 green/review，不得复用。报告问题后按阶段授权交接返工与复验，不自动回滚或修复代码；独立且仍在已授权范围内的工作可以继续。

核对跨轮未完任务沿用原 ID，必要 done 前置及其传递依赖闭包完整；撤出任务有确认、原因与 evidence。基线任务的引用和证据须仍匹配当前代码，备注非本轮新增成果。

验收直接引用 DSL 证据及自动测试结果，规则、场景和追溯信息各自保留唯一来源。两种模式均按[全链路证据](references/verification.md#evidence)核对并汇总同目录 `evidence.md`：每个实际环节必须有上下文、输入、输出、结果及可定位来源。检查调查/确认、需求产品（lite 合并于 TRD）、技术计划、实施测试、审查、验收与提交交付的证据是否连贯，是否对应当前版本；缺失、未执行或未验证明确列出并说明下一步，不能宣布该部分通过。人工验收和审查记录写入 evidence.md，DSL 保留任务证据摘要，长日志引用真实报告，不重复维护业务规则或任务状态。状态或证据变化后通过公共工具重新生成 `plan.md`。

## 最后验收交付

按[并行归并](../develop-work-flow/SKILL.md#collaboration)由指定协调记录者根据验收结果统一更新 plan.yaml 的 status、remark、evidence 和 evidence.md；串行验收可由当前验收方担任记录者。失败、受阻或待验证事项在 remark 简述原因与下一步；未执行或未通过不能标为 done。随后按[计划工具用法](../trd-writer/references/planning.md#script-entry)依次执行 render、status、check（`--project` 指向项目根，`--feature` 使用当前需求目录的实际完整名称）。

核对[任务状态列表](../trd-writer/references/planning.md#task-status)已随本轮计划刷新、覆盖全部任务，并区分必要前置基线和本轮完成项。文件缺失时补生成并记录缺口；失败、受阻和未验证项按实际结果交付。

交付 `evidence.md` 的全链路核对结论和未决项，并记录本次实际验收输入、输出及执行结果；工具校验不会代替这项核对。

按公共规范决定是否值得本阶段内的独立审查，披露实际审查方式。最终区分通过、失败和未验证项；无发现就说明无发现，不能将未验证写成通过。交付验收报告后，按[阶段授权](../develop-work-flow/references/authorization.md#stage-authorization)报告结论并取得下一环节授权；提交、push、合并、部署分别核对相应对象与范围，已明确批准的同一对象和范围不重复申请。不能临时把这些动作合并进验收阶段规避门禁。本 skill 不自动修业务代码、提交、推送、合并或部署。

所有本次交付文档最末按[文档评审状态](../../agents/doc-reviewer/references/review.md#document-review-status)维护“评审结论”，记录实际审查、用户确认及下一环节授权；取得答复或发生影响结论的修改后同步更新，不能沿用失效批准。生成视图只维护独立评审区，机器可读文件用末尾注释，不改变任务或场景契约。
