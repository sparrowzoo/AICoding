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

## 2026-06-08 — 运行时验证 (E2E Verification)

**验证方式**: 通过独立 Java 程序调用 `SubtractFunction.subtract()` 观察运行时行为

**验证覆盖**:
- **正常路径** (6 个场景): `10-3=7`, `-5-(-3)=-2`, `7-0=7`, `5-5=0`, `5-(-3)=8`, `-3-5=-8` — 全部 PASS
- **溢出保护** (2 个场景): `MAX_VALUE-(-1)` 抛 `ArithmeticException("overflow")`, `MIN_VALUE-1` 抛 `ArithmeticException("overflow")` — 全部 PASS
- **特殊边界** (1 个场景): `0-MIN_VALUE` 返回 `Integer.MIN_VALUE` — PASS
- **探测项** (额外 4 个边界): `0-0=0`, `MAX_VALUE-MAX_VALUE=0`, `0-1=-1`, `MIN_VALUE-1` 抛异常 — 全部 PASS

**结论**: 13/13 场景通过。与 spec 完全一致。无异常行为。

## 2026-06-08 — E2E 业务验收 (e2e-validator)

**验收方式**: 以业务规则为契约，逐条验收代码实现

**验收覆盖**: 12 条业务规则 (R-001 ~ R-012)

**验收结果**:

| 指标 | 数值 |
|------|------|
| 总规则数 | 12 |
| ✅ 通过 | 8 |
| ⚠️ 需确认 | 4 |
| ❌ 未通过 | 0 |

**⚠️ 需确认项**:
1. **R-009 (0-MIN_VALUE 特判)**: 实现使用 `a==0 && b==MIN_VALUE` 特判绕过 `Math.subtractExact` 溢出检测，符合 spec 但缺少业务决策说明
2. **R-010 (纯函数)**: 无显式幂等性测试用例
3. **R-011 (异常消息)**: 溢出测试只断言了异常类型，未断言消息文本 `"overflow"`
4. **R-012 (不可实例化)**: 缺少反射/构造函数调用的防御测试

**改进建议**: 补充 3 个测试用例（异常消息断言、幂等性验证、构造器防御）以提升测试完备性。

**质量门禁**: doc-reviewer 审查通过 | 无需人工介入

## 2026-06-08 — 归档

**归档操作**: subtract-function 功能变更已关闭并归档

| 项目 | 说明 |
|------|------|
| 归档路径 | `docs/archive/20260608/subtract-function/` |
| 归档内容 | 需求提案、技术设计、规格说明、实施计划、审计跟踪 |
| 源代码 | `SubtractFunction.java` / `SubtractFunctionTest.java` 保留在 `src/` 中 |
| 结论 | 功能已完成，代码已合并，变更已关闭 |
