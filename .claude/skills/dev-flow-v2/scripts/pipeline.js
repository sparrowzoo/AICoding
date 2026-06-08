/**
 * dev-flow-v2 研发工作流脚本
 *
 * 按 phase 推进研发流水线，每个 phase 通过 agent() 调用专职 Skill。
 * 质量门禁在各 Skill 内部自闭环，脚本只看结构化结果。
 *
 * args:
 *   feature  : string — kebab-case 功能名
 *   phase    : 'design' | 'build'
 *   scale    : 'normal' | 'small'
 */

export const meta = {
  name: 'dev-flow-v2-pipeline',
  description: '研发工作流 v2 编排脚本——TRD→编码→E2E→归档',
  phases: [
    { title: 'TRD', detail: '技术设计 + specs + plan' },
    { title: '审查', detail: '并行 doc-reviewer (opus) 独立审查' },
    { title: '编码', detail: 'SDD 派发 implementer 子 Agent 逐 Task 编码' },
    { title: '验证', detail: '运行时验证 + E2E 验收' },
    { title: '归档', detail: 'OpenSpec 归档 + 文档归档' },
  ],
}

const feature = args.feature
const pipelinePhase = args.phase || 'design'
const scale = args.scale || 'normal'
const isSmall = scale === 'small'

// ========== Schemas ==========
const TRD_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    files: {
      type: 'object',
      properties: {
        proposal: { type: 'string' },
        design: { type: 'string' },
        specs: { type: 'array', items: { type: 'string' } },
        plan: { type: 'string' },
      },
      required: ['design', 'specs', 'plan'],
    },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    taskCount: { type: 'number' },
    docReviewPassed: { type: 'boolean' },
    reviewIterations: { type: 'number' },
    needsHuman: { type: 'boolean' },
  },
  required: ['success', 'files', 'riskLevel', 'taskCount', 'docReviewPassed', 'needsHuman'],
}

const CODE_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    sourceFiles: { type: 'array', items: { type: 'string' } },
    testFiles: { type: 'array', items: { type: 'string' } },
    testTotal: { type: 'number' },
    testPassed: { type: 'number' },
    testFailed: { type: 'number' },
    codeReviewPassed: { type: 'boolean' },
    reviewIterations: { type: 'number' },
    needsHuman: { type: 'boolean' },
  },
  required: ['success', 'sourceFiles', 'testFiles', 'testTotal', 'testPassed', 'codeReviewPassed', 'needsHuman'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'BLOCKED', 'SKIP'] },
    surface: { type: 'string' },
    claim: { type: 'string' },
    steps: { type: 'array', items: { type: 'object' } },
    probes: { type: 'array', items: { type: 'object' } },
    findings: { type: 'string' },
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
    needsConfirm: { type: 'number' },
    docReviewPassed: { type: 'boolean' },
    needsHuman: { type: 'boolean' },
  },
  required: ['success', 'totalRules', 'passed', 'failed', 'needsHuman'],
}

// ========== Phase: TRD 产出 + 审查 ==========
async function runTRD() {
  phase('TRD')
  log(`📐 TRD 产出: ${feature} (${scale})`)

  const trdPrompt = isSmall
    ? `为小需求 "${feature}" 产出技术设计文档。
       使用 Skill({skill: 'trd-writer'})。
       小需求模式：合并 spec 为单一文件，跳过 plan 审查。
       完成后追加 audit-trail 到 ./docs/${feature}/audit-trail.md。
       返回：success, files(design/specs/plan路径), riskLevel, taskCount, needsHuman。`
    : `为常规需求 "${feature}" 产出技术设计文档。
       使用 Skill({skill: 'trd-writer'})。
       按 OpenSpec + Superpowers 规范产出 design.md + specs/ + plan.md。
       内部完成 executing-plans 自审 + doc-reviewer (opus) 并行审查。
       完成后追加 audit-trail 到 ./docs/${feature}/audit-trail.md。
       返回：success, files(design/specs/plan路径), riskLevel, taskCount, docReviewPassed, reviewIterations, needsHuman。`

  let result = await agent(trdPrompt, { phase: 'TRD', schema: TRD_SCHEMA })

  // 重试逻辑：doc review 未通过，最多 2 次
  let retries = 0
  while (result && !result.docReviewPassed && retries < 2) {
    retries++
    log(`🔁 TRD 审查未通过，第 ${retries} 次重试...`)
    result = await agent(
      `TRD 产出审查未通过，根据审查意见修复文档后重新提交。
       使用 Skill({skill: 'trd-writer'}) 修复 openspec/changes/${feature}/ 下的文档。
       上次结果：riskLevel=${result.riskLevel}, taskCount=${result.taskCount}
       重试次数：${retries}/2`,
      { phase: 'TRD', schema: TRD_SCHEMA }
    )
  }

  if (result && !result.docReviewPassed && retries >= 2) {
    result.needsHuman = true
    log('⚠️ TRD 审查 2 次仍未通过，需人工介入')
  }

  return result
}

