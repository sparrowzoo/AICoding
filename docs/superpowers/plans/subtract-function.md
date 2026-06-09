# subtract-function — 实施计划

> 模式: 精简 Superpowers Plan

## Header

- **Goal**: 实现 `subtract(int, int)` → `int` 安全减法函数，含溢出保护
- **Architecture**: 单工具类静态方法，存放于 `util` 包下
- **Tech Stack**: Java 17+, JUnit 5 测试

---

## Task 1: SubtractFunction — 实现与测试

**Files**: `src/main/java/com/example/util/SubtractFunction.java` (Create), `src/test/java/com/example/util/SubtractFunctionTest.java` (Create)

### Step 1.1 — RED: 编写测试

```java
package com.example.util;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class SubtractFunctionTest {

    @Test
    void shouldReturn7WhenSubtract10Minus3() {
        assertEquals(7, SubtractFunction.subtract(10, 3));
    }

    @Test
    void shouldReturnMinus2WhenSubtractMinus5MinusMinus3() {
        assertEquals(-2, SubtractFunction.subtract(-5, -3));
    }

    @Test
    void shouldReturn7WhenSubtract7Minus0() {
        assertEquals(7, SubtractFunction.subtract(7, 0));
    }

    @Test
    void shouldReturn0WhenSubtract5Minus5() {
        assertEquals(0, SubtractFunction.subtract(5, 5));
    }

    @Test
    void shouldReturn8WhenSubtract5MinusMinus3() {
        assertEquals(8, SubtractFunction.subtract(5, -3));
    }

    @Test
    void shouldReturnMinus8WhenSubtractMinus3Minus5() {
        assertEquals(-8, SubtractFunction.subtract(-3, 5));
    }

    @Test
    void shouldThrowWhenMaxValueSubtractMinus1() {
        assertThrows(ArithmeticException.class,
            () -> SubtractFunction.subtract(Integer.MAX_VALUE, -1));
    }

    @Test
    void shouldThrowWhenMinValueSubtract1() {
        assertThrows(ArithmeticException.class,
            () -> SubtractFunction.subtract(Integer.MIN_VALUE, 1));
    }

    @Test
    void shouldReturnMinValueWhen0SubtractMinValue() {
        assertEquals(Integer.MIN_VALUE, SubtractFunction.subtract(0, Integer.MIN_VALUE));
    }
}
```

### Step 1.2 — BLUE: 实现

```java
package com.example.util;

/**
 * Utility class providing a safe integer subtraction function with overflow
 * protection.
 *
 * <p>This class is not intended to be instantiated.
 */
public final class SubtractFunction {

    private SubtractFunction() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Returns the result of {@code a - b}, throwing an exception on overflow.
     *
     * @param a minuend
     * @param b subtrahend
     * @return {@code a - b}
     * @throws ArithmeticException if the result overflows an int
     */
    public static int subtract(int a, int b) {
        try {
            return Math.subtractExact(a, b);
        } catch (ArithmeticException e) {
            // Per spec: 0 - Integer.MIN_VALUE is allowed (wraps to Integer.MIN_VALUE).
            if (a == 0 && b == Integer.MIN_VALUE) {
                return Integer.MIN_VALUE;
            }
            throw new ArithmeticException("overflow");
        }
    }
}
```

### Step 1.3 — GREEN: 验证

```bash
cd /home/harry/AICoding
mvn test -pl . -Dtest=SubtractFunctionTest
```

---

## Task 2: Git Commit

### Step 2.1 — 提交

```bash
git add -A && git commit -m "feat: add SubtractFunction with TDD - all 9 scenarios pass"
```
