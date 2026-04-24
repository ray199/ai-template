#!/usr/bin/env node
// PostToolUse(Write|Edit) hook：文件写入后若属于受管文档，则跑 validate-doc 校验。
// 非受管文件跳过。失败不硬阻断（只把错误打印到 stderr，让 Claude 看到后修正）。

'use strict';

const path = require('path');
const { validateOne } = require('./validate-doc.js');

const filePath = process.argv[2];
if (!filePath) process.exit(0);

// 统一为 POSIX 风格，便于匹配
const norm = filePath.replace(/\\/g, '/');

// 从路径推断受管类型和 need_id
const patterns = [
  { re: /docs\/requirements\/backlog\/(REQ-\d{8}-\d{3})\.md$/, type: 'requirement' },
  { re: /docs\/design\/(REQ-\d{8}-\d{3})-design\.md$/, type: 'design' },
  { re: /docs\/design\/(REQ-\d{8}-\d{3})-code-report\.md$/, type: 'code-report' },
  { re: /docs\/test\/(REQ-\d{8}-\d{3})-test\.md$/, type: 'test' },
  { re: /docs\/review\/(REQ-\d{8}-\d{3})-review\.md$/, type: 'review' },
  { re: /docs\/delivery\/(REQ-\d{8}-\d{3})-delivery\.md$/, type: 'delivery' },
];

let matched = null;
for (const p of patterns) {
  const m = norm.match(p.re);
  if (m) { matched = { type: p.type, reqId: m[1] }; break; }
}

if (!matched) process.exit(0); // 非受管文件，跳过

const repoRoot = process.env.REPO_ROOT || process.cwd();
const res = validateOne(matched.type, matched.reqId, repoRoot);

if (res.ok) {
  console.log(`✓ ${matched.type} / ${matched.reqId} schema 校验通过`);
  process.exit(0);
}

// 失败：打印错误，但不硬阻断（exit 0）。AI 会看到 stderr 提示后修正。
console.error(`⚠ ${matched.type} / ${matched.reqId} schema 校验失败：`);
for (const e of res.errors) console.error(`   · ${e}`);
console.error('请修正 front-matter 字段。');
process.exit(0);
