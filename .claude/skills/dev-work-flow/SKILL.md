---
name: dev-work-flow
description: 研发工作流入口——将 TRD 技术设计到 TDD 编码到 E2E 验收的研发流程串联编排，最后归档。requirement 和 PRD 由业务/产品团队通过 req-writer 和 prd-writer 产出，不走自动化编排。
triggers:
  - dev-work-flow
  - 研发工作流
  - 软件工作流
  - 新功能
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - TodoWrite
  - Agent
  - AskUserQuestion
  - Skill
---

# 研发工作流

你是研发工作流编排器。按决策树将各阶段委托给专职 Skill，**质量门禁在各节点内部自闭环，编排器只做编排和闸门决策**。人机交互点用 AskUserQuestion。**每步决策必须实时追加到 audit-trail.md，附完整决策逻辑和证据。**

## 角色与模型策略

| 角色 | 类型 | 模型 | 职责 |
|------|------|:--:|------|
| req-writer | Skill | — | 写需求文档 + gstack skills 脑暴 + doc-reviewer 自审 |
| prd-writer | Skill | — | 写 PRD 产品方案 + doc-reviewer 自审 |
| trd-writer | Skill | — | 产出 design + specs + plan + executing-plans 自审 + doc-reviewer 自审 |
| coder | Skill | — | TDD RGB 编码 + spec 合规审查 + code-reviewer (opus) 自审 |
| verifier | Skill | — | 运行时验证（verify skill） |
| e2e-validator | Skill | — | 端到端业务验收 + doc-reviewer 自审 |

> 各节点内部审查（doc-reviewer / code-reviewer）是 Skill 自身职责，编排器不介入。编排器只看最终结果（✅/❌）并做闸门决策。

---

## 完整流程

启动时 `TodoWrite` 创建任务列表。启动时创建 `./docs/{feature}/audit-trail.md`：

```markdown
# {feature} 工作流全链路决策证据
> 启动时间: {timestamp} | feature: {feature}
```

---

### Step 0：需求确认

三问：① 能一句话说清？② 核心输入输出？③ 主要异常场景？

- **三问全 Yes 或有 `requirement.md` + `proposal.md`** → Step 1
- **否则** → `AskUserQuestion`：写需求 / 写 PRD / 自行处理
  - 写需求 → `Skill({skill: 'req-writer'})`
  - 写 PRD → `Skill({skill: 'prd-writer'})`
  - 完成后回到 Step 0

**→ 追加 audit-trail.md：**

```markdown
## 节点①：需求确认
| 检查项 | 结果 | 证据 |
|--------|------|------|
| ① 功能描述 | Yes/No | {用户描述或为什么不清楚} |
| ② 输入输出 | Yes/No | {方法签名或为什么不清楚} |
| ③ 异常场景 | Yes/No | {边界列表或为什么不清楚} |
| **决策** | **明确/不明确** | **{理由}** |
| **路由** | **Step1 / req-writer / prd-writer** | **{依据}** |
```

---

### 规模判定（Step 0 之后，Step 1 之前）

三问全 Yes 后，判断需求规模：

| 特征 | 小需求 | 常规需求 |
|------|--------|----------|
| 功能范围 | 单类/单函数 | 多模块 |
| 异常场景 | ≤3 个 | >3 个 |
| 外部依赖 | 无 | 有 |

**小需求**（全中）→ 简化模式：trd-writer 产出一个合并 spec 文件，跳过 plan 审查，Step 2 自动 Path B。

**常规需求** → 标准流程。

追加 audit-trail：`## 规模判定 | 小需求/常规 | {依据}`

---

### Step 1：TRD 产出

```
Skill({skill: 'trd-writer'})
```

> trd-writer 内部自闭环：产出文档 → executing-plans 自审 → doc-reviewer (opus) 审查 → ≤2 次重审 → 返回 ✅/❌。

**无论规模大小，文件路径严格按 OpenSpec 和 Superpowers 规范。**

> **禁止将 OpenSpec 文档写入 `docs/{feature}/` 目录。**

trd-writer 返回后，读取 `design.md` Risks 和 `plan.md` 任务数。

- **✅** → Step 2
- **❌** → 回退 trd-writer，附带失败原因，≤2 次。超限 `⚠️ 人工介入`

**→ 追加 audit-trail.md：**

