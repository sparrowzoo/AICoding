#!/usr/bin/env bash
# task-monitor SessionStart hook：无人值守模式（--dangerously-skip-permissions）下注入监控规则。
# 输出 Claude Code 期望的 JSON 格式（hookSpecificOutput.additionalContext）。

if [ -z "${CLAUDE_UNATTENDED:-}" ]; then
  exit 0
fi

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"<system-reminder>当前会话处于 --dangerously-skip-permissions 无人值守自动工作模式（CLAUDE_UNATTENDED=1）。必须加载 task-monitor skill；仅在当前已授权环节与范围内自主推进，环节交接、重大设计和环境操作仍遵守主工作流授权规则。关键节点按该 skill 提醒用户，需要确认时停下等待。</system-reminder>"}}\n'
exit 0
