# AI 编程规范模板

一套面向小团队、兼容新老项目的 AI 驱动开发规范。事实源 `.ai-config/workflow.md`，平台无关；Claude Code / Trae 等各自薄引用。

**核心思路**：按需求复杂度分级处理（XS/S/M/L/XL），轻重不一刀切。规范由 schema 机械校验 + git hooks 强制门，不靠人记。

---

## 工作流

```
模糊想法                     原始需求（一句话 / 零散 / 完整 PRD）
   │                            │
   ▼ (可选)                     ▼
/pg:explore ──▶ EXPLORE-xxx.md  /pg:intake ──▶ requirement.md
                  │                              │
                  └──────想清楚了 ──────────────▶│
                                                 ▼
                            ┌──── XS ─── git commit "XS: ..." ──▶ PR
                            │
                            ├──── S ──── /pg:code ──▶ /pg:check ──▶ /pg:deliver
                            │
                            └─ M/L/XL ── /pg:design ──▶ /pg:code ──▶ /pg:check ──▶ /pg:deliver
                                            │
                                            └─ L/XL 强制任务拆解 + 老项目强制现状基线
```

---

## 命令速查

| 命令 | 阶段 | 主要产出物 |
|---|---|---|
| `/pg:init` | 项目初始化 | `.ai-config/`、`docs/`、老项目 `project-map.md` |
| `/pg:explore` | 想法探索（可选） | `docs/_exploration/EXPLORE-xxx.md`（草稿，不进 backlog） |
| `/pg:intake` | 需求接入 | `docs/requirements/backlog/REQ-xxx.md` |
| `/pg:design` | 技术设计（M/L/XL） | `docs/design/REQ-xxx-design.md`（含任务拆解 T1-T6） |
| `/pg:code` | 编码 | 源码 + 迁移脚本 + code-report |
| `/pg:check` | 测试 + 审查 | test.md + review.md（M/L/XL） |
| `/pg:deliver` | 交付归档 | delivery.md + 归档到 done/ |
| `/pg:prototype` | 按需原型 | `docs/prototype/REQ-xxx.html` |

---

## 工作量分级

| 等级 | 场景 | 工期 | 路径 |
|---|---|---|---|
| **XS** | 改文案 / 加字段 / 样式微调 | <1 天 | git 快车道（commit-msg hook 守门） |
| **S** | 单文件、≤1 页面 | 1-2 天 | intake → code → check → deliver |
| **M** | 新模块、2-4 页面、新表 | 3-5 天 | + design |
| **L** | 跨模块改造、5+ 页面 | 1-2 周 | 同 M，强制任务拆解，审查更严 |
| **XL** | 超大型、需拆分 | 4 周+ | 同 L，必须有 iteration_plan |

---

## 快速开始

### 新项目从零开始

```bash
git clone https://github.com/ray199/ai-template.git my-project
cd my-project
git config core.hooksPath .ai-config/scripts/git-hooks    # 装 git hooks
chmod +x .ai-config/scripts/git-hooks/*
```

然后在 Claude Code / Trae 里：

```
/pg:init                              # 检测技术栈、建目录骨架
/pg:intake 第一个需求描述            # 接入第一个需求
```

### 老项目接入

```bash
# 把 .ai-config/、.claude/、.trae/、.github/、.gitignore、CLAUDE.md 拷到老项目根目录
git config core.hooksPath .ai-config/scripts/git-hooks
chmod +x .ai-config/scripts/git-hooks/*
```

然后：

```
/pg:init existing                     # 扫描代码，生成 docs/_context/project-map.md
                                      # 必须填写 invariants（不可变约束）段
/pg:intake <需求>                     # 此后所有需求自动遵守 invariants
```

### 日常使用

```
模糊想法 → /pg:explore → 想清楚 → /pg:intake
明确需求 → /pg:intake → 按 workload 分级走完整流程
小修改  → git commit "XS: 描述"
```

所有校验失败都由脚本拦住，不会流转到下一阶段。

---

## 目录结构

```
.
├── .ai-config/                         # 事实源（平台无关）
│   ├── workflow.md                      # 命令契约 + 产出物 schema
│   ├── rules/                           # 技术栈、代码风格、安全、Git
│   │   ├── profiles/                    # 7 种语言专项（Java/Python/.NET/Node+Vue/React/Go/TS）
│   │   └── middleware/                  # 6 种中间件（Redis/RocketMQ/Auth/Logging/API-Client/AI-LLM）
│   ├── skills/                          # 各阶段执行技能（渐进式：主 SKILL + references/ + templates/）
│   │   ├── init/
│   │   ├── idea-exploration/
│   │   ├── intake-requirement/
│   │   ├── technical-design/
│   │   ├── coding-impl/
│   │   ├── code-review/
│   │   ├── testing/
│   │   ├── delivery/
│   │   └── prototype-generation/
│   └── scripts/
│       ├── validate-doc.js              # 产出物 schema 校验（纯 Node）
│       └── git-hooks/                   # pre-commit + commit-msg
│
├── .claude/commands/pg/                 # Claude Code 斜杠命令（/pg:xxx）
├── .trae/rules/project_rules.md         # Trae 单文件触发映射（双识别 /pg:xxx 和 /xxx）
├── .github/workflows/validate-docs.yml  # CI 强制校验
│
├── docs/                                # 阶段产出（命令自动生成）
│   ├── _context/project-map.md          # 老项目上下文
│   ├── _exploration/                    # /pg:explore 草稿
│   ├── requirements/{backlog,done}/     # /pg:intake 写入；/pg:deliver 归档
│   ├── design/                          # /pg:design + /pg:code 产出
│   ├── test/, review/, delivery/, prototype/
│
├── CLAUDE.md                            # 项目指令（Claude Code 自动读取）
└── README.md                            # 本文件
```

