## Why

在 `com.example.util` 工具包中缺少减法运算能力。当前已有 AddFunction、DivideFunction，需要补充 SubtractFunction 以完善基础算术工具集，提供安全的整数减法运算（含溢出保护）。

## What Changes

- 新增 `SubtractFunction` 工具类，提供 `subtract(int a, int b)` 静态方法
- 新增 `SubtractFunctionTest` 测试类，覆盖正常值、负数、零、溢出边界和纯函数约束

## Capabilities

### New Capabilities
- `subtract-function`: 提供安全整数减法函数 `subtract(int a, int b) -> int`，包含溢出保护、零值处理和纯函数约束

### Modified Capabilities

（无）

## Impact

- 新增文件: `src/main/java/com/example/util/SubtractFunction.java`
- 新增文件: `src/test/java/com/example/util/SubtractFunctionTest.java`
- 无外部依赖变更，无 API 兼容性影响
