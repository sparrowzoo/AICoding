# subtract-function — 技术设计

> 模式: 精简版 (小需求)

## 1. Context

实现一个安全整数减法函数，包含溢出保护。单函数、无外部依赖、无状态、无 I/O。

约束:
- 无第三方库
- 单一职责
- 防御性编程处理边界
- 与现有 `DivideFunction`, `AddFunction` 保持一致的风格和错误处理惯例

### 业务规则摘要

| # | 规则 | 说明 |
|---|------|------|
| R1 | 整数减法 | `subtract(a, b)` 返回 `a - b` 的整数结果 |
| R2 | 溢出保护 | 当结果超出 int 范围时，抛 `ArithmeticException("overflow")` |
| R3 | 零值处理 | 减零返回原值；结果为零返回 0 |
| R4 | 纯函数 | 无副作用，相同输入始终相同输出 |

溢出判定条件:
- `b > 0` 时，若 `a < Integer.MIN_VALUE + b` 则下溢
- `b < 0` 时，若 `a > Integer.MAX_VALUE + b` 则上溢
- 等价于 Java 重写 `Math.subtractExact(a, b)` 的溢出检测逻辑

## 2. Decisions

| # | 决策点 | 选型 | 替代方案 | 理由 |
|---|--------|------|----------|------|
| 1 | 溢出检测策略 | `Math.subtractExact` 原生检测 | 手动计算 `a - b` 后查符号 / 用 long 强转再检查 | `Math.subtractExact` 已封装完整溢出检测，代码最简洁；与 `DivideFunction` 和 `AddFunction` 风格一致 |
| 2 | 异常类型 | `ArithmeticException` | `IllegalArgumentException` | Java 数学运算内建溢出使用 `ArithmeticException`；与 `DivideFunction.divide` 异常类型一致，用户代码可用统一 catch |
| 3 | 工具类构造器 | `private` 构造器 + `final class` | 非 final / 公开构造器 | 防止实例化，标记语义清晰；与现有 `DivideFunction` 保持一致 |
| 4 | 方法可见性 | `public static` | 实例方法 | 无状态纯函数，静态方法调用更简洁 |

## 3. Data Model

本次变更不涉及数据模型。

## 4. API / Contracts

```java
public static int subtract(int a, int b)
```

| 参数 | 类型 | 约束 | 说明 |
|------|------|------|------|
| a | int | 无特殊约束 | 被减数 |
| b | int | 无特殊约束 | 减数 |
| 返回值 | int | — | `a - b` 的整数结果 |

异常:

| 条件 | 异常类型 | 消息 |
|------|----------|------|
| 结果溢出 int 范围 | `ArithmeticException` | `"overflow"` |

溢出判定规则:

```
结果 = a - b
当 b > 0 且 a < Integer.MIN_VALUE + b 时 → 下溢，抛异常
当 b < 0 且 a > Integer.MAX_VALUE + b 时 → 上溢，抛异常
否则 → 正常返回 a - b
```

实现方式: 委托给 `Math.subtractExact(a, b)` 进行运算和溢出检测，捕获其 `ArithmeticException` 后以统一消息 `"overflow"` 重新抛出。

## 5. Flows

核心流程 — 单函数按优先级执行:

```
1. 委托 Math.subtractExact(a, b)
   ├── 正常 → 返回结果
   └── 异常(ArithmeticException)
        └── throw new ArithmeticException("overflow")
```

流程说明:
- 无需前置校验（减法本身不涉及除零等前置检查）
- 溢出检测由 `Math.subtractExact` 内建完成
- 异常消息统一为 `"overflow"`，与 AC6 对齐

## 6. Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `Math.subtractExact` 原始异常消息为 "integer overflow"，与 AC 中 "overflow" 不一致 | 测试断言消息文本时可能失败 | 捕获后以 `new ArithmeticException("overflow")` 重新抛出，统一消息格式 |
| 无前置校验 | 语义上无必要 | 减法运算本身无除零等前置条件，无需校验 |
