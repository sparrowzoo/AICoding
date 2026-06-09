# Plan: AddFunction

## Overview
TDD 实现 AddFunction——整数加法运算，包含 null 保护和溢出检测。

## Tasks

### Task 1: 创建项目结构 + 测试类
**Files**: `src/main/java/com/example/math/`, `src/test/java/com/example/math/`, `src/test/java/com/example/math/AddFunctionTest.java`

**目标**: 创建 Maven 包目录，编写 9 个测试用例（TDD RED）。

**Step 1.1**: 创建目录
```bash
mkdir -p src/main/java/com/example/math
mkdir -p src/test/java/com/example/math
```

**Step 1.2**: 创建测试文件 `src/test/java/com/example/math/AddFunctionTest.java`
```java
package com.example.math;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AddFunctionTest {

    @Test
    void testAddTwoPositiveIntegers() {
        assertEquals(2, AddFunction.add(1, 1));
    }

    @Test
    void testAddPositiveAndNegative() {
        assertEquals(2, AddFunction.add(5, -3));
    }

    @Test
    void testAddTwoNegativeIntegers() {
        assertEquals(-5, AddFunction.add(-2, -3));
    }

    @Test
    void testAddLargeIntegers() {
        assertEquals(3000000, AddFunction.add(1000000, 2000000));
    }

    @Test
    void testAddWithZero() {
        assertEquals(5, AddFunction.add(5, 0));
    }

    @Test
    void testAddZeroAndZero() {
        assertEquals(0, AddFunction.add(0, 0));
    }

    @Test
    void testPositiveOverflow() {
        assertThrows(ArithmeticException.class,
            () -> AddFunction.add(Integer.MAX_VALUE, 1));
    }

    @Test
    void testNegativeOverflow() {
        assertThrows(ArithmeticException.class,
            () -> AddFunction.add(Integer.MIN_VALUE, -1));
    }

    @Test
    void testFirstParamNull() {
        assertThrows(IllegalArgumentException.class,
            () -> AddFunction.add(null, 5));
    }

    @Test
    void testSecondParamNull() {
        assertThrows(IllegalArgumentException.class,
            () -> AddFunction.add(5, null));
    }
}
```

**验证**: `mvn test -Dtest=AddFunctionTest` → 10/10 编译失败（AddFunction 类不存在）

---

### Task 2: 实现 AddFunction（TDD GREEN）
**File**: `src/main/java/com/example/math/AddFunction.java`

**目标**: 实现加法逻辑，使所有 10 个测试通过。

```java
package com.example.math;

public class AddFunction {

    public static int add(Integer a, Integer b) {
        if (a == null || b == null) {
            throw new IllegalArgumentException("Arguments must not be null");
        }
        return Math.addExact(a, b);
    }
}
```

**验证**: `mvn test -Dtest=AddFunctionTest` → 10/10 通过

---

### Task 3: 代码审查
**Files**: `src/main/java/com/example/math/AddFunction.java`, `src/test/java/com/example/math/AddFunctionTest.java`

**目标**: 检查代码质量，确认无冗余无安全风险。

**Step 3.1**: 运行完整测试套件确认通过
```bash
mvn test
```

**Step 3.2**: 检查代码静态质量
- 确认 null 检查覆盖所有参数
- 确认使用 Math.addExact 防止溢出
- 确认测试覆盖正常/边界/异常三类场景
- 确认无未使用的 import、无冗余代码

```bash
mvn compile -q && echo "Compilation OK"
```

---

## Task Dependency
```
Task 1 → Task 2 → Task 3
```

## File Manifest
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/main/java/com/example/math/AddFunction.java` | CREATE | 加法实现 |
| `src/test/java/com/example/math/AddFunctionTest.java` | CREATE | 10 个测试用例 |