// ========== Phase: TDD 编码 ==========
async function runCode() {
  phase('编码')
  log(`🔨 TDD 编码: ${feature}`)

  let result = await agent(
    `为 "${feature}" 进行 TDD 编码。
     使用 Skill({skill: 'coder'})。
     coder 内部：读取 plan.md → TodoWrite → 逐 Task 派发 implementer 子 Agent
     → spec 合规审查 → simplify 代码质量 → code-reviewer (opus) 独立审查。
     完成后追加 audit-trail 到 ./docs/${feature}/audit-trail.md。
     返回：success, sourceFiles[], testFiles[], testTotal, testPassed, testFailed, codeReviewPassed, reviewIterations, needsHuman。`,
    { phase: '编码', schema: CODE_SCHEMA }
  )

  let retries = 0
  while (result && !result.codeReviewPassed && retries < 2) {
    retries++
    log(`🔁 代码审查未通过，第 ${retries} 次重试...`)
    result = await agent(
      `代码审查未通过，根据审查意见修复后重新提交。
       使用 Skill({skill: 'coder'})。
       失败测试：${result.testFailed || 0}，重试 ${retries}/2。`,
      { phase: '编码', schema: CODE_SCHEMA }
    )
  }

  if (result && !result.codeReviewPassed && retries >= 2) {
    result.needsHuman = true
    log('⚠️ 代码审查 2 次仍未通过，需人工介入')
  }

  return result
}

// ========== Phase: 运行时验证 ==========
async function runVerify() {
  phase('验证')
  log(`🔍 运行时验证: ${feature}`)

  const result = await agent(
    `为 "${feature}" 进行运行时验证。
     使用 Skill({skill: 'verify'})。
     验证代码变更是否在运行时正确工作。完成后追加 audit-trail。
     返回：verdict(PASS/FAIL/BLOCKED/SKIP), surface, claim, steps, probes, findings。`,
    { phase: '验证', schema: VERIFY_SCHEMA }
  )

  return result
}

// ========== Phase: E2E 验收 ==========
async function runE2E() {
  phase('验证')
  log(`✅ E2E 验收: ${feature}`)

  let result = await agent(
    `为 "${feature}" 进行端到端业务验收。
     使用 Skill({skill: 'e2e-validator'})。
     以业务规则为契约逐条核验代码实现。完成后追加 audit-trail。
     返回：success, totalRules, passed, failed, needsConfirm, docReviewPassed, needsHuman。`,
    { phase: '验证', schema: E2E_SCHEMA }
  )

  let retries = 0
  while (result && !result.docReviewPassed && retries < 2) {
    retries++
    log(`🔁 E2E 审查未通过，第 ${retries} 次重试...`)
    result = await agent(
      `E2E 验收审查未通过，修复报告后重新提交。
       使用 Skill({skill: 'e2e-validator'})。重试 ${retries}/2。`,
      { phase: '验证', schema: E2E_SCHEMA }
    )
  }

  if (result && !result.docReviewPassed && retries >= 2) {
    result.needsHuman = true
    log('⚠️ E2E 审查 2 次仍未通过，需人工介入')
  }

  return result
}

// ========== Phase: 归档 ==========
async function runArchive() {
  phase('归档')
  log(`📦 归档: ${feature}`)

  const result = await agent(
    `为 "${feature}" 进行归档。
     1. Skill({skill: 'openspec-archive-change'}) — OpenSpec 层归档
     2. bash: 创建 docs/archive/YYYYMMDD/${feature}/，复制 audit-trail/e2e-report/plan 到归档目录
     3. bash: rm -rf docs/${feature}/
     4. 追加 audit-trail 最终条目。
     返回：{ archived: true, archivePath: string }。`,
    { phase: '归档', schema: { type: 'object', properties: { archived: { type: 'boolean' }, archivePath: { type: 'string' } }, required: ['archived'] } }
  )

  return result
}

// ========== 主流程 ==========
async function main() {
  log(`🚀 dev-flow-v2 启动 | feature: ${feature} | phase: ${pipelinePhase} | scale: ${scale}`)

  if (pipelinePhase === 'design') {
    const trd = await runTRD()
    log(`📊 TRD 完成: risk=${trd?.riskLevel}, tasks=${trd?.taskCount}, review=${trd?.docReviewPassed ? '✅' : '❌'}`)
    return { phase: 'design', trd }
  }

  if (pipelinePhase === 'build') {
    const code = await runCode()
    log(`🔨 编码完成: tests=${code?.testPassed}/${code?.testTotal}, review=${code?.codeReviewPassed ? '✅' : '❌'}`)

    if (code && !code.success) {
      return { phase: 'build', code, verify: null, e2e: null, archive: null }
    }

    const verify = await runVerify()
    log(`🔍 验证: verdict=${verify?.verdict}`)

    if (verify?.verdict === 'FAIL') {
      return { phase: 'build', code, verify, e2e: null, archive: null }
    }

    const e2e = await runE2E()
    log(`✅ E2E: ${e2e?.passed}/${e2e?.totalRules} 通过`)

    if (e2e && !e2e.success) {
      return { phase: 'build', code, verify, e2e, archive: null }
    }

    const archive = await runArchive()
    log(`📦 归档: ${archive?.archived ? '✅' : '❌'}`)

    return { phase: 'build', code, verify, e2e, archive }
  }

  // phase: 'full' — 全流程自动模式（跳过人工闸门）
  log('⚡ 全流程自动模式')
  const trd = await runTRD()
  if (!trd?.success) return { phase: 'full', trd }

  const code = await runCode()
  if (!code?.success) return { phase: 'full', trd, code }

  const verify = await runVerify()
  const e2e = await runE2E()
  const archive = await runArchive()

  return { phase: 'full', trd, code, verify, e2e, archive }
}

return main()