```markdown
## 节点②：TRD 产出
| 产出文件 | 路径 | 状态 |
|----------|------|------|
| proposal.md | {OpenSpec 规范路径} | ✅/已补齐/N/A |
| design.md | {OpenSpec 规范路径} | ✅ |
| specs/ | {OpenSpec 规范路径} | ✅ (N个capability) |
| plan.md | {Superpowers 规范路径} | ✅ |

### 自审结果（trd-writer 内部）
| 门禁 | 迭代次数 | 通过 |
|------|:--:|:--:|
| doc-reviewer (design) | N | ✅/❌ |
| doc-reviewer (specs) | N | ✅/❌ |
| doc-reviewer (plan) | N | ✅/❌ |
| needsHumanIntervention | true/false | — |

### 关键数据
| 指标 | 值 |
|------|------|
| riskLevel | 🟢low / 🟡medium / 🔴high |
| taskCount | N |
```

---

### Step 2：审核闸门

| 条件 | 路径 | 行为 |
|------|:--:|------|
| 🟢低风险 + ≤10 任务 | **B** | 自动跳过审核 |
| 🔴高风险 或 >10 任务 | **A** | 展示 TRD 摘要 → `AskUserQuestion` 人工确认 |
| 🟡中风险 | **?** | `AskUserQuestion` 用户决定 |

**→ 追加 audit-trail.md：**

```markdown
## 节点③：审核闸门
| 检查项 | 值 | 判定 |
|--------|------|------|
| riskLevel | 🟢/🟡/🔴 | 强制路径A / 不影响 |
| taskCount | N | >10 / ≤10 |
| 用户选择 | 审查/跳过/N/A | {AskUserQuestion结果或自动判定} |
| **决策** | **Path A / Path B** | **{综合理由：风险等级+任务数+用户选择}** |

### Path A 审核记录（如适用）
| 审核项 | 用户反馈 | 处理 |
|--------|---------|------|
```

---

### Step 3：TDD 编码

```
Skill({skill: 'coder'})
```

> coder 内部自闭环：派发 implementer 子 Agent → spec 合规审查 → code quality 审查 → code-reviewer (opus) 审查 → ≤2 次重审 → 返回 ✅/❌。

- **✅** → Step 3.5（运行时验证）
- **❌** → 回退 coder，附带失败原因，≤2 次
- **2 次仍不过** → `⚠️ 人工介入：[未解决问题列表]`

**→ 追加 audit-trail.md：**

```markdown
## 节点④：TDD 编码
| 产出 | 路径/数量 |
|------|------|
| 源文件 | {文件清单} |
| 测试文件 | {文件清单} |

### 测试结果
| 指标 | 值 |
|------|------|
| 测试总数 | N |
| 通过 | N |
| 失败 | 0 |

### 审查结果（coder 内部）
| 阶段 | 配置 | 迭代次数 | 通过 |
|------|------|:--:|:--:|
| spec 合规 | Skill | N | ✅/❌ |
| code quality | Skill | N | ✅/❌ |
| code-reviewer | opus | N | ✅/❌ |
| needsHumanIntervention | true/false | — |
```

---

### Step 3.5：运行时验证

**触发条件**：Step 3 全部 ✅ 后自动进入。

```
Skill({skill: 'verify'})
```

verify skill 按 diff 定位变更 → 找到 surface（CLI/API/GUI/库边界）→ 构建启动 → 驱动变更路径执行 → 捕获运行时证据 → 输出结构化报告。

编排器不干预 verify 内部流程，只接收最终报告。

| 报告结论 | 行为 |
|----------|------|
| ✅ PASS | → Step 4 |
| ❌ FAIL | → 回退 coder (Step 3)，附带 verify 报告中的失败步骤和观察 |
| ⛔ BLOCKED | → `⚠️ 人工介入：应用无法启动或变更不可达` |
| ⏭️ SKIP | → 记录跳过原因，直接 Step 4 |

FAIL 回退 ≤2 次，超限同 Step 3 升级规则。

**→ 追加 audit-trail.md：**

```markdown
## 节点④½：运行时验证
| 指标 | 值 |
|------|------|
| surface | {CLI/API/GUI/库边界} |
| claim | {从 diff 提取的功能声明} |
| verdict | PASS/FAIL/BLOCKED/SKIP |

### 验证步骤
| # | 结果 | 操作 | 观察 |
|---|:--:|------|------|
| 1 | ✅/❌/⚠️/🔍 | {在运行中的应用上做了什么} | {应用输出/截图路径} |

### 探测（Probe）
| # | 结果 | 探测内容 | 观察 |
|---|:--:|------|------|
| 1 | 🔍 | {离开 happy path 的尝试} | {应用反应} |

### 发现
{运行时观察到的摩擦、意外、环境问题。空则写"无"}

### 判定
| 决策 | 依据 |
|------|------|
| 继续→Step4 / 回退Step3 / ⚠️人工介入 | {理由} |
```

