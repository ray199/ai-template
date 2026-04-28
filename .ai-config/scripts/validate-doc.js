#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const red = s => `\x1b[31m${s}\x1b[0m`;
const green = s => `\x1b[32m${s}\x1b[0m`;
const gray = s => `\x1b[90m${s}\x1b[0m`;

function parseFrontMatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/);
  const out = {};
  let currentKey = null;
  for (const line of lines) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      out[currentKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const rawValue = kv[2].trim();
    if (rawValue === '') {
      out[key] = [];
      currentKey = key;
    } else if (/^\[.*\]$/.test(rawValue)) {
      out[key] = rawValue.slice(1, -1).split(',').map(s => stripQuotes(s.trim())).filter(Boolean);
      currentKey = null;
    } else {
      out[key] = coerce(stripQuotes(rawValue));
      currentKey = null;
    }
  }
  return out;
}

function stripQuotes(s) {
  if (/^".*"$/.test(s) || /^'.*'$/.test(s)) return s.slice(1, -1);
  return s;
}

function coerce(s) {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}

const REQ_ID_RE = /^REQ-\d{8}-\d{3}$/;

const SCHEMAS = {
  requirement: {
    required: ['need_id', 'title', 'workload', 'priority', 'deadline', 'stage', 'status', 'goal', 'acceptance'],
    rules: {
      need_id: v => REQ_ID_RE.test(v) || 'need_id 必须匹配 REQ-YYYYMMDD-XXX',
      title: v => (v && String(v).length <= 20) || 'title 必须 ≤20 字',
      workload: v => ['XS', 'S', 'M', 'L', 'XL'].includes(v) || 'workload 必须是 XS|S|M|L|XL',
      priority: v => ['P0', 'P1', 'P2'].includes(v) || 'priority 必须是 P0|P1|P2',
      stage: v => v === 'intake' || 'stage 必须为 intake',
      status: v => ['pending', 'in_progress', 'done', 'blocked'].includes(v) || 'status 不合法',
      acceptance: (v, fm) => {
        if (!Array.isArray(v) || v.length === 0) return 'acceptance 至少 1 条';
        const minByLevel = { XS: 1, S: 1, M: 2, L: 3, XL: 3 };
        const min = minByLevel[fm.workload] || 1;
        if (v.length < min) return `${fm.workload} 级 acceptance 至少 ${min} 条`;
        if (['M', 'L', 'XL'].includes(fm.workload)) {
          const isBdd = s => {
            const u = String(s).toUpperCase();
            return (/\bGIVEN\b/.test(u) && /\bWHEN\b/.test(u) && /\bTHEN\b/.test(u))
              || (/给定/.test(s) && /当/.test(s) && /则/.test(s));
          };
          if (!v.some(isBdd)) {
            return `${fm.workload} 级 acceptance 至少 1 条须为 BDD 格式（含 GIVEN/WHEN/THEN 或 给定/当/则）`;
          }
        }
        return true;
      },
      affects_modules: v => !v || (Array.isArray(v) && v.length > 0) || 'affects_modules 若填写须为非空数组',
    },
  },
  constitution: {
    required: ['kind'],
    rules: {
      kind: v => v === 'constitution' || 'kind 必须为 constitution',
    },
    bodyChecks: (body) => {
      const errs = [];
      if (!/^##\s+项目原则|^##\s+principles/im.test(body)) {
        errs.push('constitution 必须包含 "## 项目原则" 章节');
      }
      const rules = body.match(/^-\s+/gm);
      if (!rules || rules.length === 0) {
        errs.push('"## 项目原则" 至少需要 1 条规则（- 列表项）');
      }
      return errs;
    },
  },
  'project-map': {
    required: ['kind', 'generated_at'],
    rules: {
      kind: v => v === 'project-map' || 'kind 必须为 project-map',
      generated_at: v => /^\d{4}-\d{2}-\d{2}/.test(String(v)) || 'generated_at 必须是 ISO 日期',
    },
    bodyChecks: (body) => {
      const errs = [];
      if (!/^##\s+不可变约束|^##\s+invariants/im.test(body)) {
        errs.push('必须包含 "## 不可变约束" 章节（新项目可留空占位）');
      }
      return errs;
    },
  },
  design: {
    required: ['need_id', 'stage', 'status'],
    rules: {
      need_id: v => REQ_ID_RE.test(v) || 'need_id 非法',
      stage: v => v === 'design' || 'stage 必须为 design',
      status: v => ['draft', 'approved'].includes(v) || 'status 必须是 draft|approved',
    },
    bodyChecks: (body, fm, ctx) => {
      const errs = [];
      if (ctx.isExistingProject && !/^##\s+现状基线/m.test(body)) {
        errs.push('老项目 design 必须包含 "## 现状基线" 章节（列出涉及模块 / 现有行为 / 已知坑）');
      }
      if (ctx.workload === 'L' || ctx.workload === 'XL') {
        const start = body.search(/^##\s+任务拆解/m);
        if (start === -1) {
          errs.push(`${ctx.workload} 级 design 必须包含 "## 任务拆解" 章节（列任务 / 依赖 / 验收对应 / 预估）`);
        } else {
          const rest = body.slice(start + 1);
          const nextRel = rest.search(/^##\s/m);
          const sec = nextRel === -1 ? body.slice(start) : body.slice(start, start + 1 + nextRel);
          const hasHeader = /\|\s*ID\s*\|/.test(sec)
            && /任务/.test(sec)
            && /依赖/.test(sec)
            && /验收/.test(sec)
            && /预估/.test(sec);
          if (!hasHeader) {
            errs.push('"## 任务拆解" 章节必须包含表格表头：ID | 任务 | 依赖 | 验收对应 | 预估');
          }
          const taskRows = sec.match(/^\|\s*T\d+\s*\|/gm);
          if (!taskRows || taskRows.length === 0) {
            errs.push('"## 任务拆解" 至少需要一行任务（T1 / T2 / ... 形式的 ID）');
          }
        }
      }
      return errs;
    },
  },
  'code-report': {
    required: ['need_id', 'stage', 'self_check_passed'],
    rules: {
      need_id: v => REQ_ID_RE.test(v) || 'need_id 非法',
      stage: v => v === 'code' || 'stage 必须为 code',
      self_check_passed: v => v === true || '自检未通过，不允许流转到 /pg:check',
    },
  },
  test: {
    required: ['need_id', 'stage', 'test_pass_rate', 'blockers', 'conclusion'],
    rules: {
      need_id: v => REQ_ID_RE.test(v) || 'need_id 非法',
      stage: v => v === 'check' || 'stage 必须为 check',
      blockers: v => (typeof v === 'number' && v >= 0) || 'blockers 必须是非负数字',
      conclusion: v => ['pass', 'fail'].includes(v) || 'conclusion 必须是 pass|fail',
    },
  },
  review: {
    required: ['need_id', 'stage', 'blockers', 'conclusion'],
    rules: {
      need_id: v => REQ_ID_RE.test(v) || 'need_id 非法',
      stage: v => v === 'check' || 'stage 必须为 check',
      blockers: v => (typeof v === 'number' && v >= 0) || 'blockers 必须是非负数字',
      conclusion: v => ['pass', 'fail'].includes(v) || 'conclusion 必须是 pass|fail',
    },
  },
  delivery: {
    required: ['need_id', 'stage', 'released_at', 'rollback_verified'],
    rules: {
      need_id: v => REQ_ID_RE.test(v) || 'need_id 非法',
      stage: v => v === 'delivered' || 'stage 必须为 delivered',
      rollback_verified: v => v === true || 'rollback 方案必须验证通过',
    },
  },
};

function pathFor(type, reqId) {
  const p = {
    requirement: `docs/requirements/backlog/${reqId}.md`,
    design: `docs/design/${reqId}-design.md`,
    'code-report': `docs/design/${reqId}-code-report.md`,
    test: `docs/test/${reqId}-test.md`,
    review: `docs/review/${reqId}-review.md`,
    delivery: `docs/delivery/${reqId}-delivery.md`,
    'project-map': `docs/_context/project-map.md`,
    constitution: `docs/_context/constitution.md`,
  };
  return p[type];
}

function isExistingProject(repoRoot) {
  return fs.existsSync(path.join(repoRoot, 'docs/_context/project-map.md'));
}

function getRequirementWorkload(reqId, repoRoot) {
  const candidates = [
    path.join(repoRoot, `docs/requirements/backlog/${reqId}.md`),
    path.join(repoRoot, `docs/requirements/done/${reqId}/${reqId}.md`),
    path.join(repoRoot, `docs/requirements/done/${reqId}.md`),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const fm = parseFrontMatter(fs.readFileSync(p, 'utf8'));
    if (fm && fm.workload) return String(fm.workload).toUpperCase();
  }
  return null;
}

function splitFrontMatterAndBody(content) {
  const m = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!m) return { body: content };
  return { body: content.slice(m[0].length) };
}

function validateCheck(reqId, repoRoot) {
  const testRes = validateOne('test', reqId, repoRoot);
  const reviewRes = validateOne('review', reqId, repoRoot);
  return { ok: testRes.ok && reviewRes.ok, errors: [...testRes.errors, ...reviewRes.errors] };
}

function validateOne(type, reqId, repoRoot) {
  const rel = pathFor(type, reqId);
  if (!rel) return { ok: false, errors: [`未知类型：${type}`] };
  const full = path.join(repoRoot, rel);
  if (!fs.existsSync(full)) return { ok: false, errors: [`文件不存在：${rel}`] };

  const content = fs.readFileSync(full, 'utf8');
  const fm = parseFrontMatter(content);
  if (!fm) return { ok: false, errors: [`${rel} 缺少 YAML front-matter`] };
  const { body } = splitFrontMatterAndBody(content);

  const schema = SCHEMAS[type];
  const errors = [];
  for (const key of schema.required) {
    if (fm[key] === undefined || fm[key] === null || fm[key] === '') {
      errors.push(`${rel} 缺字段：${key}`);
    }
  }
  for (const [key, rule] of Object.entries(schema.rules)) {
    if (fm[key] === undefined) continue;
    const r = rule(fm[key], fm);
    if (r !== true) errors.push(`${rel} 字段 ${key}：${r}`);
  }
  if (typeof schema.bodyChecks === 'function') {
    const ctx = { isExistingProject: isExistingProject(repoRoot) };
    if (type === 'design' && reqId) {
      ctx.workload = getRequirementWorkload(reqId, repoRoot);
    }
    const bodyErrs = schema.bodyChecks(body || '', fm, ctx);
    for (const e of bodyErrs) errors.push(`${rel} 正文：${e}`);
  }
  return { ok: errors.length === 0, errors };
}

function scanAll(repoRoot) {
  const results = [];
  const dirs = [
    { dir: 'docs/requirements/backlog', type: 'requirement' },
    { dir: 'docs/design', type: null, detect: true },
    { dir: 'docs/test', type: 'test' },
    { dir: 'docs/review', type: 'review' },
    { dir: 'docs/delivery', type: 'delivery' },
  ];
  for (const { dir, type, detect } of dirs) {
    const abs = path.join(repoRoot, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.md')) continue;
      let actualType = type;
      if (detect) {
        actualType = f.endsWith('-code-report.md') ? 'code-report'
                   : f.endsWith('-design.md') ? 'design'
                   : null;
      }
      if (!actualType) continue;
      const m = f.match(/^(REQ-\d{8}-\d{3})/);
      if (!m) {
        results.push({ file: path.join(dir, f), ok: false, errors: ['文件名不符合 REQ-YYYYMMDD-XXX 前缀'] });
        continue;
      }
      const r = validateOne(actualType, m[1], repoRoot);
      results.push({ file: path.join(dir, f), ...r });
    }
  }
  if (isExistingProject(repoRoot)) {
    const r = validateOne('project-map', null, repoRoot);
    results.push({ file: 'docs/_context/project-map.md', ...r });
  }
  if (fs.existsSync(path.join(repoRoot, 'docs/_context/constitution.md'))) {
    const r = validateOne('constitution', null, repoRoot);
    results.push({ file: 'docs/_context/constitution.md', ...r });
  }
  return results;
}

function main() {
  const [, , type, reqId] = process.argv;
  const repoRoot = process.env.REPO_ROOT || process.cwd();

  if (!type) {
    console.error('用法：validate-doc.js <type> <REQ-id>   或   validate-doc.js all');
    process.exit(2);
  }

  if (type === 'all') {
    const results = scanAll(repoRoot);
    if (results.length === 0) {
      console.log(gray('（docs/ 下暂无产出物可校验）'));
      process.exit(0);
    }
    let failed = 0;
    for (const r of results) {
      if (r.ok) console.log(green('✓'), r.file);
      else {
        console.log(red('✗'), r.file);
        for (const e of r.errors) console.log('   ', red(e));
        failed++;
      }
    }
    console.log('');
    console.log(failed === 0 ? green(`全部 ${results.length} 份通过`) : red(`${failed}/${results.length} 份未通过`));
    process.exit(failed === 0 ? 0 : 1);
  }

  if (!['project-map', 'constitution'].includes(type) && !reqId) {
    console.error('缺少 REQ-id 参数');
    process.exit(2);
  }

  const result = type === 'check' ? validateCheck(reqId, repoRoot) : validateOne(type, reqId, repoRoot);

  if (result.ok) {
    console.log(green('✓'), `${type} / ${reqId || ''} 校验通过`);
    process.exit(0);
  }
  console.log(red('✗'), `${type} / ${reqId || ''} 校验失败：`);
  for (const e of result.errors) console.log('   ', red(e));
  process.exit(1);
}

if (require.main === module) main();

module.exports = { parseFrontMatter, validateOne, validateCheck, scanAll, SCHEMAS };
