#!/usr/bin/env bash
# task-monitor SessionStart hook：无人值守模式（--dangerously-skip-permissions）下注入监控规则。
# 输出 Claude Code 期望的 JSON 格式（hookSpecificOutput.additionalContext）。

LOG="/tmp/task-monitor-hook.log"
printf '%s hook-ran CLAUDE_UNATTENDED=%s\n' "$(date '+%H:%M:%S')" "${CLAUDE_UNATTENDED:-<unset>}" >> "$LOG"

if [ -z "${CLAUDE_UNATTENDED:-}" ]; then
  exit 0
fi

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"<system-reminder>当前会话处于 --dangerously-skip-permissions 无人值守自动工作模式（CLAUDE_UNATTENDED=1）。必须加载 task-monitor skill，并在关键节点提醒用户、失败或不可逆操作前停下等待确认。</system-reminder>"}}\n'
exit 0
