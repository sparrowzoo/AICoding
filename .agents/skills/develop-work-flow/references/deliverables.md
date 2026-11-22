# 阶段产物与需求目录

<a id="documents"></a>
## 文档职责与唯一来源

交付内容统一遵守[产物内容边界](../../../agents/doc-reviewer/references/document-quality.md#artifact-relevance)，过程留证不混入需求或设计正文。

业务文档按用户需求组织：**目标项目根目录** `doc/<需求目录>/`，需求目录采用 `req-r<至少两位编号>-<英文名称>-<git用户名>`，例如 `req-r01-profile-git-user`（`git-user` 仅为示例，实际按下文读取目标项目的 `user.name`），即 `doc/req-【需求】/`，其中【需求】用稳定编号、名称与 Git 用户名后缀替换。`/doc` 在交流中指项目目录，不是操作系统根目录。

```text
doc/
├── req-r01-profile-git-user/            # lite 文档布局（不代表复杂度）
│   ├── technical.md            # TRD：目标、规则、验收、设计与影响确认
│   ├── plan.yaml               # 任务来源，mode: lite
│   ├── evidence.md             # 各环节的上下文、输入、输出、结果与证据
│   ├── plan.md                 # 自动生成的阅读计划
│   └── task-status.md          # 首次计划交付即生成、持续更新的任务状态表
└── req-r02-order-git-user/              # 业务需求：full
    ├── product.md              # 按指定 PRD 模板编写的完整产品需求规格
    ├── technical.md            # TRD：概要、详细设计、测试与影响确认
    ├── acceptance.feature      # 可执行验收场景
    ├── plan.yaml               # 任务来源，mode: full
    ├── evidence.md             # 各环节的上下文、输入、输出、结果与证据
    ├── plan.md                 # 自动生成的阅读计划
    └── task-status.md          # 首次计划交付即生成、持续更新的任务状态表
```

<a id="requirement-document-boundary"></a>
### 新需求独立成文与章节复用

<a id="requirement-directory-naming"></a>
**需求目录命名：** 新建需求目录前，在目标业务项目执行 `git config --get user.name`（或 `git -C <projectRoot> config --get user.name`），将当前生效值追加到目录末尾。必须读取目标项目，不能读取 AICoding 源仓库的配置、操作系统账号或自行猜测用户名，也不能把示例用户名写死。未配置 `user.name` 时先请用户设置；若值不能直接用于现有小写 kebab-case 目录规则（如含空格、中文或路径分隔符），先确认可用的目录后缀，不擅自音译或修改 Git 配置。

同一需求继续沿用已确定的完整目录名，不因接手人或 Git 用户名变化重复追加后缀或改名。已有目录仅在用户明确要求迁移时改名，并同步本地链接、脚本路径、计划的 `feature` 和生成视图；目录内标准文件名保持不变。历史提交链接、分支名、已引用的文档编号及原始运行记录保留其历史身份，不机械替换。

- **独立新需求：** 按独立目标和验收范围判断，新建 `doc/req-rNN-name-<git用户名>/`，在已授权阶段编写本需求文档。是否修改存量代码、是否属于同一产品，不决定目录归属。
- **同一需求迭代：** 澄清、返工、纯技术小迭代和产品逻辑小变更沿用原目录，更新范围见[迭代承接](../../trd-writer/references/planning.md#iteration)。边界有歧义时先明确范围。
- **必备交付：** TRD、任务计划源 `plan.yaml`、生成的 `plan.md` 和 `task-status.md`。首次计划交付生成[任务状态表](../../trd-writer/references/planning.md#task-status)。文档集合按[需求性质与分流](../SKILL.md#requirement-kind)确定，未获授权的下游产物不提前编写。

重复内容使用“本次适用说明 + 相关文档具体章节链接”复用；需要固定基线时注明文档编号及可核实版本。本次变化、适用条件、接口影响和验收必须在新文档写清，不能只写“同前”。引用应直接定位权威章节，避免层层跳转；仍遵守 PRD、TRD 的职责及单向依赖。共用内容用简短说明和章节引用；模板结构及内容省略范围统一按[模板规则](../../../agents/doc-reviewer/references/document-quality.md#template-structure)执行。

新需求使用自己的 R/S/T 命名空间；跨需求引用带完整需求目录名。旧需求的未完任务、已完成任务及证据保留在旧目录，不能为了依赖闭包把旧计划搬进新计划；外部前置条件在本次 TRD 中引用并说明就绪验证，`depends_on` 仍只引用本计划任务。同一需求内的编号及跨轮承接按[迭代承接](../../trd-writer/references/planning.md#iteration)处理。

先检查现有需求目录再分配编号；编号在项目内唯一、不复用。名称使用小写 kebab-case，确定后保持稳定。历史交给 Git；同一需求的评审修订不按轮次复制整套文档。

目录编号 r01 标识一项用户需求；目录内部的 R01、S01、T01 分别标识可验收子项、场景和任务。跨需求引用写完整限定名，如 `req-r01-profile-git-user/R01`。DSL 的 `feature` 字段与工具的 `--feature` 参数填写完整需求目录名，不带 `doc/` 前缀，不增加目录层级。用户明确指定的文档路径优先；当前 CLI 固定读取 `<projectRoot>/doc/<feature>/`，遇到其他布局须明确工具适配方式，不能擅自移动文件或伪造项目根。

两种布局使用同一份 [TRD 正文模板](../../trd-writer/templates/technical.md)。TRD 按[数据结构设计要求](../../trd-writer/SKILL.md#data-structure-design)说明内部类型、读写语义与表列映射，API、协议类型、各层方法和 PO 字段引用 [api-first 的声明](../../api-first/SKILL.md#layer-contracts)。

### lite：两份设计与计划源

`technical.md` 是 TRD，由 trd-writer 按[指定 TRD 模板](../../trd-writer/templates/technical.md)按实际范围组织必要内容，统一维护本轮目标与范围、带 R 编号的业务规则/基线引用、验收场景、概要与详细设计、测试设计和影响确认。验收放在带 `<a id="acceptance"></a>` 锚点的章节中，使用文档内唯一的 `gherkin` 围栏代码块，场景仍有稳定 S 编号并引用 R。纯文档等无行为任务可省略该块，但任务须写 `scenarios: []` 和具体 `tdd_exception`，并保留适当验证证据。

`plan.yaml` 以 `mode: lite` 指定文档契约，维护当前迭代的任务、依赖、引用、修改范围、验证命令、状态和证据摘要；trd-writer 规划，coder 更新实施结果，验收人据实际结果核验。任务引用 TRD 中的规则、场景和接口，不复制正文。

lite 的设计与计划仅维护这两份源；另在 `evidence.md` 记录全链路过程证据，阅读计划和任务状态表自动生成。风险与措施写入 TRD，任务证据摘要维护于 DSL；手工验收及审查记录由 evidence.md 链接到实际结果。精简的是文档组织，不是行为测试：涉及行为的任务必须有 Gherkin 场景及对应真实测试。

### full：按职责分工

| 文件 | 权威内容 | 主要维护角色 |
|---|---|---|
| `product.md` | 按 [PRD：产品需求规格说明书模板](../../prd-writer/templates/product.md)完整维护产品规格，包括背景、评估、目标、验证方式、业务与功能需求、相关方、风险、范围、数据分析、灰度、相关文档、待确认问题及相关数据表 | 产品负责人 / prd-writer |
| `technical.md` | 按 [TRD：技术需求规格说明书模板](../../trd-writer/templates/technical.md)维护方案概述、系统需求、总体方案、系统依赖、风险、运行设计、特性设计、部署方案与附录；承载技术契约、测试设计、影响与确认 | 技术负责人 / trd-writer |
| `acceptance.feature` | Gherkin 验收例子，稳定 S 编号并引用 R；涵盖有意义的正常、边界、异常行为 | prd-writer 维护，trd-writer 校对 |
| `plan.yaml` | 当前迭代任务及执行记录，字段职责与 lite 一致 | trd-writer 规划 / coder 更新，验收人核验 |

full 同样维护 `evidence.md`，汇总跨阶段、手工验收与审查的可定位证据。PRD 维护业务依据、确认输入、产品行为及验收规则；同一已确认事实通过摘要和来源引用关联，不在两份文档各维护一套可独立修改的定义。产品规则正文在 PRD，场景用具体例子验证，TRD 说明实现，任务引用相应编号。
