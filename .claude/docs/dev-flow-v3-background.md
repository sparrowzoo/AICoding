# dev-flow-v3 背景与设计

> 记录「为什么要有 V3」以及设计决策。配套实现见 `.claude/skills/dev-flow-v3/SKILL.md`。

---

## 一、为什么要有 V3

研发工作流经历了三个版本：

### v1：markdown 决策树（`dev-work-flow`）

- 纯 SKILL.md 写编排，靠 Claude 原生执行。
- **能跑**，但重试次数、闸门规则、回退逻辑全靠 Claude 自觉遵守，无强制。

### v2：脚本驱动（`dev-flow-v2` + `pipeline.js`）

- 想把编排写成确定性 JS 脚本（`pipeline.js`），用 `Workflow({scriptPath})` 执行。
- **问题**：`pipeline.js` 依赖一个「Workflow 脚本运行时」（注入 `agent()`/`pipeline()`/`parallel()`/`log()`/`phase()`/`args` 这些全局），**这个运行时从未被实现**。
- **后果**：脚本是死代码，`Workflow({scriptPath})` 无法执行，实际还是编排器手动跑。

### 结论

需要一版「**用原生工具、真正能跑、又保留 v2 改进逻辑**」的编排 → **V3**。

---

## 二、核心技术判断

`pipeline.js` 里最难的 `agent()` 要做的是「派一个能读文件、跑 bash、调 skill 的子 agent」。

**这个能力只有 Claude Code 宿主本身有**，外部运行时复刻不了：

- Node 脚本 / MCP server 可以跑 JS，但「派带工具权限的子 agent」做不到（MCP 的 `sampling` 只是一次 LLM 调用，不是完整 agent）。

所以「实现一个能真跑 pipeline.js 的运行时」不划算——正确做法是把编排逻辑**用原生工具直接表达**。

---

## 三、方案对比（三选一，选 A）

| 方案 | 做法 | 评价 |
|------|------|------|
| **A. SKILL.md 原生编排** ✅ | 用原生 `Skill`/`Agent` 工具跑编排 | 工作量小、可靠、已验证可跑 |
| B. Node 运行时 + claude CLI | `agent()` 内部 shell 调 `claude -p` | 能落地但子 agent 是独立进程、慢、上下文不共享 |
| C. 插件/MCP 提供 Workflow 工具 | 注册一个能派子 agent 的工具 | 最正规但依赖插件 API，不确定可行 |

**选 A**：`agent()` 的核心能力原生就有，再包一层 JS 是重复造轮子。

---

## 四、V3 与 v1/v2 的关系

| 来源 | 继承了什么 |
|------|-----------|
| v1（`dev-work-flow`） | 原生 markdown 编排骨架、audit-trail 证据链、需求确认三问 |
| v2（`dev-flow-v2`） | 改进逻辑：`needsHuman` 人工介入、`rootCause` 根因回退、重试携带审查意见、commit 闸门、规模判定、审核闸门 |
| **去掉** | 对 `pipeline.js` / `Workflow` 运行时的依赖 |

---

## 五、V3 设计要点：原生工具如何替代脚本

| pipeline.js 里的东西 | V3 原生替代 |
|----------------------|-------------|
| `agent(prompt, {schema})` | `Agent` 工具（`subagent_type: general-purpose`），prompt 要求返回结构化 JSON |
| `pipeline(items, ...stages)` | SKILL.md 里顺序执行，每步查 ✅/❌ |
| `parallel(thunks)` | 一条消息里并行发多个 `Agent` 调用 |
| `args` | SKILL.md 的入参 |
| `log`/`phase` | Claude 自己的进度输出 |
| schema 强校验 + 重试补齐 | prompt 里写死返回字段 + 编排器读结果时校验，缺字段就让子 agent 重来 |

### 完整流程

```
Step 0   需求确认（三问：功能/输入输出/异常）
Step 0.5 规模判定（小需求 → 跳审核闸门）
Step 1   TRD 产出（Skill: trd-writer → 返回 riskLevel/taskCount）
Step 2   审核闸门（riskLevel × taskCount → Path A 人工确认 / B 自动跳过）
Step 3   TDD 编码（Skill: coder → 返回测试通过/审查通过）
Step 4   运行时验证（Skill: verify → PASS/FAIL/BLOCKED/SKIP）
Step 5   E2E 验收（Skill: e2e-validator → success + rootCause）
Step 6   根因回退（code/design/requirement → 回不同阶段）
Step 7   归档（commit 闸门 + OpenSpec 归档 + docs 归档）
```

---

## 六、关键规则（一页记住）

1. **不依赖 Workflow 运行时**——全部用原生 `Skill`/`Agent`/`AskUserQuestion` 工具。
2. **质量门禁在各 skill 内部自闭环**（doc-reviewer / code-reviewer），编排器只看 ✅/❌。
3. **重试 ≤2 次，超限 → `needsHuman` 人工介入**；E2E 失败按 `rootCause` 回退。
4. **audit-trail 实时追记**每步决策 + 证据。
5. `feature` 英文 kebab-case ≤4 单词，中文沟通。
