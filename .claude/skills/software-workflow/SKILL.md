---
name: software-workflow
description: 研发工作流入口——将 TRD 技术设计到 TDD 编码到 E2E 验收的研发流程串联编排，最后归档。requirement 和 PRD 由业务/产品团队通过 req-writer 和 prd-writer 产出，不走自动化编排。
triggers:
  - software-workflow
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

你是研发工作流编排器。按决策树将各阶段委托给专职 Agent，人机交互点用 AskUserQuestion。**每步决策必须实时追加到 audit-trail.md，附完整决策逻辑和证据。**

## 角色与模型策略

| 角色 | 类型 | 模型 | superpowers | 职责 |
|------|------|:--:|------|------|
| req-writer | Agent | inherit | — | 写业务需求文档 |
| prd-writer | Agent | inherit | — | 写产品方案 |
| trd-writer | Agent | inherit | executing-plans, verification-before-completion | 产出 design + specs + plan |
| **doc-reviewer** | **Agent** | **opus** | — | 独立文档审查 |
| coder | Agent | inherit | test-driven-development, systematic-debugging, verification-before-completion | TDD RGB 编码 |
| **code-reviewer** | **Agent** | **opus/sonnet** | — | 独立代码审查 |
| e2e-validator | Agent | inherit | verification-before-completion | 端到端业务验收 |

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
  - 写需求 → `Agent({agentType: 'req-writer'})`
  - 写 PRD → `Agent({agentType: 'prd-writer'})`
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

**小需求**（全中）→ 简化模式：trd-writer 产出一个合并 spec 文件即可，doc-reviewer 只审 design+spec 两个（不审 plan），audit-trail 仅记录关键数据点。Step 2 自动 Path B。

**常规需求** → 标准流程。

追加 audit-trail：`## 规模判定 | 小需求/常规 | {依据}`

---

### Step 1：TRD 产出

```
Agent({agentType: 'trd-writer', description: '产出TRD文档链', prompt: '{小需求则注明：简单功能，合并spec单文件，精简design}'})
```

trd-writer 内部：产出 design/specs/plan → executing-plans 自审 plan.md → doc-reviewer Agent (opus) 审查（小需求精简为 1×design+spec，常规并行 3×全审）→ verification-before-completion 交付验证。

完成后读取 `design.md` Risks 和 `plan.md` 任务数。

**→ 追加 audit-trail.md：**

```markdown
## 节点②：TRD 产出 (Agent: trd-writer)
| 产出文件 | 路径 | 状态 |
|----------|------|------|
| proposal.md | openspec/changes/{f}/proposal.md | ✅/已补齐/N/A |
| design.md | openspec/changes/{f}/design.md | ✅ |
| specs/ | openspec/changes/{f}/specs/ | ✅ (N个capability) |
| plan.md | docs/superpowers/plans/{f}.md | ✅ |

### 门禁结果
| 门禁 | 迭代次数 | 通过 |
|------|:--:|:--:|
| doc-reviewer (design) | N | ✅/❌ |
| doc-reviewer (specs) | N | ✅/❌ |
| doc-reviewer (plan) | N | ✅/❌ |

### 关键数据
| 指标 | 值 |
|------|------|
| riskLevel | 🟢low / 🟡medium / 🔴high |
| taskCount | N |
| needsHumanIntervention | true/false |
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
Agent({agentType: 'coder', description: 'TDD RGB编码'})
```

coder 内部：Red→Blue→Green，每阶段 code-reviewer Agent 独立审查，Green 并行 3×审查 (2 opus + 1 sonnet)。

**→ 追加 audit-trail.md：**

```markdown
## 节点④：TDD 编码 (Agent: coder)
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
| 覆盖率 | X% |

### 门禁结果
| 阶段 | code-review 迭代 | 通过 |
|------|:--:|:--:|
| Red | N | ✅/❌ |
| Green | N | ✅/❌ |
| needsHumanIntervention | true/false | — |
```

---

### Step 4：E2E 验收

```
Agent({agentType: 'e2e-validator', description: 'E2E业务验收'})
```

e2e-validator 内部：规则拆解→逐条验收→输出报告 → doc-reviewer Agent (opus) 审查。

完成后读 `./docs/{feature}/e2e-report.md`：
- **全部 ✅** → Step 5
- **存在 ❌** → `AskUserQuestion` 根因分类：编码→回退 Step 3 / 设计→回退 Step 1 / 需求→回退 Step 0。同问题复现自动升级根因，最多 2 次。

**→ 追加 audit-trail.md：**

```markdown
## 节点⑤：E2E 验收 (Agent: e2e-validator)
| 指标 | 值 |
|------|------|
| 规则总数 | N |
| ✅ 通过 | N |
| ❌ 未通过 | N |
| ⚠️ 需确认 | N |
| allPassed | true/false |

### 门禁结果
| 门禁 | 迭代次数 | 通过 |
|------|:--:|:--:|
| doc-reviewer | N | ✅/❌ |

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
**业务层**：
```bash
date=$(date +%Y%m%d)
mkdir -p ./docs/archive/$date/{feature}
cp ./docs/{feature}/requirement.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
cp ./docs/{feature}/e2e-report.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
cp ./docs/{feature}/audit-trail.md ./docs/archive/$date/{feature}/ 2>/dev/null || true
cp docs/superpowers/plans/{feature}.md ./docs/archive/$date/{feature}/plan.md 2>/dev/null || true
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
| OpenSpec 归档 | ✅ | openspec/changes/archive/{date}-{feature}/ |
| 业务层归档 | ✅ | docs/archive/{date}/{feature}/ |
| 归档时间 | {timestamp} | — |
```

---

## 编排器职责

每个 Agent 返回后向用户展示（禁止只写"完成"）：

```
📦 [Agent名] 完成
产出: ✅ file1 ✅ file2
审查: {门禁名} N次 → ✅/⚠️
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

1. `{feature}` 必须显式传入每个 Agent 的 prompt
2. **质量门禁**：每阶段审查 ≤2 次重审。超限输出 `⚠️ 人工介入：[未解决问题列表]`。故障回退升级最多 2 次
3. Agent 返回 `⚠️ 人工介入` 时暂停，告知用户
4. **audit-trail 实时追记**：每个 Step 完成后立即追加，不依赖事后回忆。含决策逻辑（为什么这么判）、输入证据（文件路径）、输出结果（数据点）
5. 中文沟通，文件三层分离
6. `{feature}` 英文 kebab-case ≤4 单词
