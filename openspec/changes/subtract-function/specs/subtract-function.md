## ADDED Requirements

### Requirement: Subtract — 减法功能

提供安全减法函数 `subtract(a: int, b: int): int`，返回两整数之差，含溢出保护。

#### Scenario: 正常正数相减

```
Given 调用 subtract(10, 3)
Then  返回值 MUST equal 7
```

#### Scenario: 负数减负数

```
Given 调用 subtract(-5, -3)
Then  返回值 MUST equal -2
```

#### Scenario: 减零

```
Given 调用 subtract(7, 0)
Then  返回值 MUST equal 7
```

#### Scenario: 结果为零

```
Given 调用 subtract(5, 5)
Then  返回值 MUST equal 0
```

#### Scenario: 正数减负数（结果扩幅）

```
Given 调用 subtract(5, -3)
Then  返回值 MUST equal 8
```

#### Scenario: 负数减正数（结果扩幅）

```
Given 调用 subtract(-3, 5)
Then  返回值 MUST equal -8
```

#### Scenario: 溢出 — MAX_VALUE 减 -1

```
Given 调用 subtract(Integer.MAX_VALUE, -1)
Then  返回值 MUST throw ArithmeticException("overflow")
```

#### Scenario: 溢出 — MIN_VALUE 减 1

```
Given 调用 subtract(Integer.MIN_VALUE, 1)
Then  返回值 MUST throw ArithmeticException("overflow")
```

#### Scenario: 零减 MIN_VALUE（不溢出）

```
Given 调用 subtract(0, Integer.MIN_VALUE)
Then  返回值 MUST equal Integer.MIN_VALUE
```

### Requirement: 纯函数约束

`subtract` 函数 SHALL 为纯函数，无副作用。

#### Scenario: 纯函数 — 无副作用

```
Given 调用 subtract(a, b) 多次
Then  对相同输入 MUST 返回相同输出
```
