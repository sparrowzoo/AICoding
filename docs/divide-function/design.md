# divide-function — 技术设计

> 模式: 精简版 (小需求)

## 1. Context

实现一个安全整数除法函数 `divide(int a, int b)`，包含除零保护和溢出保护。单函数、无外部依赖、无状态、无 I/O。

约束:
- 无第三方库
- 单一职责
- 防御性编程处理边界
- 与现有 `SubtractFunction`, `AddFunction` 保持一致的风格和错误处理惯例

### 业务规则摘要

| # | 规则 | 说明 |
|---|------|------|
| R1 | 整数除法 | `divide(a, b)` 返回 `a / b` 的整数结果，截断向零 |
| R2 | 除零保护 | 当 `b == 0` 时，抛 `ArithmeticException("/ by zero")` |
| R3 | 溢出保护 | 当 `a == Integer.MIN_VALUE && b == -1` 时，抛 `ArithmeticException("overflow")` |
| R4 | 纯函数 | 无副作用，相同输入始终相同输出 |
| R5 | 不可实例化 | 工具类应通过 `private` 构造器防止实例化 |

溢出判定条件:
- `Integer.MIN_VALUE / -1` 在 Java 中会导致整数溢出（结果 `Integer.MAX_VALUE + 1`，超出 int 正数范围），需前置检测并抛出异常

## 2. Decisions

| # | 决策点 | 选型 | 替代方案 | 理由 |
|---|--------|------|----------|------|
| 1 | 溢出检测策略 | 前置条件检查：`if (a == Integer.MIN_VALUE && b == -1)` | 使用 `Math.divideExact`(Java 18+) / 用 long 转换后计算再截断 | 前置检查最简洁且直观；Java 17 无 `Math.divideExact`，不能用；long 转换会隐藏语义 |
| 2 | 异常类型 — 除零 | `ArithmeticException("/ by zero")` | `IllegalArgumentException` | Java `/` 运算符除零时原生抛 `ArithmeticException`；保持与 JDK 行为一致 |
| 3 | 异常类型 — 溢出 | `ArithmeticException("overflow")` | `ArithmeticException("integer overflow")` | 与现有 `SubtractFunction` 溢出异常消息格式统一为 `"overflow"`，用户代码可用统一 catch |
| 4 | 工具类构造器 | `private` 构造器 + `final class` | 非 final / 公开构造器 | 防止实例化，标记语义清晰；与现有 `SubtractFunction` 保持一致 |
| 5 | 方法可见性 | `public static` | 实例方法 | 无状态纯函数，静态方法调用更简洁 |

## 3. Data Model

本次变更不涉及数据模型。

## 4. API / Contracts

```java
public static int divide(int a, int b)
```

| 参数 | 类型 | 约束 | 说明 |
|------|------|------|------|
| a | int | 无特殊约束 | 被除数 |
| b | int | 非零 | 除数 |
| 返回值 | int | — | `a / b` 的整数结果（截断向零） |

异常:

| 条件 | 异常类型 | 消息 |
|------|----------|------|
| `b == 0` | `ArithmeticException` | `"/ by zero"` |
| `a == Integer.MIN_VALUE && b == -1` | `ArithmeticException` | `"overflow"` |

执行逻辑:

```
divide(a, b):
  1. 检查 b == 0 → throw ArithmeticException("/ by zero")
  2. 检查 a == Integer.MIN_VALUE && b == -1 → throw ArithmeticException("overflow")
  3. 返回 a / b
```

实现方式: 先做两个前置校验（除零 + 溢出），然后直接委托 Java `/` 运算符计算。

## 5. Flows

核心流程 — 单函数按优先级执行:

```
1. 校验 b == 0
   ├── 是 → throw ArithmeticException("/ by zero")
   └── 否 → 进入步骤 2
2. 校验溢出 (a == Integer.MIN_VALUE && b == -1)
   ├── 是 → throw ArithmeticException("overflow")
   └── 否 → 进入步骤 3
3. 返回 a / b
```

流程说明:
- 除零检查优先于溢出检查，因为 `b == 0` 不需要计算即可判定
- 溢出仅出现在 `Integer.MIN_VALUE / -1` 这一种场景
- 正常路径直接委托 Java 原生 `/` 运算符

## 6. Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 溢出场景仅有 `MIN_VALUE / -1` 一种组合 | 遗漏其他可能的溢出路径 | Java 中 int 除法仅此一种溢出场景，已完整覆盖 |
| 除零异常消息为 `"/ by zero"`，带空格和斜杠 | 可能与其他语言/库约定不一致 | 保持与 JDK `ArithmeticException` 原生消息一致 |
| 被除数为负数的截断方向 | 不同语言对负数的截断方向不同 | Java 为截断向零，与 C/C++/Python 3 一致；已在 spec 中明确 |
