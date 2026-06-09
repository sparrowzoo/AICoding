---
name: dev-flow-v2
description: 研发工作流 v2——需求确认→设计编码→E2E→归档。调用 pipeline.js 脚本驱动。
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

脚本驱动编排器。编排器做决策，脚本执行。

**脚本**: `.claude/skills/dev-flow-v2/scripts/pipeline.js`

## 流程

### Step 0：需求确认

以下三项都有基本认知即为「明确」：

| # | 问题 | 作用 |
|:---|:---|:---|
| ① | 一句话说清功能？ | 范围判定 |
| ② | 核心输入输出？ | 接口契约 |
| ③ | 主要异常场景？ | 边界条件 |

明确 → 进入 Step 1

不明确 → **AskUserQuestion** 让用户选：

| 选项 | 行为 |
|:---|:---|
| 继续聊 | AskUserQuestion 逐项聊，聊完回 Step 0 |
| 写需求文档 | Skill({skill: 'req-writer'}) 产出后回 Step 0 |
| 写 PRD | Skill({skill: 'prd-writer'}) 产出后回 Step 0 |
| 自行处理 | 跳过，直接进入 Step 1（用户说了算） |

### Step 1：执行

```
Workflow({ scriptPath: '...pipeline.js', args: { feature } })
```

- `feature`：kebab-case 功能名

| 返回 `status` | 编排器行为 |
|:---|:---|
| `ok` | ✅ 完成 |
| `failed` | ❌ 终止，展示 `summary` |

## 关键规则

1. `feature` 英文 kebab-case ≤4 单词
2. 中文沟通
