# AI Coding 工作流维护说明

本仓库的完整执行规则统一维护在 [develop-work-flow/SKILL.md](../.agents/skills/develop-work-flow/SKILL.md)。本文件面向工作流维护者，说明文件职责与维护入口；执行技能时不要求读取本文件或其他 `design-docs/` 文档。

## 文件职责

| 位置 | 维护内容 |
| --- | --- |
| `.agents/skills/develop-work-flow/SKILL.md` | 自包含的执行流程、授权与确认、文档职责、DSL、测试、证据、迭代和脚本约定 |
| `.agents/skills/*/SKILL.md` | 各阶段的具体职责，通过主 SKILL 的锚点引用共享规则 |
| `.agents/agents/*/AGENT.md` | 审查职责与输出要求，通过主 SKILL 引用执行契约 |
| `.agents/skills/develop-work-flow/assets/` | lite/full 及证据模板，字段与主 SKILL 一致 |
| `.agents/skills/develop-work-flow/scripts/` | 用户级依赖准备、DSL 校验、Markdown 生成及测试 |
| `design-docs/` | 面向维护者的架构与设计依据、实现边界和导航，不维护第二份执行规则正文 |
| 目标业务项目的 `doc/req-rNN-name/` | 该需求的业务事实、设计、计划、证据与生成视图 |

技能的工作流规则只向技能包内引用。业务项目的实际需求、代码、测试与证据属于任务输入，仍按授权读取；“不读取外部设计说明”不限制业务调查。

## 执行规范索引

| 主题 | 唯一执行来源 |
| --- | --- |
| 完整流程与读取边界 | [执行入口](../.agents/skills/develop-work-flow/SKILL.md#runtime-boundary)与[执行步骤](../.agents/skills/develop-work-flow/SKILL.md#steps) |
| 需求开始与工作分支 | [需求分支准备](../.agents/skills/develop-work-flow/SKILL.md#requirement-branch) |
| 需求分类与历史功能代码设计确认 | [分流规则](../.agents/skills/develop-work-flow/SKILL.md#routing)与[确认规则](../.agents/skills/develop-work-flow/SKILL.md#existing-confirmation) |
| 文档、接口与 DSL | [文档职责](../.agents/skills/develop-work-flow/SKILL.md#documents)、[接口共识](../.agents/skills/develop-work-flow/SKILL.md#interfaces)、[DSL 契约](../.agents/skills/develop-work-flow/SKILL.md#dsl) |
| 迭代与并行 | [迭代承接](../.agents/skills/develop-work-flow/SKILL.md#iteration)、[打回与恢复](../.agents/skills/develop-work-flow/SKILL.md#rework)、[记录归并](../.agents/skills/develop-work-flow/SKILL.md#collaboration) |
| 测试、证据与验收 | [RIGHT-BICEP](../.agents/skills/develop-work-flow/SKILL.md#right-bicep)、[全链路证据](../.agents/skills/develop-work-flow/SKILL.md#evidence)、[四列状态表](../.agents/skills/develop-work-flow/SKILL.md#task-status) |
| 接入、工具与追溯 | [接入前提](../.agents/skills/develop-work-flow/SKILL.md#onboarding)、[脚本入口](../.agents/skills/develop-work-flow/SKILL.md#script-entry)、[Git 追溯](../.agents/skills/develop-work-flow/SKILL.md#traceability) |

## 维护方式

需要调整执行行为时，先在主 SKILL 明确规则，再同步关联技能、审查代理、模板和确实受影响的脚本；不要把新增执行要求只写在设计说明中。阶段专有职责仍由对应技能维护，共享规则只在主 SKILL 维护。

文档检查应覆盖技能与代理的引用闭合、锚点、示例和模板一致性。独立可用性核验只提供技能包及实际项目输入，确认不依赖源仓库设计说明仍能形成有效计划、核验证据和处理确认边界。脚本变更另按主 SKILL 的入口运行测试。

维护者的架构与设计依据见 [AI Coding 设计说明](<AI Coding 设计说明.md>)；业务实施仍以对应项目的具体授权及确认范围为准。
