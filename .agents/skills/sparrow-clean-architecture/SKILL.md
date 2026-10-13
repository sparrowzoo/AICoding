---
name: sparrow-clean-architecture
description: Use when a user wants to copy, generate, or update reusable AGENTS.md architecture rules for a Sparrow-style Java/Maven Clean Architecture project, including 复用整洁架构规范 or 新项目架构约束. Not for ordinary feature implementation or unrelated architectures.
---

# 复用整洁架构规范

将 [AGENTS.md 模板](assets/AGENTS.md) 复制或合并到目标项目。模板是通用架构规则的唯一源；本文件只定义如何应用，不重复规则。

1. 通过软链接调用时，先解析当前 `SKILL.md` 的真实路径，再定位同一技能包内的 `assets/AGENTS.md`；不读取源仓库的设计文档或依赖固定机器路径。
2. 确认目标项目。用户已指明路径或明确指向当前项目时直接采用；仅请求模板时交付模板，无需询问尚未确定的包名或 DAO。写入目标不明确时只澄清路径。
3. 读取模板与目标已有的 `AGENTS.md`、适用指令及必要的 POM。仅采用已核实或用户已选择的项目命名与技术选择；未确定时保留通用模块职责，不杜撰配置。已有架构与模板冲突时说明差异，确认采用范围后再修改冲突部分。
4. 无 `AGENTS.md` 时写入模板；已有文件时只合并或更新对应的架构条款，保留其他规则、命令和用户修改。已有等价条款直接复用，不整段重复追加；再次执行不得产生第二份相同规范。
5. 合并 MySQL 表结构规范时保留模板的通用字段定义及按业务选用原则；有存量表规范时先核对冲突，不借合并规范开始具体表设计、改表或生成迁移。表设计前告知、字段语义及适用边界均随模板进入目标 AGENTS：自有业务表遵循项目规范，第三方框架表保持官方实际结构，不为统一命名改造。
6. 交付一个自包含的项目 `AGENTS.md`。不另建架构手册、镜像模板或项目级 Skill 副本，不写入本机路径、源仓库链接或必须安装本 Skill 的前提。生成规则不包含新建业务模块、修改 POM、运行环境、提交或发布的授权。
7. 核对依赖图、职责与目标事实是否一致，检查原有内容保留和重复条款；报告文件位置、变化与未决项。仅处理规范时不启动业务构建或测试。

示例：`使用 $sparrow-clean-architecture，将架构规范合并到当前项目的 AGENTS.md，保留已有项目约定。`
