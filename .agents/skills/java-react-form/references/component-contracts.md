# 组件核对说明

本文件帮助定位和核对组件，不是冻结的参数定义。生成前，以目标项目当前源码为准；不要复制另一模块的组件接口假定它们相同。

## 查找顺序

1. 用户指定的 Java 类、父类、`InputDatasource` 及其 `DatasourceType`。
2. 目标前端模块的 `common/components/forms/validatable-*` 及 `validable-two-switch.tsx`。
3. 同模块真实表单调用、校验定义、TypeScript 模型、字典／树协议与数据供应方。
4. 用户已确认的字段映射、组件范围和例外。

可用 `rg --files` 定位文件，再用 `rg` 查导出及调用。不要因项目示例路径失效就创建另一份公共组件。

## everythingstore 中已观察到的实现

以下为编写 skill 时的观察，未来生成必须重新核实。路径均相对于业务仓库，不绑定本机目录。

| 定位入口 | 需要核对的事项 |
| --- | --- |
| `lingcheuk-protocol-dao/src/main/java/com/lingcheuk/protocol/dao/InputDatasource.java` | `type` 必填，`params` 默认空串，`tree` 默认 false，`defaultValue` 默认 `"-1"` |
| 同包 `enums/DatasourceType.java` | 已有 `NULL / DICTIONARY / TABLE / ENUM / UPLOAD / TWO_SWITCH`，其中 `TWO_SWITCH(7)` 不包含在 `isList` 中；不能只靠 `isList` 识别双选 |
| `lingcheuk-www/front/www/src/common/components/forms/` | `validatable-*` 及 `validable-two-switch.tsx`，逐个读取实际导出、props 及内部状态 |
| `lingcheuk-www/front/www/src/common/lib/protocol/TreeItem.ts` | 扁平节点的 id、parentId、名称及 code；明确选中值是哪个字段 |
| `lingcheuk-admin/front/src/components/micro-service/add.tsx`、`edit.tsx` | 可参考布局和表单绑定；其中直接调用保存 API 的做法不适用于本 skill 的 `onSubmit` 边界 |
| `lingcheuk-admin/front/src/schema/micro-service.ts` | 现有校验和类型转换示例，仅复用目标字段适用的规则 |

## 必须核实的能力差距

- `validatable-select`：已观察版本只支持单选，接收 `dictionary`、字符串 `defaultValue` 和 `setValue`；没有多选接口。没有字典选项时会退回文本框，要核查字典加载中、空结果和加载失败是否会产生错误输入。
- `validatable-tree`：已观察版本为 `value: readonly number[]`、`onChange(number[])`，只支持多选；`selectionMode` 的 `cascade / independent` 表示父子联动／节点独立，不表示单多选。单个 `Long` 树字段需要单选能力；`String[]` 树字段必须核实字符串代表数字 ID 还是业务 code。
- `validatable-image`：已观察版本是单张图片 URL 字符串，`pathType` 用于上传分类；初值写入内部状态。多张图片或以资源 ID 提交的字段不能直接套用。
- `validatable-date`：已观察版本默认格式为 `YYYY-MM-DD`，空初始值会变成今天；声明了 `readonly` 但未执行，且没有完整错误信息展示。可空日期、只读日期或需要时间的字段必须先解决行为差异。
- `validatable-input`、`validatable-textarea`：核查 `register`、`readonly`、`errorMessage`、`isSubmitted`、`pageTranslate` 与当前表单库的配合。
- 部分组件仅使用非受控初值，或在挂载／选项变化时调用 `setValue`；`reset` 是否能同时更新可见内容必须实际核对，不能只检查表单内部数据。

当前版本若已经补齐能力，直接按真实接口使用；若仍不足，按主 skill 的“公共组件能力不足”处理，不将这份观察当作永久限制。

## 双选与布尔开关

以下接口已按 WWW 当前源码核对；生成时仍需读取目标模块版本。双选文件实际拼写是 `validable-two-switch.tsx`，导出名为 `ValidatableTwoSwitch`，不要自行重命名或另建同名组件。

