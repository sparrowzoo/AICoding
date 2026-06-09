# divide-function — 需求提案

> 状态: 已补齐 | 特征: 小需求

## 1. 功能概述

一个安全整数除法函数，接收两个整数，返回它们的商（截断向零）。需处理除零保护和溢出保护。

## 2. 接口规格

```
divide(a: int, b: int) → int
```

- **输入**: `a` — 被除数, `b` — 除数
- **输出**: `a / b` — 两数之商（截断向零）

## 3. 异常边界

| # | 场景 | 输入 | 预期输出 |
|---|------|------|----------|
| 1 | 正常正数 | `divide(10, 2)` | `5` |
| 2 | 负数除负数 | `divide(10, -2)` | `-5` |
| 3 | 被除数为零 | `divide(0, 5)` | `0` |
| 4 | 除不尽截断向零 | `divide(1, 2)` | `0` |
| 5 | 除零保护 | `divide(10, 0)` | 抛 `ArithmeticException("/ by zero")` |
| 6 | 溢出保护 — MIN_VALUE / -1 | `divide(Integer.MIN_VALUE, -1)` | 抛 `ArithmeticException("overflow")` |
| 7 | 负数除负一 | `divide(-10, -1)` | `10` |

## 4. 验收标准 (AC)

- AC1: 输入正常整数对，返回正确的商
- AC2: 支持负数场景
- AC3: 被除数为零返回 0
- AC4: 除不尽时截断向零
- AC5: 除零时抛 `ArithmeticException("/ by zero")`
- AC6: MIN_VALUE / -1 溢出时抛 `ArithmeticException("overflow")`
- AC7: 函数为纯函数，无副作用
