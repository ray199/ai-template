# CLAUDE.md 模板（由 /pg:init 生成）

> 由 `/pg:init` 复制到项目根目录 `CLAUDE.md`。
> Claude Code 启动时自动加载本文件作为项目指令。
> Trae / Cursor / Codex 也可读本文件作为参考（虽然各自有 native 适配文件）。

模板内容如下：

```markdown
# 项目级 AI 指令（CLAUDE.md）

> 本文件由 `/pg:init` 自动生成。Claude Code 会在每次会话启动时自动加载。
> 修改本文件等于变更项目级 AI 行为，请审慎。

## 工作流概览

本项目使用 **AI 编程规范（pg:）**，事实源在 `.ai-config/workflow.md`，平台无关。

8 个命令（命名空间 `pg:`，避免与内置冲突）：

| 命令 | 阶段 | 主要产出 |
|---|---|---|
| `/pg:init` | 项目初始化 | docs/、project-map.md、skill-registry.md |
| `/pg:explore`（可选） | 想法探索 | docs/_exploration/EXPLORE-*.md（草稿） |
| `/pg:intake` | 需求接入 | docs/requirements/backlog/REQ-*.md |
| `/pg:design`（M+） | 技术设计 | docs/design/REQ-*-design.md |
| `/pg:code` | 编码 | 源码 + 迁移脚本 + code-report |
| `/pg:check` | 测试审查 | docs/test/ + docs/review/ |
| `/pg:deliver` | 交付归档 | docs/delivery/ + 归档到 done/ |
| `/pg:prototype`（按需） | 原型生成 | docs/prototype/ |

详细契约见 `.ai-config/workflow.md`。

## 工作量分级

| 等级 | 场景 | 工期 | 流程 |
|---|---|---|---|
| XS | 改文案 / 加字段 / 样式微调 | <1 天 | git commit "XS: ..." → PR |
| S | 单文件 / ≤1 页面 | 1-2 天 | intake → code → check → deliver |
| M | 新模块 / 2-4 页面 / 新表 | 3-5 天 | + design |
| L | 跨模块改造 / 5+ 页面 | 1-2 周 | 同 M，强制任务拆解 |
| XL | 整体重构 / 拆分迭代 | 4 周+ | 同 L，必有 iteration_plan |

## 必读上下文

AI 在执行命令时按需自动读取：

| 文件 | 用途 | 何时读 |
|---|---|---|
| `.ai-config/workflow.md` | 工作流契约（事实源） | 任何命令 |
| `docs/USAGE.md` | 团队使用教程 | 新人入职 |
| `docs/_context/project-map.md` | 老项目上下文（必读） | /pg:design 老项目 |
| `docs/_context/skill-registry.md` | 项目可用 skill 清单 | /pg:design / /pg:code |
| `docs/requirements/backlog/REQ-*.md` | 需求文档 | /pg:design 起每阶段 |
| `docs/_exploration/EXPLORE-*.md` | 探索草稿（按 graduated_to 关联） | /pg:design 起 |
| `.ai-config/rules/` | 通用代码风格 / 安全 / 工作流规则 | /pg:code |
| `.ai-config/skills/` | 各阶段执行技能（命令模板自动加载） | 对应命令 |

## 自动化校验

**硬门**（git hooks + CI，机械、阻断）：
- `pre-commit`：本次涉及的 `docs/**/REQ-*.md` 跑 schema 校验
- `commit-msg`：conventional commit 或 `XS:` 前缀
- CI workflow：PR 触发 `validate-doc.js all`

**软门**（AI 软提示，上下文相关、不阻断）：
- /pg:intake 并行需求冲突
- /pg:design 老项目"现状基线"+ L/XL"任务拆解"
- /pg:deliver 收尾两问

## 提交规范

- conventional commit：`feat: ...` / `fix: ...` / `docs: ...` / `refactor: ...` / `chore: ...`
- XS 快车道：`XS: <一句话描述>`（commit-msg hook 强制前缀）

## 多平台适配

| 平台 | 适配位置 | 触发 |
|---|---|---|
| Claude Code | `.claude/commands/pg/` | `/pg:xxx` 严格命名空间 |
| Trae | `.trae/rules/project_rules.md` | `/pg:xxx` 或 `/xxx` 双识别 |
| Cursor | `.cursor/rules/`（按需） | 同 Claude Code |
| Codex CLI | `AGENTS.md`（按需） | 同 Claude Code |

事实源永远是 `.ai-config/workflow.md` + `validate-doc.js`，平台层被动同步。

## 设计原则

- **减法优先** —— 每条规则、文档、hook 都要能说清守门的风险，说不清就删
- **按等级做减法** —— XS 走快车道、S 轻量、M 标准、L/XL 完整；不一刀切
- **事实源单一** —— `workflow.md` 改完所有平台被动同步
- **机械校验** —— 能交给脚本就别靠人记；schema 失败即阻断
- **渐进式 skill** —— SKILL.md 主文件 ≤150 行；细节走 references/ + templates/ lazy-load

## 详细文档导航

| 入口 | 看什么 |
|---|---|
| [`.ai-config/workflow.md`](./.ai-config/workflow.md) | **事实源**：8 个命令的契约 + 8 种产出物 schema |
| [`docs/USAGE.md`](./docs/USAGE.md) | 角色 + 场景双视角的使用教程 |
| [`README.md`](./README.md) | 项目对外介绍 |
| [`.ai-config/skills/*/SKILL.md`](./.ai-config/skills/) | 各阶段执行技能（含 references / templates 子目录） |
| [`.ai-config/rules/profiles/`](./.ai-config/rules/profiles/) | 7 种语言专项规范 |
| [`.ai-config/rules/middleware/`](./.ai-config/rules/middleware/) | 6 种中间件规范 |
```

## 生成规则（/pg:init 处理逻辑）

1. **检测项目根目录是否已有 CLAUDE.md**：
   - **无** → 直接复制本模板（替换 `<项目名>` 等占位符）
   - **有**：
     - 检查内容是否已引用 `.ai-config/workflow.md`：
       - 已引用 → 不动
       - 未引用 → 询问用户："是否在末尾追加规范引用块？(Y/N)"
       - 选 Y → 在末尾加一段："## AI 编程规范\n本项目使用 pg: 系列命令，详见 [.ai-config/workflow.md](./.ai-config/workflow.md)"
2. **不要覆盖已有 CLAUDE.md 内容**——避免破坏用户原有项目级指令
3. **跨平台冗余说明**：CLAUDE.md 主要给 Claude Code 用，但 Trae / Cursor 团队成员看到这份文件也能快速理解项目规范，无需删除

## 全新项目 vs 老项目

- **全新项目（`/pg:init` 不带 existing 参数）**：直接生成完整 CLAUDE.md
- **老项目（`/pg:init existing`）**：按上面"生成规则"判断是否生成 / 追加
