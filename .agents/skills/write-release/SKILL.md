---
name: write-release
description: 仅用于 sparrow-js 项目；用户要求写发版说明、发版日志、版本发布记录或 changelog 时使用。触发词：发版、发版说明、发版日志、版本发布、release notes、release log、changelog。
---

# 写发版说明 write-release

把一次发版整理成站点上的发版说明页，并登记到发版记录页与首页页脚。产物是 `common/public/release-node/` 下的静态 HTML，加上 `common/public/release.html` 与首页页脚的登记。

## 每次发版做的事

1. **确认发版信息**：版本号，以及「自上次发版以来」的提交范围。
   - 有 tag：`git log <上一 tag>..HEAD`
   - 无 tag：用 `release.html` 顶部最新条目的日期作起点（`git log --since="<日期>"`），或由用户指定范围。
2. **汇总 git log**：把提交按「新增 / 修复 / 重构 / 其他」分组，提炼每组重点与影响面，去掉纯噪音提交（chore、无关 merge）。
3. **人工润色**：写一段摘要（这次发版解决了什么、对用户/开发者有何影响、有无升级或迁移注意）。
4. **写说明页**：复制 `references/template.html` 到 `common/public/release-node/<版本>.html`，填占位符，删除空分组。
5. **登记到 release.html**：在 `common/public/release.html` 列表顶部插入新条目（最新靠前），并去掉「暂无发版记录」占位。
6. **确保首页入口**（一次性，幂等）：`common/src/app/[locale]/_components/site-footer.tsx` 页脚 nav 应有指向 `/release.html` 的链接（文案 `t("nav.releases")`），缺失则补；`common/messages/website/zh.json` 与 `en.json` 应有 `nav.releases`（中「发版记录」/ 英「Release Notes」）。

## 文件与命名

| 内容 | 位置 | 说明 |
| --- | --- | --- |
| 发版说明页 | `common/public/release-node/<版本>.html` | 版本作文件名，如 `v1.2.3.html` |
| 发版记录页 | `common/public/release.html` | 列表索引，最新靠前，只维护 `<ol class="releases">` 内条目 |
| 首页入口 | `site-footer.tsx` 页脚 nav | 指向 `/release.html`，一次性配置，幂等 |

## 模板占位符

见 `references/template.html`，逐个替换并清除剩余 `{{…}}`：

| 占位符 | 填写 |
| --- | --- |
| `{{TITLE}}` | 标题，如「v1.2.3 发版说明」 |
| `{{DESCRIPTION}}` | 一句话摘要，用于 meta 与 og:description |
| `{{VERSION}}` / `{{DATE}}` | 版本 / 发布日期 `YYYY-MM-DD` |
| `{{SUMMARY_HTML}}` | 摘要段落 HTML |
| `{{CHANGES_HTML}}` | 分组后的变更明细（见下） |

`{{CHANGES_HTML}}` 用以下结构生成，只保留非空分组：

```html
<section class="group">
  <h3>新增功能</h3>
  <ul><li>…</li></ul>
</section>
<section class="group">
  <h3>问题修复</h3>
  <ul><li>…</li></ul>
</section>
<!-- 重构优化 / 其他 同理 -->
```

## release.html 条目格式

在 `<ol class="releases">` 内、标记 `<!-- 在此插入新条目（最新靠前） -->` 之后插入：

```html
<li class="release">
  <a class="release-title" href="/release-node/<版本>.html"><版本></a>
  <span class="release-meta"><date></span>
  <p class="release-summary">摘要</p>
</li>
```

## 关键：静态文件用原生 `<a>`，不用 next-intl `Link`

`release.html` 与 `release-node/*.html` 都是 `common/public/` 下的静态文件，服务在**根路径**（无 locale 前缀）。页脚入口必须用原生 `<a href="/release.html">`，不能用 `@/common/i18n/navigation` 的 `Link`——`Link` 会按 `localePrefix: "always"` 拼上 `/zh/` 或 `/en/`，得到 `/zh/release.html` 导致 404。说明页内、记录页内的互相跳转同理，一律写原生 `<a href="/release.html">`、`<a href="/release-node/<版本>.html">`。

## 验证

- 无残留 `{{…}}`；标签闭合；`release.html` 每条 `href` 指向真实存在的说明页。
- 页脚 nav 能经 `/release.html` 访问记录页；中英文 `nav.releases` 已补齐。
- 页脚是 React 组件，改动只涉及一条 `<a href="/release.html">` 与文案键，不新增样式；如需视觉调整在 `home.module.css` 的 `.footerMain nav` 里做。

## 常见错误

| 错误 | 后果 | 正确做法 |
| --- | --- | --- |
| 只写说明页、漏登记 release.html | 记录页看不到新发版 | 每次发版都登记条目 |
| 条目加到列表尾部 | 最新发版被压到最下 | 最新靠前，插到标记之后 |
| 空分组也渲染 | 出现无内容的「新增功能」 | 删除空分组 section |
| 占位符未清除 | 页面显示 `{{…}}` | 发布前逐项检查 |
| 漏删「暂无发版记录」占位 | 占位与真实条目并存 | 插入首条时删空状态 |
| 页脚入口用了 next-intl `Link` | 拼上 `/zh/` 前缀导致 404 | 静态文件用原生 `<a>` |
