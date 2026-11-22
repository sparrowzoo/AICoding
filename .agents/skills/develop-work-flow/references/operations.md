# Git 追溯

<a id="traceability"></a>
## 按任务查 Git 提交

提交采用 Conventional Commits，正文带本次任务 trailer，例如：

```text
feat(profile): reject empty display names

Task: req-r01-profile-git-user/T01
```

一个提交可包含紧密关联的多个任务并逐行记录 Task；不强制分别提交 RED 和 GREEN，不为凑记录提交破损代码。当前提交不把自身 hash 写回自身文件，避免循环更新。按 Git 解析出的 `Task` trailer 完整值查询，不使用子串 grep，避免 T10 命中 T100 或提交正文中的提及。例如在业务项目根查询 T10：

```sh
git log --all --format='%H%x09%(trailers:key=Task,valueonly,separator=%x09)' |
  awk -F '\t' -v target='req-r01-profile-git-user/T10' '{ for (i=2; i<=NF; i++) if ($i == target) { print $1; break } }'
```

命中表示该提交包含完整的任务 trailer，不代表已合并或部署；未命中时明确记录未找到对应提交，不伪造 hash。
