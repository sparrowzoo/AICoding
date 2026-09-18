---
name: dev-flow-v3
description: 研发工作流 v3——原生 SKILL.md 编排，不依赖 Workflow 脚本运行时。需求确认→规模判定→TRD→审核闸门→编码→验证→E2E→归档。
triggers:
  - dev-flow-v3
  - 研发工作流v3
  - 研发工作流
  - 新功能
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
---

# 研发工作流 v3

原生编排版。**不用 `Workflow` 工具 / `pipeline.js`**，直接用原生 `Skill` / `Agent` / `AskUserQuestion` 工具驱动。

> 为什么是 v3 而不是 v2：v2 的 `pipeline.js` 依赖一个从未实现的「Workflow 脚本运行时」，脚本跑不起来。v3 把同样的编排逻辑用原生工具落地。背景见 `.claude/docs/dev-flow-v3-background.md`。

编排器只做决策，质量门禁在各 Skill 内部自闭环（doc-reviewer / code-reviewer）。启动时用 TodoWrite 建任务列表，并创建 `./docs/{feature}/audit-trail.md` 记录全链路决策证据。

---

## Step 0：需求确认

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
| 自行处理 | 跳过，直接进 Step 1（用户说了算） |

---

## Step 0.5：规模判定

| 特征 | 小需求 | 常规需求 |
|------|--------|----------|
| 功能范围 | 单类/单函数 | 多模块 |
| 异常场景 | ≤3 个 | >3 个 |
| 外部依赖 | 无 | 有 |

- **小需求**（全中）→ 跳过 Step 2 审核闸门，自动 Path B
- **常规需求** → 标准流程

追加 audit-trail：`## 规模判定 | 小需求/常规 | {依据}`

---

## Step 1：TRD 产出

```
Skill({skill: 'trd-writer'})
```

trd-writer 内部自闭环：产出 design.md + specs/ + plan.md → doc-reviewer (opus) 审查。

返回后，读 `design.md` 的 Risks 和 `plan.md` 的任务数，确定：

| 字段 | 来源 |
|------|------|
| riskLevel | design.md Risks 数量/严重度 → low/medium/high |
| taskCount | plan.md 任务数 |

- 审查通过（✅）→ Step 2
- 审查未通过（❌）→ 把审查意见回传给 trd-writer 重试，≤2 次；超限 → `⚠️ 人工介入`

追加 audit-trail：

```markdown
## 节点②：TRD 产出
| 产出 | 路径 | 状态 |
|------|------|------|
| design.md / specs/ / plan.md | {路径} | ✅/❌ |
| riskLevel | {low/medium/high} | |
| taskCount | {N} | |
```

---

## Step 2：审核闸门

| 条件 | 路径 | 行为 |
|------|:--:|------|
| 🟢低风险 + ≤10 任务 | B | 自动跳过审核 |
| 🔴高风险 或 >10 任务 | A | 展示 TRD 摘要 → AskUserQuestion 人工确认 |
| 🟡中风险 | ? | AskUserQuestion 用户决定 |

Path A 用户选择：**确认进入编码** / **修改设计**（重跑 Step 1）/ **中止**。

追加 audit-trail：`## 审核闸门 | riskLevel/taskCount/路径/用户选择`

---

## Step 3：TDD 编码

```
Skill({skill: 'coder'})
```

coder 内部自闭环：读 plan.md → 逐 Task 派 implementer 子 Agent → spec 审查 → simplify → code-reviewer (opus) 审查。

- ✅ → Step 4
- ❌ → 把 code-reviewer 意见回传 coder 重试，≤2 次；超限 → `⚠️ 人工介入`

追加 audit-trail：

```markdown
## 节点④：TDD 编码
| 源文件 | 测试文件 | 测试结果 | 审查结果 |
|--------|----------|----------|----------|
| {清单} | {清单} | {总数/通过/失败} | {✅/❌ + 迭代次数} |
```

---

## Step 4：运行时验证

```
Skill({skill: 'verify'})
```

verify 按 diff 定位变更 → 找到 surface → 构建启动 → 驱动执行 → 输出判定。

| 判定 | 行为 |
|------|------|
| ✅ PASS | → Step 5 |
| ❌ FAIL | → 回退 Step 3，附带失败步骤 |
| ⛔ BLOCKED | → `⚠️ 人工介入：应用无法启动或变更不可达` |
| ⏭️ SKIP | → 记录原因，直接 Step 5 |

FAIL 回退 ≤2 次，超限 → 人工介入。

---

## Step 5：E2E 验收

```
Skill({skill: 'e2e-validator'})
```

e2e-validator 内部自闭环：规则拆解 → 逐条验收 → doc-reviewer 审查报告。

完成后读结果：

| 结果 | 行为 |
|------|------|
| ✅ 全通过 | → Step 7 归档 |
| ❌ 有未通过 | → Step 6 根因回退 |
| ⚠️ 需人工介入 | → 终止，展示问题清单 |

---

## Step 6：E2E 根因回退

按未通过规则的性质判定根因（AskUserQuestion 与用户确认）：

| rootCause | 判定依据 | 回退 |
|-----------|----------|------|
| code | 实现错误（逻辑/边界没写对） | 回退 Step 3（编码） |
| design | 设计缺陷（接口/结构不对） | 回退 Step 1（TRD） |
| requirement | 需求理解偏差 | 回退 Step 0 |

同问题复现自动升级根因，最多 2 次。超限 → `⚠️ 人工介入`。

---

## Step 7：归档

验收通过后：

1. **commit 闸门**：`git status --porcelain` 确认代码已提交，未提交先 commit。
2. **OpenSpec 归档**：`Skill({skill: 'opsx:archive'})`
3. **docs 归档**：
   ```bash
   date=$(date +%Y%m%d)
   mkdir -p ./docs/archive/$date/{feature}
   cp ./docs/{feature}/requirement.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
   cp ./docs/{feature}/e2e-report.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
   cp ./docs/{feature}/audit-trail.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
   cp ./docs/superpowers/plans/{feature}.md ./docs/archive/$date/{feature}/plan.md 2>/dev/null || true
   rm -rf ./docs/{feature}
   ```

最后 AskUserQuestion：是否规划下期？

---

## 需求变更

| 级别 | 判断 | 处理 |
|------|------|------|
| 轻量 | 不改变接口/规则/范围 | 直接修改文档 |
| 中度 | 影响当前阶段输入 | 回退到当前 Step |
| 重度 | 改变核心需求 | 回到 Step 0 |

AskUserQuestion 确认级别。追加 audit-trail。

---

## 关键规则

1. `feature` 英文 kebab-case ≤4 单词
2. 中文沟通
3. 每个 Skill 返回后向用户展示：产出 + 自审结果 + 决定与依据（禁止只写「完成」）
4. **audit-trail 实时追记**：每个 Step 完成后立即追加（决策逻辑 + 输入证据 + 输出结果）
5. **质量门禁在节点内部自闭环**：doc-reviewer / code-reviewer 由各 Skill 自行调用，编排器只看 ✅/❌
6. **故障回退 ≤2 次**，超限输出 `⚠️ 人工介入：[未解决问题列表]`
7. **不依赖 Workflow 工具**：全程用原生 Skill / Agent / AskUserQuestion
