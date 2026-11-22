# Java 对象变量命名规范

<a id="java-object-naming"></a>
## 强制按声明的接口或类名命名单个对象

适用于 Java 技术设计、TRD 接口定义和代码示例、源码生成、正式代码、测试、重构与审查。TRD 和 coder 必须执行，不能等到编码完成后再处理，也不能将本规则当作可选风格建议。

- **单个对象的变量名以声明的接口或类名为依据，保留完整职责，使用小驼峰命名。** 声明为接口时按接口名命名，不按实现类、存放的数据或操作的数据命名。成员字段、构造参数、方法参数和局部对象变量均适用。
- **缩写也按小驼峰词形处理。** `ContractDAO` 对应 `contractDao`，`ProjectDTO` 对应 `projectDto`；不是只将类型名首字母小写后保留 `contractDAO`。`DatabaseSessionRepository` 对应 `databaseSessionRepository`，`LongTermMemoryService` 对应 `longTermMemoryService`。
- **禁止把单个依赖对象命名成像集合的复数数据名或省略职责的泛称。** 例如 `ContractDAO contracts`、`ContractDAO contract`、`ContractDAO dao`、`ContractService service` 均不符合；应写为 `ContractDAO contractDao`、`ContractService contractService`。`contracts` 仅适合真实的合同集合等与名称含义一致的数据。
- 同一作用域确有多个同类型对象时，在完整类型对应的变量名之前增加明确用途，例如 `primaryContractDao`、`archiveContractDao`；不缩写掉接口职责。真实集合及业务数据字段按其内容命名，不将集合机械改名为 `list`，也不因本规则擅自改变 JSON、数据库或其他已确认的对外字段。
- 重命名时同步构造参数、赋值、调用点、测试和按名称注入的引用，核对依赖注入行为保持一致；不只修改字段声明而漏掉使用处。
- **TRD 和 coder 交付前必须检查本次范围内的上述声明与引用。** TRD 检查接口定义、依赖字段、示例和设计源码；coder 检查正式代码、测试及相关调用方。不符合项在已授权范围内修正，未解决的项明确报告为不符合，不得声称规范检查通过。仅规则或文档变更检查内容与链接；源码变更执行必要编译和受影响验证，不把未执行的检查写成通过。

正确示例（字段声明片段，类型按项目实际包通过 import 引用）：

```java
private final ContractDAO contractDao;
```

禁止写成 `private final ContractDAO contracts;`。
