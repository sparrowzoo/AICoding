import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const sourceScripts = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url)));
const sourceSkill = path.dirname(sourceScripts);
const sourceSkills = path.dirname(sourceSkill);
const sourceRules = path.join(sourceSkill, 'SKILL.md');
const supportSkills = ['develop-work-flow', 'prd-writer', 'api-first', 'coder', 'e2e-validator'];
const skillLinks = new Map([
  ['references', path.join(sourceSkill, 'references')],
  ['templates', path.join(sourceSkill, 'templates')],
]);
const scriptLinks = ['install.mjs', 'plan.mjs', 'plan.test.mjs'];
const manifests = ['package.json', 'package-lock.json'];
const installedEntryMarker = '<!-- AICoding 安装脚本生成 -->';

function linkMatches(link, source) {
  const info = fs.lstatSync(link, { throwIfNoEntry: false });
  return info?.isSymbolicLink() && path.resolve(path.dirname(link), fs.readlinkSync(link)) === source;
}

function canReplaceSkill(destination) {
  const info = fs.lstatSync(destination, { throwIfNoEntry: false });
  if (!info || linkMatches(destination, sourceSkill)) return true;
  if (!info.isDirectory()) return false;

  const entry = path.join(destination, 'SKILL.md');
  const scripts = path.join(destination, 'scripts');
  if (!fs.lstatSync(entry, { throwIfNoEntry: false })?.isFile()
      || !fs.readFileSync(entry, 'utf8').includes(installedEntryMarker)
      || !fs.lstatSync(scripts, { throwIfNoEntry: false })?.isDirectory()) return false;

  const rulesLink = linkMatches(path.join(destination, 'source.md'), sourceRules) ? 'source.md' : 'source';
  const rulesTarget = rulesLink === 'source.md' ? sourceRules : sourceSkill;
  return linkMatches(path.join(destination, rulesLink), rulesTarget)
    && fs.readdirSync(destination).every(name => name === 'scripts' || name === 'SKILL.md' || name === rulesLink || skillLinks.has(name))
    && [...skillLinks].every(([name, source]) => linkMatches(path.join(destination, name), source))
    && fs.readdirSync(scripts).every(name => name === 'node_modules' || manifests.includes(name) || scriptLinks.includes(name))
    && scriptLinks.every(name => linkMatches(path.join(scripts, name), path.join(sourceScripts, name)));
}

function writeSkillEntry(destination) {
  const sourceEntry = fs.readFileSync(sourceRules, 'utf8').replaceAll('\r\n', '\n');
  const frontMatter = sourceEntry.match(/^---\n[\s\S]*?\n---(?=\n)/)?.[0];
  if (!frontMatter) throw new Error('trd-writer 的 SKILL.md 缺少元数据。');
  fs.writeFileSync(path.join(destination, 'SKILL.md'), `${frontMatter}

${installedEntryMarker}

# 技术设计与实施计划

执行前完整读取 [源技能规则](source.md)。从该文件的真实路径查找其中引用的技能和资料。
`);
}

function prepareSkill(destination) {
  const scripts = path.join(destination, 'scripts');
  fs.mkdirSync(scripts, { recursive: true });
  writeSkillEntry(destination);
  fs.symlinkSync(sourceRules, path.join(destination, 'source.md'));
  for (const [name, source] of skillLinks) fs.symlinkSync(source, path.join(destination, name));
  for (const name of scriptLinks) fs.symlinkSync(path.join(sourceScripts, name), path.join(scripts, name));
  for (const name of manifests) fs.copyFileSync(path.join(sourceScripts, name), path.join(scripts, name));

  const result = spawnSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: scripts, stdio: 'inherit' });
  if (result.error) throw new Error(`无法运行 npm，请先安装 npm。 ${result.error.message}`);
  if (result.status !== 0) throw new Error('计划工具的依赖安装失败。安装目录保留原状，可重新运行安装命令。');
}

function checkDestination(skillsDirectory) {
  const sourceRepository = path.resolve(sourceSkills, '..', '..');
  const relative = path.relative(sourceRepository, skillsDirectory);
  if (!relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`))) {
    throw new Error('请指定工具的用户级 skills 目录。');
  }
}

function install(skillsDirectory) {
  checkDestination(skillsDirectory);
  fs.mkdirSync(skillsDirectory, { recursive: true });
  checkDestination(fs.realpathSync(skillsDirectory));

  for (const name of supportSkills) {
    const destination = path.join(skillsDirectory, name);
    if (fs.lstatSync(destination, { throwIfNoEntry: false }) && !linkMatches(destination, path.join(sourceSkills, name))) {
      throw new Error(`已有其他安装，请先核对 ${destination}`);
    }
  }
  const destination = path.join(skillsDirectory, 'trd-writer');
  if (!canReplaceSkill(destination)) throw new Error(`已有其他安装，请先核对 ${destination}`);

  const staging = fs.mkdtempSync(path.join(skillsDirectory, '.trd-writer-'));
  const candidate = path.join(staging, 'next');
  const previous = path.join(staging, 'previous');
  let preservePrevious = false;
  try {
    prepareSkill(candidate);
    for (const name of supportSkills) {
      const link = path.join(skillsDirectory, name);
      const source = path.join(sourceSkills, name);
      if (!linkMatches(link, source)) fs.symlinkSync(source, link);
    }
    if (!canReplaceSkill(destination)) throw new Error(`安装目标已变化，请先核对 ${destination}`);
    if (fs.lstatSync(destination, { throwIfNoEntry: false })) fs.renameSync(destination, previous);
    try {
      fs.renameSync(candidate, destination);
    } catch (error) {
      if (fs.lstatSync(previous, { throwIfNoEntry: false })) {
        preservePrevious = true;
        try {
          fs.renameSync(previous, destination);
          preservePrevious = false;
        } catch (restoreError) {
          throw new Error(`安装失败，原安装可从 ${previous} 恢复。 ${restoreError.message}`);
        }
      }
      throw error;
    }
  } finally {
    if (!preservePrevious) fs.rmSync(staging, { recursive: true, force: true });
  }
  console.log(`核心 skills 和计划工具已安装到 ${skillsDirectory}`);
}

try {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('请先安装 Node.js 22 或更高版本。');
  const { values } = parseArgs({ options: { 'skills-dir': { type: 'string' } } });
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  install(path.resolve(values['skills-dir'] || path.join(codexHome, 'skills')));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
