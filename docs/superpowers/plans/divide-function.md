# divide-function — 实施计划

> 模式: 精简 Superpowers Plan

## Header

- **Goal**: 实现 `divide(int, int)` → `int` 安全除法函数，含除零保护和溢出保护
- **Architecture**: 单工具类静态方法，存放于 `util` 包下
- **Tech Stack**: Java 17+, JUnit 5 测试

> **注意**: 本功能已有 `DivideFunction.java` 和 `DivideFunctionTest.java` 存在但未提交，此计划基于 TDD 重新验证驱动。

---

## Task 1: DivideFunction — 实现与测试

**Files**: `src/main/java/com/example/util/DivideFunction.java` (Create/Update), `src/test/java/com/example/util/DivideFunctionTest.java` (Create/Update)

### Step 1.1 — RED: 编写测试

```java
package com.example.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DivideFunctionTest {

    @Test
    void shouldReturn5WhenDivide10By2() {
        assertEquals(5, DivideFunction.divide(10, 2));
    }

    @Test
    void shouldReturnMinus5WhenDivide10ByMinus2() {
        assertEquals(-5, DivideFunction.divide(10, -2));
    }

    @Test
    void shouldReturn0WhenDivide0By5() {
        assertEquals(0, DivideFunction.divide(0, 5));
    }

    @Test
    void shouldReturn0WhenDivide1By2() {
        assertEquals(0, DivideFunction.divide(1, 2));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenDivideByZero() {
        assertThrows(ArithmeticException.class, () -> DivideFunction.divide(10, 0));
    }

    @Test
    void shouldThrowArithmeticExceptionWhenMinValueDivideByMinus1() {
        assertThrows(ArithmeticException.class, () -> DivideFunction.divide(Integer.MIN_VALUE, -1));
    }

    @Test
    void shouldReturn10WhenMinus10DivideByMinus1() {
        assertEquals(10, DivideFunction.divide(-10, -1));
    }
}
```

### Step 1.2 — BLUE: 实现

```java
package com.example.util;

/**
 * Utility class providing a safe integer division function with zero-division
 * and overflow protection.
 *
 * <p>This class is not intended to be instantiated.
 */
public final class DivideFunction {

    private DivideFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the quotient of {@code a} divided by {@code b}.
     *
     * <p>The result is truncated toward zero. For example, {@code divide(1, 2)}
     * returns {@code 0} rather than {@code 0.5}.
     *
     * @param a dividend
     * @param b divisor
     * @return {@code a / b} (integer division, truncates toward zero)
     * @throws ArithmeticException if {@code b == 0} or overflow
     *         ({@code Integer.MIN_VALUE / -1})
     */
    public static int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("/ by zero");
        }
        if (a == Integer.MIN_VALUE && b == -1) {
            throw new ArithmeticException("overflow");
        }
        return a / b;
    }
}
```

### Step 1.3 — GREEN: 验证

```bash
cd /home/harry/AICoding
mvn test -pl . -Dtest=DivideFunctionTest
```

预期输出: `Tests run: 7, Failures: 0, Errors: 0`

---

## Task 2: Git 提交

### Step 2.1 — 提交代码

```bash
cd /home/harry/AICoding
git add -A && git commit -m "feat: add DivideFunction with TDD - all 7 scenarios pass"
```
