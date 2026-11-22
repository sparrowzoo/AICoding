---
name: coder
description: 主代理和子代理在写代码、改代码前必须使用本 skill。召回关键词：直接实现功能、改一行代码、修 bug、重构、写测试、接通调用方、前后端联调、代码审查、编写接口或数据类型声明。按获批设计实现、测试和修正代码，发现设计缺口先报告。
---

# 代码实现与验证

每位实际写代码的代理都必须在动手前读取本 skill，按改动内容读取下方列出的适用规范，并在实现、联调、测试和修正中严格遵守。直接接手小改、编写接口或类型声明、按计划实施时，都按本次授权和已确认的设计执行。

<a id="implementation-scope"></a>
## 按设计实施，发现问题先报告

以用户本轮明确同意的任务、现行设计和接口定义为依据，沿用项目现有的框架、模块分工和业务处理顺序。可以自行决定已定行为的局部实现，例如用哪个私有函数复用同一段计算。

只实现本轮设计或用户指令已经确定的业务逻辑。新增、删除或更改业务接口、请求或响应字段、数据模型及其含义，调整框架、模块职责或业务流程，都要有对应的明确依据。例如，设计只要求订单列表按状态筛选，未经确认就不能增加“缺省只看已支付”、在响应中加统计字段，或把查询改走新的消息链路。

发现原设计不合理、有遗漏、与现有代码冲突，或必须改变上述内容才能继续时，**先暂停受影响部分，直接向用户报告，等用户明确确认改法和范围后再动手**。说清在哪个文件或调用场景发现了什么、按原设计会发生什么、涉及哪些调用方或数据，以及建议怎么改。建议的行为也不要先写进声明、实现或测试。产品行为由 PRD 承接，方案与框架调整由 TRD 承接，接口与协议由 api-first 承接。其他已获准且不依赖该决定的工作可以继续。

## 开始条件与规则入口

