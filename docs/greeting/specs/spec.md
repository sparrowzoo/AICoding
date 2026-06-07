# greeting — 规格说明书

> 模式: OpenSpec Delta (单文件) | Capability: GreetFunction

## ADDED Requirements

### Requirement: Greet — 问候功能

提供问候函数 `greet(name: String): String`，返回中文问候语。

#### Scenario: 正常输入 — 返回 "你好，{name}"

```
Given 调用 greet("张三")
Then  返回值 MUST equal "你好，张三"
```

#### Scenario: 空字符串输入 — 返回 "你好，匿名用户"

```
Given 调用 greet("")
Then  返回值 MUST equal "你好，匿名用户"
```

#### Scenario: null 输入 — 返回 "你好，匿名用户"

```
Given 调用 greet(null)
Then  返回值 MUST equal "你好，匿名用户"
```

#### Scenario: 超长输入 — 截断至 100 字符

```
Given 调用 greet("a".repeat(101))
Then  返回值 MUST equal "你好，{100个a}"
```

#### Scenario: 刚好 100 字符 — 不截断

```
Given 调用 greet("a".repeat(100))
Then  返回值 MUST equal "你好，{100个a}"
```

#### Scenario: 纯函数 — 无副作用

```
Given 调用 greet(name) 多次
Then  对相同输入 MUST 返回相同输出
```
