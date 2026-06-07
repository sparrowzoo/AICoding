# greeting — 实施计划

> 模式: 精简 Superpowers Plan

## Header

- **Goal**: 实现 greet(String) → String 问候函数，含边界处理
- **Architecture**: 单工具类静态方法，存放于 `util` 包下
- **Tech Stack**: Java 17+，JUnit 5 测试

---

## Task 1: GreetFunction — 实现与测试

**Files**: `src/main/java/com/example/util/GreetFunction.java` (Create), `src/test/java/com/example/util/GreetFunctionTest.java` (Create)

### Step 1.1 — RED: 编写测试

```java
package com.example.util;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class GreetFunctionTest {

    @Test
    void shouldGreetWithName() {
        assertEquals("你好，张三", GreetFunction.greet("张三"));
    }

    @Test
    void shouldDefaultToAnonymousWhenEmpty() {
        assertEquals("你好，匿名用户", GreetFunction.greet(""));
    }

    @Test
    void shouldDefaultToAnonymousWhenNull() {
        assertEquals("你好，匿名用户", GreetFunction.greet(null));
    }

    @Test
    void shouldTruncateWhenTooLong() {
        String longInput = "a".repeat(101);
        String expectedName = "a".repeat(100);
        assertEquals("你好，" + expectedName, GreetFunction.greet(longInput));
    }

    @Test
    void shouldNotTruncateWhenExactly100() {
        String input = "a".repeat(100);
        assertEquals("你好，" + input, GreetFunction.greet(input));
    }
}
```

### Step 1.2 — BLUE: 实现

```java
package com.example.util;

import java.util.Objects;

public final class GreetFunction {

    private static final String DEFAULT_NAME = "匿名用户";
    private static final int MAX_LENGTH = 100;

    private GreetFunction() {}

    public static String greet(String name) {
        String safeName = Objects.toString(name, "");
        if (safeName.isEmpty()) {
            safeName = DEFAULT_NAME;
        }
        if (safeName.length() > MAX_LENGTH) {
            safeName = safeName.substring(0, MAX_LENGTH);
        }
        return "你好，" + safeName;
    }
}
```

### Step 1.3 — GREEN: 验证

```bash
cd /home/harry/AICoding
mvn test -pl . -Dtest=GreetFunctionTest
```

---

## Task 2: Git Commit

### Step 2.1 — 提交

```bash
git add -A && git commit -m "feat: add GreetFunction with boundary handling"
```
