---
name: clean-project
description: Use when you need to clean the project — remove all files except .claude/, .agents/, .gitignore and .git/. Triggered by "清空项目", "清理项目", "clean project".
---

# 清空项目

删除项目根目录下所有文件和目录，保留 `.claude/`、`.agents/`、`.gitignore` 和 `.git/`。

## 执行

```bash
./.claude/skills/clean-project/clean.sh
```

脚本会先列出待删除内容，确认后执行。加 `-y` 跳过确认。
