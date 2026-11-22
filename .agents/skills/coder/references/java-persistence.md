# Java 实体、存储接口与数据转换

这些约定用于采用相应 Java/Sparrow 分层、公共持久化基类、转换器、主键或 MyBatis-Plus 的项目。设计和实现都先核对实际代码、依赖版本、数据库字段、映射注解以及用户已确认的项目约定。未采用某项组件的项目沿用自身架构，已有契约有差异时先说明影响。在 TRD 里设计数据或生成待审 DDL，不表示已经批准执行数据库变更。

<a id="entity-lombok-po"></a>
## 实体与数据结构

- 项目自有 Java 实体统一使用 Lombok `@Data`，按需选构造注解。核对实际模块启用 Lombok、序列化和调用方访问需求，不叠加 `@Getter`／`@Setter` 或手写机械访问器。保留含业务含义的方法和枚举行为。映射类用业务名称，持久化职责由 po 包和映射表达；重命名同步 DAO、转换器、映射与测试。
- 数据库表和字段沿用项目已有的前缀、大小写和业务名称。改名时核对持久化映射和调用方，在获批范围同步相关代码与测试。
- 从当前项目定位 PO 基类、标记接口、通用字段和映射。业务需要全部通用审计字段时必须继承现有 PO；只需要部分或无需通用字段时，说明依据，用项目约定的 POJO 标记及实际字段。避免遮蔽继承字段或复制整套通用字段。类型、UNSIGNED、默认值、可更新性不一致时分别列出实体、映射和数据库的冲突，在获批范围内解决。
- 采用工作流约定的 Jakarta 映射时使用 `jakarta.persistence` 注解，核实第三方 DDL 生成器支持的注解及与 MyBatis-Plus 的映射一致性。此约定只描述映射，保留项目选定的 DAO 执行方式。核对实体字段、主键生成、外键关系、索引、约束与数据库实际一致性，包括继承字段和序列化影响。

<a id="dao-contract"></a>
## DAO、查询与并发

- 项目已有 `DaoSupport` 时，所有 DAO 继承 `DaoSupport<对应实体, 主键类型>`，核对真实插入及主键返回语义，复用已有 CRUD。仅为已确认的查询或原子更新增加方法，核对 DAO 实现、Mapper、测试和调用方。DAO 使用自己的查询条件、PO 或符合实际存储边界的类型。
- 按项目约定优先复用 TrustedOwner 等可信归属，从调用上下文选定 USER/PROJECT 范围，ALL 不能表示跳过过滤。服务端提供身份，后台任务显式携带。普通同步调用沿用既有 SessionContext。
- 采用本工作流单表查询约定时，由数据库一次完成单表可表达的归属、状态、可见性、时间、游标、排序和限制条件，Java 批量加载关联 ID 并组装多表事实。业务查询不用 JOIN、关联子查询或逐条重复查询。跨记录筛选后保持原来的分页、排序、去重和总量语义，必要时继续取下一批。
- 使用 MyBatis-Plus 时，查询／更新条件、选择列和排序用 LambdaQueryWrapper／LambdaUpdateWrapper 的实体方法引用，复合条件用 and/or。数据库专有聚合等置于明确的 Mapper SQL。原子更新与并发条件在数据库操作中保证。
- 主键、完整唯一索引等能够保证最多一条时，优先用 getEntity、selectById 或 selectOne。部分联合唯一条件不代表唯一，预期唯一却返回多条时要暴露问题。“取最新一条”按业务排序选择。测试要能发现跨租户、关联缺失、连续过滤和分页不足等回归。

<a id="save-param-long"></a>
## 实体保存实现

采用 [api-first 的实体保存接口](../../api-first/references/engineering-contracts.md#save-param-long)时，Repository 调用 Converter 的 `param2po`，ID 非空时更新并返回 ID，为空时插入并返回实际生成的 ID。保持租户隔离、审计、事务、行数和异常约定。核对 DAO 支持的主键回填方式、前端返回值及测试，分别验证两类操作和调用次数。

<a id="repository-converter"></a>
## Repository 和 Converter

- 采用 Sparrow 整洁架构时，domain 的 Repository 接口使用业务类型或稳定协议；infrastructure 的 Repository 实现调用 DAO 和对应实体的 Converter，检查读写结果和转换存储异常。转换逻辑在实体所归属的 `infrastructure.converter` 中集中维护。复用已有转换器，避免在 Repository、Service 或 Controller 内逐字段复制、循环映射集合或借序列化中转。无需转换时复用原类型。
- Converter 负责 `param2po`、`po2dto` 等映射，保留字段、空值、集合顺序、分页总数、标识精度与时间单位。读取时按需复用项目的 BeanCopier，异名异型字段显式映射。转换器不访问 DAO 或作授权决策；服务端决定可信归属和业务状态。
- 项目已有 POInitUtils 时，创建或初始化 PO 的写入转换在复制业务字段后使用 `POInitUtils.init(...)` 绑定当前 LoginUser 和审计信息。核对工具实际职责、DAO 更新列及历史数据，保护创建人、创建时间及不可变归属。转 DTO 或查询条件时无须初始化 PO。测试验证真实字段及查询范围。

<a id="query-converter"></a>
## 数据库分页查询对象

DAO 查询对象放在对应 DAO 的 `query` 子包。DAO 接收存储查询条件，HTTP 的 Query 由协议层维护。业务 Query 交给对应 Converter 的 `toDbPagerQuery`。输入为空时创建带原默认分页值的数据库查询对象，保留可信范围过滤；有输入时用已有 BeanCopier 复制同名同型属性并显式转换差异。数据库查询类名和包以项目真实定义为准，例如 `ProjectDBQuery projectDbQuery`。测试覆盖 null、分页、筛选和原输入未被修改。
