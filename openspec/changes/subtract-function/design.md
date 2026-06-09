## Context

实现一个安全整数减法函数 `subtract(int a, int b)`，包含溢出保护。单函数、无外部依赖、无状态、无 I/O。

当前 `com.example.util` 包已有 `AddFunction`、`DivideFunction`，均采用工具类模式（`final class` + `private` 构造器 + `public static` 方法），本设计保持风格一致。

约束:
- 无第三方库
- 单一职责
- 防御性编程处理边界
- 与现有工具类保持一致的风格和错误处理惯例

### 业务规则摘要

| # | 规则 | 说明 |
|---|------|------|
| R1 | 整数减法 | `subtract(a, b)` 返回 `a - b` 的整数结果 |
| R2 | 溢出保护 | 当结果超出 int 范围时，抛 `ArithmeticException("overflow")` |
| R3 | 零值处理 | 减零返回原值；结果为零返回 0 |
| R4 | 零减 MIN_VALUE 特例 | `0 - Integer.MIN_VALUE` 在 Java int 中回绕为 `Integer.MIN_VALUE`，此场景不视为溢出 |
| R5 | 纯函数 | 无副作用，相同输入始终相同输出 |
| R6 | 不可实例化 | 工具类通过 `private` 构造器防止实例化 |

### 溢出分析

减法的溢出场景与加法不同:
- `MAX_VALUE - (-1)` 等价于 `MAX_VALUE + 1`，正溢出
- `MIN_VALUE - 1` 等价于 `MIN_VALUE + (-1)`，负溢出
- `0 - Integer.MIN_VALUE` 等价于 `0 + (-Integer.MIN_VALUE)`，但 `-Integer.MIN_VALUE` 本身在 int 中回绕为 `Integer.MIN_VALUE`，因此结果为 `Integer.MIN_VALUE` — 这是 Java 语言规范行为，不视为异常溢出

## Goals / Non-Goals

**Goals:**
- 提供 `subtract(int, int) -> int` 纯函数
- 溢出时以 `ArithmeticException("overflow")` 抛出
- 与现有工具类风格统一

**Non-Goals:**
- 不支持 long/float/double/BigDecimal 类型的减法
- 不提供链式减法或集合归约的糖方法
- 不涉及 I/O 或外部状态

## Decisions

| # | 决策点 | 选型 | 替代方案 | 理由 |
|---|--------|------|----------|------|
| 1 | 溢出检测策略 | `Math.subtractExact` 原生检测 | 手动计算 `a - b` 后符号判断 / 用 long 强转再检查 | `Math.subtractExact` 是 Java 标准库内建溢出检测 API，代码最简洁；与 add/divide 函数风格一致 |
| 2 | 异常类型 — 溢出 | `ArithmeticException("overflow")` | `IllegalArgumentException("overflow")` / `ArithmeticException("integer overflow")` | Java 数学运算溢出使用 `ArithmeticException`；消息统一为 `"overflow"` 便于用户代码统一 catch |
| 3 | 工具类构造器 | `private` 构造器 + `final class` | 非 final / 公开构造器 | 防止实例化，标记语义清晰；与现有工具类保持一致 |
| 4 | 方法可见性 | `public static` | 实例方法 | 无状态纯函数，静态方法调用更简洁 |
| 5 | 零减 MIN_VALUE 特例处理 | 在 catch 块中添加 `a == 0 && b == Integer.MIN_VALUE` 豁免 | 不做特殊处理，直接抛出 `ArithmeticException` | Java 语言规范中 `0 - Integer.MIN_VALUE` 的行为是定义良好的（回绕到 MIN_VALUE），该场景已在竞品测试中出现，应视为正常行为而非溢出 |

## API / Contracts

```java
public static int subtract(int a, int b)
```

| 参数 | 类型 | 约束 | 说明 |
|------|------|------|------|
| a | int | 无特殊约束 | 被减数 (minuend) |
| b | int | 无特殊约束 | 减数 (subtrahend) |
| 返回值 | int | — | `a - b` 的整数结果 |

异常:

| 条件 | 异常类型 | 消息 |
|------|----------|------|
| `a - b` 结果溢出 int 范围 | `ArithmeticException` | `"overflow"` |

溢出判定规则 (由 `Math.subtractExact` 内建实现):
- `b > 0` 且 `a < Integer.MIN_VALUE + b` 时 → 下溢
- `b < 0` 且 `a > Integer.MAX_VALUE + b` 时 → 上溢
- 特例: `a == 0 && b == Integer.MIN_VALUE` → 返回 `Integer.MIN_VALUE`（不视为溢出）

## Flows

核心流程 — 单函数:

```
1. 委托 Math.subtractExact(a, b)
   ├── 正常 → 返回结果
   └── ArithmeticException 捕获
        ├── 特例: a == 0 && b == Integer.MIN_VALUE
        │   └── 返回 Integer.MIN_VALUE
        └── 其他溢出
            └── throw new ArithmeticException("overflow")
```

流程说明:
- 无需前置校验（减法不涉及除零等前置条件）
- 溢出检测由 `Math.subtractExact` 内建完成
- 零减 MIN_VALUE 需特殊处理，因为 `Math.subtractExact` 将其视为溢出，但业务上它是定义良好的回绕行为
- 异常消息统一为 `"overflow"`

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `Math.subtractExact` 零减 MIN_VALUE 视为溢出 | 符合 AC 的特例场景会抛异常 | catch 块中添加 `a == 0 && b == Integer.MIN_VALUE` 豁免，返回 `Integer.MIN_VALUE` |
| `Math.subtractExact` 原始消息为 "integer overflow"，与 AC 中 "overflow" 不一致 | 测试断言异常消息时可能失败 | 捕获后以 `new ArithmeticException("overflow")` 重新抛出，统一消息格式 |
| 手动维护豁免逻辑与 `Math.subtractExact` 内建逻辑分离 | 业务规则散落在两处 | 通过单 catch 块集中处理，豁免条件明确，测试覆盖该场景 |
