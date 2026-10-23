# develop-work-flow 路径问题修复与验证报告

## 1. 结论与版本

**F02、F03 已修复，58 项脚本测试全部通过。本次已知四项问题全部关闭，按原评分口径为 100/100。** 该分数限于本轮已检查范围，不代表真实需求从设计到发布的完整流程已经演练通过。

日期：2026-10-23。对象：AICoding 当前工作区；Git 基线 `27fb650dc7b0b5235801157e34638b8c19cf902e`，实际文件版本以[源文件 SHA-256 清单](evidence/develop-work-flow-v3/source-manifest.json)为准。v3 是报告轮次；承接 [v2](report-v2-develop-work-flow-review.md)，历史报告保留当时事实，当前修复状态以本报告为准。

授权依据：用户要求“先修复2 3项吧 快速修复，这个功能不复杂”。本轮仅修改两个脚本及其测试，主代理完成实现、自审与验证，没有额外分派代理，也没有修改业务代码或 `my`。

## 2. 修复落点

| 问题 | 修复 | 验证结果 |
|---|---|---|
| F02：依赖安装目录保护不完整 | [setup.mjs](../skills/develop-work-flow/scripts/setup.mjs) 第 12—39 行：保护整个共享 `.agents/` 源目录；从最近存在的父目录解析真实位置，拒绝通过软链接进入源目录，检查先于创建、复制和 npm 调用 | 源目录内已有/不存在的目标、父软链接、失效父软链接，以及软链接后的 `..` 均覆盖；失败时不写清单、不调用 npm；正常独立目录仍可安装或刷新 |
| F03：Git 目录大小写绕过 | [workflow.mjs](../skills/develop-work-flow/scripts/workflow.mjs) 第 65、82 行：路径分段统一按小写比较 `.git` | files 和 design 中的 `.git`、`.GIT`、`.Git` 均拒绝；`.github` 任务及设计路径正常通过 |

回归用例位于 [workflow.test.mjs](../skills/develop-work-flow/scripts/workflow.test.mjs)。安装测试使用临时技能副本及假 npm，仅记录调用，不访问网络或安装真实依赖；Git 路径测试使用临时项目，不接触真实仓库内部数据。

解析软链接后的 `..` 使用 `fs.realpathSync.native`，避免先做字符串路径归一化而改变实际文件系统指向。该分支已用实际测试验证。

## 3. 实际验证

在 `develop-work-flow/scripts/`、Node `v24.22.0` 下执行：

```sh
node --test --test-name-pattern='Git directory|setup rejects dependency|setup resolves existing parent|setup rejects dangling parent|setup permits a new external' workflow.test.mjs
node --test workflow.test.mjs
```

- 修改实现前：新增的首批 6 项测试中 3 项按预期失败，复现两类路径缺口；[失败证据](evidence/develop-work-flow-v3/workflow-tests-red.log)。
- 修复后：最终完整回归 **58/58 通过，0 失败、0 跳过**；[最终日志](evidence/develop-work-flow-v3/workflow-tests-green.log)。
- `git diff --check` 通过；相对 v2 源文件清单，只改变已授权的两个脚本和测试文件。
- 自审核对检查顺序、路径解析、正常目录兼容及测试中的实际副作用；本轮是主代理自审，不冒称独立验收。

## 4. 评分与未验证范围

| 评分项 | 满分 | 当前分数 | 依据 |
|---|---:|---:|---|
| 流程职责与阶段衔接 | 30 | 30 | 沿用 v2 已修正的 F04，本轮规则未变 |
| 规则一致性与唯一来源 | 25 | 25 | 沿用 v2 已修正的 F01，本轮规则未变 |
| 脚本能力与操作边界 | 25 | 25 | F02、F03 修复并通过回归，解除原 8 分扣分 |
| 验证、追溯与返工恢复 | 20 | 20 | 既有用例及新增路径用例全部通过 |
| **总分** | **100** | **100** | **本轮范围内无剩余已确认问题** |

未进行真实 npm 网络安装、多操作系统运行、通知投递或真实业务需求到发布的完整演练；本次没有执行 Maven，也没有提交、推送或部署。上述未验证范围与先前报告一致，不将其描述为已通过。

## 5. 评审结论

本轮快速修复及相关回归完成，F02、F03 已关闭；主代理自审在本轮范围内无剩余发现，当前评分 100/100。用户授权的脚本修复已完成；后续业务开发、完整流程演练及 Git 发布动作不由本次修复自动授权。
