---
name: my
description: 多智能体协同——Workflow 脚本驱动的并行任务编排。用法：/my <任务描述>
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - Skill
  - Workflow
---

# my

脚本：`.claude/skills/my/scripts/pipeline.js`

## 用法

```
Workflow({ scriptPath: '...pipeline.js', args: { mode, items } })
```

| 参数 | 说明 |
|------|------|
| `mode` | `'serial'` 串行 / `'parallel'` 并行 |
| `items` | `[{ id: string }]` |

## 两种模式

| mode | 写法 | 行为 |
|------|------|------|
| `serial` | `for...await` | 一个接一个，后面等前面 |
| `parallel` | `parallel(thunks)` | 全部同时启动，全完成返回 |
