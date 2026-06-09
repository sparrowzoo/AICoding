# subtract-function — 需求提案

> 状态: 已补齐 | 特征: 小需求

## 1. 功能概述

一个安全减法函数，接收两个整数，返回它们的差。需处理整数溢出保护。

## 2. 接口规格

```
subtract(a: int, b: int) → int
```

- **输入**: `a` — 被减数, `b` — 减数
- **输出**: `a - b` — 两数之差

## 3. 异常边界

| # | 场景 | 输入 | 预期输出 |
|---|------|------|----------|
| 1 | 正常正数 | `subtract(10, 3)` | `7` |
| 2 | 负数减负数 | `subtract(-5, -3)` | `-2` |
| 3 | 减零 | `subtract(7, 0)` | `7` |
| 4 | 结果为零 | `subtract(5, 5)` | `0` |
| 5 | 正数减负数（结果扩幅） | `subtract(5, -3)` | `8` |
| 6 | 负数减正数（结果扩幅） | `subtract(-3, 5)` | `-8` |
| 7 | 溢出 — MAX_VALUE - (-1) | `subtract(Integer.MAX_VALUE, -1)` | 抛 `ArithmeticException("overflow")` |
| 8 | 溢出 — MIN_VALUE - 1 | `subtract(Integer.MIN_VALUE, 1)` | 抛 `ArithmeticException("overflow")` |
| 9 | 零减MIN_VALUE | `subtract(0, Integer.MIN_VALUE)` | `Integer.MIN_VALUE` (不溢出) |

## 4. 验收标准 (AC)

- AC1: 输入正常整数对，返回正确的差
- AC2: 支持负数场景
- AC3: 减零返回原值
- AC4: 结果为零返回 0
- AC5: 正数-负数 / 负数-正数 跨边界场景正确
- AC6: 溢出时抛 `ArithmeticException("overflow")`
- AC7: 函数为纯函数，无副作用
