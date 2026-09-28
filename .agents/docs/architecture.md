# 研发工作流与 OpenSpec 架构说明

> 本文档记录本项目的研发工作流、OpenSpec 集成、以及相关工具链的完整关系。目的：以后忘了能快速回忆。

---

## 1. 全景：三层结构

本项目的「研发工作流」由三层组成，从上到下：

```
┌─ Skill 层 ──────────────────────────────────────────────┐
│  .claude/skills/  自定义研发工作流（dev-flow-v3 等）      │
│  编排决策：需求确认 → 设计 → 编码 → 验证 → E2E → 归档      │
└──────────────────────┬──────────────────────────────────┘
                       │ 调用
┌─ 命令层（Claude 集成）───────────────────────────────────┐
│  .claude/commands/opsx/  OpenSpec 的 Claude 操作手册      │
│  11 个 slash commands：/opsx:new /opsx:apply /opsx:archive │
└──────────────────────┬──────────────────────────────────┘
                       │ 调用
┌─ CLI 层（引擎）─────────────────────────────────────────┐
│  openspec 命令行工具（@fission-ai/openspec，v1.13.1）     │
│  openspec new / status / instructions / archive ...      │
└──────────────────────────────────────────────────────────┘
```

- **Skill 层** = 本项目的研发流程编排（自己写的）
- **命令层** = OpenSpec 官方配给 Claude 的操作手册（`openspec init` 生成）
- **CLI 层** = OpenSpec 的引擎（npm 装的）

---

## 2. openspec CLI（引擎）

### 是什么

OpenSpec 是一个「规范驱动开发（spec-driven development）」的命令行工具，由 Fission AI 出品。核心能力：管理 change（变更提案）、生成 spec/design/proposal 模板、校验、归档。

### 安装

```bash
npm install -g @fission-ai/openspec
```

- **包名是 `@fission-ai/openspec`**，不是 `openspec`（npm 上那个 `openspec` 是 0.0.0 占位包）。
- 当前版本 **1.13.1**。

### 本机实际安装位置（重要，非默认）

由于本机 node 是用官方 `.pkg` 装的，`/usr/local` 归 `root` 所有，普通 `npm install -g` 会 EACCES。实际装到了用户本地前缀：

| 项 | 位置 |
|----|------|
| 实际安装目录 | `~/.npm-global/lib/node_modules/@fission-ai/openspec` |
| 二进制软链 | `~/.local/bin/openspec` → `~/.npm-global/bin/openspec` |
| PATH | `~/.local/bin` 已在 PATH 里，所以 `openspec` 直接可用 |

当时的安装命令（绕开 sudo）：

```bash
mkdir -p ~/.npm-global
npm install -g @fission-ai/openspec --prefix ~/.npm-global --cache /tmp/npm-cache-zl
ln -sf ~/.npm-global/bin/openspec ~/.local/bin/openspec
```

### 想永久修掉 root 权限问题（可选）

让以后 `npm install -g` 不用 sudo（需要你手动跑，要密码）：

```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules ~/.npm
```

### 常用命令

```
openspec new change "<name>"     # 创建 change（隐藏命令，不在顶层 --help）
openspec schemas --json          # 列出工作流 schema（隐藏命令）
openspec status --change "<name>" # 查看 change 的产物完成状态
openspec instructions <artifact> --change "<name>" --json  # 获取某产物的模板+规则
openspec list --json             # 列出 changes
openspec archive <name> -y       # 归档
openspec context --json          # 查看当前 OpenSpec root
```

> ⚠️ `openspec new` 和 `openspec schemas` 是**隐藏命令**，不会出现在 `openspec --help` 顶层列表里，但确实存在。别因为 --help 看不到就以为删了。

---

## 3. `.claude/commands/opsx/` 是什么、为什么存在

### 为什么会有这些文件

`.claude/commands/opsx/` 下的 11 个 `.md` 文件是 **OpenSpec 装进项目的 Claude Code 集成文件**，由 `openspec init --tools claude` 自动生成。

**关键：装了 openspec CLI 还不够**，因为：

- `openspec` CLI 只是引擎，Claude 并不知道「用户想做新需求时，我该先跑 `openspec new change`，再跑 `openspec status`，再跑 `openspec instructions`」。
- 这些 `.md` 文件就是「给 Claude 看的操作手册」——把每一步「什么时候、按什么顺序、调哪个 CLI 命令」写成了指令。

### 文件清单（11 个）

```
explore.md   new.md       archive.md      bulk-archive.md  continue.md
apply.md     verify.md    onboard.md      sync.md          ff.md  propose.md
```

对应 Claude Code 里的 slash commands：`/opsx:new`、`/opsx:apply`、`/opsx:archive` 等。

