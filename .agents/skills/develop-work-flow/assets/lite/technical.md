# REPLACE_TITLE · 技术设计

<a id="trd"></a>
文档编号：REPLACE_TRD_ID（按 `TRD-<需求目录>` 派生，跨迭代保持稳定）。

本轮迭代与来源：REPLACE_ITERATION_SOURCE（原需求编号、文档路径/锚点、原 TRD 编号及可复核版本；首次需求注明无前序来源）。

> 本轮轻量变更的规则、验收与设计来源；既有规则引用原文档基线，写清本轮变化；与 plan.yaml 配合使用。替换占位符，按实际影响裁剪，不补建独立需求、产品或场景文件。

<a id="R01"></a>
## 目标与规则

本轮目标、范围及验收规则：REPLACE_GOAL_RULES（大需求的小迭代只更新本次内容，引用原需求编号/文档，保留未变基线，不重写整个需求）。

## 分流、影响与确认

文档深度及意图识别依据：REPLACE_DOCUMENT_DEPTH（由 AI 根据业务规则、协作关系与实现复杂度判断简单/复杂，对应 lite/full）。

新需求 / 老需求及代码分析依据：REPLACE_LOGIC_CLASSIFICATION（不按需求名称分类）

具体涉及的历史文件、函数/接口与当前行为，本次改哪里、如何改、必须保留什么：REPLACE_CODE_IMPACT（独立新增时说明无历史影响的事实依据）。

受影响调用方/角色、风险和控制措施：REPLACE_IMPACT（高风险也可使用轻量模式，但须明确说明；无需外部通知）。

本次代码设计确认：REPLACE_CONFIRMATION（涉及历史功能逻辑时，即使使用 lite，也先展示具体代码设计并取得用户确认后实施；记录所确认的方案/版本、代码边界、用户结论及可定位来源。一般开发授权不能替代代码设计确认；未确认则注明待确认。独立新逻辑记录已有实施授权与关键待决项）。

<a id="api-01"></a>
## 接口与实现

关联 R01 / S01。新增或变化的接口：REPLACE_INTERFACE（入口、输入/默认值/校验、输出/错误、副作用；无接口变化则说明实现边界）。

实现文件、模块/函数职责、调用关系、允许修改的边界及关键执行步骤：REPLACE_IMPLEMENTATION

<a id="acceptance"></a>
## 验收场景

```gherkin
@R01
Feature: REPLACE_FEATURE
  @S01
  Scenario: REPLACE_SCENARIO
    Given REPLACE_PRECONDITION
    When REPLACE_ACTION
    Then REPLACE_EXPECTED_RESULT
```

<a id="test-strategy"></a>
## 验证与交付

场景绑定的真实测试入口、受影响行为的回归检查：REPLACE_TESTS

RIGHT-BICEP：REPLACE_TEST_DIMENSIONS（思考各维度，紧凑记录适用项的断言；不适用项可合并说明，不要求六行表）。

必要的发布、恢复措施：REPLACE_DELIVERY
