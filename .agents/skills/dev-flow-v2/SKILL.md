---
name: dev-flow-v2
description: 研发工作流 v2（pipeline 机制）——脚本驱动编排（pipeline.js + runner.js 独立运行时，agent 用 mock）。与 v3 是同一套流程的两种实现机制，按流程性质选用。
triggers:
  - dev-flow-v2
  - 研发工作流v2
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - Skill
  - AskUserQuestion
  - TodoWrite
  - Workflow
---

# 研发工作流 v2

> **两种实现机制之一（pipeline）**：v2 是确定性脚本编排（`pipeline.js` + `runner.js`），[dev-flow-v3](../dev-flow-v3/SKILL.md) 是 native 编排（宿主 `Skill`/`Agent` 驱动）。同一套研发流程，按流程性质选用：明确 → v2，非确定 → v3。
>
> v2 原依赖的 `Workflow` 脚本运行时从未实现；现已用 `runner.js` 补齐原语，`pipeline.js` 可独立跑通（agent 用 mock）。

脚本驱动编排器。编排器做决策，脚本执行。质量门禁在各 Skill 内部自闭环，编排器只看结果做闸门决策。

**脚本**: `.claude/skills/dev-flow-v2/scripts/pipeline.js`
**运行时**: `.claude/skills/dev-flow-v2/scripts/runner.js`

```bash
# agent 用 mock，验证确定性编排逻辑（闸门/重试/根因回退）
node scripts/runner.js --feature=<kebab-case> [--mode=design|build|full] [--scenario=pass]
```

scenario：`pass` / `trd-retry` / `trd-fail` / `trd-human` / `code-retry` / `code-fail` / `verify-fail` / `verify-blocked` / `verify-skip` / `e2e-code` / `e2e-design` / `e2e-requirement` / `e2e-human`。

> 把 mock 换成真实子 agent：把 `runner.js` 的 `agent()` 改为 shell 调 `claude -p`（代价：独立进程、慢、上下文不共享）。

启动时 `TodoWrite` 创建任务列表，并创建 `./docs/{feature}/audit-trail.md` 记录全链路决策证据。

## 流程

### Step 0：需求确认

以下三项都有基本认知即为「明确」：

| # | 问题 | 作用 |
|:---|:---|:---|
| ① | 一句话说清功能？ | 范围判定 |
| ② | 核心输入输出？ | 接口契约 |
| ③ | 主要异常场景？ | 边界条件 |

明确 → Step 0.5

不明确 → **AskUserQuestion** 让用户选：

| 选项 | 行为 |
|:---|:---|
| 继续聊 | AskUserQuestion 逐项聊，聊完回 Step 0 |
| 写需求文档 | Skill({skill: 'req-writer'}) 产出后回 Step 0 |
| 写 PRD | Skill({skill: 'prd-writer'}) 产出后回 Step 0 |
| 自行处理 | 跳过，直接进入 Step 1（用户说了算） |

### Step 0.5：规模判定

| 特征 | 小需求 | 常规需求 |
|------|--------|----------|
| 功能范围 | 单类/单函数 | 多模块 |
| 异常场景 | ≤3 个 | >3 个 |
| 外部依赖 | 无 | 有 |

- **小需求**（全中）→ 跳过 Step 2 审核闸门，自动 Path B
- **常规需求** → 标准流程

追加 audit-trail：`## 规模判定 | 小需求/常规 | {依据}`

### Step 1：TRD 产出

```
node scripts/runner.js --feature=<feature> --mode=design
```

返回字段：

| 字段 | 说明 |
|------|------|
| status | ok / failed |
| riskLevel | low / medium / high |
| taskCount | 任务数 |
| needsHuman | 是否需人工介入 |

- `needsHuman: true` → ⚠️ 人工介入，终止并展示 summary
- `status: failed` → ❌ 终止
- `status: ok` → Step 2

### Step 2：审核闸门

| 条件 | 路径 | 行为 |
|------|:--:|------|
| 🟢低风险 + ≤10 任务 | B | 自动跳过审核 |
| 🔴高风险 或 >10 任务 | A | 展示 TRD 摘要 → AskUserQuestion 人工确认 |
| 🟡中风险 | ? | AskUserQuestion 用户决定 |

Path A 用户选择：**确认进入编码** / **修改设计**（重跑 Step 1）/ **中止**。

追加 audit-trail：`## 审核闸门 | riskLevel/taskCount/路径/用户选择`

### Step 3：编码 + 验证 + E2E + 归档

```
node scripts/runner.js --feature=<feature> --mode=build
```

返回字段：

| 字段 | 说明 |
|------|------|
| status | ok / failed |
| e2eRootCause | code / design / requirement（E2E 失败时） |
| needsHuman | 是否需人工介入 |

- `status: ok` → ✅ 完成
- `needsHuman: true` → ⚠️ 人工介入
- `status: failed` 且 `e2eRootCause` 有值 → Step 4 根因回退
- `status: failed` 无 `e2eRootCause`（编码/验证失败）→ 回退 Step 3 重跑 build

### Step 4：E2E 根因回退

按 `e2eRootCause` 路由（AskUserQuestion 与用户确认根因）：

| rootCause | 回退 | 行为 |
|-----------|------|------|
| code | 编码 | 重跑 Step 3（build） |
| design | 设计 | 回退 Step 1（design），再进 Step 3 |
| requirement | 需求 | 回退 Step 0 |

同问题复现自动升级根因，最多 2 次。超限 → ⚠️ 人工介入。

## 需求变更

| 级别 | 判断 | 处理 |
|------|------|------|
| 轻量 | 不改变接口/规则/范围 | 直接修改文档 |
| 中度 | 影响当前阶段输入 | 回退到当前 Step |
| 重度 | 改变核心需求 | 回到 Step 0 |

AskUserQuestion 确认级别。追加 audit-trail。

## 关键规则

1. `feature` 英文 kebab-case ≤4 单词
2. 中文沟通
3. 每个 Workflow 返回后向用户展示：产出 + 自审结果 + 决定与依据（禁止只写"完成"）
4. audit-trail 实时追记：每个 Step 完成后立即追加（决策逻辑 + 输入证据 + 输出结果）
5. 质量门禁在节点内部自闭环（doc-reviewer / code-reviewer），编排器只看 ✅/❌