### TWO_SWITCH 双选

- `TwoSwitchOptions<T>` 为 `readonly [Option<T>, Option<T>]`，每项 `{key: T, value: string}`，`T extends string | number`；`value` 是显示文字，`key` 才是提交值。两项 key 必须不同，数字 `1` 与字符串 `"1"` 不可随意转换。布尔类型走普通开关，不用双选制造布尔编码。
- props 为 `fieldPropertyName`、`options`、`value?: T | null`／`defaultValue?: T | null`、`onValueChange?: (value: T) => void`；支持 `required`、`requiredMessage`、`validate`、`errorMessage`、`isSubmitted`、`disabled`、`readOnly`／`readonly`、`setValue`、`setError`、`onBlur`。没有 `multiple`、`dictionary` 或数组值接口。
- `validateTwoSwitch(value, options, rules)` 校验重复 key、必填空值和选项归属；空值是 `null`／`undefined`，不能用 truthy 判断漏掉 `0`。默认未选；注解默认 `"-1"` 不是自动选项，也不自动转为数字。只有协议明确且真实选项包含对应类型的 key，才可用作默认值。
- 组件按二元组直接读取 `options[0]` 和 `options[1]`，自身不保证运行时数组长度。动态数据须先验证恰好两项、key 为 string／number 且不同，再通过 `[first, second]` 构造有类型的二元组；不要使用 `slice(0, 2)` 或类型断言绕过检查。加载中、失败、空列表、三项以上、重复 key 都不能作为有效双选渲染或提交。
- 编辑值不在当前选项中时保留原模型值并显示不可用，阻止提交，不能自动选择第一项。`value` 受控绑定按属性是否存在判断；编辑异步回填和切换记录使用 `value`／`onValueChange`，仅更新 `defaultValue` 不会刷新内部值。原生表单 reset 仅重置非受控值；受控状态由父表单恢复。
- 回调保留 key 的 string／number 类型；组件原生隐藏 input 使用字符串，不能据此把 `FormData` 字符串当成最终模型类型。提交仍由表单校验后的 TypeScript 模型交给 `onSubmit`。

### boolean／Boolean 普通开关

- 文件 `validatable-switch.tsx` 导出 `ValidatableSwitch`、`validateSwitch`。绑定为 `fieldPropertyName`、`value?: boolean`／`defaultValue?: boolean`、`onValueChange?: (value: boolean) => void`；支持 `requiredChecked`、`requiredMessage`、`validate`、`errorMessage`、`isSubmitted`、`disabled`、`readOnly`／`readonly`、`setValue`、`setError`、`onBlur`，没有 `options` 或 `required` 属性。
- `false` 是有效布尔值。Java 非空必填在模型层验证 `value != null`，不能映射成 `requiredChecked`；该参数只表示必须为 `true`。`validateSwitch` 参数是 boolean，不负责区分模型中的 `null`、`undefined` 与 `false`。
- 组件默认关闭，受控 `undefined` 也显示关闭，不支持 nullable 三态。对于允许为空的 `Boolean`，在模型保留原 `null`／`undefined`，可用 `value={model.flag ?? false}` 仅适配显示，在用户操作回调时才写入 boolean；不得在初始化、渲染或提交时将缺失静默改为 `false`。若必须能清回未设置状态或要求用户明确选择关闭，需核查现有交互是否足够，不能假装有三态能力。
- `boolean`／`Boolean` 上出现 `TWO_SWITCH` 等冲突数据源注解时仍用普通开关，并在字段清单列出原注解及处理方式；不改 Java、不伪造字典。原始 boolean 的默认值也应核查实际新增／JSON 约定，不把组件自身的 false 默认当作后端协议。
- 受控检测与 reset 行为同双选；使用表单模型提交，不从原生 checkbox 是否出现在 `FormData` 推断 false。新增、编辑回填和校验至少覆盖 false 有效、可空值不被改写、非空必填拦截缺失，以及明确的必须开启规则。
