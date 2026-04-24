# Claude Code 开发规范

> **事实源入口**：详细的命令契约、产出物 schema 在 [`.ai-config/workflow.md`](.ai-config/workflow.md)。本文件只做索引和高层说明。
>
> 修改工作流 → 只改 `.ai-config/workflow.md` 和 `.ai-config/scripts/validate-doc.js`，其他文件都是薄引用。

## 核心设计理念

- **流程清晰**：四阶段五命令，每个阶段有明确的输入、输出和后置校验
- **输出物标准化**：所有 md 产出物都有 YAML front-matter，受 `validate-doc.js` 机械校验
- **自动检查分层**：Git/CI 强制门（硬 gate）+ IDE hook 提示（软提示）
- **按等级做减法**：XS 走 git 快车道、S 轻量、M 标准、L/XL 完整；不搞一刀切

## 工作流程全景

```
XS 级：不走 /intake → git commit "XS: ..." → PR review
────────────────────────────────────────────────
S/M/L/XL：
  /intake ──▶ /design (M/L/XL) ──▶ /code ──▶ /check ──▶ /deliver
           ↑
           └─ S 级跳过 /design
```

详细契约见 [`.ai-config/workflow.md`](.ai-config/workflow.md)。

## 命令速查

| 命令 | 阶段 | 主要产出物 | 后置校验 |
|---|---|---|---|
| `/init` | 项目初始化 | `.ai-config/`、`docs/`、老项目 `project-map.md` | 目录结构 + project-map |
| `/explore` | 想法探索（可选） | `docs/_exploration/EXPLORE-xxx.md`（草稿） | — |
| `/intake` | 需求接入 | `docs/requirements/backlog/REQ-xxx.md` | `validate-doc.js requirement` |
| `/design` | 技术设计（M/L/XL） | `docs/design/REQ-xxx-design.md` | `validate-doc.js design` |
| `/code` | 编码 | 源码 + 迁移脚本 + code-report | `validate-doc.js code-report` |
| `/check` | 测试+审查 | test.md + review.md（M/L/XL） | `validate-doc.js check` |
| `/deliver` | 交付归档 | delivery.md + 归档到 done/ | `validate-doc.js delivery` |
| `/prototype` | 按需原型 | `docs/prototype/*.html` | — |

## 工作量等级

| 等级 | 场景 | 工期 | 流程 |
|---|---|---|---|
| XS | 改文案 / 加字段 / 样式微调 | <1 天 | git 快车道（commit-msg hook 守门） |
| S | 单文件、≤1 页面 | 1-2 天 | intake → code → check → deliver |
| M | 新模块、2-4 页面、新表 | 3-5 天 | intake → design → code → check → deliver |
| L | 跨模块改造、5+ 页面 | 1-2 周 | 同 M，审查更严 |
| XL | 超大型、需拆分 | 4 周+ | 同 L，必须有 iteration_plan |

详细判分维度见 [`.ai-config/skills/intake-requirement/workload-evaluation.md`](.ai-config/skills/intake-requirement/workload-evaluation.md)。

## 规范文件索引

- **工作流契约**：[`.ai-config/workflow.md`](.ai-config/workflow.md)
- **系统角色定义**：`.ai-config/rules/00_system_role.mdc`
- **技术栈 Profile**：`.ai-config/rules/01_tech_stack.mdc`（按语言见 `profiles/`）
- **代码风格**：`.ai-config/rules/02_code_style.mdc`
- **安全规范**：`.ai-config/rules/03_security.mdc`
- **Git 工作流**：`.ai-config/rules/04_git_workflow.mdc`
- **工作流高层**：`.ai-config/rules/05_workflow.mdc`
- **需求规范**：`.ai-config/rules/06_requirement.mdc`
- **文档格式**：`.ai-config/rules/doc-format-standard.md`
- **语言专项审查清单**：`.ai-config/skills/code-review/{java,vue,dotnet,python}-code-review-checklist.md`

## 文档管理

```
docs/
├── _context/           # 老项目上下文（project-map.md）
├── requirements/
│   ├── backlog/        # 待开发（/intake 写入，XS 不写入）
│   └── done/           # 已交付归档（/deliver 写入）
├── design/             # /design 和 /code 的产出
├── test/               # /check 产出（M/L/XL）
├── review/             # /check 产出（M/L/XL）
├── delivery/           # /deliver 产出
└── prototype/          # /prototype 产出
```

## 自动检查双层体系

**第一层：Git/CI 强制门（跨平台，机械）**
- `pre-commit`：对本次提交的 `docs/**/REQ-*.md` 跑 schema 校验，失败阻止 commit
- `commit-msg`：校验 conventional commit 或 `XS:` 前缀
- CI (`.github/workflows/validate-docs.yml`)：PR 触发，跑 `validate-doc.js all`

**第二层：Claude Code hook（提示性，AI 辅助）**
- `SessionStart`：打印在制品状态摘要
- `PostToolUse(Write|Edit)`：若写的是受管文档，立刻校验并把错误回传给 AI

安装 Git hook（项目接入后一次性操作）：
```bash
git config core.hooksPath .ai-config/scripts/git-hooks
chmod +x .ai-config/scripts/git-hooks/*
```

## 多平台适配

`.ai-config/workflow.md` 是唯一事实源。各平台适配层：

| 平台 | 适配位置 | 角色 |
|---|---|---|
| Claude Code | `.claude/commands/` | 7 份斜杠命令（/init, /intake, /design, /code, /check, /deliver, /prototype） |
| Trae | `.trae/rules/project_rules.md` | 单文件触发词映射（Trae 无斜杠命令机制） |
| Cursor | `.cursor/rules/`（按需建立） | 同 Claude Code 模式 |
| Codex CLI | `AGENTS.md`（按需建立） | 同 Claude Code 模式 |

## 快速开始

1. **新项目**：执行 `/init` → 技术栈确认 → `/intake <第一个需求>`
2. **老项目接入**：执行 `/init existing` → 填充 `docs/_context/project-map.md`（尤其是 invariants）→ `/intake`
3. **日常**：按等级走对应流程，所有校验失败都由脚本拦住，不会流转到下一阶段

## 反馈和改进

规范是活文档。遇到以下情况请更新 `.ai-config/workflow.md` 并在 PR 里说明：

- 某个 schema 字段实际用不上 → 删
- 某个校验规则太严 / 太松 → 改
- 缺少某类产出物的校验 → 加 schema

原则：**减法优先**。每个规则 / 文档 / hook 都要能说清它守门的是什么风险；说不清就删。