---

## 多平台适配

事实源 `.ai-config/workflow.md` + `validate-doc.js`，平台层都是薄引用。

| 平台 | 适配位置 | 触发方式 | 状态 |
|---|---|---|---|
| Claude Code | `.claude/commands/pg/` | 8 份斜杠命令，严格 `/pg:xxx` | ✅ |
| Trae | `.trae/rules/project_rules.md` | 双识别：`/pg:xxx` 或 `/xxx` 都能用 | ✅ |
| Cursor | `.cursor/rules/`（按需建立） | 同 Claude Code 模式 | 按需 |
| Codex CLI | `AGENTS.md`（按需建立） | 同 Claude Code 模式 | 按需 |

修改契约只改 `.ai-config/workflow.md` 和 `validate-doc.js`，平台层被动同步。

---

## 双层校验体系

**第一层：Git/CI 强制门**（跨平台、机械、阻断）
- `pre-commit`：本次涉及的 `docs/**/REQ-*.md` 跑 schema 校验，失败阻 commit
- `commit-msg`：conventional commit 或 `XS:` 前缀
- CI workflow：PR 触发 `validate-doc.js all`
- 各阶段后置：requirement / design / code-report / check / delivery / project-map 全部 schema 验证

**第二层：AI 软提示**（上下文相关、不阻断）
- 在制品状态摘要、写文档后即时校验
- `/pg:intake` 并行需求冲突提示（基于 `affects_modules`）
- `/pg:design` 老项目"现状基线"章节强制；L/XL 强制任务拆解
- `/pg:deliver` 收尾两问（增量回写 project-map + review 反模式回流）

每条规则都要能说清"它在守什么风险"——说不清就删。

---

## 文档导航

| 入口 | 看什么 |
|---|---|
| [`.ai-config/workflow.md`](./.ai-config/workflow.md) | **事实源**：8 个命令的契约 + 7 种产出物 schema |
| [`CLAUDE.md`](./CLAUDE.md) | 项目级指令（Claude Code 自动加载） |
| [`claude.md`](./claude.md) | 各阶段详细规范（高层说明） |
| [`.ai-config/skills/*/SKILL.md`](./.ai-config/skills/) | 各阶段执行技能（按需深入读 references/ 和 templates/） |
| [`.ai-config/rules/profiles/`](./.ai-config/rules/profiles/) | 7 种语言专项规范 |
| [`.ai-config/rules/middleware/`](./.ai-config/rules/middleware/) | 6 种中间件规范 |

---

## 设计原则

- **减法优先** —— 每条规则、文档、hook 都要能说清守门的风险，说不清就删
- **按等级做减法** —— XS 走快车道、S 轻量、M 标准、L/XL 完整；不一刀切
- **事实源单一** —— `workflow.md` 改完所有平台被动同步；不允许各自维护
- **机械校验** —— 能交给脚本就别靠人记；schema 失败即阻断
- **渐进式** —— SKILL.md 主文件控制在 150 行内；细节走 references/ + templates/ lazy-load

---

## 版本

| 版本 | 日期 | 主要变更 |
|---|---|---|
| **v5.0** | 2026-04-28 | 全面重构：跨平台事实源、命令命名空间化（`/pg:xxx`）、`/pg:explore` 前置脑暴、L/XL 强制任务拆解、9 个 skill 渐进式拆分（主 SKILL + references/ + templates/）、project-map schema 校验、affects_modules 并行冲突提示、deliver 收尾两问 |
| v4.0 | 2026-04-15 | Phase 8-10：前后端全链路覆盖、跨阶段校验、新项目骨架、首次上线清单 |
| v3.0 | 2026-04-14 | Phase 6-7：Trae 兼容入口、多语言规范、文档格式标准化 |
| v2.0 | 2026-04-06 | Phase 4-5：工作流完整文档、规范增强、原型自动生成 |
| v1.0 | 2026-03-20 | Phase 1-3：需求接入、变更跟踪、项目自动扫描 |

---

## 反馈

规范是活文档。遇到以下情况请改 `.ai-config/workflow.md` 并在 PR 里说明：

- 某个 schema 字段实际用不上 → 删
- 某个校验规则太严 / 太松 → 改
- 缺某类产出物的校验 → 加 schema
