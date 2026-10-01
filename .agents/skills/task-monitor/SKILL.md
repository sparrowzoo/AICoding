---
name: task-monitor
description: Use when the session runs unattended under --dangerously-skip-permissions (marked by CLAUDE_UNATTENDED=1), where no human reviews each tool call, so the user must be notified at key checkpoints and failures instead of permission prompts.
---

# 任务监控（无人值守模式）

## 执行边界

本 skill 仅在无人值守模式生效：会话由 `claude --dangerously-skip-permissions` 启动、并由环境变量 `CLAUDE_UNATTENDED=1` 标记，经 SessionStart hook 注入本规则。有人在看的普通会话不启用监控。

核心原则：无人值守时没有逐次权限确认，AI 在**关键节点**主动提醒用户，其余时间自主推进（“让 AI 自己跑”）；失败或不可逆操作前停下等确认。

## 关键节点

| 时机 | 触发条件 | 行为 |
|---|---|---|
| 开始执行 | 明确任务目标与范围后 | 邮件通知：本轮目标、范围、步骤/任务数、分支与基线 |
| 复杂或高风险 | 判定复杂，或面临不可逆操作（删除、覆盖、force push、合并、部署等） | 邮件说明依据 + **停下等待确认** |
| 连续失败两次 | 同一任务连续两次失败或被打回 | 邮件说明原因与下一步 + 标记受阻 + **停下等待确认** |
| 全部完成 | 全部任务结束并完成验收 | 邮件汇总：任务状态计数、未决项、commit/push/merge 状态 |

非关键节点不打扰用户，AI 自主推进。「停下等待确认」的节点在用户确认前不继续对应部分，其余独立工作继续。

## 通知方式

通过本 skill 自带的 `scripts/send-email.py` 发送邮件（发件人 `server@sparrowzoo.com` → `zh_harry@163.com`，密码读环境变量 `email_password`，不写入仓库）：

```sh
python3 .agents/skills/task-monitor/scripts/send-email.py "主题" "正文"
```

正文可作参数或用 stdin 传入。发送失败不阻塞其它已授权工作，但须在证据中记录失败与原因。

## 红线（STOP）

- 无人值守模式下跳过「开始执行」通知就往下做
- 不可逆操作前不通知、不等待确认
- 连续失败仍机械重跑，不通知用户
- 全部完成不发汇总
- 把普通会话（未标记 `CLAUDE_UNATTENDED`）也套用监控

## 维护

- 通知规则初版沿用 develop-work-flow 的邮件通知规则，后续在本文档独立迭代补充。
- 邮件脚本由本 skill 统一维护（职责单一）；develop-work-flow 通过同一脚本发送其通知，路径引用本 skill 的脚本。
- 本 skill 与其它 skill 一样在 AICoding 仓库统一维护、Git 提交与 GitHub 同步。
