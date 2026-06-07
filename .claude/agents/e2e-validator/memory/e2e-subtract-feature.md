---
name: e2e-subtract-feature
description: E2E validation pattern for subtract feature in basic-math project
metadata:
  type: project
---

E2E validated subtract feature (2026-06-05) for the basic-math project, a Java/Maven library at `/home/harry/AICoding/basic-math/`. Followed the pattern: design.md + specs/ as validation basis (no requirement.md or proposal.md existed). The code is a single-method utility class `SubtractFunction.subtract(int, int)` following `AddFunction`'s `public final class` + `private` constructor + `public static` method pattern.

**Key verification results:**
- All 6 business rules passed (R-001 through R-006)
- 16/16 tests passed, 0 failures, 0 errors
- Overflow behavior (R-004) takes precedence over a<b negative result (R-003) at the boundary `MIN_VALUE - 1` -- this is a deliberate design choice matching Java int semantics
- Minor gap: no explicit test for `subtract(0, 0)` -- logged as 🟡 improvement

**Pattern learned for future E2E validations:**
- When overflow semantics exist, always cross-reference "normal behavior" rules (e.g., "a < b -> negative") against overflow behavior to identify implicit rule conflicts
- Zero-value boundaries (0 - 0) should have explicit test cases, not just implied coverage
- Utility class structural tests (final, private constructor, public static) should use reflection to verify
- When no requirement.md exists, design.md's "业务规则摘要" table is the authoritative source
- docs/e2e-report.md always goes into `./docs/{feature}/`

Related: [[basic-math-project-structure]]
