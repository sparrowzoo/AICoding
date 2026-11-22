# 研发工作流的邮件通知

<a id="notify"></a>
## 邮件通知规则

用户已明确授权收件人、用途和信息范围时，工作流在以下时机通过 [task-monitor](../SKILL.md) 统一维护的 `scripts/send-email.py` 向 `zh_harry@163.com` 发送通知（发件人 `server@sparrowzoo.com`，密码读环境变量 `email_password`，不写入仓库）。规则适用于工作流全部技能（prd-writer、trd-writer、coder、e2e-validator），只在此处维护，下游技能引用本节。

| 时机 | 触发条件 | 行为 |
|---|---|---|
| 复杂需求提醒 | 分流判定为「复杂」时，在进入设计前 | 发邮件说明复杂依据，**停下等待用户确认**；确认只授权开始相应设计环节，后续交接仍遵守阶段门禁 |
| 任务失败两次 | 同一任务连续两次未能通过验证或被打回（未形成有效 RED、GREEN 未达、审查未过、验收打回；TDD 中符合预期的有效 RED 不计失败） | 发邮件说明失败原因与下一步，该任务标 `blocked` 并**停下等待用户确认**，其余独立且已授权的任务继续 |
| 全部完成 | 全部任务结束并完成最终验收后 | 发邮件汇总：任务状态计数、未决项、commit/push/merge 状态，指向 task-status.md 与 evidence.md |

发送命令（在项目根执行，正文可作参数或用 stdin 传入）：

```sh
python3 .agents/skills/task-monitor/scripts/send-email.py "主题" "正文"
```

各阶段的交付授权不因邮件表未单列而省略；邮件只在上述时机发送，不为每次普通交接增加邮件。发送失败不阻塞其它已授权工作，但须在 `evidence.md` 记录发送失败与原因；「停下等待用户确认」的时机在用户确认前不继续对应部分。
