# 需求编号与验收场景

R 编号使用独立行、代码块之外的 `<a id="R01"></a>` 声明。lite 在 `technical.md` 声明目标与规则；full 在 `product.md` 声明 R，直接关联诉求来源和产品规则。编号稳定、不复用。技术设计用同样形式的 `<a id="api-01"></a>` 等显式锚点。

本轮有行为场景时，lite 将场景写在 TRD 的 `<a id="acceptance"></a>` 章节，集中放入一个 `gherkin` 代码块，生成的引用指向 `technical.md#acceptance`。纯文档等无行为变更任务能否省略场景块，按[任务引用的场景及例外条件](../../trd-writer/references/planning.md#dsl)判断。full 将 Gherkin 正文放入独立的 `acceptance.feature`。下例描述修改显示名称时的行为。

```gherkin
@R01
Feature: 显示名称校验
  @S01
  Scenario: 拒绝空名称
    Given 用户正在修改显示名称
    When 提交空字符串
    Then 提示名称不能为空
```

这是格式示例，不是任何项目已经确认的需求。每个 Scenario/Scenario Outline 直接标记一个唯一 `@S数字`（如 @S01），编号采用至少两位数字的 R/S/T 形式，并具有至少一个 `@R数字`；R 可从 Feature/Rule 继承。使用官方 Gherkin 语法，包括中文语法、Examples、数据表等，不自创扩展步骤关键字。计划引用的场景必须有实际步骤；Scenario Outline 还须至少有一行 Examples 数据。lite 的场景块必须位于顶层并正确闭合，代码示例或 HTML 注释中的锚点不能代替正文声明。

场景是长期维护的验收库，计划只引用当前迭代相关部分。
