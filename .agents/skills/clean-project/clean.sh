#!/usr/bin/env bash
# 清空项目 — 保留 .claude/ .git/，删除其余所有文件和目录
set -euo pipefail

PROJECT_DIR="${1:-.}"

cd "$PROJECT_DIR"

echo "=== 待删除 ==="
find . -maxdepth 1 -not -name '.claude' -not -name '.agents' -not -name '.git' -not -name 'pom.xml' -not -name '.gitignore' -not -name '.' -not -name '..' | sort

if [[ "${2:-}" == "-y" ]]; then
    echo "=== 执行清理 ==="
    find . -maxdepth 1 -not -name '.claude' -not -name '.agents' -not -name '.git' -not -name 'pom.xml' -not -name '.gitignore' -not -name '.' -not -name '..' -exec rm -rf {} +
    echo "=== 清理后 ==="
    ls -la
    echo "✓ 完成"
else
    read -r -p "确认删除以上内容? [y/N] " answer
    if [[ "$answer" =~ ^[Yy] ]]; then
        echo "=== 执行清理 ==="
        find . -maxdepth 1 -not -name '.claude' -not -name '.agents' -not -name '.git' -not -name 'pom.xml' -not -name '.gitignore' -not -name '.' -not -name '..' -exec rm -rf {} +
        echo "=== 清理后 ==="
        ls -la
        echo "✓ 完成"
    else
        echo "已取消"
    fi
fi
