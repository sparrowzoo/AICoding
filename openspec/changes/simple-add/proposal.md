# simple-add — 需求提案

> 状态: 已补齐 | 特征: 小需求

## 1. 功能概述

一个安全的整数加法函数，接收两个整数，返回它们的和。支持正负数混合运算，需处理整数溢出保护。

## 2. 接口规格

```
add(a: int, b: int) → int
```

- **输入**: `a` — 加数, `b` — 加数
- **输出**: `a + b` — 两数之和

## 3. 异常边界

| # | 场景 | 输入 | 预期输出 |
|---|------|------|----------|
| 1 | 正常正数 | `add(2, 3)` | `5` |
| 2 | 负数加正数 | `add(-2, 3)` | `1` |
| 3 | 正数加负数 | `add(5, -3)` | `2` |
| 4 | 负数加负数 | `add(-5, -3)` | `-8` |
| 5 | 零加正数 | `add(0, 5)` | `5` |
| 6 | 负数加零 | `add(-3, 0)` | `-3` |
| 7 | 大数正溢出 | `add(Integer.MAX_VALUE, 1)` | 抛 `ArithmeticException("overflow")` |
| 8 | 大数负溢出 | `add(Integer.MIN_VALUE, -1)` | 抛 `ArithmeticException("overflow")` |
| 9 | 零加零 | `add(0, 0)` | `0` |

## 4. 验收标准 (AC)

- AC1: 输入正常整数对，返回正确的和
- AC2: 支持正负数混合运算
- AC3: 零加任何数返回该数本身
- AC4: 正溢出时抛 `ArithmeticException("overflow")`
- AC5: 负溢出时抛 `ArithmeticException("overflow")`
- AC6: 函数为纯函数，无副作用
