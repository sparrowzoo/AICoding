---
name: dev-flow-v2
description: 研发工作流 v2——script 驱动的轻量编排器。需求确认→TRD→编码→E2E→归档。重量级编排（并行审查/agent派发/重试）由 Workflow 脚本承载。触发词：dev-flow-v2、研发工作流v2。当需要端到端研发交付时使用。
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

Script 驱动编排器。决策树 → 委托专职 Skill，质量门禁在节点内部自闭环。人机交互点用 AskUserQuestion。

**脚本**: `.claude/skills/dev-flow-v2/scripts/pipeline.js`

## 角色矩阵

| 阶段 | 执行者 | 工具 |
|------|--------|------|
| 需求确认 | 编排器 | AskUserQuestion |
| TRD 产出 | trd-writer Skill | 内部自审+doc-reviewer |
| 审核闸门 | 编排器 | AskUserQuestion |
| TDD 编码 | coder Skill | SDD+code-reviewer |
| 运行时验证 | verify Skill | 启动应用+驱动验证 |
| E2E 验收 | e2e-validator Skill | doc-reviewer |
| 归档 | OpenSpec + bash | openspec-archive-change |

## 流程

启动时 `TodoWrite` 创建任务列表。

### Step 0：需求确认

三问：① 一句话说清功能？② 核心输入输出？③ 主要异常场景？

- 三问全 Yes → 规模判定
- 否则 → `AskUserQuestion`：写需求(req-writer) / 写 PRD(prd-writer) / 自行处理

### 规模判定

| 特征 | 小需求 | 常规需求 |
|------|--------|----------|
| 功能范围 | 单类/单函数 | 多模块 |
| 异常场景 | ≤3 | >3 |
| 外部依赖 | 无 | 有 |

小需求（全中）→ trd-writer 合并 spec，跳过 plan 审查。

### Step 1：TRD 产出（脚本 design 阶段）

```
Workflow({ scriptPath: '...pipeline.js', args: { feature, scale, phase: 'design' } })
```

→ 脚本内部：agent 调用 trd-writer → 并行 doc-reviewer (opus) → ≤2 次重审 → 返回结构化结果 `{ riskLevel, taskCount, docReviewPassed }`。

### Step 2：审核闸门

| 条件 | 行为 |
|------|------|
| 🟢低风险 + ≤10 任务 | 自动跳过 → 继续 Step 3 |
| 🔴高风险 或 >10 任务 | 展示摘要 → `AskUserQuestion` |
| 🟡中风险 | `AskUserQuestion` 用户决定 |

### Step 3-5：编码→验证→E2E→归档（脚本 build 阶段）

```
Workflow({ scriptPath: '...pipeline.js', args: { feature, scale, phase: 'build' } })
```

→ 脚本内部串行：coder → verify → e2e-validator → 归档，每阶段 agent 调用对应 Skill + ≤2 次重审。

### 故障回退

每阶段 ≤2 次回退。超限 `⚠️ 人工介入`。同问题复现自动升级根因。

### 需求变更

| 级别 | 判断 | 处理 |
|------|------|------|
| 轻量 | 不改接口/规则 | 直接修改文档 |
| 中度 | 影响当前输入 | 回退当前阶段 |
| 重度 | 改核心需求 | 回到 Step 0 |

## 关键规则

1. `{feature}` 英文 kebab-case ≤4 单词
2. 质量门禁在各 Skill 内部自闭环，编排器只看 ✅/❌
3. 文件路径按 OpenSpec + Superpowers 规范
4. 中文沟通
5. audit-trail 由脚本 agent 实时追加到 `./docs/{feature}/audit-trail.md`
