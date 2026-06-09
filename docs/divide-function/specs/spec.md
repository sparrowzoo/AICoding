# divide-function — 规格说明书

> 模式: OpenSpec Delta (单文件) | Capability: DivideFunction

## ADDED Requirements

### Requirement: Divide — 除法功能

提供安全除法函数 `divide(a: int, b: int): int`，返回两整数之商，含除零保护和溢出保护。

#### Scenario: 正常正数相除

```
Given 调用 divide(10, 2)
Then  返回值 MUST equal 5
```

#### Scenario: 负数除负数 — 结果为负数

```
Given 调用 divide(10, -2)
Then  返回值 MUST equal -5
```

#### Scenario: 被除数为零 — 结果为零

```
Given 调用 divide(0, 5)
Then  返回值 MUST equal 0
```

#### Scenario: 除不尽截断向零

```
Given 调用 divide(1, 2)
Then  返回值 MUST equal 0
```

#### Scenario: 除零保护 — 抛出异常

```
Given 调用 divide(10, 0)
Then  返回值 MUST throw ArithmeticException("/ by zero")
```

#### Scenario: 溢出保护 — MIN_VALUE / -1

```
Given 调用 divide(Integer.MIN_VALUE, -1)
Then  返回值 MUST throw ArithmeticException("overflow")
```

#### Scenario: 负数除负一 — 正常结果

```
Given 调用 divide(-10, -1)
Then  返回值 MUST equal 10
```

#### Scenario: 纯函数 — 无副作用

```
Given 调用 divide(a, b) 多次
Then  对相同输入 MUST 返回相同输出
```
