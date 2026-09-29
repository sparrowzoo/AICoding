# 文章可选组件

按需要读取和选用片段；不把整份示例放进文章。样式及行为由 `https://r.sparrowzoo.net/article/article.css`、`article.js` 提供，无需读取或复制其源码。普通段落、列表、h4、figure/figcaption 可直接使用。

## 小节与官方依据

目录只收录 `section[id]` 的直属 h2/h3（或 `.section-heading` 内的标题），不会收录卡片标题。小节 ID 必须唯一，不使用数字开头。

```html
<section id="how-it-works" class="subsection">
  <h3><span class="step">STEP 01</span>工作原理</h3>
  <p>先解释原理，再给操作与验证方法。</p>
  <p class="fine">依据：<a href="https://example.com/spec">官方规范</a>。区分规范事实与本文建议。</p>
</section>
```

## 提示与结论卡片

```html
<aside class="note cyan"><strong>适用边界</strong><p>这里说明前提和例外，正文里的 <strong>强调</strong> 不会另起一行。</p></aside>
<div class="card-grid">
  <div class="panel card"><h3>关键结论</h3><p>用一句话说明读者能获得什么。</p></div>
  <div class="panel card"><h3>下一步</h3><p>给出可以执行的建议。</p></div>
</div>
```

## 术语

```html
<dl class="glossary">
  <div class="panel"><dt>术语</dt><dd>面向初学者的简短解释。</dd></div>
</dl>
```

## 表格

保持列标题简短；长内容让局部区域滚动，不压缩到无法阅读。每张表有 caption 和列头 scope。

```html
<div class="table-wrap" tabindex="0" role="region" aria-label="方案比较，可左右滚动">
  <table>
    <caption>方案比较</caption>
    <thead><tr><th scope="col">方案</th><th scope="col">适用情况</th><th scope="col">限制</th></tr></thead>
    <tbody><tr><th scope="row">方案 A</th><td>情况说明</td><td>边界说明</td></tr></tbody>
  </table>
</div>
<p class="fine">窄屏可左右滑动表格。</p>
```

## 代码与折叠示例

代码只写 HTML 转义后的纯文本，不手写高亮 span。基础模板不加载语法高亮库；必要时另行按需接入。语言类名用于标识语言，复制只取代码正文。完整长例子可以折叠，关键操作步骤保持可见。

```html
<div class="codebox">
  <div class="code-header"><span>示例 · config.xml</span><button type="button" class="copy" hidden>复制</button></div>
  <pre><code class="language-xml">&lt;config&gt;example&lt;/config&gt;</code></pre>
</div>
<details class="panel example-group">
  <summary>查看完整示例</summary>
  <div class="example-content"><p>完整解释或代码块。</p></div>
</details>
```

## Tab 对比

仅当切换能帮助比较时使用。同组按钮共用 `data-tab-group`，每个按钮及目标面板具有唯一 ID。原始 HTML 不给面板加 `hidden`，JS 成功初始化后再切换；脚本不可用时全部方案仍可阅读。按钮初始为普通按钮，JS 设置 Tab 的角色及状态。

```html
<div class="switcher" aria-label="选择接入方式">
  <button type="button" id="approach-a-tab" data-tab-group="approach" data-target="approach-a">方式 A</button>
  <button type="button" id="approach-b-tab" data-tab-group="approach" data-target="approach-b">方式 B</button>
</div>
<div id="approach-a" class="panel route-panel" aria-labelledby="approach-a-tab"><h4>方式 A</h4><p>方式 A 的完整内容。</p></div>
<div id="approach-b" class="panel route-panel" aria-labelledby="approach-b-tab"><h4>方式 B</h4><p>方式 B 的完整内容。</p></div>
```

## 正文图与可选头图

图用于解释关系；没有必要时保留模板的简洁首屏。正文图使用 figure 和文字说明；可见头图与社交分享缩略图分别维护。不要为了布局隐藏图中的信息。

```html
<figure>
  <img src="/backend/topic/diagram.svg" alt="用文字说明图中的关系" width="900" height="500" loading="lazy" decoding="async">
  <figcaption>图 1：关系说明。补充屏幕阅读器或小屏读者需要的信息。</figcaption>
</figure>
```

若首屏需要图，将 h1、摘要、元信息及操作按钮包在 `.hero-grid > div` 中，旁边增加 `.hero-visual` 图块；移动端自然纵排。首屏图片不设 `loading="lazy"`。

## 参考资料

在关键结论旁就近链接；文末统一列出处与用途。示例网址必须换成实际权威来源。

```html
<ol class="sources">
  <li><a href="https://example.com/spec">官方规范名称</a><p>支持哪些结论，适用版本或核对日期。</p></li>
</ol>
```
