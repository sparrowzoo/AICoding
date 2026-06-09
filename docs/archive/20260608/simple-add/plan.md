# simple-add — 实施计划

> 模式: 精简 Superpowers Plan

## Header

- **Goal**: 实现 `add(int, int)` → `int` 安全加法函数，含正/负溢出保护
- **Architecture**: 单工具类静态方法，存放于 `util` 包下
- **Tech Stack**: Java 17+, JUnit 5 测试

---

## Task 1: AddFunction — 实现与测试

**Files**: `src/main/java/com/example/util/AddFunction.java` (Create), `src/test/java/com/example/util/AddFunctionTest.java` (Create)

### Step 1.1 — RED: 编写测试

```java
package com.example.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AddFunctionTest {

    @Test
    void shouldReturn5WhenAdd2And3() {
        assertEquals(5, AddFunction.add(2, 3));
    }

    @Test
    void shouldReturn1WhenAddMinus2And3() {
        assertEquals(1, AddFunction.add(-2, 3));
    }

    @Test
    void shouldReturn2WhenAdd5AndMinus3() {
        assertEquals(2, AddFunction.add(5, -3));
    }

    @Test
    void shouldReturnMinus8WhenAddMinus5AndMinus3() {
        assertEquals(-8, AddFunction.add(-5, -3));
    }

    @Test
    void shouldReturn5WhenAdd0And5() {
        assertEquals(5, AddFunction.add(0, 5));
    }

    @Test
    void shouldReturnMinus3WhenAddMinus3And0() {
        assertEquals(-3, AddFunction.add(-3, 0));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenPositiveOverflow() {
        assertThrows(ArithmeticException.class, () -> AddFunction.add(Integer.MAX_VALUE, 1));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenNegativeOverflow() {
        assertThrows(ArithmeticException.class, () -> AddFunction.add(Integer.MIN_VALUE, -1));
    }

    @Test
    void shouldReturn0WhenAdd0And0() {
        assertEquals(0, AddFunction.add(0, 0));
    }
}
```

### Step 1.2 — BLUE: 实现

```java
package com.example.util;

/**
 * Utility class providing a safe integer addition function with positive
 * and negative overflow protection.
 *
 * <p>This class is not intended to be instantiated.
 */
public final class AddFunction {

    private AddFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the sum of {@code a} and {@code b}.
     *
     * <p>Overflow detection uses sign analysis: if both operands are positive
     * and the sum is negative, positive overflow occurred; if both are negative
     * and the sum is non-negative, negative overflow occurred.
     *
     * @param a first addend
     * @param b second addend
     * @return {@code a + b}
     * @throws ArithmeticException if the result overflows an {@code int}
     *         (i.e. {@code Integer.MAX_VALUE + 1} or {@code Integer.MIN_VALUE + (-1)})
     */
    public static int add(int a, int b) {
        int sum = a + b;
        // Positive overflow: a > 0, b > 0, but sum wrapped to negative
        if (a > 0 && b > 0 && sum < 0) {
            throw new ArithmeticException("overflow");
        }
        // Negative overflow: a < 0, b < 0, but sum wrapped to non-negative
        if (a < 0 && b < 0 && sum >= 0) {
            throw new ArithmeticException("overflow");
        }
        return sum;
    }
}
```

### Step 1.3 — GREEN: 验证

```bash
cd /home/harry/AICoding
mvn test -pl . -Dtest=AddFunctionTest
```

预期输出: `Tests run: 9, Failures: 0, Errors: 0`

---

## Task 2: Git 提交

### Step 2.1 — 追加审计记录并提交

```bash
cd /home/harry/AICoding
cat >> docs/simple-add/audit-trail.md << 'AUDIT'
## 2026-06-08 — AddFunction 实现

- **TDD 轮次**: 9 个场景全部通过
- **Scenarios**: 正常正数 / 负数加正数 / 正数加负数 / 负数加负数 / 零加正数 / 负数加零 / 正溢出 / 负溢出 / 零加零
- **覆盖度**: 全部 9 个场景 + 纯函数约束
AUDIT
git add -A && git commit -m "feat: add AddFunction with TDD - all 9 scenarios pass"
```
