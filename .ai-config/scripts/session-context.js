#!/usr/bin/env node
// SessionStart hook：进入会话时列出当前在制品状态。
// 纯信息性输出，失败不阻断（被 shell `|| true` 吞掉）。

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontMatter } = require('./validate-doc.js');

const REPO = process.env.REPO_ROOT || process.cwd();
const BACKLOG = path.join(REPO, 'docs/requirements/backlog');

if (!fs.existsSync(BACKLOG)) process.exit(0);

const byStage = { intake: [], design: [], code: [], check: [] };
for (const f of fs.readdirSync(BACKLOG)) {
  if (!f.endsWith('.md')) continue;
  const content = fs.readFileSync(path.join(BACKLOG, f), 'utf8');
  const fm = parseFrontMatter(content);
  if (!fm || !fm.need_id) continue;

  // 推断最新阶段：look for files that exist
  const id = fm.need_id;
  let stage = 'intake';
  if (fs.existsSync(path.join(REPO, `docs/delivery/${id}-delivery.md`))) continue; // delivered, skip
  if (fs.existsSync(path.join(REPO, `docs/test/${id}-test.md`))) stage = 'check';
  else if (fs.existsSync(path.join(REPO, `docs/design/${id}-code-report.md`))) stage = 'code';
  else if (fs.existsSync(path.join(REPO, `docs/design/${id}-design.md`))) stage = 'design';
  if (byStage[stage]) byStage[stage].push(`${id} (${fm.workload}) ${fm.title || ''}`);
}

const total = Object.values(byStage).reduce((a, b) => a + b.length, 0);
if (total === 0) process.exit(0);

console.log('── 在制品状态 ──');
for (const [stage, items] of Object.entries(byStage)) {
  if (items.length === 0) continue;
  console.log(`  ${stage} (${items.length}):`);
  for (const it of items) console.log(`    · ${it}`);
}
process.exit(0)