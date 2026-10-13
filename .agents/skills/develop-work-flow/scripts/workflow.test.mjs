import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('./workflow.mjs', import.meta.url));
const setup = fileURLToPath(new URL('./setup.mjs', import.meta.url));
const yaml = `schema: 1
feature: cart-total
iteration: basket-1
tasks:
  - id: T02
    title: 展示购物车总额
    requirements: [R02]
    scenarios: [S02]
    design: [technical.md#api-02]
    files: [src/cart/view.mjs]
    depends_on: [T01]
    verify: node --test tests/cart-view.test.mjs
    status: todo
  - id: T01
    title: 计算购物车总额
    requirements: [R01]
    scenarios: [S01]
    design: [technical.md#api-01]
    files: [src/cart/total.mjs]
    depends_on: []
    verify: node --test tests/cart-total.test.mjs
    status: todo
`;
const feature = `# language: zh-CN
功能: 购物车金额
  @R01
  规则: 计算
    @S01
    场景大纲: 累加数量
      假如 单价为 <price>
      当 购买 <quantity> 件
      那么 总额为 <total>
      例子:
        | price | quantity | total |
        | 3     | 2        | 6     |
  @R02
  规则: 展示
    @S02
    场景: 显示总额
      假如 已计算总额
      那么 页面显示总额
    @S99
    场景: 历史场景无需纳入本轮
      假如 已关闭旧界面
      那么 无需修改旧界面
`;

function fixture(t, featureName = 'cart-total') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-cart-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const doc = path.join(root, 'doc', featureName);
  fs.mkdirSync(doc, { recursive: true });
  fs.writeFileSync(path.join(doc, 'requirement.md'), '# 购物车需求\n<a id="R01"></a>\n计算金额。\n<a id="R02"></a>\n显示金额。\n');
  fs.writeFileSync(path.join(doc, 'product.md'), '# 产品行为\n<a id="R01"></a>\n按数量累加。\n<a id="R02"></a>\n页面显示。\n');
  fs.writeFileSync(path.join(doc, 'technical.md'), '# 接口设计\n<a id="api-01"></a>\n计算接口。\n<a id="api-02"></a>\n展示接口。\n');
  fs.writeFileSync(path.join(doc, 'acceptance.feature'), feature);
  fs.writeFileSync(path.join(doc, 'plan.yaml'), yaml.replace('feature: cart-total', `feature: ${featureName}`));
  const edit = (name, transform) => {
    const p = path.join(doc, name);
    fs.writeFileSync(p, transform(fs.readFileSync(p, 'utf8')));
  };
  const run = (command = 'validate', env = {}) => spawnSync(process.execPath, [cli, command, '--project', root, '--feature', featureName], {
    encoding: 'utf8', env: { ...process.env, ...env },
  });
  return { root, doc, edit, run };
}
function ok(result) { assert.equal(result.status, 0, result.stderr || result.stdout); }
function fails(result, code) {
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, new RegExp(`\\[${code}\\]`));
}

function liteFixture(t) {
  const f = fixture(t);
  for (const name of ['requirement.md', 'product.md', 'acceptance.feature']) fs.unlinkSync(path.join(f.doc, name));
  f.edit('plan.yaml', s => s.replace('schema: 1', 'schema: 1\nmode: lite'));
  f.edit('technical.md', s => `${s}\n<a id="R01"></a>\n按数量计算金额。\n<a id="R02"></a>\n显示计算结果。\n<a id="acceptance"></a>\n\`\`\`gherkin\n${feature}\`\`\`\n`);
  return f;
}

