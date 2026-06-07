---
name: feedback-rule-conflict-analysis
description: Doc-reviewer feedback on needing to analyze rule conflicts (R-003 vs R-004) in E2E reports
metadata:
  type: feedback
---

When two business rules have overlapping scope (e.g., R-003 "a < b -> negative" and R-004 "overflow wraps, no exception"), explicitly analyze their interaction at boundary conditions. Do NOT treat them as independent rules -- identify the implicit priority. In the basic-math subtract case, the design intentionally prioritizes overflow semantics (R-004) over the negative-result guarantee (R-003), but this priority is only visible when you examine `MIN_VALUE - 1` as both a R-003 and R-004 boundary simultaneously.

**Why:** Design documents often list rules independently without stating interaction priorities. The E2E report is the right place to surface these implicit trade-offs.

**How to apply:** For every pair of rules that share a boundary condition, add a "规则交互说明" paragraph in each rule's section with cross-references. Include at least one concrete example showing the interaction.
