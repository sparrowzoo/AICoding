# simple-add — 技术设计

> 模式: 精简版 (小需求)

## 1. Context

实现一个安全整数加法函数 `add(int a, int b)`，包含正/负溢出保护。单函数、无外部依赖、无状态、无 I/O。

约束:
- 无第三方库
- 单一职责
- 防御性编程处理边界
- 与现有 `SubtractFunction`, `DivideFunction` 保持一致的风格和错误处理惯例

### 业务规则摘要

| # | 规则 | 说明 |
|---|------|------|
| R1 | 整数加法 | `add(a, b)` 返回 `a + b` 的整数结果 |
| R2 | 正溢出保护 | 当 `a + b > Integer.MAX_VALUE` 时，抛 `ArithmeticException("overflow")` |
| R3 | 负溢出保护 | 当 `a + b < Integer.MIN_VALUE` 时，抛 `ArithmeticException("overflow")` |
| R4 | 纯函数 | 无副作用，相同输入始终相同输出 |
| R5 | 不可实例化 | 工具类应通过 `private` 构造器防止实例化 |

溢出判定条件:
- 正溢出: `a > 0 && b > 0 && a + b < 0`（两正数相加结果变负，即溢出）
- 负溢出: `a < 0 && b < 0 && a + b >= 0`（两负数相加结果非负，即溢出）
- 仅在同号时才可能溢出，异号相加不会溢出

## 2. Decisions

| # | 决策点 | 选型 | 替代方案 | 理由 |
|---|--------|------|----------|------|
| 1 | 溢出检测策略 | 前置条件检查：基于符号判断 `a > 0 && b > 0 && sum < 0` | 使用 `Math.addExact`(Java 8+) / 用 long 转换后比较范围 | `Math.addExact` 内部也是符号判断，性能无差异；但前置检查逻辑更直观且与 SubtractFunction 风格统一。团队约定前置校验模式 |
| 2 | 异常类型 — 溢出 | `ArithmeticException("overflow")` | `IllegalArgumentException("overflow")` / `ArithmeticException("integer overflow")` | 与现有 `SubtractFunction` 溢出异常消息格式统一为 `"overflow"`，用户代码可用统一 catch |
| 3 | 工具类构造器 | `private` 构造器 + `final class` | 非 final / 公开构造器 | 防止实例化，标记语义清晰；与现有工具类保持一致 |
| 4 | 方法可见性 | `public static` | 实例方法 | 无状态纯函数，静态方法调用更简洁 |
| 5 | 溢出检测 API | 手动符号判断 | `Math.addExact` | `Math.addExact` 内部也是符号判断，但多一层 try-catch 开销；手动前置检查更可预测 |

## 3. Data Model

本次变更不涉及数据模型。

## 4. API / Contracts

```java
public static int add(int a, int b)
```

| 参数 | 类型 | 约束 | 说明 |
|------|------|------|------|
| a | int | 无特殊约束 | 加数 |
| b | int | 无特殊约束 | 加数 |
| 返回值 | int | — | `a + b` 的结果 |

异常:

| 条件 | 异常类型 | 消息 |
|------|----------|------|
| `a > 0 && b > 0 && result < 0` | `ArithmeticException` | `"overflow"` |
| `a < 0 && b < 0 && result >= 0` | `ArithmeticException` | `"overflow"` |

执行逻辑:

```
add(a, b):
  1. 计算 sum = a + b
  2. 检查正溢出: a > 0 && b > 0 && sum < 0 → throw ArithmeticException("overflow")
  3. 检查负溢出: a < 0 && b < 0 && sum >= 0 → throw ArithmeticException("overflow")
  4. 返回 sum
```

实现方式: 先做加法，再通过符号关系判断是否溢出。仅同号相加才有可能溢出；异号相加时 `|sum| < max(|a|, |b|)`，不可能溢出。

## 5. Flows

核心流程 — 单函数按优先级执行:

```
1. 计算 sum = a + b
2. 检查正溢出 (a > 0 && b > 0 && sum < 0)
   ├── 是 → throw ArithmeticException("overflow")
   └── 否 → 进入步骤 3
3. 检查负溢出 (a < 0 && b < 0 && sum >= 0)
   ├── 是 → throw ArithmeticException("overflow")
   └── 否 → 进入步骤 4
4. 返回 sum
```

流程说明:
- 异号相加不会溢出，不做检查
- 同号时 sum 符号与任一加数符号相反则溢出
- 正常路径直接委托 Java 原生 `+` 运算符
- 用 `Math.addExact` 也可行，但前置判断更直观且与非功能需求无性能差异

## 6. Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 溢出检测在 sum 计算后判断 | sum 本身已在 int 中回绕，但仅用符号关系判断不依赖精确值 | 符号判断是确定性的：正+正得负=溢出，负+负得非负=溢出 |
| 异号不会溢出 | 一切异号组合均安全 | 数学上已证明：设 a>0, b<0，则 sum 在 [b, a] 区间内 |
| int 溢出时 sum 的值不可靠 | 仅用于符号判断，不用于业务逻辑 | 溢出时直接抛出，不会使用回绕后的 sum |
