# subtract-function — Audit Trail

## 2026-06-08 — TRD 产出

**产出内容**: subtract-function 技术设计文档链

| 文件 | 路径 | 说明 |
|------|------|------|
| 需求提案 | `docs/subtract-function/proposal.md` | 功能概述、接口规格、异常边界 9 场景、AC 7 条 |
| 技术设计 | `docs/subtract-function/design.md` | Context、Decisions(4项)、API/Contracts、Flows、Risks |
| 规格说明 | `docs/subtract-function/specs/spec.md` | 单文件合并 spec，10 个 Scenario(6 正常 + 2 溢出 + 1 边界 + 1 纯函数) |
| 实施计划 | `docs/subtract-function/plan.md` | 2 个 Task：实现与测试、Git 提交 |

**关键决策**:
- 溢出检测使用 `Math.subtractExact` + 异常消息统一为 "overflow"
- 异常类型使用 `ArithmeticException`，与现有 `DivideFunction` 保持一致
- 纯静态工具类模式，无状态

**风险项**:
- 无。`Math.subtractExact` 异常已通过 catch-rethrow 统一消息

**审查状态**: 自审通过
