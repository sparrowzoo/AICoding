# Spec: AddFunction

## Capability
整数加法运算——接收两个整数，返回它们的和。

## Requirements

### REQ-ADD-001: 基本整数加法
两个整数（含正负组合）相加，返回正确和。

**Scenario: 两个正整数相加**
- GIVEN: 输入 a=1, b=1
- WHEN: 调用 add(1, 1)
- THEN: 返回 2

**Scenario: 正负整数相加**
- GIVEN: 输入 a=5, b=-3
- WHEN: 调用 add(5, -3)
- THEN: 返回 2

**Scenario: 两个负整数相加**
- GIVEN: 输入 a=-2, b=-3
- WHEN: 调用 add(-2, -3)
- THEN: 返回 -5

### REQ-ADD-002: 大整数加法
两个大整数相加，返回正确和。

**Scenario: 两个大正整数相加**
- GIVEN: 输入 a=1000000, b=2000000
- WHEN: 调用 add(1000000, 2000000)
- THEN: 返回 3000000

### REQ-ADD-003: 零值处理
加零不改变值。

**Scenario: 加零**
- GIVEN: 输入 a=5, b=0
- WHEN: 调用 add(5, 0)
- THEN: 返回 5

**Scenario: 零加零**
- GIVEN: 输入 a=0, b=0
- WHEN: 调用 add(0, 0)
- THEN: 返回 0

### REQ-ADD-004: 溢出保护
当结果超出 Integer.MAX_VALUE 或低于 Integer.MIN_VALUE 时抛出 ArithmeticException。

**Scenario: 正整数溢出**
- GIVEN: 输入 a=Integer.MAX_VALUE, b=1
- WHEN: 调用 add(Integer.MAX_VALUE, 1)
- THEN: 抛出 ArithmeticException

**Scenario: 负整数溢出**
- GIVEN: 输入 a=Integer.MIN_VALUE, b=-1
- WHEN: 调用 add(Integer.MIN_VALUE, -1)
- THEN: 抛出 ArithmeticException

### REQ-ADD-005: null 输入保护
任一参数为 null 时抛出 IllegalArgumentException。

**Scenario: 第一个参数为 null**
- GIVEN: 输入 a=null, b=5
- WHEN: 调用 add(null, 5)
- THEN: 抛出 IllegalArgumentException

**Scenario: 第二个参数为 null**
- GIVEN: 输入 a=5, b=null
- WHEN: 调用 add(5, null)
- THEN: 抛出 IllegalArgumentException

## Module Structure
```
src/
├── main/java/com/example/math/
│   └── AddFunction.java          # 加法核心实现（纯静态工具类）
└── test/java/com/example/math/
    └── AddFunctionTest.java      # TDD 测试用例
```

## API Contract
```java
public class AddFunction {
    /**
     * @param a 第一个加数，不可为 null
     * @param b 第二个加数，不可为 null
     * @return 两数之和
     * @throws IllegalArgumentException 参数为 null (错误码: NULL_INPUT)
     * @throws ArithmeticException 结果溢出 (错误码: OVERFLOW)
     */
    public static int add(Integer a, Integer b);
}
```

## Error Codes
| 错误码 | 含义 |
|--------|------|
| NULL_INPUT | 输入参数为 null |
| OVERFLOW | 结果溢出 int 范围 |

## Validation Rules
| 规则 | 条件 | 行为 |
|------|------|------|
| null 检查 | a == null 或 b == null | throw IllegalArgumentException(NULL_INPUT) |
| 溢出检查 | 结果 > Integer.MAX_VALUE 或 < Integer.MIN_VALUE | throw ArithmeticException(OVERFLOW) |