---

### Step 4：E2E 验收

```
Skill({skill: 'e2e-validator'})
```

> e2e-validator 内部自闭环：规则拆解 → 逐条验收 → doc-reviewer (opus) 审查验收报告 → ≤2 次重审 → 返回 ✅/❌。

完成后判断：
- **✅** → Step 5
- **❌** → `AskUserQuestion` 根因分类：编码→回退 Step 3 / 设计→回退 Step 1 / 需求→回退 Step 0。同问题复现自动升级根因，最多 2 次。

**→ 追加 audit-trail.md：**

```markdown
## 节点⑤：E2E 验收
| 指标 | 值 |
|------|------|
| 规则总数 | N |
| ✅ 通过 | N |
| ❌ 未通过 | N |
| ⚠️ 需确认 | N |
| allPassed | true/false |

### 审查结果（e2e-validator 内部）
| doc-reviewer 迭代次数 | 通过 |
|:--:|:--:|
| N | ✅/❌ |

### 验收判定（如存在 ❌）
| 决策 | 根因 | 处理 |
|------|------|------|
| 回退 | 编码/设计/需求 | → Step3/Step1/Step0 |
| 升级 | N次 | {升级理由} |
```

---

### Step 5：归档

验收通过 + 代码已提交后：

**OpenSpec 层**：`Skill({skill: 'openspec-archive-change'})`

```bash
date=$(date +%Y%m%d)
mkdir -p ./docs/archive/$date/{feature}
cp ./docs/{feature}/requirement.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
cp ./docs/{feature}/e2e-report.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
cp ./docs/{feature}/audit-trail.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
cp ./docs/superpowers/plans/{feature}.md ./docs/archive/$date/{feature}/plan.md 2>/dev/null || true
rm -rf ./docs/{feature}
```

最后 `AskUserQuestion`：是否规划下期？是→从遗留问题提取需求回到 Step 0。

**→ 追加 audit-trail.md：**

```markdown
## 节点⑥：归档确认
| 检查项 | 结果 | 证据 |
|--------|:--:|------|
| e2e allPassed | ✅ | e2e-report.md |
| 代码已提交 | ✅/跳过 | git status |
| OpenSpec 归档 | ✅ | {OpenSpec 规范路径} |
| 文档归档 | ✅ | {归档路径} |
| 归档时间 | {timestamp} | — |
```

---

## 编排器职责

每个 Skill 返回后向用户展示（禁止只写"完成"）：

```
📦 [Skill名] 完成
产出: ✅ file1 ✅ file2
自审: {门禁名} N次 → ✅/⚠️
决定: [路径/回退] 依据: {条件}
```

---

## 需求变更

| 级别 | 判断 | 处理 |
|------|------|------|
| 轻量 | 不改变接口/规则/范围 | 直接修改文档 |
| 中度 | 影响当前阶段输入 | 回退到当前 Step |
| 重度 | 改变核心需求 | 回到 Step 0 |

`AskUserQuestion` 确认级别。追加 audit-trail：`## 需求变更 | 级别 | 影响 | 处理 | 用户确认`。

---

## 关键规则

1. `{feature}` 必须显式传入每个 Skill
2. **质量门禁在节点内部自闭环**：doc-reviewer / code-reviewer 由各 Skill 自行调用，编排器不介入
3. **编排器只看结果**：每个 Skill 返回 ✅/❌，编排器做闸门决策（通过/回退/升级）
4. **故障回退升级**：每阶段 ≤2 次回退。超限输出 `⚠️ 人工介入：[未解决问题列表]`。故障回退升级最多 2 次
5. Skill 返回 `⚠️ 人工介入` 时暂停，告知用户
6. **audit-trail 实时追记**：每个 Step 完成后立即追加，不依赖事后回忆。含决策逻辑（为什么这么判）、输入证据（文件路径）、输出结果（数据点）
7. 中文沟通，文件按 OpenSpec 和 Superpowers 规范分离
8. `{feature}` 英文 kebab-case ≤4 单词
