---
name: plan-superpowers-format
description: plan.md 的 Superpowers Plan 格式——独立于 OpenSpec tasks.md，Header + TDD Task 拆分
metadata:
  type: reference
---

plan.md 使用 Superpowers Plan 格式（独立于 OpenSpec tasks.md）。结构包含：
- Header：Goal（一句话）、Architecture（2-3 句）、Tech Stack
- Task N：Component Name + Files（Create/Modify/Test 精确路径）
- 每个 Step 是 TDD 子步骤：RED 测试（完整代码）→ BLUE 实现（完整代码）→ GREEN 验证（精确命令）
- 每步 2-5 分钟可完成
- 必须包含完整代码块，无 TBD/TODO
- 最终 Task 是 Git commit

**Why:** plan.md 为 Superpowers 体系产物，与 OpenSpec tasks.md 独立——不替代，各自存在
**How to apply:** 创建 plan.md 到 `docs/superpowers/plans/{feature}.md`，不创建 tasks.md。
