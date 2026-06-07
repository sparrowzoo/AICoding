---
name: spec-split-pattern
description: basic-math 项目的 specs 拆分惯例——按 capability 拆分，单个 capability 使用单文件
metadata:
  type: reference
---

对于 basic-math 项目，每个 capability 对应一个 `specs/{capability}/spec.md`。当功能简单（仅一个 capability）时，单文件即可覆盖全部需求和场景。spec 格式遵循 OpenSpec 的 delta 模式（ADDED Requirements），每个 Requirement 包含 `### Requirement:` 标题 + 描述 + 至少一个 `#### Scenario:`。使用 SHALL/MUST 规范语言。

关联：[[plan-superpowers-format]], [[design-sections-for-simple-features]]
