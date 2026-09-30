---
name: write-blog
description: 仅用于 sparrowzoo 项目；用户明确调用 write-blog、或要求在 sparrowzoo 写博客文章时，生成 content/<slug>.json（ArticleContent 契约），由后端 Thymeleaf 渲染。与 write-doc（sparrow-js 静态 HTML）职责分离。
---

# 写博客 write-blog

在 sparrowzoo 项目中，一篇博客文章 = `content/<slug>.json` 一个 JSON 文件，由 Spring Boot 后端（`com.sparrow.blog.*`）读取、sanitize、注入系统字段后经 Thymeleaf 渲染。本 skill 产出这个 JSON。AI 只负责生成结构化内容，后端统一负责品牌、安全与 SEO。

## 输出落点

- 文件：`content/<slug>.json`；`slug` 仅允许 `[A-Za-z0-9_-]+`（kebab-case，如 `spring-boot-static-resources`）。
- 访问：`GET /article/{slug}`（详情页）、`GET /article/{slug}/og.png`（分享图）。
- 系统字段（`articleUrl` / `publishedAt` / `updatedAt` / `publishedDate` / `updatedDate` / `ogImageUrl`）由后端注入，**不要写进 JSON**。

## JSON 契约（13 个 AI 字段 + status）

| 字段 | 类型 | 渲染方式 | 说明 |
| --- | --- | --- | --- |
| `title` | 文本 | `th:text` 转义 | 标题，纯文本 |
| `description` | 文本 | `th:text` 转义 | 摘要，纯文本 |
| `category` | 文本 | `th:text` | 分类（如「工程」） |
| `subcategory` | 文本 | `th:text` | 子分类（如「后端」） |
| `topic` | 文本 | `th:text` | 主题（如「Spring Boot」） |
| `audience` | 文本 | `th:text` | 受众/适用版本，一句话 |
| `hero` | 内联 SVG | sanitize 后 `th:utext` + 转 PNG | 文章结构图象化，规则见 references/rules.md |
| `conclusion` | HTML 片段 | sanitize 后 `th:utext` | 结论先行 |
| `background` | HTML 片段 | sanitize 后 `th:utext` | 问题背景 |
| `details` | 章节数组 | 逐章 sanitize | `[{ "title": "纯文本", "content": "HTML 片段" }]` |
| `summary` | HTML 片段 | sanitize 后 `th:utext` | 总结归纳 |
| `sources` | HTML 片段 | sanitize 后 `th:utext` | 参考资料 |
| `keywords` | `string[]` | join 进 meta + `article:tag` | 关键词数组 |
| `status` | 文本 | — | 固定 `"published"` |

- 文本字段（title/description/category/subcategory/topic/audience）保持原始值，由模板 `th:text` 转义，**不要放 HTML**。
- HTML 字段（conclusion/background/summary/sources 与 details 各 `content`）写 HTML 片段，sanitize 后输出。
- `details` 每个章节的 `title` 是纯文本（模板转义渲染），`content` 是 HTML 片段；章节按数组顺序自动生成锚点 `#details-1`、`#details-2`…并进入目录，无需手工编号。

最小骨架：

```json
{
  "title": "…",
  "description": "…",
  "category": "工程",
  "subcategory": "后端",
  "topic": "…",
  "audience": "…",
  "hero": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>…</svg>",
  "conclusion": "<p>…</p>",
  "background": "<p>…</p>",
  "details": [ { "title": "…", "content": "<p>…</p>" } ],
  "summary": "<p>…</p>",
  "sources": "<ol class='sources'><li><a href='…' target='_blank' rel='noopener'>…</a></li></ol>",
  "keywords": ["…"],
  "status": "published"
}
```

## 内容主线

固定主线（与 write-doc 一致）：「标题摘要 → 结论先行 → 问题背景 → 详细内容 → 总结归纳 → 参考资料」。

- **conclusion**：直接回答主要问题并写明前提；最好附权威说明，保证严谨。
- **background**：解释必要术语与上下文，对小白友好。
- **details**：按逻辑或操作步骤展开，分多个章节（每章一个 `{title, content}`）；有对比用表格或图。
- **summary**：给出选择与下一步，避免重复正文。
- **sources**：关键事实就近链接官方规范，文末统一列出处与用途。

HTML 组件（表格、提示、术语、代码块）写法见 `references/rules.md`，只需查对应小节，不复制整份。

## 转义约定

- HTML/SVG 属性一律用**单引号**，避免 JSON 里 `\"` 转义（如 `<div class='table-wrap'>`、`viewBox='0 0 600 600'`）。
- 代码块内容中的 `<` `>` `&` 需 HTML 转义为 `&lt;` `&gt;` `&amp;`（`<pre><code>` 内的纯文本）。
- 除代码外不要放字面换行进字符串值；代码内换行用 `\n`。

## 验证

1. `python3 -c "import json; json.load(open('content/<slug>.json'))"` 校验 JSON 合法。
2. 后端已在跑时，`curl -s -o /dev/null -w '%{http_code}' localhost:8888/article/<slug>` 应返回 200。
3. `curl -s -o /dev/null -w '%{http_code} %{content_type}' localhost:8888/article/<slug>/og.png` 应返回 `200 image/png`，且页面 `og:image` 指向该 PNG（而非 `/webjars/default-share.png`）即 hero 有效。
4. 确认渲染页中关键组件（表格、codebox、note、章节锚点 `#details-N`）都在、无被剥空的内容。

## 常见错误

| 错误 | 后果 | 正确做法 |
| --- | --- | --- |
| hero 用 `<rect width height>` 或 `<line x1 y1 x2 y2>` | 属性被 sanitize 剥掉，图形不可见 | 用 `<path d>` 画矩形/线，或 `<circle>` |
| hero 用 `<defs>`/`<linearGradient>`/`url(#…)` | 被整体剥离 | 纯色 `fill`，禁 defs/gradient/url() |
| HTML 用 `style`/`scope`/`tabindex`/`role`/`aria-*` | 属性被剥 | 只用 `class` 及 rules.md 允许的属性 |
| 字段名写错或漏 `status` | 反序列化为 null/空 | 对照上表逐字段 |
| 把系统字段（articleUrl/日期）写进 JSON | 被忽略（record 无此字段） | 只写 13+1 字段 |
| 写 HTML 文件而非 JSON | 与 write-doc 混淆 | 产物是 `content/<slug>.json` |

完整规则与组件示例见 `references/rules.md`。
