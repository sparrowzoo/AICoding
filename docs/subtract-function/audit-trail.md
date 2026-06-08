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

## 2026-06-08 — TDD 编码实施

**产出内容**: SubtractFunction 实现与测试

| 文件 | 路径 | 说明 |
|------|------|------|
| 实现 | `src/main/java/com/example/util/SubtractFunction.java` | 安全减法，含溢出保护 |
| 测试 | `src/test/java/com/example/util/SubtractFunctionTest.java` | 9 个测试用例，覆盖全部 spec Scenario |

**实施模式**: Subagent-Driven Development (SDD)
- TDD RED 阶段：编写 9 个测试用例
- TDD BLUE 阶段：实现 `subtract(int, int)` 方法
- TDD GREEN 阶段：9/9 测试通过，全部 16 个测试无回归

**关键实现细节**:
- 溢出检测委托 `Math.subtractExact(a, b)`，catch 后统一抛出 `ArithmeticException("overflow")`
- 特判 `a == 0 && b == Integer.MIN_VALUE`：`Math.subtractExact` 会抛异常，但 spec 要求此场景返回 `Integer.MIN_VALUE`
- 与 `DivideFunction` 保持一致风格：`final class` + `private` 构造器 + `public static` 方法

**审查记录**:

| 审查阶段 | 结果 | 说明 |
|----------|------|------|
| Spec 合规审查 | PASS | 所有 spec Scenario 均有对应测试覆盖和实现 |
| 代码质量审查 (simplify) | PASS | 无简化/复用/效率问题 |
| 独立 code-review (opus) | PASS | Correctness/Architecture/Cleanliness/Test Quality 均通过 |

**提交**: `b4f7f51` - feat: add SubtractFunction with TDD - all 9 scenarios pass
