# 技术设计交付与模板

<a id="trd-template"></a>
### TRD：严格遵守模板结构

full/lite 编写或审查前读取 [TRD 模板](../templates/technical.md)，统一执行[模板结构与内容检查](../../../agents/doc-reviewer/references/document-quality.md#template-structure)。本节只定义技术文档特有的职责。

- 说明本次复杂度及模式评估、现状与变化、模块和调用边界、重要取舍、风险、验证与必要恢复方案；full 引用 PRD 的目标、R编号及规则，lite 在 TRD 承载必要产品规则。公共架构与未变设计直接引用既有章节。
- 第 6.1 节从具体场景说明调用双方、顺序与影响，引用 [api-first 的 API 与协议交付](../../api-first/SKILL.md#design-source-delivery)，定位方法签名及其 Param、Query、DTO 等实际类型的字段定义。注明已写入的声明或待应用差异及基线。复用已有定义时链接源码并说明理由。
- 第 6.2 节由 TRD 按[数据结构设计要求](../SKILL.md#data-structure-design)说明内部类型、DAO 读写行为和 PO 表列映射，引用 [api-first 交付的方法与字段声明](../../api-first/SKILL.md#layer-contracts)。沿同一场景核对第 6.1 节的输入输出与这些定义如何对应。存储字段与约束按[人类可读规范](../../../agents/doc-reviewer/references/document-quality.md#human-readable)描述，已有源码能表达的定义直接引用。
- Java/Maven、MySQL 等模板约束仅在本次实际适用时落实，通用规范集中引用；选用通用字段仍遵守其完整定义，不能借精简改变约束。不要为填模板新增模块、数据库或环境。
- 未决项、真实元信息、授权范围必须清楚。需要的排期仅用简表引用 T 编号，任务正文和状态只维护在 DSL；无排期决定时简述未定，不为未知日期堆空表。

稳定锚点保留在对应语义的正文中，不得改变模板章号或层级，新增测试、验收和授权内容放入相应章节或附录，不能放进注释或代码块：

| 锚点 | 内容职责 |
| --- | --- |
| `trd` | 文档编号 `TRD-<需求目录>`、迭代、来源与可复核基线 |
| lite 的 `R01` 等 | 本次规则或基线与明确变化；full 引用 PRD，不复制规则正文 |
| `api-01` 等 | 业务场景、调用关系、实际接口与协议源码或拟议差异，关联 R/S 及计划任务 |
| `environment-authorization-record` | 所需环境操作组、边界与授权出处；无操作可简述 |
| `test-strategy` | RIGHT-BICEP 适用性、场景/测试绑定和预期断言，实际结果引用 evidence |
| lite 的 `acceptance` | 唯一顶层 Gherkin 块；full 引用 acceptance.feature，不复制场景正文；纯无行为任务按 DSL 例外 |
| `stage-authorization-record` | 当前方案及范围、确认和未决项，引用原始依据 |

交付前逐项核对模板章节、顺序与层级，并核对内容充分性、引用有效性、PRD→TRD 单向承接、模式评估、适用约束与授权状态。最末保留简明评审结论；CLI 校验不等于设计正确或用户批准。
