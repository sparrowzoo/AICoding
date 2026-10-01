# write-blog 规则与组件

按需要查阅各小节；不把整份内容塞进文章。

## 设计系统（深色主题）

页面视觉由 `article.css` 统一负责，作者只需选用语义 class，**不手写颜色、不写内联样式**（`style` 会被 sanitize 剥掉）。整体观感：

- **深色底**：背景 `#07070d`；卡片/面板半透明白（4%）、边框半透明白；代码块深底 `#0c0c16`。无 `.dark` 时页面自动切浅色，正文无需感知主题。
- **文字三级**：主 `#f4f4f7` / 次 `#a5a5ba` / 弱 `#85859b`（`--text`/`--secondary`/`--tertiary`）。
- **强调渐变**：紫 `#6d5cff` → 青 `#22d3ee` → 粉紫 `#a855f7`（`--gradient`），用于标题渐变字、主按钮、圆点；点缀克制，不铺大面积亮色。
- **圆角** `18px`；背景叠加径向光斑 + 网格噪点（CSS 负责）。
- **站点头部**：`template.html` 已 `th:replace` 注入 `header.html` 的 banner（logo/产品入口/主题切换/登录）。**作者不写站点头部、导航或任何站点 chrome**，只产出正文内容片段。

精确值以 `article.css` 为准；作者只需记住“深色、强调渐变克制、用语义 class”。

## hero SVG 白名单

hero 是内联 SVG，表达文章结构的图象化总结（框、连线、关键词、层次）。

- `viewBox="0 0 600 600"`（600×600）。
- 仅允许标签：`svg g path circle rect line polygon polyline ellipse text tspan`。
- 仅允许属性：`viewBox x y cx cy r rx ry d points fill stroke stroke-width opacity font-size font-family font-weight text-anchor transform`（另有 `xmlns` 仅限 `svg`）。
- 品牌色 `#6d5cff` / `#22d3ee` / `#a855f7`，背景 `#07070d`，文字 `#f4f4f7`。
- 禁止 `<defs>` / `<linearGradient>` / `url(...)`，用纯色 `fill`。
- `<rect>` 不能写 `width`/`height`（会被剥），画矩形用 `<path d='M0 0 H600 V600 H0 Z'>`。
- `<line>` 不能写 `x1/y1/x2/y2`（会被剥），画线用 `<path d='M150 500 H450'>`。

### 设计原则

hero 既是正文两栏配图，也是 `og:image` 分享图，要**美观大方、简约，并与页面深色风格一致**：

- **与页面风格一致**：背景用深色 `#07070d`，图形与点缀用品牌强调色 `#6d5cff` / `#22d3ee` / `#a855f7`，文字用浅色 `#f4f4f7`、辅助 `#9a9ab0`。不要用大面积亮色铺底（会与页面深色风格脱节、也显得廉价）。
- **简约**：只表达一个核心结构（层级 / 流程 / 对比 / 关键词），元素克制、不堆砌，信息一眼可读。
- **排版美观大方**：字号有层级（大标题 40–48、条目 24–28、脚注 20–22）；文字多用居中 `text-anchor='middle'` 且对齐统一；圆点/短线条做视觉锚点，间距均匀，四周留白、不贴边。如果有列表，请居左圣齐；如果有对比，请用表格或图示。

### 示例

```json
"hero": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'><path d='M0 0 H600 V600 H0 Z' fill='#07070d'/><text x='300' y='72' font-size='40' font-family='sans-serif' font-weight='bold' fill='#f4f4f7' text-anchor='middle'>URL 查找优先级</text><circle cx='300' cy='150' r='10' fill='#6d5cff'/><text x='300' y='186' font-size='26' font-family='sans-serif' fill='#f4f4f7' text-anchor='middle'>1 · Controller 映射</text></svg>"
```

## HTML 白名单

HTML 字段（conclusion/background/summary/sources、details 各 `content`）sanitize 后输出。

允许标签：`p br hr a img h1 h2 h3 h4 h5 h6 strong b em i u s ul ol li dl dt dd code pre blockquote table thead tbody tfoot tr th td caption figure figcaption div span details summary button`

允许属性：

- 全局：`title` `id` `class`
- `<a>`：`href` `target` `rel`（协议仅 http/https/mailto）
- `<img>`：`src` `alt`
- `<td>`/`<th>`：`colspan` `rowspan`
- `<button>`：`type`

禁止：`script style iframe object embed`、`on*` 事件、`style` 属性、`scope`/`tabindex`/`role`/`aria-*`（会被静默剥掉）。

`<pre><code>` 会被后端自动包成 `.codebox`（含 `.code-header` + 复制按钮），无需手写 codebox 结构。

## 组件写法

`details` 章节标题由 `details[].title` 承担，content 内**不要再写 `<h3>`**（模板已渲染章节标题）；`conclusion`/`background`/`summary` 内可用 `<h3>` 做小标题。

### 表格

```html
<div class='table-wrap'><table><caption>方案比较</caption><thead><tr><th>方案</th><th>适用</th><th>限制</th></tr></thead><tbody><tr><th>方案 A</th><td>…</td><td>…</td></tr></tbody></table></div>
```

列标题保持简短；长内容靠 `.table-wrap` 局部横向滚动，不压缩到无法阅读。`<th>` 不加 `scope`（会被剥）。

### 提示/结论卡片

```html
<aside class='note cyan'><strong>警示</strong><p>说明前提与例外。</p></aside>
<div class='card-grid'><div class='panel card'><h3>关键结论</h3><p>…</p></div><div class='panel card'><h3>下一步</h3><p>…</p></div></div>
```

### 术语

```html
<dl class='glossary'><div class='panel'><dt>术语</dt><dd>面向初学者的简短解释。</dd></div></dl>
```

### 代码

```html
<pre><code>System.out.println("hello");</code></pre>
```

代码写 HTML 转义后的纯文本（`<` `>` `&` 转 `&lt;` `&gt;` `&amp;`），不手写高亮 span；`<pre><code>` 自动包 `.codebox`，复制只取代码正文。

### 参考资料

```html
<ol class='sources'><li><a href='https://docs.spring.io/spring-boot/reference/web/servlet.html' target='_blank' rel='noopener'>官方规范名</a><p>支持哪些结论、适用版本或核对日期。</p></li></ol>
```

可用 class（与 write-doc 的 article.css 一致）：`table-wrap` `note cyan` `glossary` `panel` `card` `card-grid` `fine` `muted` `sources` `codebox` `code-header` `copy` 等。
