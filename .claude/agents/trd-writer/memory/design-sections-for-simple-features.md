---
name: design-sections-for-simple-features
description: 简单功能（单类工具函数）的 design.md 必备章节
metadata:
  type: reference
---

对于类似 MultiplyFunction 的简单单类功能，design.md 必须包含：
1. **Context** — 技术背景、现有约束、设计目标
2. **Decisions** — 关键决策（模式选型、实现策略、包组织、测试策略），含替代方案对比表格
3. **Data Model** — 无数据模型时注明"本次变更不涉及" 
4. **API/Contracts** — 精确方法签名、参数约束表、返回值语义、错误/异常说明
5. **Flows** — 核心调用流程（文字描述 + 决策点分析）
6. **Risks / Trade-offs** — 每项风险含"影响"和"缓解措施"

设计文档基于 proposal.md 或用户提示词中的事实和 Capabilities，追溯所有 AC。无 proposal.md 时从用户需求直接提取。
