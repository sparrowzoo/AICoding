#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

function statIfPresent(target) {
  try { return fs.lstatSync(target); } catch (error) { if (error.code === 'ENOENT') return undefined; throw error; }
}

if (process.argv.includes('--help')) {
  console.log('node setup.mjs\n将锁定的依赖安装到 ~/.local/share/ai-coding-workflow/；需要写入用户目录和 npm 网络权限。\nAI_CODING_WORKFLOW_DEPS 可指定绝对临时目录用于测试。不向 skill 源目录安装 node_modules。');
} else {
  try {
    if (process.argv.length > 2) throw new Error('不支持额外参数，请使用 --help。');
    const destination = process.env.AI_CODING_WORKFLOW_DEPS || path.join(os.homedir(), '.local/share/ai-coding-workflow');
    if (!path.isAbsolute(destination)) throw new Error('AI_CODING_WORKFLOW_DEPS 必须为绝对路径。');
    const source = path.dirname(fileURLToPath(import.meta.url));
    const directoryStat = statIfPresent(destination);
    if (directoryStat?.isSymbolicLink()) throw new Error('依赖目录不能是软链接。');
    if (directoryStat && !directoryStat.isDirectory()) throw new Error('依赖目标必须是目录。');
    const physicalDestination = directoryStat ? fs.realpathSync(destination) : path.resolve(destination);
    if (physicalDestination === source || physicalDestination.startsWith(`${source}${path.sep}`)) throw new Error('依赖目录不能位于 skill 源目录内。');
    // Preflight both manifests before copying either one, including dangling symlinks.
    for (const name of ['package.json', 'package-lock.json']) {
      const target = path.join(destination, name);
      const stat = statIfPresent(target);
      if (stat?.isSymbolicLink()) throw new Error(`${name} 不能是软链接。`);
      if (stat && !stat.isFile()) throw new Error(`${name} 必须是普通文件。`);
    }
    const existingPackage = path.join(destination, 'package.json');
    if (statIfPresent(existingPackage)) {
      const installed = JSON.parse(fs.readFileSync(existingPackage, 'utf8'));
      if (installed.name !== 'ai-coding-workflow' || installed.private !== true) throw new Error('目标属于其他 package，拒绝覆盖。请使用本工具专用依赖目录。');
    } else if (directoryStat && fs.readdirSync(destination).length > 0) {
      throw new Error('非空目标目录没有本工具 package，拒绝接管。');
    }
    fs.mkdirSync(destination, { recursive: true });
    for (const name of ['package.json', 'package-lock.json']) {
      const target = path.join(destination, name);
      fs.copyFileSync(path.join(source, name), target);
    }
    console.log(`依赖目录：${fs.realpathSync(destination)}`);
    const result = spawnSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'], {
      cwd: destination, stdio: 'inherit', env: process.env,
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } catch (error) {
    console.error(`setup 失败：${error.message}`);
    process.exitCode = 1;
  }
}
