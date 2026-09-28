/**
 * dev-flow-v2 脚本 —— 研发流水线编排
 *
 * 用法（通过 runner.js 调用）：
 *   const { createPipeline } = require('./pipeline.js')
 *   const main = createPipeline({ args, agent, phase, log })
 *   const result = await main()
 *
 * 依赖注入：
 *   args  : { feature, mode } — feature 为 kebab-case 功能名；mode ∈ design|build|full（默认 full）
 *     - design : 仅 TRD，返回 riskLevel/taskCount 供编排器做审核闸门
 *     - build  : 编码 → 运行时验证 → E2E → 归档（假定 TRD 已完成）
 *     - full   : design + build 连跑，无人工闸门（低风险全自动）
 *   agent : 派子 agent 干活（真实实现 shell 调 claude -p，或 mock）
 *   phase / log : 进度输出
 *
 * 返回：
 *   { status: 'ok' | 'failed', summary, ... }
 *   - design 额外：riskLevel / taskCount / needsHuman
 *   - build  额外：e2eRootCause / needsHuman
 */

const meta = {
  name: 'dev-flow-v2-pipeline',
  description: '研发工作流 v2 编排脚本——TRD→编码→E2E→归档',
  phases: [
    { title: 'TRD', detail: '技术设计 + specs + plan' },
    { title: '编码', detail: 'TDD 编码 + code review' },
    { title: '验证', detail: '运行时验证 + E2E 验收' },
    { title: '归档', detail: 'OpenSpec 归档' },
  ],
}

// ========== Schema ==========
// schema 相当于 Tool function calling 的 parameters 定义：
// 告诉 LLM "你必须按这个 JSON 格式返回"，缺 required 字段自动重试补齐。
// agent() 返回解析后的对象，直接 result.field 访问，无需 parse。
// reviewFeedback / issues 字段把上一轮审查意见传回重试，避免盲重跑。

const TRD_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    taskCount: { type: 'number' },
    docReviewPassed: { type: 'boolean' },
    needsHuman: { type: 'boolean' },
    reviewFeedback: { type: 'string' },
  },
  required: ['success', 'riskLevel', 'taskCount', 'docReviewPassed', 'needsHuman', 'reviewFeedback'],
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
    reviewFeedback: { type: 'string' },
  },
  required: ['success', 'testTotal', 'testPassed', 'codeReviewPassed', 'needsHuman', 'reviewFeedback'],
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
    issues: { type: 'string' },
    rootCause: { type: 'string', enum: ['code', 'design', 'requirement'] },
  },
  required: ['success', 'totalRules', 'passed', 'failed', 'needsHuman', 'issues'],
}

