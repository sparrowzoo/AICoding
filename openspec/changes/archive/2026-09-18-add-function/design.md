# Design: add-function

## Context

用户需求「用 Java 实现 1+1=2」。本质是一个整数加法方法。项目为 Spring Boot 3.2.5 / Java 17，但本功能是纯函数，不依赖 Spring 容器。

## Decisions

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 返回类型 | int / long / BigDecimal | int | 需求明确是整数加法，int 简单直接 |
| 方法签名 | add(int a, int b) | 采用 | 两个操作数，符合需求 |
| 溢出处理 | 抛异常 / 静默回绕 | 静默回绕（Java 原生语义） | 保持简单，用测试记录边界行为 |
| 有无状态 | 静态方法 / 实例方法 | 实例方法 | 便于测试，遵循既有模式 |

## Data Model

无状态。纯函数，不涉及持久化。

## API Contracts

```java
package com.example.math;

public class AddFunction {
    /** 两个整数相加，溢出时按 Java int 语义回绕 */
    public int add(int a, int b) {
        return a + b;
    }
}
```

## Flows

1. 调用 `add(a, b)`
2. 返回 `a + b`

## Risks

| 风险 | 缓解 |
|------|------|
| int 溢出回绕（MAX_VALUE+1 → MIN_VALUE） | 测试 `overflow_wrapsAround` 明确记录该行为 |
