# add-function 工作流全链路决策证据

> 启动时间: 2026-09-18 | feature: add-function | 驱动方式: 手动编排（Workflow 运行时与 openspec CLI 均不可用）

## 节点①：需求确认

| 检查项 | 结果 | 证据 |
|--------|------|------|
| ① 功能描述 | Yes | 「用 Java 实现 1+1=2」→ 整数加法方法 |
| ② 输入输出 | Yes | `int add(int a, int b)` → int |
| ③ 异常场景 | Yes | 无业务异常；int 溢出为边界 |
| **决策** | 明确 | 三问全 Yes |

## 规模判定

| 特征 | 判定 |
|------|------|
| 功能范围 | 单类/单函数 → 小 |
| 异常场景 | ≤3 → 小 |
| 外部依赖 | 无 → 小 |
| **结论** | **小需求** → 跳过审核闸门，自动 Path B |

## 节点②：TRD 产出

| 产出 | 路径 | 状态 |
|------|------|:--:|
| design.md | openspec/changes/add-function/design.md | ✅ |
| specs | openspec/changes/add-function/specs/add-function.md | ✅ |
| plan.md | docs/superpowers/plans/add-function.md | ✅ |

> openspec CLI 不可用，文档按 OpenSpec/Superpowers 规范手动产出。riskLevel=low，taskCount=3。

## 节点③：审核闸门

| 检查项 | 值 | 判定 |
|--------|------|------|
| riskLevel | low | 不影响 |
| taskCount | 3 | ≤10 |
| **决策** | **Path B** | 小需求，自动跳过 |

## 节点④：TDD 编码

| 产出 | 路径 |
|------|------|
| 源文件 | src/main/java/com/example/math/AddFunction.java |
| 测试文件 | src/test/java/com/example/math/AddFunctionTest.java |

- 测试总数 10，通过 10，失败 0
- RED：AddFunction 不存在，编译失败（确认）
- GREEN：实现后 `mvn test` BUILD SUCCESS

## 节点④½：运行时验证

| 指标 | 值 |
|------|------|
| surface | 库边界（纯方法） |
| claim | add 返回两整数之和 |
| verdict | PASS（`mvn test` 10/10 通过） |

## 节点⑤：E2E 验收

| 指标 | 值 |
|------|------|
| 规则总数 | 5 |
| ✅ 通过 | 5 |
| ❌ 未通过 | 0 |
| allPassed | true |

## 节点⑥：归档

| 检查项 | 结果 |
|--------|:--:|
| e2e allPassed | ✅ |
| 代码已提交 | ⏳ 待用户确认（未 git commit） |
| 文档归档 | ✅ docs/archive/20260918/add-function/ |
