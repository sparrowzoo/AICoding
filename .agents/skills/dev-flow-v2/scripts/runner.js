#!/usr/bin/env node
/**
 * dev-flow-v2 独立 Node 运行时。
 *
 * 补齐 pipeline.js 依赖的「Workflow 运行时」原语，让脚本能真正跑起来：
 *   - args   : 注入 feature/mode
 *   - agent  : 派子 agent（当前用可插拔 mock，按 schema 返回合法结果）
 *   - phase  : 阶段横幅
 *   - log    : 进度日志
 *   - 顶层 `return main()`：用 new Function 把脚本当函数体执行，天然支持
 *
 * 用法：
 *   node scripts/runner.js --feature=<kebab-case> [--mode=design|build|full] [--scenario=<name>]
 *
 * scenario 用不同注入结果证明编排分支（闸门/重试/根因回退）真实执行，默认 pass 全通过。
 */

const { createPipeline } = require('./pipeline.js')

// ---------- CLI ----------
function parseCli(argv) {
  const out = { feature: null, mode: 'full', scenario: 'pass' }
  for (const a of argv) {
    const [k, v] = a.replace(/^--/, '').split('=')
    if (k === 'feature') out.feature = v
    else if (k === 'mode') out.mode = v
    else if (k === 'scenario') out.scenario = v
  }
  return out
}

const cli = parseCli(process.argv.slice(2))
if (!cli.feature) {
  console.error('缺少 --feature（kebab-case 功能名）')
  process.exit(2)
}
if (!['design', 'build', 'full'].includes(cli.mode)) {
  console.error(`非法 mode: ${cli.mode}（应为 design|build|full）`)
  process.exit(2)
}

// ---------- 日志原语（pipeline.js 直接调用） ----------
function phase(title) {
  console.log(`\n========== [${title}] ==========`)
}
function log(msg) {
  console.log(`  ${msg}`)
}

// ---------- mock agent ----------
// 每个 phase 一个 schema 合法的结果集合；scenario 指定各 phase 的结果序列。
// 序列按调用顺序消费，最后一个结果重复（用于 retry 场景：先失败一次再通过）。
const BASE = {
  TRD: {
    pass: { success: true, riskLevel: 'low', taskCount: 3, docReviewPassed: true, needsHuman: false, reviewFeedback: '' },
    reviewFail: { success: true, riskLevel: 'low', taskCount: 3, docReviewPassed: false, needsHuman: false, reviewFeedback: 'design.md 缺少风险清单' },
    fail: { success: false, riskLevel: 'low', taskCount: 3, docReviewPassed: false, needsHuman: false, reviewFeedback: '' },
    human: { success: true, riskLevel: 'high', taskCount: 12, docReviewPassed: true, needsHuman: true, reviewFeedback: '' },
  },
  CODE: {
    pass: { success: true, testTotal: 5, testPassed: 5, testFailed: 0, codeReviewPassed: true, needsHuman: false, reviewFeedback: '' },
    reviewFail: { success: true, testTotal: 5, testPassed: 4, testFailed: 1, codeReviewPassed: false, needsHuman: false, reviewFeedback: '边界条件漏测' },
    fail: { success: false, testTotal: 5, testPassed: 2, testFailed: 3, codeReviewPassed: false, needsHuman: false, reviewFeedback: '' },
    human: { success: true, testTotal: 5, testPassed: 5, testFailed: 0, codeReviewPassed: true, needsHuman: true, reviewFeedback: '' },
  },
  VERIFY: {
    pass: { verdict: 'PASS' },
    fail: { verdict: 'FAIL' },
    blocked: { verdict: 'BLOCKED' },
    skip: { verdict: 'SKIP' },
  },
  E2E: {
    pass: { success: true, totalRules: 5, passed: 5, failed: 0, needsHuman: false, issues: '', rootCause: null },
    code: { success: false, totalRules: 5, passed: 3, failed: 2, needsHuman: false, issues: '规则2 边界没写对', rootCause: 'code' },
    design: { success: false, totalRules: 5, passed: 3, failed: 2, needsHuman: false, issues: '规则3 接口契约不符', rootCause: 'design' },
    requirement: { success: false, totalRules: 5, passed: 2, failed: 3, needsHuman: false, issues: '规则1 需求理解偏差', rootCause: 'requirement' },
    human: { success: false, totalRules: 5, passed: 2, failed: 3, needsHuman: true, issues: '需人工介入', rootCause: null },
  },
  ARCHIVE: {
    pass: { archived: true, commitVerified: true },
  },
}

// scenario → { phase: [结果 key 序列] }，缺省的 phase 走 ['pass']
const SCENARIOS = {
  pass: {},
  'trd-retry': { TRD: ['reviewFail', 'pass'] },
  'trd-fail': { TRD: ['fail'] },
  'trd-human': { TRD: ['human'] },
  'code-retry': { CODE: ['reviewFail', 'pass'] },
  'code-fail': { CODE: ['fail'] },
  'verify-fail': { VERIFY: ['fail'] },
  'verify-blocked': { VERIFY: ['blocked'] },
  'verify-skip': { VERIFY: ['skip'] },
  'e2e-code': { E2E: ['code'] },
  'e2e-design': { E2E: ['design'] },
  'e2e-requirement': { E2E: ['requirement'] },
  'e2e-human': { E2E: ['human'] },
}

if (!SCENARIOS[cli.scenario]) {
  console.error(`未知 scenario: ${cli.scenario}`)
  process.exit(2)
}
const scenario = SCENARIOS[cli.scenario]

// 用 schema.required 判断当前是哪个 phase（runE2E 和 runVerify 都传 phase '验证'，靠 schema 区分）
function detectPhase(schema) {
  const req = (schema && schema.required) || []
  if (req.includes('riskLevel')) return 'TRD'
  if (req.includes('testTotal')) return 'CODE'
  if (req.includes('verdict')) return 'VERIFY'
  if (req.includes('totalRules')) return 'E2E'
  if (req.includes('archived')) return 'ARCHIVE'
  return null
}

const callIndex = {}

async function agent(_prompt, options = {}) {
  const p = detectPhase(options.schema)
  if (!p) throw new Error(`mock agent 无法识别 schema: ${JSON.stringify(options.schema && options.schema.required)}`)

  const seq = (scenario[p] && scenario[p].length) ? scenario[p] : ['pass']
  const i = callIndex[p] || 0
  callIndex[p] = i + 1
  const key = seq[Math.min(i, seq.length - 1)]

  log(`[mock agent] ${p} → ${key}（第 ${i + 1} 次调用）`)
  return BASE[p][key]
}

// ---------- 加载并执行 pipeline.js ----------
const args = { feature: cli.feature, mode: cli.mode }
const main = createPipeline({ args, agent, phase, log })

;(async () => {
  log(`🚀 dev-flow-v2 | ${cli.feature} | mode=${cli.mode} | scenario=${cli.scenario}`)
  try {
    const result = await main()
    console.log('\n========== 返回 ==========')
    console.log(JSON.stringify(result, null, 2))
  } catch (e) {
    console.error('\n❌ pipeline 抛异常：', e)
    process.exit(1)
  }
})()
