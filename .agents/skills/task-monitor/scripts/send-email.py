#!/usr/bin/env python3
"""发送工作流通知邮件（QQ 企业邮箱 SMTP，smtp.exmail.qq.com:465 SSL）。

用法:
  python3 send-email.py "<主题>" "<正文>"
  # 正文也可从 stdin 读入：
  printf '%s' "<正文>" | python3 send-email.py "<主题>"

密码从环境变量 email_password 读取；缺失或发送失败时以非零码退出，
并在 stderr 输出原因。不把密码写入仓库。
"""
import os
import smtplib
import sys
from email.header import Header
from email.mime.text import MIMEText
from email.utils import formataddr

SMTP_HOST = "smtp.exmail.qq.com"
SMTP_PORT = 465
FROM_ADDR = "server@sparrowzoo.com"
FROM_NAME = "AI Coding 工作流"
TO_ADDR = "zh_harry@163.com"


def main(argv):
    if len(argv) < 2:
        sys.stderr.write("用法: send-email.py <主题> [正文]\n")
        return 2

    subject = argv[1]
    body = argv[2] if len(argv) > 2 else sys.stdin.read().strip()
    password = os.environ.get("email_password")
    if not password:
        sys.stderr.write("缺少环境变量 email_password\n")
        return 3

    msg = MIMEText(body or "", "plain", "utf-8")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = formataddr((FROM_NAME, FROM_ADDR))
    msg["To"] = TO_ADDR

    server = None
    try:
        server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=30)
        server.login(FROM_ADDR, password)
        server.sendmail(FROM_ADDR, [TO_ADDR], msg.as_string())
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"发送失败: {exc}\n")
        return 1
    finally:
        if server is not None:
            try:
                server.quit()
            except Exception:  # noqa: BLE001
                pass
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
