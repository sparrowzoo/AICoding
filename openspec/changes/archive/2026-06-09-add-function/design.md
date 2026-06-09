# Design: AddFunction

## Context
实现一个整数加法运算功能，作为计算器基础组件。需要支持 int 类型加法，含边界保护（null、溢出）。技术栈：Java + Maven + JUnit 5。

## Decisions

### D1: 实现方式
| 选项 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A: 静态方法类 | `AddFunction.add(a, b)` 纯静态工具类 | 简单、无状态、易测试 | 不可扩展为实例方法 |
| B: 实例方法 | `new AddFunction().add(a, b)` | 可扩展 | 无状态场景不必要 |

**选择**: 选项 A（静态方法类）。加法运算是纯函数，无状态，静态方法最简单直接。

### D2: 参数类型
| 选项 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A: `int` 原始类型 | `add(int a, int b)` | 无需 null 检查，简单 | 无法表示"无输入"语义 |
| B: `Integer` 包装类型 | `add(Integer a, Integer b)` | 可检测 null 输入 | 需拆箱，多一层检查 |

**选择**: 选项 B（`Integer`）。需要明确处理 null 输入场景，提升健壮性。

### D3: 目录结构
| 选项 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A: `com.example.math` | 独立 math 包 | 职责清晰、可复用 | 与现有包名不一致 |
| B: `com.example.taobao` | 复用现有包名 | 一致性 | 语义不匹配 |

**选择**: 选项 A（`com.example.math`）。math 语义准确，与业务逻辑解耦，后续可独立复用。

## Data Model
```
输入: Integer a, Integer b
输出: int (两数之和)
错误码: NULL_INPUT | OVERFLOW
异常: IllegalArgumentException | ArithmeticException
```

## Error Codes
| 错误码 | 含义 | 触发条件 |
|--------|------|----------|
| NULL_INPUT | 输入参数为 null | a == null 或 b == null |
| OVERFLOW | 结果溢出 int 范围 | 结果 > Integer.MAX_VALUE 或 < Integer.MIN_VALUE |

## API / Contracts
```java
public class AddFunction {
    /**
     * 返回两个整数的和。
     * @param a 第一加数
     * @param b 第二加数
     * @return a + b
     * @throws IllegalArgumentException 参数为 null (错误码: NULL_INPUT)
     * @throws ArithmeticException 结果溢出 int 范围 (错误码: OVERFLOW)
     */
    public static int add(Integer a, Integer b);
}
```

## Flows

### 正常流程
1. 校验 a 非 null → 否则抛出 IllegalArgumentException(NULL_INPUT)
2. 校验 b 非 null → 否则抛出 IllegalArgumentException(NULL_INPUT)
3. 执行 `Math.addExact(a, b)`（JDK 内建溢出检测）
4. 返回结果

### 异常流程
- null 输入 → IllegalArgumentException (NULL_INPUT)
- 溢出 → ArithmeticException (OVERFLOW)

## Risks
| 风险 | 等级 | 影响范围 | 缓解措施 |
|------|------|----------|----------|
| 溢出未检测 | 中 | 计算结果错误且无提示，影响所有调用方 | 使用 Math.addExact 内置溢出检测 |
| null 输入遗漏 | 低 | NPE 导致调用方崩溃 | 参数校验前置，明确异常类型 |
