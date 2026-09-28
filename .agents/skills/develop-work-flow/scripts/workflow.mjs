#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

const MARKER = '<!-- ai-coding-workflow:generated schema=1 -->';
const STATUS_MARKER = '<!-- ai-coding-workflow:task-status schema=1 -->';
const help = `用法：node workflow.mjs <validate|render|status|check> --project <项目根> --feature <slug>

feature 是需求目录完整名称，例如 req-r01-profile；名称使用小写 kebab-case。
输入由 plan.yaml 的可选 mode: full|lite 指定；省略时为 full，不按文件缺失推断。
full：doc/<feature>/{requirement.md,product.md,technical.md,acceptance.feature,plan.yaml}
lite：doc/<feature>/{technical.md,plan.yaml}；R 锚点写在 TRD 正文，场景写在唯一 gherkin fenced 代码块。
lite 场景块须有正文 <a id="acceptance"></a>；支持反引号或波浪线 fence，拒绝多个场景块或未闭合块。
仅所有任务均无场景且各自声明 tdd_exception 时，lite 可省略场景块；轻量模式不减免测试与证据。
输出：render 仅写 doc/<feature>/plan.md；status 仅写 doc/<feature>/task-status.md。
validate 校验结构与追溯引用；render 生成拓扑排序的详细计划；status 生成任务编号/名称/状态/备注四列表格。
check 要求 plan.md 新鲜；task-status.md 已存在时也检查，未生成时不阻止规划阶段检查。
生成文件均拒绝覆盖无对应生成标记的手写文件。例如：node workflow.mjs status --project . --feature req-r01-profile
工具不执行 DSL 中的任何命令，不证明业务语义、测试结果或证据真实性。
首次运行：node setup.mjs（依赖安装到 ~/.local/share/ai-coding-workflow/，需要相应权限）。
测试可设置 AI_CODING_WORKFLOW_DEPS=<绝对依赖目录>。需要 Node.js 22+。
`;
function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
function text(value) { return typeof value === 'string' && value.trim().length > 0; }
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function schema(condition, message) { if (!condition) fail('SCHEMA_INVALID', message); }
function keys(object, allowed, required, label) {
  schema(record(object), `${label} 必须是 mapping。`);
  for (const key of Object.keys(object)) schema(allowed.includes(key), `${label} 未知字段：${key}`);
  for (const key of required) schema(Object.hasOwn(object, key), `${label} 缺少字段：${key}`);
}
function stringList(value, label, { empty = false, pattern } = {}) {
  schema(Array.isArray(value) && (empty || value.length > 0), `${label} 必须是${empty ? '' : '非空'}字符串列表。`);
  schema(value.every(item => text(item) && item === item.trim() && (!pattern || pattern.test(item))), `${label} 含非法值。`);
  schema(new Set(value).size === value.length, `${label} 含重复值。`);
}
function placeholders(content, name) {
  if (/REPLACE_[A-Z0-9_]+|<实际[^>\n]*>|\bTBD\b/.test(content)) fail('PLACEHOLDER', `${name} 含未替换占位符。`);
}
function dependencies() {
  const base = process.env.AI_CODING_WORKFLOW_DEPS || path.join(os.homedir(), '.local/share/ai-coding-workflow');
  if (!path.isAbsolute(base)) fail('DEPENDENCIES_MISSING', 'AI_CODING_WORKFLOW_DEPS 必须为绝对目录；先运行 node setup.mjs。');
  try {
    const require = createRequire(path.join(base, 'package.json'));
    return { YAML: require('yaml'), Gherkin: require('@cucumber/gherkin'), Messages: require('@cucumber/messages') };
  } catch { fail('DEPENDENCIES_MISSING', `无法从 ${base} 加载依赖。请先运行 node setup.mjs；依赖不安装到项目或 skill 源目录。`); }
}
function inside(root, absolute) {
  const relative = path.relative(root, absolute);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
// Reject every existing symlink component, including dangling links. Nonexistent leaves are allowed.
function safePath(root, absolute) {
  if (!inside(root, absolute)) fail('UNSAFE_PATH', `路径越过项目根：${absolute}`);
  const parts = path.relative(root, absolute).split(path.sep).filter(Boolean);
  if (parts.includes('.git')) fail('UNSAFE_PATH', '.git 路径不允许作为工作流输入或输出。');
  let current = root;
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (error.code === 'ENOENT') break;
      throw error;
    }
    if (stat.isSymbolicLink()) fail('UNSAFE_PATH', `路径含软链接：${current}`);
    if (i < parts.length - 1 && !stat.isDirectory()) fail('UNSAFE_PATH', `路径父级不是目录：${current}`);
  }
  return absolute;
}
function projectFile(root, value) {
  if (!text(value) || path.isAbsolute(value) || value.includes('\\') || /[\x00-\x1f]/.test(value)) fail('UNSAFE_PATH', `非法项目相对路径：${value}`);
  const parts = value.split('/');
  if (parts.some(part => ['', '.', '..', '.git'].includes(part))) fail('UNSAFE_PATH', `文件路径不可包含空段、点路径或 .git：${value}`);
  return safePath(root, path.resolve(root, value));
}
// Call only outside an active fence. Fence info and contents are literal code,
// so their comment markers must never change the surrounding Markdown state.
function visibleMarkdownLine(line, state) {
  while (true) {
    if (state.inComment) {
      const end = line.indexOf('-->');
      if (end === -1) return '';
      line = line.slice(end + 3);
      state.inComment = false;
    }
    if (/^ {0,3}(`{3,}|~{3,})/.test(line)) return line;
    const start = line.indexOf('<!--');
    if (start === -1) return line;
    const end = line.indexOf('-->', start + 4);
    if (end === -1) {
      state.inComment = true;
      return line.slice(0, start);
    }
    line = line.slice(0, start) + line.slice(end + 3);
  }
}
function anchors(content, label) {
  const found = new Set();
  let fence;
  const comments = { inComment: false };
  for (let line of content.split(/\r?\n/)) {
    if (fence) {
      if (new RegExp(`^ {0,3}${fence.char}{${fence.length},}[ \\t]*$`).test(line)) fence = undefined;
      continue;
    }
    line = visibleMarkdownLine(line, comments);
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (opening) { fence = { char: opening[1][0], length: opening[1].length }; continue; }
    const match = line.match(/^ {0,3}<a[ \t]+id[ \t]*=[ \t]*["']([^"']+)["'][ \t]*>[ \t]*<\/a>[ \t]*$/);
    if (!match) continue;
    if (found.has(match[1])) fail('DUPLICATE_ID', `${label} 重复 anchor：${match[1]}`);
    found.add(match[1]);
  }
  return found;
}
function embeddedGherkin(content) {
  let fence, block;
  const comments = { inComment: false };
  for (let line of content.split(/\r?\n/)) {
    if (fence) {
      if (new RegExp(`^ {0,3}${fence.char}{${fence.length},}[ \\t]*$`).test(line)) fence = undefined;
      else if (fence.gherkin) block.push(line);
      continue;
    }
    line = visibleMarkdownLine(line, comments);
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!opening) continue;
    const gherkin = opening[2].trim() === 'gherkin';
    if (gherkin) {
      if (block !== undefined) fail('GHERKIN_INVALID', 'technical.md 只能有一个顶层 gherkin 代码块。');
      block = [];
    }
    fence = { char: opening[1][0], length: opening[1].length, gherkin };
  }
  if (fence) fail('GHERKIN_INVALID', 'technical.md 含未闭合的 fenced 代码块。');
  return block?.join('\n');
}
function load(project, featureName, libs) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featureName)) fail('SCHEMA_INVALID', 'feature 必须为 kebab-case slug。');
  let root;
  try { root = fs.realpathSync(project); } catch { fail('UNSAFE_PATH', '项目根不存在。'); }
  if (!fs.statSync(root).isDirectory()) fail('UNSAFE_PATH', '项目根必须是目录。');
  const directory = safePath(root, path.join(root, 'doc', featureName));
  const sources = new Map();
  function read(absolute) {
    safePath(root, absolute);
    if (sources.has(absolute)) return sources.get(absolute);
    let content;
    try {
      if (!fs.statSync(absolute).isFile()) fail('REFERENCE_INVALID', `输入不是文件：${absolute}`);
      content = fs.readFileSync(absolute, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') fail('REFERENCE_INVALID', `输入文件不存在：${absolute}`);
      throw error;
    }
    placeholders(content, path.relative(root, absolute));
    sources.set(absolute, content);
    return content;
  }
  const raw = { 'plan.yaml': read(path.join(directory, 'plan.yaml')) };
  const parsed = libs.YAML.parseDocument(raw['plan.yaml'], { uniqueKeys: true, merge: false, version: '1.2' });
  if (parsed.errors.length || parsed.warnings.length) fail('YAML_INVALID', [...parsed.errors, ...parsed.warnings].map(e => e.message).join('; '));
  let plan;
  try { plan = parsed.toJS({ maxAliasCount: 100 }); } catch (error) { fail('YAML_INVALID', error.message); }
  keys(plan, ['schema', 'mode', 'feature', 'iteration', 'tasks'], ['schema', 'feature', 'iteration', 'tasks'], 'plan');
  schema(plan.schema === 1, 'schema 只支持整数 1。');
  const mode = plan.mode === undefined ? 'full' : plan.mode;
  schema(['full', 'lite'].includes(mode), 'mode 只支持 full 或 lite；省略时为 full。');
  schema(plan.feature === featureName, 'plan.feature 必须与 --feature 相同。');
  schema(text(plan.iteration), 'iteration 必须为非空字符串。');
  schema(Array.isArray(plan.tasks) && plan.tasks.length > 0, 'tasks 必须为非空列表。');
  for (const name of mode === 'full' ? ['requirement.md', 'product.md', 'technical.md', 'acceptance.feature'] : ['technical.md']) raw[name] = read(path.join(directory, name));
  const requirements = mode === 'full' ? anchors(raw['requirement.md'], 'requirement.md') : anchors(raw['technical.md'], 'technical.md');
  const products = mode === 'full' ? anchors(raw['product.md'], 'product.md') : requirements;
  const requirementId = /^R\d{2,}$/;
  const scenarioId = /^S\d{2,}$/;
  const taskId = /^T\d{2,}$/;
  const knownRequirement = id => {
    if (!requirements.has(id) || !products.has(id)) fail('REFERENCE_INVALID', mode === 'full'
      ? `${id} 必须同时在 requirement.md 与 product.md 有显式 anchor。`
      : `${id} 必须在 technical.md 正文有显式 anchor。`);
  };
  if (mode === 'full') for (const id of products) if (requirementId.test(id) && !requirements.has(id)) fail('REFERENCE_INVALID', `product.md 的 ${id} 未在需求中声明。`);
  const scenarioMap = new Map();
  const scenarioSource = mode === 'full' ? raw['acceptance.feature'] : embeddedGherkin(raw['technical.md']);
  if (mode === 'lite' && scenarioSource !== undefined && !requirements.has('acceptance')) fail('REFERENCE_INVALID', 'technical.md 的场景块需要正文 <a id="acceptance"></a>。');
  let document;
  if (scenarioSource !== undefined) {
    try {
      const { Parser, AstBuilder, GherkinClassicTokenMatcher } = libs.Gherkin;
      document = new Parser(new AstBuilder(libs.Messages.IdGenerator.incrementing()), new GherkinClassicTokenMatcher()).parse(scenarioSource);
    } catch (error) { fail('GHERKIN_INVALID', error.message); }
    if (!document.feature) fail('GHERKIN_INVALID', `${mode === 'full' ? 'acceptance.feature' : 'technical.md 的 gherkin 代码块'} 缺少 Feature。`);
  }
  function walk(node, inherited = []) {
    const tags = (node.tags || []).map(tag => tag.name.slice(1));
    const allRequirements = [...new Set([...inherited, ...tags.filter(tag => requirementId.test(tag))])];
    for (const child of node.children || []) {
      if (child.rule) walk(child.rule, allRequirements);
      if (!child.scenario) continue;
      const scenario = child.scenario;
      const ownTags = (scenario.tags || []).map(tag => tag.name.slice(1));
      const ids = ownTags.filter(tag => scenarioId.test(tag));
      const refs = [...new Set([...allRequirements, ...ownTags.filter(tag => requirementId.test(tag))])];
      if (ids.length !== 1 || refs.length === 0) fail('SCENARIO_INVALID', `场景“${scenario.name}”必须直接声明一个 @S 编号并具有至少一个有效 @R 标签。`);
      if (scenarioMap.has(ids[0])) fail('DUPLICATE_ID', `重复场景编号：${ids[0]}`);
      refs.forEach(knownRequirement);
      const isOutline = libs.Gherkin.dialects[document.feature.language].scenarioOutline.includes(scenario.keyword);
      const hasExampleRow = scenario.examples.some(example => example.tableBody.length > 0);
      scenarioMap.set(ids[0], { id: ids[0], name: scenario.name, requirements: refs, line: scenario.location.line,
        executable: scenario.steps.length > 0 && (!isOutline || hasExampleRow) });
    }
  }
  if (document) walk(document.feature);
  const byId = new Map();
  const allowedTask = ['id', 'title', 'requirements', 'scenarios', 'design', 'files', 'depends_on', 'verify', 'status', 'evidence', 'tdd_exception', 'remark'];
  for (const task of plan.tasks) {
    keys(task, allowedTask, allowedTask.slice(0, 9), 'task');
    schema(typeof task.id === 'string' && taskId.test(task.id), 'task.id 必须为 T01 形式。');
    if (byId.has(task.id)) fail('DUPLICATE_ID', `重复任务编号：${task.id}`);
    byId.set(task.id, task);
    schema(text(task.title) && text(task.verify), `${task.id} title/verify 必须为非空字符串。`);
    if (task.remark !== undefined) schema(typeof task.remark === 'string', `${task.id}.remark 必须为字符串，可为空。`);
    schema(['todo', 'doing', 'done', 'blocked'].includes(task.status), `${task.id} 非法 status。`);
    stringList(task.requirements, `${task.id}.requirements`, { pattern: requirementId });
    stringList(task.scenarios, `${task.id}.scenarios`, { empty: true, pattern: scenarioId });
    if (task.scenarios.length === 0 && !text(task.tdd_exception)) fail('EVIDENCE_INVALID', `${task.id} 无场景任务必须说明 tdd_exception。`);
    stringList(task.design, `${task.id}.design`);
    stringList(task.files, `${task.id}.files`);
    stringList(task.depends_on, `${task.id}.depends_on`, { empty: true, pattern: taskId });
    task.requirements.forEach(knownRequirement);
    const covered = new Set();
    for (const id of task.scenarios) {
      const scenario = scenarioMap.get(id);
      if (!scenario) fail('REFERENCE_INVALID', `${task.id} 引用不存在的场景 ${id}。`);
      if (!scenario.executable) fail('SCENARIO_INVALID', `${task.id} 的 ${id} 没有可执行步骤，或 Scenario Outline 没有 Examples 数据行。`);
      scenario.requirements.forEach(ref => covered.add(ref));
    }
    if (task.scenarios.length && (task.requirements.some(ref => !covered.has(ref)) || [...covered].some(ref => !task.requirements.includes(ref)))) fail('COVERAGE_INVALID', `${task.id} requirements 必须与所引用场景的需求集合一致。`);
    for (const ref of task.design) {
      const parts = ref.split('#');
      if (parts.length !== 2 || !parts[0].endsWith('.md') || !parts[1] || path.isAbsolute(parts[0]) || parts[0].includes('\\') || /^[a-z]+:/i.test(parts[0])) fail('REFERENCE_INVALID', `${task.id} 非法设计引用：${ref}`);
      const target = safePath(root, path.resolve(directory, parts[0]));
      if (!anchors(read(target), parts[0]).has(parts[1])) fail('REFERENCE_INVALID', `${task.id} 设计锚点不存在：${ref}`);
    }
    task.files.forEach(file => projectFile(root, file));
    if (task.evidence !== undefined) {
      keys(task.evidence, ['red', 'green', 'review'], [], `${task.id}.evidence`);
      schema(Object.values(task.evidence).every(text), `${task.id}.evidence 各值必须为非空字符串。`);
    }
    if (task.tdd_exception !== undefined) schema(text(task.tdd_exception), `${task.id}.tdd_exception 必须说明不适用理由。`);
    if (task.status === 'done' && (!task.evidence?.green || !task.evidence?.review || !(task.evidence?.red || task.tdd_exception))) fail('EVIDENCE_INVALID', `${task.id} done 需要 green/review，并需要 red 或 tdd_exception。`);
  }
  for (const task of plan.tasks) {
    for (const id of task.depends_on) {
      if (!byId.has(id)) fail('DEPENDENCY_INVALID', `${task.id} 依赖不存在的 ${id}。`);
      if (['doing', 'done'].includes(task.status) && byId.get(id).status !== 'done') fail('DEPENDENCY_INVALID', `${task.id} 为 ${task.status}，但依赖 ${id} 未完成。`);
    }
  }
  const ordered = [], visiting = new Set(), visited = new Set();
  function visit(task) {
    if (visiting.has(task.id)) fail('DEPENDENCY_CYCLE', `依赖出现环：${task.id}`);
    if (visited.has(task.id)) return;
    visiting.add(task.id);
    task.depends_on.forEach(id => visit(byId.get(id)));
    visiting.delete(task.id); visited.add(task.id); ordered.push(task);
  }
  plan.tasks.forEach(visit);
  const sourceList = [...sources].map(([absolute, content]) => [path.relative(root, absolute).split(path.sep).join('/'), content]).sort(([a], [b]) => a.localeCompare(b));
  const hash = createHash('sha256').update(JSON.stringify(sourceList)).digest('hex');
  return { root, directory, plan, mode, ordered, scenarioMap, hasAcceptance: scenarioSource !== undefined, hash };
}
function inline(value) { return String(value).replace(/([\\`*_[\]<>])/g, '\\$1').replace(/\r?\n/g, ' '); }
function uriComponent(value) { return encodeURIComponent(value).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`); }
function designHref(ref) { const [file, anchor] = ref.split('#'); return `${file.split('/').map(uriComponent).join('/')}#${uriComponent(anchor)}`; }
function fenced(value) {
  const maxTicks = Math.max(2, ...(value.match(/`+/g) || []).map(v => v.length));
  const fence = '`'.repeat(maxTicks + 1);
  return `${fence}text\n${value}\n${fence}`;
}
function generate(model) {
  const { plan, mode, ordered, scenarioMap, hasAcceptance, hash } = model;
  const sourceLinks = mode === 'full'
    ? '[需求](requirement.md) · [产品](product.md) · [技术](technical.md) · [场景](acceptance.feature) · [任务 DSL](plan.yaml)'
    : `[技术](technical.md)${hasAcceptance ? ' · [场景](technical.md#acceptance)' : ''} · [任务 DSL](plan.yaml)`;
  const lines = [MARKER, `<!-- sources-sha256: ${hash} -->`, `# ${inline(plan.feature)} 执行计划`, '', `本轮：${inline(plan.iteration)}`, '',
    '本文件由 DSL 生成，请修改源文件后重新 render。状态与证据是声明；业务语义、测试真实性及审查质量由人或审查流程确认。CLI 不执行以下命令。', '',
    `来源：${sourceLinks}`, '',
    'Git 追溯：提交正文使用 `Task: <feature>/<TID>`；任务编号在 feature 内终身不复用，历史复用由 Git 审查检查。当前提交无需将自己的 hash 写回当前文件。', ''];
  for (const task of ordered) {
    lines.push(`## ${task.id} ${inline(task.title)}`, '', `- 状态：${task.status}`, `- 依赖：${task.depends_on.join(', ') || '无'}`,
      `- 需求：${task.requirements.map(id => mode === 'full' ? `[${id}](requirement.md#${id}) / [产品行为](product.md#${id})` : `[${id}](technical.md#${id})`).join('；')}`,
      `- 场景：${task.scenarios.map(id => `[${id}](${mode === 'full' ? `acceptance.feature#L${scenarioMap.get(id).line}` : 'technical.md#acceptance'}) ${inline(scenarioMap.get(id).name)}`).join('；') || '无（见 TDD 例外）'}`,
      `- 设计：${task.design.map(ref => `[${inline(ref)}](${designHref(ref)})`).join('；')}`, '', '修改文件：', '',
      ...task.files.map(file => `- ${inline(file)}`), '', '验证命令（项目根执行）：', '', fenced(task.verify), '', '验证与审查证据：', '',
      `- RED：${inline(task.evidence?.red || '未记录')}`, `- GREEN：${inline(task.evidence?.green || '未记录')}`, `- REVIEW：${inline(task.evidence?.review || '未记录')}`);
    if (task.remark !== undefined) lines.push(`- 备注：${inline(task.remark || '—')}`);
    if (task.tdd_exception) lines.push(`- TDD 例外：${inline(task.tdd_exception)}`);
    lines.push('', 'Git trailer：', '', fenced(`Task: ${plan.feature}/${task.id}`), '');
  }
  return lines.join('\n');
}
function tableCell(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '|': '&#124;', '\\': '&#92;', '`': '&#96;', '*': '&#42;', '_': '&#95;', '[': '&#91;', ']': '&#93;', '~': '&#126;' };
  return String(value).replace(/[&<>|\\`*_\[\]~]/g, char => entities[char]).replace(/\r\n|\r|\n/g, '<br>');
}
function generateStatus(model) {
  const labels = { todo: '未开始', doing: '进行中', done: '已完成', blocked: '受阻' };
  return [STATUS_MARKER, `<!-- sources-sha256: ${model.hash} -->`, '',
    '| 任务编号 | 名称 | 状态 | 备注 |', '| --- | --- | --- | --- |',
    ...model.ordered.map(task => `| ${task.id} | ${tableCell(task.title)} | ${labels[task.status]} | ${tableCell(task.remark || '—')} |`), '',
  ].join('\n');
}
function readGenerated(model, name, marker, errorCode) {
  const destination = safePath(model.root, path.join(model.directory, name));
  let content;
  try { content = fs.readFileSync(destination, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (content !== undefined && !content.startsWith(`${marker}\n`)) fail(errorCode, `${name} 没有本工具对应的生成标记，拒绝覆盖或接管手写文件。`);
  return { destination, content };
}
function writeGenerated(model, destination, content) {
  const temporary = safePath(model.root, path.join(model.directory, `.workflow-${randomUUID()}.tmp`));
  try {
    fs.writeFileSync(temporary, content, { flag: 'wx', mode: 0o644 });
    safePath(model.root, destination);
    fs.renameSync(temporary, destination);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) { console.log(help); return; }
  const command = args.shift();
  if (!['validate', 'render', 'status', 'check'].includes(command)) fail('ARGUMENTS', '未知命令，请使用 --help。');
  const options = {};
  while (args.length) {
    const flag = args.shift(), value = args.shift();
    if (!['--project', '--feature'].includes(flag) || !value || value.startsWith('--') || options[flag]) fail('ARGUMENTS', '需要唯一的 --project 与 --feature 参数。');
    options[flag] = value;
  }
  if (!options['--project'] || !options['--feature']) fail('ARGUMENTS', '必须指定 --project 和 --feature。');
  const model = load(options['--project'], options['--feature'], dependencies());
  if (command === 'validate') { console.log(`OK validate ${model.plan.feature}: ${model.ordered.length} tasks；仅结构/引用校验，未执行命令。`); return; }
  if (command === 'status') {
    const { destination } = readGenerated(model, 'task-status.md', STATUS_MARKER, 'HANDWRITTEN_STATUS');
    writeGenerated(model, destination, generateStatus(model));
    console.log(`OK status ${path.relative(model.root, destination)}`); return;
  }
  const { destination, content: previous } = readGenerated(model, 'plan.md', MARKER, 'HANDWRITTEN_PLAN');
  const expected = generate(model);
  if (command === 'check') {
    if (previous !== expected) fail('STALE_PLAN', 'plan.md 缺失、源内容已变或生成文件被修改；请先运行 render。');
    const status = readGenerated(model, 'task-status.md', STATUS_MARKER, 'HANDWRITTEN_STATUS');
    if (status.content !== undefined && status.content !== generateStatus(model)) fail('STALE_STATUS', 'task-status.md 源内容已变或生成文件被修改；请先运行 status。');
    console.log(`OK check ${model.plan.feature}: 生成内容与全部源文件一致。`); return;
  }
  writeGenerated(model, destination, expected);
  console.log(`OK render ${path.relative(model.root, destination)}`);
}
try { main(); } catch (error) { console.error(`ERROR [${error.code || 'IO_ERROR'}] ${error.message}`); process.exitCode = 1; }
