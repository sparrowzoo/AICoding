/**
 * 并行 vs 串行演示
 *
 * args:
 *   mode: 'serial' | 'parallel'
 *   items: array of { id: string }
 */

export const meta = {
  name: 'pipeline',
  description: '并行/串行演示',
  phases: [
    { title: 'Execute' }
  ],
}

const { items, mode } = args

// ========== 子任务逻辑：派发 agent 子代理 ==========
async function runTask(item) {
  log(`→ Agent ${item.id} 启动`)
  const result = await agent(
    `处理任务 "${item.id}"。完成任务后返回结果。`,
    { label: item.id, phase: 'Execute' }
  )
  log(`✓ Agent ${item.id} 完成 → ${result}`)
  return result
}

// ========== 串行：逐个执行 ==========
async function runSerial(items) {
  log(`--- 串行开始 (${items.length} 个任务逐个执行) ---`)
  const results = []
  for (const item of items) {
    results.push(await runTask(item))
  }
  log('--- 串行结束 ---')
  return results
}

// ========== 并行：同时启动 ==========
async function runParallel(items) {
  log(`--- 并行开始 (${items.length} 个任务同时启动) ---`)
  const thunks = items.map(item => () => runTask(item))
  const results = await parallel(thunks)
  log('--- 并行结束 ---')
  return results.filter(Boolean)
}

// ========== 执行 ==========
if (mode === 'serial') {
  return runSerial(items)
} else {
  return runParallel(items)
}
