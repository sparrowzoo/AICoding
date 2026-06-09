# simple-add — 规格说明书 — AddFunction

> 模式: OpenSpec Delta (单文件) | Capability: AddFunction

## ADDED Requirements

### Requirement: Add — 加法功能

提供安全加法函数 `add(a: int, b: int): int`，返回两整数之和，含正/负溢出保护。

#### Scenario: 正常正数相加

```
Given 调用 add(2, 3)
Then  返回值 MUST equal 5
```

#### Scenario: 负数加正数

```
Given 调用 add(-2, 3)
Then  返回值 MUST equal 1
```

#### Scenario: 正数加负数

```
Given 调用 add(5, -3)
Then  返回值 MUST equal 2
```

#### Scenario: 负数加负数

```
Given 调用 add(-5, -3)
Then  返回值 MUST equal -8
```

#### Scenario: 零加正数

```
Given 调用 add(0, 5)
Then  返回值 MUST equal 5
```

#### Scenario: 负数加零

```
Given 调用 add(-3, 0)
Then  返回值 MUST equal -3
```

#### Scenario: 大数正溢出保护

```
Given 调用 add(Integer.MAX_VALUE, 1)
Then  返回值 MUST throw ArithmeticException("overflow")
```

#### Scenario: 大数负溢出保护

```
Given 调用 add(Integer.MIN_VALUE, -1)
Then  返回值 MUST throw ArithmeticException("overflow")
```

#### Scenario: 零加零

```
Given 调用 add(0, 0)
Then  返回值 MUST equal 0
```

### Requirement: 纯函数约束

`add` 函数 SHALL 为纯函数，无副作用。

#### Scenario: 纯函数 — 无副作用

```
Given 调用 add(a, b) 多次
Then  对相同输入 MUST 返回相同输出
```
