/**
 * dev-flow-v2 脚本 —— 研发流水线编排
 *
 * args:
 *   feature  : string — kebab-case 功能名
 *
 * 返回：
 *   { status: 'ok' | 'failed', summary: string }
 *   - ok    : 全流程完成
 *   - failed: 不可恢复错误
 */

export const meta = {
  name: 'dev-flow-v2-pipeline',
  description: '研发工作流 v2 编排脚本——TRD→编码→E2E→归档',
  phases: [
    { title: 'TRD', detail: '技术设计 + specs + plan' },
    { title: '编码', detail: 'TDD 编码 + code review' },
    { title: '验证', detail: '运行时验证 + E2E 验收' },
    { title: '归档', detail: 'OpenSpec 归档' },
  ],
}

const feature = args.feature

// ========== Schema ==========
// schema 相当于 Tool function calling 的 parameters 定义：
// 告诉 LLM "你必须按这个 JSON 格式返回"，缺 required 字段自动重试补齐。
// agent() 返回解析后的对象，直接 result.field 访问，无需 parse。

const TRD_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    taskCount: { type: 'number' },
    docReviewPassed: { type: 'boolean' },
    needsHuman: { type: 'boolean' },
  },
  required: ['success', 'riskLevel', 'taskCount', 'docReviewPassed', 'needsHuman'],
}

const CODE_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    testTotal: { type: 'number' },
    testPassed: { type: 'number' },
    testFailed: { type: 'number' },
    codeReviewPassed: { type: 'boolean' },
    needsHuman: { type: 'boolean' },
  },
  required: ['success', 'testTotal', 'testPassed', 'codeReviewPassed', 'needsHuman'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'BLOCKED', 'SKIP'] },
  },
  required: ['verdict'],
}

const E2E_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    totalRules: { type: 'number' },
    passed: { type: 'number' },
    failed: { type: 'number' },
    needsHuman: { type: 'boolean' },
  },
  required: ['success', 'totalRules', 'passed', 'failed', 'needsHuman'],
}


// ========== TRD ==========

async function runTRD() {
  phase('TRD')
  log(`📐 TRD 产出: ${feature}`)

  let result = await agent(
    `为 "${feature}" 产出技术设计文档。使用 Skill({skill: 'trd-writer'})。按 OpenSpec + Superpowers 规范产出 design.md + specs/ + plan.md。内部完成 doc-reviewer (opus) 审查。完成后追加 audit-trail 到 ./docs/${feature}/audit-trail.md。返回结构化结果。`,
    { phase: 'TRD', schema: TRD_SCHEMA }
  )

  let retries = 0
  while (result && !result.docReviewPassed && retries < 2) {
    retries++
    log(`🔁 TRD 审查重试 ${retries}/2`)
    result = await agent(
      `TRD 审查未通过，根据意见修复 openspec/changes/${feature}/ 下的文档。重试 ${retries}/2。`,
      { phase: 'TRD', schema: TRD_SCHEMA }
    )
  }

  return result
}


// ========== 编码 ==========

async function runCode() {
  phase('编码')
  log(`🔨 编码: ${feature}`)

  let result = await agent(
    `为 "${feature}" TDD 编码。使用 Skill({skill: 'coder'})。coder 内部：读取 plan.md → 逐 Task 编码 → spec 审查 → simplify → code-reviewer。追加 audit-trail。返回结构化结果。`,
    { phase: '编码', schema: CODE_SCHEMA }
  )

  let retries = 0
  while (result && !result.codeReviewPassed && retries < 2) {
    retries++
    log(`🔁 代码审查重试 ${retries}/2`)
    result = await agent(
      `代码审查未通过，使用 Skill({skill: 'coder'}) 修复。失败测试 ${result.testFailed || 0}。重试 ${retries}/2。`,
      { phase: '编码', schema: CODE_SCHEMA }
    )
  }

  return result
}


// ========== 运行时验证 ==========

async function runVerify() {
  phase('验证')
  log(`🔍 验证: ${feature}`)

  const result = await agent(
    `为 "${feature}" 运行时验证。使用 Skill({skill: 'verify'})。追加 audit-trail。返回判定结果。`,
    { phase: '验证', schema: VERIFY_SCHEMA }
  )

  return result
}


// ========== E2E 验收 ==========

async function runE2E() {
  log(`✅ E2E: ${feature}`)

  let result = await agent(
    `为 "${feature}" E2E 验收。使用 Skill({skill: 'e2e-validator'})。追加 audit-trail。返回结构化结果。`,
    { phase: '验证', schema: E2E_SCHEMA }
  )

  let retries = 0
  while (result && !result.success && retries < 2) {
    retries++
    log(`🔁 E2E 重试 ${retries}/2`)
    result = await agent(
      `E2E 未通过，使用 Skill({skill: 'e2e-validator'}) 修复。重试 ${retries}/2。`,
      { phase: '验证', schema: E2E_SCHEMA }
    )
  }

  return result
}


// ========== 归档 ==========

async function runArchive() {
  phase('归档')
  log(`📦 归档: ${feature}`)

  const result = await agent(
    `为 "${feature}" 归档。1. Skill({skill: 'openspec-archive-change'}) 2. 创建 docs/archive/ 目录并复制文件 3. rm -rf docs/${feature}/ 4. 追加 audit-trail 最终条目。返回 { archived: boolean }。`,
    { phase: '归档', schema: { type: 'object', properties: { archived: { type: 'boolean' } }, required: ['archived'] } }
  )

  return result
}


// ========== 主流程 ==========
// 串行多阶段 pipeline：TRD → 编码 → 验证 → E2E → 归档
// 每个阶段抛异常 → 后续自动跳过，最终结果为 null
// 每阶段返回值自动传给下一阶段

async function main() {
  log(`🚀 dev-flow-v2 | ${feature}`)

  const [ok] = await pipeline(
    [{ feature }],

    // ── Stage 1: TRD ──
    async (item) => {
      const trd = await runTRD()
      if (!trd?.success) throw new Error('TRD_FAILED')
      return trd
    },

    // ── Stage 2: 编码 ──
    async (trd, item) => {
      log(`📊 TRD: risk=${trd.riskLevel}, tasks=${trd.taskCount}`)
      const code = await runCode()
      if (!code?.success) throw new Error('CODE_FAILED')
      return code
    },

    // ── Stage 3: 运行时验证 ──
    async (code, item) => {
      const verify = await runVerify()
      if (verify?.verdict === 'FAIL') throw new Error('VERIFY_FAILED')
      return verify
    },

    // ── Stage 4: E2E ──
    async (verify, item) => {
      const e2e = await runE2E()
      if (!e2e?.success) throw new Error('E2E_FAILED')
      return e2e
    },

    // ── Stage 5: 归档 ──
    async (e2e, item) => {
      await runArchive()
      return true
    },
  )

  return {
    status: ok ? 'ok' : 'failed',
    summary: ok ? `${feature} 全流程完成 ✅` : `${feature} 流程中断，详见日志`,
  }
}

return main()