### 如何重新生成/更新

不要手动改这 11 个文件，让 CLI 自己重新生成：

```bash
openspec init --tools claude --force   # 完整重新生成（也会生成 AGENTS.md / openspec/config.yaml）
# 或
openspec update                        # 只更新指令文件
```

---

## 4. `.claude/skills/` 是什么（自定义研发工作流）

这是本项目的**自定义研发流程编排**，独立于 OpenSpec，是团队自己写的。

| Skill | 作用 |
|-------|------|
| `dev-flow-v3` | **研发工作流 v3**（主入口）：原生编排，需求确认→规模判定→TRD→审核闸门→编码→验证→E2E→归档 |
| `dev-flow-v2` | v2，已废弃（依赖未落地的 Workflow 运行时，指向 v3） |
| `dev-work-flow` | v1，已废弃（只剩 stub，指向 v3） |
| `req-writer` | 模糊诉求 → 结构化需求文档 |
| `prd-writer` | 需求文档 → OpenSpec proposal（PRD） |
| `trd-writer` | OpenSpec change → design.md + specs + plan.md（技术设计） |
| `coder` | 承接技术文档，TDD 派子 Agent 编码 |
| `e2e-validator` | 逐条核验业务规则（正常/边界/异常） |
| `my` | 多智能体并行编排（演示 serial/parallel） |
| `clean-project` | 清空项目（保留 .claude/.git/pom.xml） |

### dev-flow-v3 的流程

```
Step 0   需求确认（三问：功能/输入输出/异常）
Step 0.5 规模判定（小需求 → 跳审核闸门）
Step 1   TRD 产出（design + specs + plan）
Step 2   审核闸门（riskLevel × taskCount → Path A 人工确认 / B 自动跳过）
Step 3   TDD 编码
Step 4   运行时验证
Step 5   E2E 验收
Step 6   根因回退（code/design/requirement → 回不同阶段）
Step 7   归档
```

v3 用原生 `Skill`/`Agent`/`AskUserQuestion` 工具编排，不依赖 `pipeline.js`。详见 [dev-flow-v3-background.md](dev-flow-v3-background.md)。

---

## 5. Workflow 工具：一个「未落地」的设计

### 现象

`dev-flow-v2` 和 `my` 的 SKILL.md 里都写了：

```
Workflow({ scriptPath: '...pipeline.js', args: { feature } })
```

`pipeline.js` 里用了 `agent()` / `pipeline()` / `parallel()` / `log()` / `phase()` / `args` 这些全局函数，以及 `export const meta` 这种写法——这是为某个**自定义的「Workflow 脚本运行时」**设计的。

### 现状

- 这个 Workflow 运行时**从未被实现成真正的工具**。
- 官方插件市场（`claude-plugins-official`，39 个插件）里**没有任何插件声明 `Workflow` 工具**。
- 所以 `pipeline.js` 目前只是「编排设计文档」，无法被真机执行。

### 实际是怎么跑的

当前工作流实际是**编排器（Claude 本体）手动驱动**：按 dev-flow-v2 的决策逻辑，直接调用底层 skill（trd-writer → coder → e2e-validator → 归档）来跑。效果等价，但没有 pipeline.js 那层自动化。

### 决策：v3 原生编排

最终没走上面两条路，而是选了第三条——**用原生 `Skill`/`Agent` 工具直接表达编排**（即 dev-flow-v3）。详见 [dev-flow-v3-background.md](dev-flow-v3-background.md)。

---

## 6. 环境坑速查

| 问题 | 原因 | 解决 |
|------|------|------|
| `npm install -g` EACCES | node 官方 .pkg 装的，`/usr/local` 归 root | 用 `--prefix ~/.npm-global`，或 `sudo chown -R $(whoami) /usr/local/lib/node_modules ~/.npm` |
| `openspec new`/`schemas` 在 --help 里看不到 | 隐藏命令 | 直接敲，能用 |
| `Workflow` 工具不存在 | 从未实现 | 见第 5 节 |

---

## 7. 关键结论（一页记住）

1. **`openspec` CLI 是引擎，`.claude/commands/opsx/` 是它的 Claude 操作手册**；两者都来自 OpenSpec，缺一不可。
2. **装 CLI 不够，还要 `openspec init --tools claude` 生成操作手册**（那 11 个 .md）。
3. **`.claude/skills/` 是本项目自己写的研发工作流**，和 OpenSpec 是两码事，但会调用 OpenSpec 产物。
4. **`pipeline.js` 的 Workflow 运行时没落地**，已由 dev-flow-v3 用原生工具替代。
5. **openspec 装在了 `~/.npm-global/`**（因为 /usr/local 是 root），软链到了 `~/.local/bin/openspec`。