function createPipeline({ args, agent, phase, log }) {
  const feature = args.feature
  const mode = args.mode || 'full'

  // ========== TRD ==========

  async function runTRD() {
    phase('TRD')
    log(`📐 TRD 产出: ${feature}`)

    let result = await agent(
      `为 "${feature}" 产出技术设计文档。使用 Skill({skill: 'trd-writer'})。按 OpenSpec + Superpowers 规范产出 design.md + specs/ + plan.md。内部完成 doc-reviewer (opus) 审查。完成后追加 audit-trail 到 ./docs/${feature}/audit-trail.md。返回结构化结果，其中 reviewFeedback 填写 doc-reviewer 的审查意见（通过则填空字符串）。`,
      { phase: 'TRD', schema: TRD_SCHEMA }
    )

    let retries = 0
    while (result && !result.docReviewPassed && retries < 2) {
      retries++
      log(`🔁 TRD 审查重试 ${retries}/2`)
      result = await agent(
        `TRD 审查未通过（第 ${retries} 次）。上一轮审查意见：\n${result.reviewFeedback || '（未捕获到意见，请对照 doc-reviewer 审查维度自查 design.md/specs/plan.md）'}\n\n根据上述意见修复 openspec/changes/${feature}/ 下的文档，重新执行 doc-reviewer 审查。reviewFeedback 返回本轮审查意见。`,
        { phase: 'TRD', schema: TRD_SCHEMA }
      )
    }

    if (result && !result.docReviewPassed) result.needsHuman = true
    return result
  }

  // ========== 编码 ==========

  async function runCode() {
    phase('编码')
    log(`🔨 编码: ${feature}`)

    let result = await agent(
      `为 "${feature}" TDD 编码。使用 Skill({skill: 'coder'})。coder 内部：读取 plan.md → 逐 Task 编码 → spec 审查 → simplify → code-reviewer。追加 audit-trail。返回结构化结果，其中 reviewFeedback 填写 code-reviewer 的审查意见（通过则填空字符串）。`,
      { phase: '编码', schema: CODE_SCHEMA }
    )

    let retries = 0
    while (result && !result.codeReviewPassed && retries < 2) {
      retries++
      log(`🔁 代码审查重试 ${retries}/2`)
      result = await agent(
        `代码审查未通过（第 ${retries} 次）。上一轮审查意见：\n${result.reviewFeedback || `（未捕获到意见，已知失败测试 ${result.testFailed || 0} 个）`}\n\n使用 Skill({skill: 'coder'}) 根据意见修复，重新执行 code-reviewer 审查。reviewFeedback 返回本轮审查意见。`,
        { phase: '编码', schema: CODE_SCHEMA }
      )
    }

    if (result && !result.codeReviewPassed) result.needsHuman = true
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

    const result = await agent(
      `为 "${feature}" E2E 验收。使用 Skill({skill: 'e2e-validator'})。追加 audit-trail。返回结构化结果：success 表示全部业务规则通过；若未通过，issues 填写未通过规则的证据链摘要，rootCause 按未通过规则的性质判定为 code（实现错误）/ design（设计缺陷）/ requirement（需求理解偏差）。`,
      { phase: '验证', schema: E2E_SCHEMA }
    )

    return result
  }

  // ========== 归档 ==========

  async function runArchive() {
    phase('归档')
    log(`📦 归档: ${feature}`)

    const result = await agent(
      `为 "${feature}" 归档。归档前先确认代码已提交：运行 \`git status --porcelain\`，若有未提交变更先 git commit（无法提交则中断并报告）。然后：1. Skill({skill: 'opsx:archive'}) 2. 创建 docs/archive/ 目录并复制文件 3. rm -rf docs/${feature}/ 4. 追加 audit-trail 最终条目。返回结构化结果。`,
      { phase: '归档', schema: { type: 'object', properties: { archived: { type: 'boolean' }, commitVerified: { type: 'boolean' } }, required: ['archived', 'commitVerified'] } }
    )

    return result
  }

  // ========== mode 执行 ==========

  function humanResult(stage) {
    return {
      status: 'failed',
      summary: `${feature} 需人工介入（${stage}）⚠️`,
      needsHuman: true,
    }
  }

  async function runDesign() {
    log(`📐 design 模式: ${feature}`)

    const trd = await runTRD()
    if (trd?.needsHuman) return { ...humanResult('TRD'), riskLevel: trd.riskLevel, taskCount: trd.taskCount }
    if (!trd?.success) {
      return {
        status: 'failed',
        summary: `${feature} TRD 失败，详见日志`,
        needsHuman: false,
        riskLevel: trd?.riskLevel,
        taskCount: trd?.taskCount,
      }
    }

    return {
      status: 'ok',
      summary: `${feature} TRD 完成 ✅`,
      needsHuman: false,
      riskLevel: trd.riskLevel,
      taskCount: trd.taskCount,
    }
  }

  async function runBuild() {
    log(`🔨 build 模式: ${feature}`)

    // ── 编码 ──
    const code = await runCode()
    if (code?.needsHuman) return { ...humanResult('编码'), e2eRootCause: null }
    if (!code?.success) {
      return { status: 'failed', summary: `${feature} 编码失败，详见日志`, needsHuman: false, e2eRootCause: null }
    }

    // ── 运行时验证 ──
    const verify = await runVerify()
    if (verify?.verdict === 'BLOCKED') return { ...humanResult('验证'), e2eRootCause: null }
    if (verify?.verdict === 'FAIL') {
      return { status: 'failed', summary: `${feature} 运行时验证失败，详见日志`, needsHuman: false, e2eRootCause: null }
    }

    // ── E2E 验收 ──
    const e2e = await runE2E()
    if (e2e?.needsHuman) return { ...humanResult('E2E'), e2eRootCause: null }
    if (!e2e?.success) {
      return {
        status: 'failed',
        summary: `${feature} E2E 失败（根因: ${e2e.rootCause || '未判定'}）`,
        needsHuman: false,
        e2eRootCause: e2e.rootCause || null,
      }
    }

    // ── 归档 ──
    await runArchive()

    return {
      status: 'ok',
      summary: `${feature} 构建完成 ✅`,
      needsHuman: false,
      e2eRootCause: null,
    }
  }

  async function runFull() {
    const design = await runDesign()
    if (design.status !== 'ok') return design
    return runBuild()
  }

  // ========== 入口 ==========

  async function main() {
    log(`🚀 dev-flow-v2 | ${feature} | mode=${mode}`)

    if (mode === 'design') return runDesign()
    if (mode === 'build') return runBuild()
    return runFull()
  }

  return main
}

module.exports = { createPipeline, meta }