通过用户级软链接调用时，按本文件的真实位置查找规则。新任务先按[执行方式确认](../develop-work-flow/references/authorization.md#execution-choice)核对用户选择。按正式计划实施时，读取本需求的产品规则或已确认技术目标、TRD、设计源码、`plan.yaml` 及对应场景。在 `evidence.md` 中核对[完整计划的展示记录](../trd-writer/SKILL.md#plan-walkthrough)、设计文件版本、用户答复和本批获准任务。轻量技术布局从 TRD 读取设计、规则和内嵌场景；已存在的产品规则以确认的 PRD 为准。任务按[阶段授权](../develop-work-flow/references/authorization.md#stage-authorization)、[存量确认](../trd-writer/references/design-decisions.md#existing-confirmation)与[迭代承接](../trd-writer/references/planning.md#iteration)执行。

| 当代码涉及 | 实现与代码审查都直接读取 |
| --- | --- |
| 公共接口、跨模块调用和消息 | 核对沿用的接口和协议源码。新增或变更时，读取 [api-first](../api-first/SKILL.md) 交付的定义及影响，对照实际调用方实现 |
| 项目自有 Java 业务方法，包括模块内部方法 | [方法参数](#java-method-parameters) |
| Java 声明或协议源码 | [类型与 import](references/java-type-imports.md#java-type-imports)、[对象命名](references/java-object-naming.md#java-object-naming)、[协议分包](../api-first/references/java-protocol-layout.md#protocol-package-layout) |
| Spring MVC 或 Sparrow HTTP 接入 | [Controller、认证及统一响应](../api-first/references/engineering-contracts.md#sparrow-controller) |
| 框架复用、失败重试、异步身份、连接和历史状态 | [实现与审查规则](references/implementation-boundaries.md) |
| Java 实体、DAO、保存、分页及对象转换 | [Java 持久化约定](references/java-persistence.md)，按实际改动读取相应章节 |

单独进行代码 review 时从本页的[代码审查](#code-review)进入。用户选择不走正式计划的已授权简单修改，按实际改动读取上述规则、核实影响、执行验证并交付事实；复杂新功能或存量变更仍需先评估具体方案与实施范围。新建或切换分支适用[分支规则](../develop-work-flow/references/authorization.md#requirement-branch)。

<a id="interface-code"></a>
## 设计阶段只写声明

收到声明任务时，核对委派方、已定定义、目标文件和本轮授权。API 方法及配套协议类型按 [api-first 的写入分工](../api-first/SKILL.md#declaration-owner)办理。Controller、Repository、DAO 方法及 PO 字段按 [api-first 确定的声明](../api-first/SKILL.md#layer-contracts)和本 skill 的编码规范编写。用 [TRD 的数据设计](../trd-writer/SKILL.md#data-structure-design)核对读写行为、内部结构和表列映射。现有声明能满足目标时直接引用。

按[接口设计交付规则](../api-first/SKILL.md#design-source-delivery)选择交付方式。获准的兼容声明可写入对应文件。需要同步迁移调用方时，先按实际源码交付可审阅的差异，待迁移批次获准再一起落地。已有 Controller 保留原有方法体和行为。只有新增方法且框架要求方法体时才使用明确的未实现占位。将文件或差异、验证结果及未决项交还委派方，发现定义问题按[设计变更边界](#implementation-scope)处理。

此时业务实现任务仍待计划获批。方法中的业务逻辑、DAO 查询实现、运行装配和业务测试按具体实施授权开展。库表操作另行确认。

## 接手接口与数据设计

按获批 [TRD 中的设计交付清单](../trd-writer/SKILL.md#design-source-delivery)核对实际工作树、用户修改及待应用差异的基线。接口、协议与 PO 字段以复用的现有源码或 api-first 交付的声明为准。按 TRD 核对内部数据结构、DAO 读写行为以及 PO 字段到表列的映射。检查本次涉及的前端、接口、业务和存储之间的实际调用、输入输出和副作用。二进制协议用独立样本核对完整帧。基线与已审版本有出入、设计不全或要改变公共签名时，按[设计变更边界](#implementation-scope)处理。新一轮 TRD 写入或修订须先说明原因、文件和范围并取得同意。

<a id="java-method-parameters"></a>
## Java 业务方法的参数

项目自有 Java 业务方法最多接收三个参数，公开方法和私有方法均适用。优先复用职责匹配的现有类型，确需组合时按业务意图组织参数。框架覆写签名、装配构造器和既有数据载体构造器沿用原约定。如果满足此规则需要改变已确认的接口或数据结构，先按[设计变更边界](#implementation-scope)报告。

## 实施一个批次

1. 按[任务格式](../trd-writer/references/planning.md#dsl)验证正式计划。选取依赖已完成、属于本次获批范围的任务，核对文件边界和现有未提交修改，再将任务置为 `doing`。并行时按[记录归并](../develop-work-flow/SKILL.md#collaboration)指定唯一记录者。
2. 实现本批涉及的业务逻辑、存储操作、前后端调用和必要的运行装配。先核对项目框架版本和已有能力。选用现有接口与服务，保证同一请求的身份读取、校验、查询、转换、写入和外部调用各有明确责任层。需跨事务或因并发重复检查时说明时点和原因，保护幂等及必要清理。
3. 保持代码清楚可维护。用稳定的业务名称，持续迭代的业务类避免 Mvp、V1 等阶段名。正常路径前先处理无效前提，使用约定的异常或返回值。Java 优先沿用项目直白易读的写法，新语法按真实需要选用。修改已定义字段时同步获准的所有调用方、映射、请求样本及测试。
4. 按[环境授权](../develop-work-flow/references/authorization.md#environment-authorization)核对测试环境操作组。库表、字段、索引、约束变更以及数据迁移或清理，须先确认具体库表、操作、原因、影响和恢复方式；已有脚本、启动时自动迁移及本地测试库均适用。仅批准环境准备时，不执行其中未获批的数据库动作。
5. 按 TRD 测试设计和 [RIGHT-BICEP](../e2e-validator/references/verification.md#right-bicep) 将有行为的任务绑定到真实场景测试，按[编码任务的测试证据要求](references/test-evidence.md)记录真实 RED、GREEN 和审查结果。检查实际运行的目标测试、关键调用次数、返回数据及副作用，既有覆盖充分或无行为的任务写明 TDD 例外及替代验证。环境故障、空测试集和静态推断如实记为未验证。

<a id="code-review"></a>
## 代码审查

先按[审查与复审](../../agents/doc-reviewer/references/review.md#review-feedback)确定范围。通读实际 diff，沿调用方和被调用方验证下列事项。用户只要求 review 时保持只读；本批授权的编码自查可修正具体问题。按风险使用独立审查，如实区分独立审查和自审。

- 将新增的业务分支、接口或字段、数据结构和框架调整与本版设计或用户的明确变更逐项对照。找不到依据时，指出具体差异及影响，按[设计变更边界](#implementation-scope)交给用户决定。测试通过本身不能证明该改动已获批准。
- 代码和线上字段、协议、DAO 查询、PO 映射及返回值能否实现确认过的业务规则；从前端到数据库和事件验证名字、类型、可空、单位、标识来源及兼容性。
- 成功、异常、重复、并发和恢复分支的顺序与副作用；权限、可信身份、事务、幂等和重试是否与设计相符，错误语义和已有行为是否得到保留。
- 涉及 Java 持久化时，按[保存接口](references/java-persistence.md#save-param-long)、[Repository 与 Converter](references/java-persistence.md#repository-converter)等适用章节核对真实方法、映射与使用方。按项目技术栈检查实际装配、分层依赖、查询条件、前后端联调和相关回归。
- 用实际场景、输入、预期断言、命令和结果支持结论。交代哪些验证复用了用户提供的既有结果，这些结果对应哪一版，以及哪些范围仍未验证。

## 交付代码与验证结果

- 正式计划内的批次由指定记录者按任务维护状态、备注和 `evidence.md`，给出任务编号、代码位置、实际运行的检查、审查结果、失败或遗留项。按[计划工具用法](../trd-writer/references/planning.md#script-entry)生成阅读计划和[任务状态表](../trd-writer/references/planning.md#task-status)，检查与来源一致，按[文档评审状态](../../agents/doc-reviewer/references/review.md#document-review-status)维护末章。每批报告完成范围、未完成任务及下一环节。
- 单独获准的小改直接报告改动位置、执行的检查和遗留问题。
- 同一任务连续两次失败或被打回按[通知规则](../task-monitor/references/notifications.md#notify)处理。验收打回时按[依赖恢复](../e2e-validator/references/verification.md#rework)阻塞受影响的后续任务，保留旧证据并标明失效；获准返工后逐步复验。独立验收、提交、推送和部署各自按实际授权进入。获准提交时使用既有 Conventional Commits 和精确 Task trailer。
