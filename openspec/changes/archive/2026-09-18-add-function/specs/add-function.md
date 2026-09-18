# Capability: add-function

整数加法能力。

## Requirements

### Requirement: 两个整数相加

`add(int a, int b)` 返回两整数之和。

#### Scenario: 1+1=2（核心）

- Given 两个操作数 1 和 1
- When 调用 `add(1, 1)`
- Then 返回 2

#### Scenario: 0 是加法单位元

- When 调用 `add(x, 0)` 或 `add(0, x)`
- Then 返回 x

#### Scenario: 相反数相加为 0

- When 调用 `add(5, -5)`
- Then 返回 0

#### Scenario: 满足交换律

- When 调用 `add(a, b)` 与 `add(b, a)`
- Then 两者相等

#### Scenario: 溢出回绕

- When 调用 `add(Integer.MAX_VALUE, 1)`
- Then 返回 `Integer.MIN_VALUE`（Java int 溢出语义）
