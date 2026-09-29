---
name: write-doc
description: 仅用于 sparrow-js 项目；用户明确调用 write-doc 时，按技能内模板编写或改写静态 HTML，并维护主站文档目录及中英文条目。
---

# 写文档 write-doc

文章发布为 `common/public/` 现有分类下的静态 HTML。本文、模板与组件示例随 skill 维护；CSS/JS 唯一源码在项目 `sparrow/source/article/`，文章直接引用线上资源。

## 读取与分类

1. 读取本 skill 同目录的 `templates/article.html`；需要表格、代码、提示、图表等组件时，仅查 `references/components.md` 对应小节。相对路径以本 skill 的真实目录解析。
2. 检查 `common/public/` 现有分类与 `common/src/app/[locale]/_components/site-content.ts` 对应条目，确定 kebab-case 文件名及 `category / subcategory / topic`。没有合适分类时，先告知拟用目录并询问，不擅自新建分类。
3. 日常写文章不再读取 Maven 范例或公共 CSS/JS 源码，不重新生成固定框架。

## 内容与生成

- 复制模板到 `common/public/<已有分类>/<kebab-case>.html`，只生成正文与元信息。固定主线是「标题摘要 → 结论先行 → 问题背景 → 详细内容 → 总结归纳 → 参考资料」。结论回答主要问题并写明前提，背景解释必要术语，详细内容按逻辑或操作步骤展开，总结给出选择与下一步，避免重复正文；关键事实就近链接官方规范。
- 保留 Banner、面包屑、返回文档目录、桌面/手机阅读目录、进度、分享入口和页脚。正文小节使用带唯一 ID 的 `section.subsection`，内含直属 `h3`（见组件片段），目录由脚本生成，不手工维护小节链接。卡片、表格、Tab、折叠示例与图解按需使用；脚本不可用时正文仍完整，长表格和代码仅在局部滚动。
- 使用模板内 `https://r.sparrowzoo.net/article/` 的 CSS/JS 引用，不内联或复制公共资源到文章、`common/public/` 或 skill 包。只在明确维护公共资源时读取源码；专用图表或交互另按文章需求维护，不塞进通用资源。不逐 token 生成代码高亮 span。
- 视觉由公共 CSS 统一：背景 `#07070d`，面板/边框半透明白，正文 `#f4f4f7`、辅助文字保持足够对比度；强调渐变 `#6d5cff → #22d3ee → #a855f7`、18px 圆角、径向光斑与网格背景。沿用现有类名，不为每篇重写主题。
- 真实凭证、个人账号与非公开服务信息禁止进入文章；示例用通用占位符。已公开的品牌站点、资源地址和官方来源链接保留真实地址。

## 占位符与分享

| 占位符 | 填写要求 |
| --- | --- |
| `TITLE` / `DESCRIPTION` | 标题与简洁摘要；同名值各处一致，按 HTML 文本或属性值转义 |
| `ARTICLE_URL` | 正式绝对 URL，用于 canonical 与 og:url；不带 hash，不用预览地址 |
| `CATEGORY` / `SUBCATEGORY` / `TOPIC` | 已有分类对应的面包屑展示名称 |
| `AUDIENCE` | 主要读者或适用版本，一句话 |
| `PUBLISHED_DATE` / `UPDATED_DATE` | `YYYY-MM-DD`；初次发布可相同 |
| `PUBLISHED_AT` / `UPDATED_AT` | 含时区的 ISO 8601 时间，与可见日期一致 |
| `CONCLUSION_HTML` / `BACKGROUND_HTML` / `DETAILS_HTML` / `SUMMARY_HTML` / `SOURCES_HTML` | 对应段落 HTML；转义其中代码文本，不对整段 HTML 再转义 |

发布前清除全部 `{{…}}`。模板预设 600 × 600 的官方 logo PNG 分享图，与可选的可见头图分开，不要求每篇生成 SVG 封面。换专属分享图时，同步更新 OG 图片地址、alt、尺寸与 MIME 类型，图片须公开可通过 HTTPS 访问。

本项目没有微信 JS-SDK 签名服务：微信内提示使用右上角菜单，其他环境优先系统分享，再降级复制链接。OG（Open Graph）是通用分享元数据：`og:title` 为标题、`og:image` 为图片；它不是微信专用协议，不保证微信采用这些字段，按钮也不能直接打开微信联系人。若另需稳定定制原生分享卡片，再接入公众号权限、安全域名、服务端签名与 JS-SDK，并用微信真机验证。

## 登记与验证

- 在 `common/src/app/[locale]/_components/site-content.ts` 的 `documents` 中登记唯一 `id`、`category`、`subcategory`、`topic`、相对 public 根的 `href`、`date: "YYYY-MM-DD"` 和中英文 `keywords`，按发布日期倒排。新增的最新文章置首；改写更新原条目，避免重复。
- 在 `common/messages/website/zh.json` 与 `en.json` 的 `docs.items.<id>` 同步 `title`、`description`。纯静态 HTML 不需要运行 copy。
- 检查占位符、链接、锚点、元信息与目录条目；验证桌面/窄屏阅读、目录、代码/表格滚动、复制及分享失败反馈，并确认禁用脚本后正文完整。模板及仅用于验收的预览页不作为正式文章登记；预览页设置 `noindex`，正式发布为文章时再登记。
- 发布前确认线上 CSS/JS 与默认分享图响应正常；资源改动需先发布到资源域名。尚未发布或无法验证时如实说明，不以文章内副本替代。