test('lite uses only two authority files for all commands and renders valid local links', t => {
  const f = liteFixture(t);
  const marker = path.join(f.root, 'must-not-exist');
  f.edit('plan.yaml', s => s.replace('node --test tests/cart-total.test.mjs', `touch ${marker}`));
  assert.deepEqual(fs.readdirSync(f.doc).sort(), ['plan.yaml', 'technical.md']);
  ok(f.run('validate')); ok(f.run('render')); ok(f.run('status')); ok(f.run('check'));
  assert.deepEqual(fs.readdirSync(f.doc).sort(), ['plan.md', 'plan.yaml', 'task-status.md', 'technical.md']);
  const plan = fs.readFileSync(path.join(f.doc, 'plan.md'), 'utf8');
  assert.match(plan, /\[R01\]\(technical\.md#R01\)/);
  assert.match(plan, /\[S01\]\(technical\.md#acceptance\)/);
  assert.match(plan, /\[技术\]\(technical\.md\)/);
  assert.doesNotMatch(plan, /requirement\.md|product\.md|acceptance\.feature/);
  assert.ok(plan.indexOf('## T01') < plan.indexOf('## T02'));
  assert.equal(visibleStatus(f), '| 任务编号 | 名称 | 状态 | 备注 |\n| --- | --- | --- | --- |\n| T01 | 计算购物车总额 | 未开始 | — |\n| T02 | 展示购物车总额 | 未开始 | — |');
  assert.equal(fs.existsSync(marker), false);
});

test('full mode is default or explicit and never inferred from missing files', t => {
  for (const explicit of [false, true]) {
    const f = fixture(t);
    if (explicit) f.edit('plan.yaml', s => s.replace('schema: 1', 'schema: 1\nmode: full'));
    ok(f.run('validate')); ok(f.run('render')); ok(f.run('status')); ok(f.run('check'));
    assert.match(fs.readFileSync(path.join(f.doc, 'plan.md'), 'utf8'), /\[R01\]\(requirement\.md#R01\) \/ \[产品行为\]\(product\.md#R01\)/);
    f.edit('product.md', s => s.replace('id="R01"', 'id="R09"'));
    fails(f.run(), 'REFERENCE_INVALID');
  }
  for (const modeLine of ['', 'mode: full\n']) {
    const f = liteFixture(t);
    f.edit('plan.yaml', s => s.replace('mode: lite\n', modeLine));
    fails(f.run(), 'REFERENCE_INVALID');
  }
});

test('mode rejects unknown strings and non-string YAML values before selecting sources', t => {
  for (const mode of ['light', 'FULL', 'null', 'false', '1', '[]', '{}']) {
    const f = liteFixture(t);
    f.edit('plan.yaml', s => s.replace('mode: lite', `mode: ${mode}`));
    fails(f.run(), 'SCHEMA_INVALID');
  }
});

test('lite retains official Gherkin syntax and scenario identity validation', t => {
  for (const [transform, code] of [
    [s => s.replace('@S02', '@S01'), 'DUPLICATE_ID'],
    [s => s.replace('@S01', ''), 'SCENARIO_INVALID'],
    [s => s.replace('@S01', '@S01 @S03'), 'SCENARIO_INVALID'],
    [s => s.replace('@R01', '@R88'), 'REFERENCE_INVALID'],
    [s => s.replace('@R01', ''), 'SCENARIO_INVALID'],
    [s => s.replace('功能: 购物车金额', '这不是 Gherkin'), 'GHERKIN_INVALID'],
    [s => s.replace(feature, ''), 'GHERKIN_INVALID'],
    [s => s.replace('      假如 已计算总额\n      那么 页面显示总额\n', ''), 'SCENARIO_INVALID'],
    [s => s.replace('        | 3     | 2        | 6     |\n', ''), 'SCENARIO_INVALID'],
  ]) {
    const f = liteFixture(t); f.edit('technical.md', transform); fails(f.run(), code);
  }
});

test('lite requires real body anchors and exact requirement coverage', t => {
  for (const transform of [
    s => s.replace('<a id="R01"></a>', '<a id="R88"></a>'),
    s => s.replace('<a id="R01"></a>', '```html\n<a id="R01"></a>\n```'),
    s => s.replace('<a id="R01"></a>', '<!-- <a id="R01"></a> -->'),
    s => s.replace('<a id="acceptance"></a>', '```html\n<a id="acceptance"></a>\n```'),
    s => s.replace('<a id="acceptance"></a>', ''),
  ]) {
    const f = liteFixture(t); f.edit('technical.md', transform); fails(f.run(), 'REFERENCE_INVALID');
  }
  const f = liteFixture(t);
  f.edit('plan.yaml', s => s.replace('requirements: [R01]', 'requirements: [R01, R02]'));
  fails(f.run(), 'COVERAGE_INVALID');
  const g = liteFixture(t);
  g.edit('plan.yaml', s => s.replace('scenarios: [S01]', 'scenarios: [S77]'));
  fails(g.run(), 'REFERENCE_INVALID');
});

test('lite extracts one top-level Gherkin fence and ignores nested teaching examples', t => {
  const f = liteFixture(t);
  f.edit('technical.md', s => '````markdown\n```gherkin\ninvalid nested example\n```\n````\n' + s);
  ok(f.run());
  const g = liteFixture(t);
  g.edit('technical.md', s => s.replace('```gherkin', '~~~~gherkin').replace(/```\n$/, '~~~~\n'));
  ok(g.run());
  const h = liteFixture(t);
  h.edit('technical.md', s => s.replace('```gherkin', '````gherkin').replace(/```\n$/, '`````\n'));
  ok(h.run());
});

test('lite preserves Gherkin block content and ignores only outer Markdown comments', t => {
  const f = liteFixture(t);
  f.edit('technical.md', s => '<!--\n```gherkin\ninvalid hidden example\n```\n-->\n' + s.replace('场景: 显示总额', '场景: 显示<!--合法名称-->总额'));
  ok(f.run('render'));
  assert.match(fs.readFileSync(path.join(f.doc, 'plan.md'), 'utf8'), /合法名称/);
});

test('lite rejects multiple and unclosed fences without treating short closers as valid', t => {
  for (const transform of [
    s => s + '\n```gherkin\nFeature: second\n```\n',
    s => s.replace(/```\n$/, ''),
    s => s.replace('```gherkin', '````gherkin'),
    s => s + '\n~~~text\nunclosed ordinary code\n',
    s => s.replace(/```\n$/, '~~~\n'),
  ]) {
    const f = liteFixture(t); f.edit('technical.md', transform); fails(f.run(), 'GHERKIN_INVALID');
  }
});

test('lite may omit acceptance only when every task has no scenarios and an explicit TDD exception', t => {
  const f = liteFixture(t);
  f.edit('technical.md', s => s.replace(/<a id="acceptance"><\/a>[\s\S]*$/, ''));
  fails(f.run(), 'REFERENCE_INVALID');
  f.edit('plan.yaml', s => s.replaceAll(/scenarios: \[S0[12]\]/g, 'scenarios: []'));
  fails(f.run(), 'EVIDENCE_INVALID');
  f.edit('plan.yaml', s => s.replaceAll('status: todo', 'status: todo\n    tdd_exception: 纯文档澄清，没有可执行行为变化'));
  ok(f.run('validate')); ok(f.run('render')); ok(f.run('status')); ok(f.run('check'));
  const plan = fs.readFileSync(path.join(f.doc, 'plan.md'), 'utf8');
  assert.doesNotMatch(plan, /technical\.md#acceptance|acceptance\.feature/);
  f.edit('plan.yaml', s => s.replace('    tdd_exception: 纯文档澄清，没有可执行行为变化\n', ''));
  fails(f.run(), 'EVIDENCE_INVALID');
});

test('lite hashes authority and referenced design files while ignoring absent-mode documents', t => {
  const f = liteFixture(t);
  ok(f.run('render')); ok(f.run('status')); ok(f.run('check'));
  for (const name of ['requirement.md', 'product.md', 'acceptance.feature']) fs.writeFileSync(path.join(f.doc, name), 'REPLACE_IGNORED\n');
  ok(f.run('check'));
  f.edit('technical.md', s => s.replace('按数量计算金额。', '按数量计算金额，禁止负数。'));
  fails(f.run('check'), 'STALE_PLAN');
  ok(f.run('render')); fails(f.run('check'), 'STALE_STATUS');
  ok(f.run('status')); ok(f.run('check'));
  f.edit('plan.yaml', s => s.replace('title: 计算购物车总额', 'title: 修改计算规则'));
  fails(f.run('check'), 'STALE_PLAN');
  fs.writeFileSync(path.join(f.doc, 'shared.md'), '<a id="shared-api"></a>\n共享设计。\n');
  f.edit('plan.yaml', s => s.replace('technical.md#api-01', 'shared.md#shared-api'));
  ok(f.run('render')); ok(f.run('status')); ok(f.run('check'));
  f.edit('shared.md', s => s + '\n更新共享规则。\n');
  fails(f.run('check'), 'STALE_PLAN');
});

test('lite preserves completion evidence and source/output path protection', t => {
  const f = liteFixture(t);
  f.edit('plan.yaml', s => s.replaceAll('status: todo', 'status: done'));
  fails(f.run(), 'EVIDENCE_INVALID');
  f.edit('plan.yaml', s => s.replaceAll('status: done', 'status: done\n    evidence: {red: 失败用例, green: 测试通过, review: 审查通过}'));
  ok(f.run());
  for (const name of ['technical.md', 'plan.yaml']) {
    const g = liteFixture(t);
    const outside = path.join(g.root, name);
    fs.renameSync(path.join(g.doc, name), outside);
    fs.symlinkSync(outside, path.join(g.doc, name));
    fails(g.run(), 'UNSAFE_PATH');
  }
  const g = liteFixture(t);
  fs.writeFileSync(path.join(g.doc, 'plan.md'), '# 手写计划\n');
  fails(g.run('render'), 'HANDWRITTEN_PLAN');
  fs.writeFileSync(path.join(g.doc, 'task-status.md'), '手写状态\n');
  fails(g.run('status'), 'HANDWRITTEN_STATUS');
  const h = liteFixture(t);
  const outside = path.join(h.root, 'outside.md');
  fs.symlinkSync(outside, path.join(h.doc, 'plan.md'));
  fails(h.run('render'), 'UNSAFE_PATH');
  assert.equal(fs.existsSync(outside), false);
});

test('help explains setup without loading dependencies', () => {
  const result = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8', env: { ...process.env, AI_CODING_WORKFLOW_DEPS: '/does-not-exist' } });
  ok(result);
  assert.match(result.stdout, /setup\.mjs/);
  assert.match(result.stdout, /不执行|never executes/i);
});

test('real Gherkin parser supports Chinese, Rule inherited tags, Outline and unplanned history', t => {
  ok(fixture(t).run());
});

test('render is topological, traceable and freshness covers source changes', t => {
  const f = fixture(t);
  ok(f.run('render'));
  const result = fs.readFileSync(path.join(f.doc, 'plan.md'), 'utf8');
  assert.ok(result.indexOf('## T01') < result.indexOf('## T02'));
  assert.match(result, /technical\.md#api-01/);
  assert.match(result, /Task: cart-total\/T01/);
  assert.match(result, /sources-sha256: [a-f0-9]{64}/);
  assert.match(result, /node --test tests\/cart-total\.test\.mjs/);
  ok(f.run('check'));
  f.edit('technical.md', s => s + '\n修订接口说明。\n');
  fails(f.run('check'), 'STALE_PLAN');
  ok(f.run('render'));
  ok(f.run('check'));
  f.edit('plan.md', s => s + '\n手改生成文本。\n');
  fails(f.run('check'), 'STALE_PLAN');
});

test('render refuses handwritten plans and symlink destinations without modifying targets', t => {
  const f = fixture(t);
  const target = path.join(f.doc, 'plan.md');
  fs.writeFileSync(target, '# 人写计划\n');
  fails(f.run('render'), 'HANDWRITTEN_PLAN');
  assert.equal(fs.readFileSync(target, 'utf8'), '# 人写计划\n');
  fs.unlinkSync(target);
  const outside = path.join(f.root, 'outside.md');
  fs.writeFileSync(outside, 'untouched');
  fs.symlinkSync(outside, target);
  fails(f.run('render'), 'UNSAFE_PATH');
  assert.equal(fs.readFileSync(outside, 'utf8'), 'untouched');
});

test('rejects YAML duplicate keys, unknown fields, wrong schema and duplicate task IDs', t => {
  for (const [transform, code] of [
    [s => s.replace('schema: 1', 'schema: 1\nschema: 1'), 'YAML_INVALID'],
    [s => s + 'unexpected: true\n', 'SCHEMA_INVALID'],
    [s => s.replace('schema: 1', 'schema: 2'), 'SCHEMA_INVALID'],
    [s => s.replace('id: T02', 'id: T01'), 'DUPLICATE_ID'],
    [s => s.replace('title: 展示购物车总额', 'title: 展示购物车总额\n    extra: false'), 'SCHEMA_INVALID'],
  ]) {
    const f = fixture(t); f.edit('plan.yaml', transform); fails(f.run(), code);
  }
});

test('validates both requirement anchors and product anchors', t => {
  for (const file of ['requirement.md', 'product.md']) {
    const f = fixture(t); f.edit(file, s => s.replace('id="R01"', 'id="R09"')); fails(f.run(), 'REFERENCE_INVALID');
  }
  const f = fixture(t);
  f.edit('requirement.md', s => s + '\n<a id="R01"></a>\n');
  fails(f.run(), 'DUPLICATE_ID');
});

test('validates Scenario identities, inherited requirements and real Gherkin syntax', t => {
  for (const [transform, code] of [
    [s => s.replace('@S02', '@S01'), 'DUPLICATE_ID'],
    [s => s.replace('@S01', ''), 'SCENARIO_INVALID'],
    [s => s.replace('@S01', '@S01 @S03'), 'SCENARIO_INVALID'],
    [s => s.replace('@R01', '@R88'), 'REFERENCE_INVALID'],
    [s => s.replace('@R01', ''), 'SCENARIO_INVALID'],
    [s => s + '\n THIS IS NOT GHERKIN\n', 'GHERKIN_INVALID'],
  ]) {
    const f = fixture(t); f.edit('acceptance.feature', transform); fails(f.run(), code);
  }
});

test('task requirements and scenario requirements must cover each other', t => {
  const f = fixture(t); f.edit('plan.yaml', s => s.replace('requirements: [R01]', 'requirements: [R01, R02]')); fails(f.run(), 'COVERAGE_INVALID');
  const g = fixture(t); g.edit('acceptance.feature', s => s.replace('@R01', '@R01 @R02')); fails(g.run(), 'COVERAGE_INVALID');
  const h = fixture(t); h.edit('plan.yaml', s => s.replace('scenarios: [S01]', 'scenarios: [S77]')); fails(h.run(), 'REFERENCE_INVALID');
});

test('dependencies must exist, be acyclic and be done before a task is done', t => {
  const a = fixture(t); a.edit('plan.yaml', s => s.replace('depends_on: [T01]', 'depends_on: [T77]')); fails(a.run(), 'DEPENDENCY_INVALID');
  const b = fixture(t); b.edit('plan.yaml', s => s.replace('depends_on: []', 'depends_on: [T02]')); fails(b.run(), 'DEPENDENCY_CYCLE');
  const c = fixture(t); c.edit('plan.yaml', s => s.replace('status: todo', 'status: done\n    evidence: {red: "失败记录", green: "通过记录", review: "审查记录"}')); fails(c.run(), 'DEPENDENCY_INVALID');
});

test('done requires green/review and red or an explicit TDD exception', t => {
  const f = fixture(t); f.edit('plan.yaml', s => s.replaceAll('status: todo', 'status: done')); fails(f.run(), 'EVIDENCE_INVALID');
  const g = fixture(t); g.edit('plan.yaml', s => s.replaceAll('status: todo', 'status: done\n    evidence: {green: "测试通过", review: "接口审查通过"}')); fails(g.run(), 'EVIDENCE_INVALID');
  g.edit('plan.yaml', s => s.replaceAll('status: done', 'status: done\n    tdd_exception: "纯文案变更，不改变可执行行为"')); ok(g.run());
  const h = fixture(t); h.edit('plan.yaml', s => s.replaceAll('status: todo', 'status: done\n    evidence: {red: "失败测试日志", green: "通过测试日志", review: "独立审查记录"}')); ok(h.run('render'));
  assert.match(fs.readFileSync(path.join(h.doc, 'plan.md'), 'utf8'), /失败测试日志/);
});

test('rejects unsafe source file paths but permits not-yet-created project files', t => {
  for (const file of ['../escape.mjs', '/tmp/escape.mjs', '.git/config', 'src/../escape.mjs']) {
    const f = fixture(t); f.edit('plan.yaml', s => s.replace('src/cart/total.mjs', file)); fails(f.run(), 'UNSAFE_PATH');
  }
  const f = fixture(t); fs.symlinkSync(os.tmpdir(), path.join(f.root, 'src')); fails(f.run(), 'UNSAFE_PATH');
  const g = fixture(t); ok(g.run());
});

test('design anchors must exist and source documents cannot cross symlink boundaries', t => {
  const f = fixture(t); f.edit('plan.yaml', s => s.replace('technical.md#api-01', 'technical.md#missing')); fails(f.run(), 'REFERENCE_INVALID');
  const g = fixture(t); fs.renameSync(path.join(g.doc, 'technical.md'), path.join(g.root, 'shared.md')); fs.symlinkSync(path.join(g.root, 'shared.md'), path.join(g.doc, 'technical.md')); fails(g.run(), 'UNSAFE_PATH');
});

test('rejects unresolved teaching placeholders', t => {
  for (const placeholder of ['REPLACE_TEST_COMMAND', '<实际测试命令>', 'TBD']) {
    const f = fixture(t); f.edit('plan.yaml', s => s.replace('node --test tests/cart-total.test.mjs', placeholder)); fails(f.run(), 'PLACEHOLDER');
  }
});

test('verify is rendered literally and is never executed', t => {
  const f = fixture(t);
  const marker = path.join(f.root, 'must-not-exist');
  f.edit('plan.yaml', s => s.replace('node --test tests/cart-total.test.mjs', `touch ${marker}`));
  ok(f.run('validate')); ok(f.run('render')); ok(f.run('check'));
  assert.equal(fs.existsSync(marker), false);
});

test('missing dependencies fail with an actionable setup instruction', t => {
  const f = fixture(t);
  const result = f.run('validate', { AI_CODING_WORKFLOW_DEPS: path.join(f.root, 'no-deps') });
  fails(result, 'DEPENDENCIES_MISSING');
  assert.match(result.stderr, /setup\.mjs/);
});

test('documentation-only iteration permits no scenarios with an explicit TDD exception', t => {
  const f = fixture(t);
  f.edit('acceptance.feature', () => 'Feature: 购物车文档说明\n');
  f.edit('plan.yaml', () => `schema: 1
feature: cart-total
iteration: "docs-1"
tasks:
  - id: T01
    title: 澄清已有接口说明
    requirements: [R01]
    scenarios: []
    design: [technical.md#api-01]
    files: [doc/cart-total/technical.md]
    depends_on: []
    verify: git diff --check
    status: todo
    tdd_exception: 纯文档澄清，没有可执行行为变化
`);
  ok(f.run('render')); ok(f.run('check'));
  f.edit('plan.yaml', s => s.replace('    tdd_exception: 纯文档澄清，没有可执行行为变化\n', ''));
  fails(f.run(), 'EVIDENCE_INVALID');
});

test('planned scenarios must contain executable steps', t => {
  const f = fixture(t);
  f.edit('acceptance.feature', s => s.replace('      假如 已计算总额\n      那么 页面显示总额\n', ''));
  fails(f.run(), 'SCENARIO_INVALID');
});

test('planned Outline requires at least one executable Examples row', t => {
  const f = fixture(t);
  f.edit('acceptance.feature', s => s.replace('      例子:\n        | price | quantity | total |\n        | 3     | 2        | 6     |\n', ''));
  fails(f.run(), 'SCENARIO_INVALID');
  const g = fixture(t);
  g.edit('acceptance.feature', s => s.replace('        | 3     | 2        | 6     |\n', ''));
  fails(g.run(), 'SCENARIO_INVALID');
});

test('design links safely encode parentheses, spaces and fragment punctuation', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.doc, 'shared (draft).md'), '<a id="api-(x)"></a>\n已有契约\n');
  f.edit('plan.yaml', s => s.replace('technical.md#api-01', 'shared (draft).md#api-(x)'));
  ok(f.run('render'));
  assert.match(fs.readFileSync(path.join(f.doc, 'plan.md'), 'utf8'), /shared%20%28draft%29\.md#api-%28x%29/);
});


test('HTML comment examples inside fences preserve real body anchors in both modes', t => {
  for (const make of [fixture, liteFixture]) {
    for (const fence of ['```', '~~~~']) {
      const f = make(t);
      const names = make === fixture ? ['requirement.md', 'product.md', 'technical.md'] : ['technical.md'];
      for (const name of names) {
        f.edit(name, s => `${fence}html\n<!--\n${fence}\n${s}\n<!-- editorial note -->\n`);
      }
      ok(f.run('validate')); ok(f.run('render')); ok(f.run('check'));
    }
  }
});

test('comment markers in opening fence info never hide following body anchors', t => {
  for (const make of [fixture, liteFixture]) {
    for (const fence of ['```', '~~~~']) {
      const f = make(t);
      const names = make === fixture ? ['requirement.md', 'product.md', 'technical.md'] : ['technical.md'];
      for (const name of names) {
        f.edit(name, s => `${fence}html <!-- comment-opening-example\nexample\n${fence}\n${s}`);
      }
      ok(f.run('validate'));
    }
  }
});

test('fences inside body comments cannot expose hidden anchors', t => {
  for (const make of [fixture, liteFixture]) {
    const f = make(t);
    const name = make === fixture ? 'requirement.md' : 'technical.md';
    f.edit(name, s => s.replace('<a id="R01"></a>', '<!--\n```html\n<a id="R01"></a>\n```\n-->'));
    fails(f.run(), 'REFERENCE_INVALID');
  }
});

test('only standalone anchors outside fenced Markdown code declare references', t => {
  for (const file of ['requirement.md', 'product.md', 'technical.md']) {
    const f = fixture(t); f.edit(file, s => `\`\`\`html\n${s}\`\`\`\n`); fails(f.run(), 'REFERENCE_INVALID');
    const g = fixture(t); g.edit(file, s => `~~~html\n${s}~~~\n`); fails(g.run(), 'REFERENCE_INVALID');
  }
  const h = fixture(t); h.edit('requirement.md', s => s.replace('<a id="R01"></a>', '示例：<a id="R01"></a>')); fails(h.run(), 'REFERENCE_INVALID');
});

test('doing tasks must wait for completed dependencies', t => {
  const f = fixture(t); f.edit('plan.yaml', s => s.replace('status: todo', 'status: doing')); fails(f.run(), 'DEPENDENCY_INVALID');
  const g = fixture(t); g.edit('plan.yaml', s => s.replace('status: todo', 'status: blocked')); ok(g.run());
});

function setupFixture(t) {
  const f = fixture(t);
  const deps = path.join(f.root, 'deps');
  const bin = path.join(f.root, 'bin');
  const marker = path.join(f.root, 'npm-called');
  fs.mkdirSync(deps); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'npm'), '#!/bin/sh\nprintf called > "$WORKFLOW_SETUP_NPM_MARKER"\n', { mode: 0o755 });
  const run = () => spawnSync(process.execPath, [setup], { encoding: 'utf8', env: { ...process.env,
    PATH: `${bin}${path.delimiter}${process.env.PATH}`, AI_CODING_WORKFLOW_DEPS: deps, WORKFLOW_SETUP_NPM_MARKER: marker } });
  return { ...f, deps, marker, run };
}

test('setup refuses a different package before overwriting files or invoking npm', t => {
  const f = setupFixture(t);
  const original = '{"name":"existing-other-project"}\n';
  fs.writeFileSync(path.join(f.deps, 'package.json'), original);
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.equal(fs.readFileSync(path.join(f.deps, 'package.json'), 'utf8'), original);
  assert.equal(fs.existsSync(f.marker), false);
});

test('setup checks dangling manifests before any writes and never writes through them', t => {
  for (const name of ['package.json', 'package-lock.json']) {
    const f = setupFixture(t);
    const outside = path.join(f.root, 'outside.json');
    fs.symlinkSync(outside, path.join(f.deps, name));
    const result = f.run();
    assert.notEqual(result.status, 0);
    assert.equal(fs.existsSync(outside), false);
    assert.equal(fs.existsSync(f.marker), false);
    if (name === 'package-lock.json') assert.equal(fs.existsSync(path.join(f.deps, 'package.json')), false);
  }
});

test('setup may refresh its own dedicated dependency directory', t => {
  const f = setupFixture(t);
  ok(f.run()); ok(f.run());
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.deps, 'package.json'), 'utf8')).name, 'ai-coding-workflow');
  assert.equal(fs.readFileSync(f.marker, 'utf8'), 'called');
});

function statusTasks(f, tasks) {
  f.edit('plan.yaml', () => JSON.stringify({ schema: 1, feature: path.basename(f.doc), iteration: 'status-1', tasks: tasks.map(task => ({
    title: `任务 ${task.id}`, requirements: ['R01'], scenarios: ['S01'], design: ['technical.md#api-01'],
    files: ['src/cart/total.mjs'], depends_on: [], verify: 'node --test tests/cart-total.test.mjs', status: 'todo', ...task,
  })) }, null, 2));
}
function visibleStatus(f) {
  return fs.readFileSync(path.join(f.doc, 'task-status.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '').trim();
}

test('status writes exactly four visible columns with all statuses in topological order', t => {
  const f = fixture(t);
  statusTasks(f, [
    { id: 'T02', title: '页面调整', status: 'doing', depends_on: ['T01'], remark: '' },
    { id: 'T01', title: '金额计算', status: 'done', evidence: { red: '失败用例', green: '测试通过', review: '审查通过' } },
    { id: 'T03', title: '文案调整', remark: '等待评审' },
    { id: 'T04', title: '接口联调', status: 'blocked', remark: '等待环境' },
  ]);
  ok(f.run('status'));
  assert.equal(visibleStatus(f), [
    '| 任务编号 | 名称 | 状态 | 备注 |',
    '| --- | --- | --- | --- |',
    '| T01 | 金额计算 | 已完成 | — |',
    '| T02 | 页面调整 | 进行中 | — |',
    '| T03 | 文案调整 | 未开始 | 等待评审 |',
    '| T04 | 接口联调 | 受阻 | 等待环境 |',
  ].join('\n'));
  assert.match(fs.readFileSync(path.join(f.doc, 'task-status.md'), 'utf8'), /sources-sha256: [a-f0-9]{64}/);
});

test('status renders remarks literally without introducing columns, rows, HTML or Markdown formatting', t => {
  const f = fixture(t);
  statusTasks(f, [{ id: 'T01', title: '名称|调整', remark: '| first\n<script>x</script> **bold** [link](url) `code` &amp; \\ ~strike~' }]);
  ok(f.run('status'));
  const visible = visibleStatus(f);
  assert.equal(visible.split('\n').length, 3);
  for (const line of visible.split('\n')) assert.equal(line.split('|').length, 6);
  assert.match(visible, /名称&#124;调整/);
  assert.match(visible, /&#124; first<br>&lt;script&gt;x&lt;\/script&gt;/);
  assert.match(visible, /&#42;&#42;bold&#42;&#42;/);
  assert.match(visible, /&#91;link&#93;\(url\)/);
  assert.match(visible, /&#96;code&#96; &amp;amp; &#92; &#126;strike&#126;/);
  assert.doesNotMatch(visible, /<script>|\*\*bold\*\*|\[link\]/);
});

test('status never executes verify or modifies the detailed plan and source DSL', t => {
  const f = fixture(t);
  const marker = path.join(f.root, 'not-executed');
  statusTasks(f, [{ id: 'T01', verify: `touch ${marker}`, remark: '人工验收前查看' }]);
  ok(f.run('render'));
  const before = new Map(['plan.yaml', 'plan.md', 'requirement.md', 'product.md', 'technical.md', 'acceptance.feature'].map(name => [name, fs.readFileSync(path.join(f.doc, name), 'utf8')]));
  ok(f.run('status')); ok(f.run('check'));
  for (const [name, content] of before) assert.equal(fs.readFileSync(path.join(f.doc, name), 'utf8'), content);
  assert.equal(fs.existsSync(marker), false);
  assert.match(before.get('plan.md'), /人工验收前查看/);
});

test('status refuses handwritten and symlink status files, including dangling links', t => {
  const f = fixture(t);
  const output = path.join(f.doc, 'task-status.md');
  fs.writeFileSync(output, '人工状态记录\n');
  fails(f.run('status'), 'HANDWRITTEN_STATUS');
  assert.equal(fs.readFileSync(output, 'utf8'), '人工状态记录\n');
  fs.unlinkSync(output);
  const outside = path.join(f.root, 'outside-status.md');
  fs.symlinkSync(outside, output);
  fails(f.run('status'), 'UNSAFE_PATH');
  assert.equal(fs.existsSync(outside), false);
  fs.writeFileSync(outside, '不能覆盖');
  fails(f.run('status'), 'UNSAFE_PATH');
  assert.equal(fs.readFileSync(outside, 'utf8'), '不能覆盖');
});

test('check permits absent status but detects stale or edited status after plan refresh', t => {
  const f = fixture(t);
  ok(f.run('render')); ok(f.run('check'));
  assert.equal(fs.existsSync(path.join(f.doc, 'task-status.md')), false);
  ok(f.run('status')); ok(f.run('check'));
  f.edit('plan.yaml', s => s.replace('title: 计算购物车总额', 'title: 更新购物车总额'));
  fails(f.run('check'), 'STALE_PLAN');
  ok(f.run('render'));
  fails(f.run('check'), 'STALE_STATUS');
  ok(f.run('status')); ok(f.run('check'));
  f.edit('task-status.md', s => s + '\n手动增加内容\n');
  fails(f.run('check'), 'STALE_STATUS');
});

test('check protects handwritten and symlink status files even though it never writes', t => {
  const f = fixture(t);
  ok(f.run('render'));
  const output = path.join(f.doc, 'task-status.md');
  fs.writeFileSync(output, '人工状态记录\n');
  fails(f.run('check'), 'HANDWRITTEN_STATUS');
  fs.unlinkSync(output);
  fs.symlinkSync(path.join(f.root, 'absent.md'), output);
  fails(f.run('check'), 'UNSAFE_PATH');
});

test('new req-prefixed requirement directory works without migrating existing slugs', t => {
  const f = fixture(t, 'req-r01-profile');
  ok(f.run('validate')); ok(f.run('render')); ok(f.run('status')); ok(f.run('check'));
  assert.equal(fs.existsSync(path.join(f.root, 'doc/req-r01-profile/task-status.md')), true);
  assert.equal(fs.existsSync(path.join(f.root, 'doc/cart-total')), false);
});

test('remark is optional or a string including empty strings, never another YAML type', t => {
  for (const remark of [null, 12, false, [], {}]) {
    const f = fixture(t); statusTasks(f, [{ id: 'T01', remark }]); fails(f.run(), 'SCHEMA_INVALID');
  }
  for (const remark of ['', '有效备注']) {
    const f = fixture(t); statusTasks(f, [{ id: 'T01', remark }]); ok(f.run());
  }
});

test('help describes status and the req-prefixed directory example', () => {
  const result = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' });
  ok(result);
  assert.match(result.stdout, /status/);
  assert.match(result.stdout, /task-status\.md/);
  assert.match(result.stdout, /req-r01-profile/);
});
