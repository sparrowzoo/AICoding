# AI Coding 工作流维护说明

工作流安排谁来做、要交付什么，以及何时请用户确认。具体的编写和审查方法放在负责方的目录。工作流运行时只需技能包和目标项目的输入。本文供维护者定位改动。

## 按职责找到维护位置

| 要调整的行为 | 维护位置 |
| --- | --- |
| 需求分流、阶段顺序、交接、分支与环境授权 | [develop-work-flow](../.agents/skills/develop-work-flow/SKILL.md) |
| 用户问题、业务规则、产品验收场景、产品文档及场景模板 | [prd-writer](../.agents/skills/prd-writer/SKILL.md) |
| 概要设计、模块协作、API 定义的汇总、数据结构与数据库设计（含 DAO 的读写语义、PO 字段及表列映射）、验证方案、逐步计划及对应模板 | [trd-writer](../.agents/skills/trd-writer/SKILL.md) |
| 按场景交付 API 及协议类型（Param、Query、DTO 等）、Controller、Repository、DAO 的接口方法和 PO 数据声明，说明兼容要求 | [api-first](../.agents/skills/api-first/SKILL.md#layer-contracts) |
| 将已确定的接口声明写入项目、业务代码实施、联调和回归 | [coder](../.agents/skills/coder/SKILL.md) |
| 最终验收、证据记录与返工复验 | [e2e-validator](../.agents/skills/e2e-validator/SKILL.md) |
| 只读文档或代码审查 | [doc-reviewer](../.agents/agents/doc-reviewer/AGENT.md) 和 [code-reviewer](../.agents/agents/code-reviewer/AGENT.md) |
| 用户级脚本依赖、任务计划校验、阅读视图生成 | [trd-writer 的计划工具](../.agents/skills/trd-writer/scripts/plan.mjs) |

每项业务需求的事实、方案、计划与证据保存在目标项目的需求目录中。trd-writer 的计划工具读取该目录，生成团队可读的计划和状态表。

## 维护方式

先确定谁对改动负责，再修改该 skill 或审查代理的正文和配套模板。在使用这项能力的步骤写明何时读取并直接链接负责方。其他阶段复用同一个定义。

例如，团队要求每个新接口都说明调用方能识别哪些错误，这条编写规则归 api-first。到了具体项目，TRD 说明失败会怎样影响业务流程，api-first 根据项目约定定义错误。按[接口声明分工](../.agents/skills/api-first/SKILL.md#declaration-owner)落实并核对本次声明或拟议差异。用户批准实施范围后，coder 实现失败处理，验收方按场景核对实际结果。

改完核对实际调用方、文档链接、锚点、示例和模板。通过业务项目软链接读取时，应能找到目标文件。验证技能可独立使用时，只提供技能包和实际项目输入。脚本变更按[仓库维护说明](../readme.md)运行测试。

维护者可以在[架构与设计依据](<AI Coding 设计说明.md>)中了解这些分工的原因。业务实施以对应项目的具体授权范围为准。
