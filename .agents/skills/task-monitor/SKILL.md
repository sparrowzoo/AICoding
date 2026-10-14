---
name: task-monitor
description: Use when the session runs unattended under --dangerously-skip-permissions (marked by CLAUDE_UNATTENDED=1) to notify the user at key checkpoints and failures while preserving stage and operation authorization.
---

# 任务监控（无人值守模式）

## 执行边界

本 skill 仅在无人值守模式生效：会话由 `claude --dangerously-skip-permissions` 启动、并由环境变量 `CLAUDE_UNATTENDED=1` 标记，经 SessionStart hook 注入本规则。有人在看的普通会话不启用监控。

触发依赖：启动脚本 `claude-by-pass-startup.sh` 导出 `CLAUDE_UNATTENDED=1`；SessionStart hook 配置在**用户全局** `~/.claude/settings.json`，通过绝对路径调用本 skill 的 `scripts/session-start.sh`。该脚本检测到 `CLAUDE_UNATTENDED` 时输出 Claude Code 期望的 JSON 注入格式（`hookSpecificOutput.additionalContext`，**不是纯文本**，纯文本不会被注入）。注意：`.agents/settings.json` 经 `.claude → .agents` 软链接不会被读取，hook 配置不能放共享目录，只能放用户全局。

核心原则：无人值守关闭的是工具级逐次权限提示，不扩大用户授权。AI 仅在**当前已授权环节与范围内**自主推进，并在关键节点提醒用户；[环节交付与授权](../develop-work-flow/SKILL.md#stage-authorization)、[重大设计边界确认](../develop-work-flow/SKILL.md#design-boundary)和[环境操作授权](../develop-work-flow/SKILL.md#environment-authorization)统一遵守主工作流，不因无人值守而豁免。同一对象与范围的有效授权直接复用，新增或改变范围时确认受影响部分。

## 关键节点

| 时机 | 触发条件 | 行为 |
|---|---|---|
| 开始执行 | 明确任务目标与范围后 | 邮件通知：本轮目标、范围、步骤/任务数、分支与基线 |
| 复杂或高风险 | 判定复杂，或面临不可逆操作（删除、覆盖、force push、合并、部署等） | 邮件说明依据；缺少对应对象与范围的有效授权时，**停下等待确认** |
| 连续失败两次 | 同一任务连续两次失败或被打回 | 邮件说明原因与下一步 + 标记受阻 + **停下等待确认** |
| 全部完成 | 全部任务结束并完成验收 | 邮件汇总：任务状态计数、未决项、commit/push/merge 状态 |

非上述邮件节点不额外发送邮件；各环节交付仍须报告结论、产物与下一环节范围，并按公共规则取得授权，不能因未列入邮件表而跳过。需要等待确认时不继续对应部分，其余独立工作仅在各自已授权范围内继续；邮件通知不代表用户批准。

## 通知方式

通过本 skill 自带的 `scripts/send-email.py` 发送邮件（发件人 `server@sparrowzoo.com` → `zh_harry@163.com`，密码读环境变量 `email_password`，不写入仓库）：

```sh
python3 .agents/skills/task-monitor/scripts/send-email.py "主题" "正文"
```

正文可作参数或用 stdin 传入。发送失败不阻塞其它已授权工作，但须在证据中记录失败与原因。

## 红线（STOP）

- 无人值守模式下跳过「开始执行」通知就往下做
- 不可逆操作前未按规则通知，或缺少有效授权仍继续
- 连续失败仍机械重跑，不通知用户
- 全部完成不发汇总
- 把普通会话（未标记 `CLAUDE_UNATTENDED`）也套用监控

## 维护

- 本文维护无人值守通知时机，授权边界引用主工作流，不另设自主执行豁免。
- 邮件脚本由本 skill 统一维护（职责单一）；develop-work-flow 通过同一脚本发送其通知，路径引用本 skill 的脚本。
- 本 skill 与其它 skill 一样在 AICoding 仓库统一维护、Git 提交与 GitHub 同步。
