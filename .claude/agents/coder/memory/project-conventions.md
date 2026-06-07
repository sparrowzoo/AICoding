---
name: project-conventions
description: Project structure conventions for basic-math and similar features under the coder workflow
metadata:
  type: project
---

# Project Conventions

For `basic-math` and future features under the `coder` workflow:

- **Language**: Java 18 + Maven (JUnit 5 + AssertJ for testing)
- **Project root**: `{feature-name}/` as standalone Maven module (relative to workspace root)
- **Package**: `com.math` (adjust per feature domain)
- **Testing framework**: JUnit 5 + AssertJ (`assertThat(...).isEqualTo(...)`)
- **Coverage gate**: JaCoCo with LINE >= 80%
- **Input docs**: design.md + specs/ (`openspec/changes/{feature}/`) + plan.md (`docs/superpowers/plans/{feature}.md`)
- **TDD workflow**: Single path — design+specs+plan from trd-writer → Red → Blue → Green → Integration
- **TDD-RGB phases**: Red (test-first) -> Blue (design confirm) -> Green (minimal impl) -> Integration verification
- **Code review gate**: After each phase using the code-review skill
