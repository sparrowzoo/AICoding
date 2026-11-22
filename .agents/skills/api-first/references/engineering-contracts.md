# 接口、数据结构与架构约定

api-first 据此定义接口。TRD 引用接口说明方案，CODER 依据定义实现行为，审查者结合调用方核对结果。先读当前项目的模块、实际调用方、框架版本、既有协议和已确认的变更。以下 Sparrow、Java、Spring 和消息协议的具体约定用于采用相应技术及业务模型的项目。已有明确的不同约定时，列出对调用方和数据的影响并按用户确认处理。

<a id="solid-interface-design"></a>
## 接口职责和依赖方向

| 原则 | 设计和实现共同检查的事 |
| --- | --- |
| 单一职责 | 一个方法服务一个明确目的。触发条件、输入输出及变化原因不同的动作分开定义，沿 Controller、用例、Repository 和 DAO 核对。例如向前查历史和向后读新消息应分别定义方向、查询和结果。实体保存的新增与更新按[保存约定](#save-param-long)处理。 |
| 开放扩展 | 在实际需要的扩展点复用框架、发布器和处理器。已有消息分发或模型执行链时，新增业务处理不重复建另一条队列或调度链。 |
| 保持可替换 | 替换实现后，方向、排序、分页位置、结果内容、异常、空值和副作用含义保持一致。例如读取消息必须返回实际数据，存储失败按约定报错。 |
| 接口隔离 | 按调用者和职责区分 HTTP 输入与结果、消息、连接资源、业务上下文和持久化对象。服务端已知的身份、固定目标或配置由服务端取得。没有输入的业务动作直接使用无参方法。 |
| 依赖倒置 | 明确模块编译依赖、运行时调用与装配。使用 Sparrow 整洁架构时，domain 依赖自有业务接口，Repository 实现依赖 dao-api，启动层装配实现。domain 不引入 PO、DAO 或框架执行类型。 |

<a id="interfaces"></a>
## 接口与数据结构

- 对本次新增或变化的 HTTP、RPC、消息及跨模块调用，写清提供方、调用方、方法、输入输出、错误、权限、状态变化和副作用。对于 HTTP，核对路径、请求方法，以及请求头、查询参数和请求体各自的绑定位置。源码及 Schema 定义字段的含义、完整类型、可空、默认值、必填和校验、标识生成方、时间单位、分页和排序。核对从前端、协议、业务上下文到 Repository、DAO、PO 的字段映射及兼容性。已约定为 Java Long 的业务 ID 还需检查前端精度；第三方字符串标识保留原协议。
- 技术文档用稳定锚点（例如 `api-01`）关联真实接口源码、需求和验收场景，说明关键实现步骤及适用的事务、并发、重试和幂等边界。已有协议直接引用。无接口变更时用相应实现章节锚点；存量逻辑变化仍写清涉及的函数和调用方。
- HTTP 写入、读取与结果按现有协议分工。采用本工作流 Java 约定时，写入用 `XxxParam`，查询用 `XxxQuery`，返回结构化数据用 `XxxDTO`，实体保存返回值另按[保存约定](#save-param-long)。已有响应、分页、错误和身份类型直接复用。按[Java 协议对象规则](java-protocol-layout.md#protocol-package-layout)确定协议包、DAO 查询包以及可共用的 DTO。Java 方法签名按 [CODER 的入参约定](../../coder/SKILL.md#java-method-parameters)核对。
- 异步接口说明接收、入队、业务处理完成、失败回调各自表示什么。消息按已确认的方向、事件类型、载荷及处理器定义。例如 TypedPublisher 接收外层 Protocol 时，handler 从中读取具体 Event；已有相同推送含义的事件直接复用，HTTP Query/DTO 与 Event 保留各自职责。分别核对双向 ACK 的字段、来源和授权，服务端推送事件拒绝客户端冒用。查询位置、接收确认和已读分别记录。
- 二进制接口按完整帧说明上行、下行、每段宽度、有无符号、端序、字节或字符长度、编码、可变分支和版本拒绝方式。使用可独立计算的完整输入／输出样本及错误边界验证互通。解析与编码有分歧，先核对真实源码与最新协议。无返回值、异步受理和业务完成分别说明可观察的结果。

<a id="save-param-long"></a>
## Java 实体保存接口

采用 Param 入参和 Long 主键的项目，Controller、Service、Repository 的实体保存方法接收对应的 `XxxParam`，返回实际保存的 `Long` 主键。详情按查询接口读取。新增和修改属于同一保存用例时可共用 save。实现和回归检查见 [CODER 的实体保存规则](../../coder/references/java-persistence.md#save-param-long)。

<a id="minimal-business-contracts"></a>
## 接口复用与业务边界

- 为每个入口和字段找出当前调用方及实际用途。已有协议的含义、约束和变化原因一致时直接复用。向调用方开放新动作时先核对授权和业务意图。
- 用业务名称区分查询主键与顺序号（如 `messageId` 与 `seqNo`）、配置选择键与固定版本、单条明细与整次执行上下文。返回的数据应足以支撑实际调用场景。
- 异步或重试场景说明受理、保存、送达分别承诺什么，重复请求时允许的动作、需要的权限和可观察结果。如何借助现有框架实现这些承诺，见 [CODER 的重试与状态管理](../../coder/references/implementation-boundaries.md)。

<a id="readable-naming"></a>
## 对外名称与代码命名

接口方法、路径、协议类型和字段采用易懂且稳定的业务词汇，同一概念统一名称。方法或路径的动作名清楚，例如 `createConversation`、`listConversation`、`create-conversation`，HTTP 方法表达相应副作用。改名时核对旧客户端、已存消息及所有调用方，向 TRD 交代兼容影响。Java 声明和示例执行[对象命名](../../coder/references/java-object-naming.md#java-object-naming)与[类型引用](../../coder/references/java-type-imports.md#java-type-imports)。

<a id="sparrow-controller"></a>
## Sparrow 与 Spring MVC 的 HTTP 边界

- 使用 Spring MVC 的项目用具体 Controller 类、真实请求映射与绑定注解定义入口，用 OpenAPI 说明动作、参数、Schema、结果和错误。字段在 Schema 中定义一次。Controller 负责格式、必填和对象组装，业务服务负责业务约束。已有 ControllerAdvice 统一封装时，方法直接返回约定的业务值，由 Advice 处理线上响应和异常。沿用既有 Advice，协议和 domain 不引入 HTTP/Servlet 执行类型。
- 使用 Sparrow Passport 和过滤器的项目，业务用例从 `SessionContext.getLoginUser()` 和 `getClientInfo()` 读取可信身份与 ClientInformation。Controller 不重新解析 token、请求头或散传身份参数，也不另造认证包装；异步任务使用在请求线程取得的可信信息。已有对象缺少必要信息时先确认来源和团队责任。
- 路径中的业务 ID 可与绑定后的请求体组装，核对路径与请求体是否冲突。按既有请求绑定约定接收相应 Param 或 Query，不重复解析 JSON。设计阶段列明受影响的前端、服务与测试，核对调用约定和身份来源。进入获批的实施批次后，由编码者同步调用方并验证统一响应和错误处理。
- 使用 Sparrow 的业务断言、错误枚举和统一异常处理时，核对实际版本的条件方向、模块分类及错误码规则。对约定的 `Asserts.isTrue(condition, errorSupport)`，条件为 true 时抛 `BusinessException`，由既有 Advice 映射。错误枚举实现项目的 ErrorSupport，末尾两位按自然顺序，HTTP 状态和业务码分别维护。
