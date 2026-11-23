# AI Coding 设计说明

AICoding 用一个流程入口协调多个专业 skill。本文解释这样分工的原因、脚本负责哪些工作，以及项目如何使用这套源码。[工作流入口](../.agents/skills/develop-work-flow/SKILL.md)供项目执行时使用，[维护说明](workflow.md)按职责列出修改位置。

章节导航：[架构](#architecture) · [DSL 与工具](#dsl) · [接入职责](#onboarding) · [设计依据](#decisions)

<a id="architecture"></a>
## 1. 架构

工作流负责选择阶段、安排交接及确认下一步授权。PRD 定义业务行为和验收场景。TRD 负责系统方案、模块职责、API 和数据结构设计、数据库设计及逐步实施计划。新增或变更的 API 交给 [api-first](../.agents/skills/api-first/SKILL.md#layer-contracts) 设计，由它按场景定义 Controller、Repository、DAO 的方法签名、协议类型（Param、Query、DTO 等）及 PO 数据声明，按[接口交付规则](../.agents/skills/api-first/SKILL.md#design-source-delivery)交付可审阅的源码或拟应用的差异。TRD 确定 DAO 的读写语义、PO 字段及表列映射，引用同一份声明。用户可以结合这些定义审阅计划中各步的业务目的和前后依赖。

用户批准对应版本和实施批次后，coder 实现业务、联调和测试。文档与代码审查者可沿各阶段的产物核对设计和实际行为。独立验收依据已确认的场景及实际运行证据判断是否通过。

每条执行规则与相关模板放在负责这项工作的 skill 或审查代理目录，调用方在具体步骤链接过去。业务项目通过软链接复用 `.agents/` 源码，使用自己已有的开发与测试工具。业务事实及批准记录留在目标项目的需求目录中。

<a id="dsl"></a>
## 2. DSL 与工具边界

Gherkin 表达可观察的验收行为，YAML 表达任务及其依赖、引用和证据摘要，Markdown 提供设计正文与团队阅读视图。DSL 的字段、mode、编号、锚点、路径和完成条件由 TRD 维护，见[任务计划格式](../.agents/skills/trd-writer/references/planning.md#dsl)。

工具负责读取与校验这些结构、生成确定性的计划和状态视图。它不执行计划中的命令，不推断用户是否确认了历史功能的具体代码设计，也不自动证明业务行为、证据完整性或测试结果；这些判断由相应阶段的执行者和审查者依据实际证据作出。

维护时核对以下实现对应关系：

| 实现对象 | 契约入口 |
| --- | --- |
| 需求文档与 lite/full 模板 | [文档职责](../.agents/skills/develop-work-flow/references/deliverables.md#documents) |
| YAML/Gherkin 解析、引用与状态检查 | [DSL 契约](../.agents/skills/trd-writer/references/planning.md#dsl) |
| 阅读计划与任务状态生成 | [计划工具用法](../.agents/skills/trd-writer/references/planning.md#script-entry)与[验收状态](../.agents/skills/trd-writer/references/planning.md#task-status) |
| 人工/AI 的语义、确认与证据核对 | [代码设计确认](../.agents/skills/trd-writer/references/design-decisions.md#existing-confirmation)与[全链路证据](../.agents/skills/e2e-validator/references/verification.md#evidence) |

<a id="onboarding"></a>
## 3. 接入职责

用户级 skills 入口和项目已有的目录软链接都指向同一份自有源码。安装入口按锁文件把计划工具的依赖安装到用户级 `trd-writer/scripts` 目录，业务项目继续使用各自的依赖和测试环境。首次安装和升级见[仓库首页](../readme.md#onboarding)。

源仓库维护自己的本地工具设置，业务项目维护自己的代码与文档。软链接只解决内容复用，不自动赋予业务实施、提交或发布授权。

<a id="decisions"></a>
## 4. 设计依据

团队需要能看懂并审阅需求和接口，也需要从任务追溯到实际代码与验证结果。

| 选择 | 依据与边界 |
|---|---|
| 按需求性质选择文档布局 | 新业务需求使用 full，由 PRD 与 TRD 分别承担产品和技术说明。内部技术需求可使用 lite。风险和复杂度决定需要展开到什么程度。 |
| Markdown 表达问题、规则和设计 | 团队与 AI 都能直接阅读、评审和修改；每类事实只有一个权威位置，通过稳定编号与链接建立关系。 |
| Gherkin 表达验收行为，YAML 表达实施任务 | 场景明确输入、行为与结果，任务明确依赖、范围和验证入口；场景绑定真实测试，AI 按任务调用实施工具，不把文件解析成功视为业务通过。 |
| 从 DSL 生成计划和任务状态视图 | 同一任务数据同时服务 AI 执行与团队阅读，避免手工维护时出现状态分歧；详细证据留在任务证据及测试报告中。 |
| 全链路证据集中索引 | evidence.md 连接每环节的上下文、输入、输出、实际结果和证据；各阶段维护、e2e 汇总核对，未执行和未验证如实显示。 |
| 同一需求迭代沿用原文档 | 产品行为变化时更新 PRD，技术变化在 TRD 说明。lite 扩为 full 时，引用原 TRD 的编号及可核对的版本，并保留已有编号。 |
| 文档按需求持续维护，Git 保留版本 | 每项需求有稳定目录，目标、设计、场景、任务与提交可连续追溯；迭代直接更新所属文档，无需复制整套资料。 |
| 独立判断存量影响，确认具体变化 | 技术事实由 AI 调查，业务意图由用户确定；存量改动通过具体证据与分轮确认形成共识，新逻辑在明确且获授权后推进，避免重复确认与整轮返工。 |
| RIGHT-BICEP 配合真实 RED/GREEN 和审查 | 用例选择覆盖正确性、边界及适用风险；验证结果必须来自实际执行，不能以流程步骤齐全代替质量判断。 |
| 通过目录软链接复用唯一源 | 各项目共享同一份自有 skills、模板和脚本，源码与设计文档在 AICoding 统一维护；业务事实归对应项目，第三方依赖由用户级安装管理。 |
| 按交付职责维护规则 | api-first 负责各层接口与数据声明，TRD 引用这些定义说明模块如何协作，并确定存储侧的数据结构与读写语义。coder 依据获批的设计实现行为。 |
| 历史功能逻辑先确认具体代码设计 | 文档模式只决定材料组织，不能替代用户对代码改法的判断；即使一般实施已授权，历史逻辑仍按明确确认的方案实施。 |

执行规则变化时，修改负责方目录中的正文，并核对调用方、模板和确实受影响的脚本。设计说明记录分工的理由。
