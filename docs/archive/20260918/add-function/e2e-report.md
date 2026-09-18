# E2E 验收报告: add-function

## 业务规则清单与追溯矩阵

| 规则 ID | 业务规则 | 实现位置 | 测试覆盖 | 验收 |
|---------|----------|----------|----------|:--:|
| R-001 | 两整数相加返回和（1+1=2） | `AddFunction.java:5-6` | 正常 5 / 边界 1 | ✅ |
| R-002 | 0 是加法单位元 | `AddFunction.java:6` | 边界 1 / 正常 1 | ✅ |
| R-003 | 相反数相加为 0 | `AddFunction.java:6` | 正常 1 | ✅ |
| R-004 | 满足交换律 | `AddFunction.java:6` | 正常 1 | ✅ |
| R-005 | 溢出按 Java int 语义回绕 | `AddFunction.java:6` | 异常 1 | ✅ |

## 逐规则验收

### R-001 两整数相加返回和

- **规则依据**：需求「1+1=2」
- **实现分析**：`src/main/java/com/example/math/AddFunction.java:5-6` — `add(int a, int b)` 返回 `a + b`
- **行为推断**：`add(1,1)` → 2；`add(3,4)` → 7；`add(-2,-3)` → -5
- **差异判定**：✅ 通过（`AddFunctionTest.java` 的 `onePlusOne_equalsTwo`、`positivePlusPositive`、`positivePlusNegative`、`negativePlusNegative`、`largeValues` 5 个场景覆盖）

### R-002 0 是加法单位元

- **实现分析**：`a + 0 == a` 与 `0 + a == a`（Java 加法恒等）
- **差异判定**：✅ 通过（`zeroPlusZero_equalsZero`、`zeroIsIdentity`）

### R-003 相反数相加为 0

- **实现分析**：`5 + (-5) == 0`
- **差异判定**：✅ 通过（`oppositeNumbers_sumToZero`）

### R-004 交换律

- **实现分析**：`a + b == b + a`
- **差异判定**：✅ 通过（`commutative`）

### R-005 溢出回绕

- **规则依据**：Java int 溢出语义（MAX_VALUE + 1 → MIN_VALUE）
- **实现分析**：`return a + b` 直接按 int 运算，溢出静默回绕
- **差异判定**：✅ 通过（`overflow_wrapsAround`，明确记录该边界行为）

## 测试证据

```
mvn test
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## 结论

全部 5 条业务规则通过，正常 / 边界 / 异常（溢出）三类场景均覆盖，无差异项。
