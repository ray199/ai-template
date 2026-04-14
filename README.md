# AI编程规范模板

一套基于 Claude Code 的规范驱动开发工作流，覆盖**需求接入 → 技术设计 → 编码实现 → 测试审查 → 交付上线**的完整闭环。

核心思路：根据需求复杂度（S/M/L/XL）自动匹配输出物规格和审查严度，一句话需求和完整 PRD 都能处理。

---

## 工作流

```
原始需求（一句话 / 零散描述 / 完整PRD）
    ↓
【阶段1】需求接入
/intake    需求结构化 + 工作量评估 + 伪需求扫描（一步完成）
           → 告知下一步：/design（M/L/XL）或 /code（S）
    ↓
【阶段2】设计+编码
/design    技术设计（M/L/XL）→ docs/design/REQ-xxx-design.md
/code      生成源代码 + DB迁移脚本 + 测试骨架
    ↓
【阶段3】测试+审查
/check     测试用例设计 + 代码审查（一步完成）
           → 告知下一步：/deliver（通过）或 重跑/check（有问题）
    ↓
【阶段4】交付上线
/deliver   上线前检查 + 文档归档 → docs/requirements/done/REQ-xxx/
```

### 工作量分级

| 等级 | 特征 | 工期 | 审查方式 |
|---|---|---|---|
| **S** | 新增字段、简单页面 | 1-2天 | AI 自动 |
| **M** | 新增模块、3-5个页面 | 3-5天 | AI + 人工确认 |
| **L** | 跨模块改造、有技术风险 | 1-2周 | AI + 人工终审 |
| **XL** | 整体重构、需拆分迭代 | 4周+ | 三级评审 |

---

## 快速开始

### 方式一：Clone 模板（新项目从零开始）

```bash
git clone https://github.com/ray199/ai-template.git my-project
cd my-project
```

命令**无前缀**，在当前项目内使用：

```
/init      /intake    /design    /code    /check    /deliver
```

### 方式二：Marketplace 插件（已有项目 / 团队统一分发）

在 Claude Code 中执行一次安装：

```
/plugin marketplace add ray199/ai-template
/plugin install ai@ai-template
```

命令带 `/ai:` 前缀，**跨项目通用**：

```
/ai:init    /ai:intake    /ai:design    /ai:code    /ai:check    /ai:deliver
```

规范有更新时，所有人执行：

```
/plugin marketplace update
```

---

### 两种方式命令对照

两套命令**功能完全一致**，仅前缀不同（Claude Code 强制要求插件命令带插件名前缀）：

| 功能 | Clone 方式 | Marketplace 方式 |
|---|---|---|
| 项目初始化 | `/init` | `/ai:init` |
| 需求接入 | `/intake` | `/ai:intake` |
| 技术设计 | `/design REQ-xxx` | `/ai:design REQ-xxx` |
| 编码实现 | `/code REQ-xxx` | `/ai:code REQ-xxx` |
| 测试+审查 | `/check REQ-xxx` | `/ai:check REQ-xxx` |
| 交付上线 | `/deliver REQ-xxx` | `/ai:deliver REQ-xxx` |

> **如何选择**：团队统一推广选 Marketplace（规范自动更新，不改项目结构）；新项目自己搭选 Clone（深度集成，可定制 `.ai-config/`）。**同一个团队只选一种**，避免混用两套命令。

---

## 目录结构

```
.
├── .ai-config/              # 项目级配置（clone 模板时使用）
│   ├── rules/               # 技术栈、代码规范、安全、Git 工作流等约束
│   ├── agents/              # 角色代理（架构师、后端开发、QA等）
│   └── skills/              # 各阶段详细技能（含项目上下文，深度集成）
│
├── skills/                  # 自包含技能（Marketplace 插件来源）
│   ├── init/SKILL.md        # 项目初始化  → /ai:init
│   ├── intake/SKILL.md      # 需求接入    → /ai:intake
│   ├── design/SKILL.md      # 技术设计    → /ai:design
│   ├── code/SKILL.md        # 编码实现    → /ai:code
│   ├── check/SKILL.md       # 测试+审查   → /ai:check
│   └── deliver/SKILL.md     # 交付上线    → /ai:deliver
│
├── .claude-plugin/          # Marketplace 插件声明
│   ├── plugin.json          # 插件名 "ai"，指向 skills/
│   └── marketplace.json     # 发布源 ray199/ai-template
│
├── .claude/
│   ├── commands/            # 项目级斜杠命令（无前缀，clone 模板时内置）
│   └── settings.json        # 预置 extraKnownMarketplaces
│
├── docs/                    # 所有阶段输出文档
│   ├── requirements/        # 需求文档（backlog / approved / done）
│   ├── design/              # 技术设计文档
│   ├── test/                # 测试报告
│   ├── review/              # 审查报告
│   └── delivery/            # 交付文档
│
├── WORKFLOW-GUIDE.md        # 工作流完整指南（各场景输出物示例）
├── CLAUDE.md                # 详细规范（各阶段完整说明）
└── EXAMPLE.md               # 实际使用示例
```

> `skills/`（自包含，无外部依赖）与 `.ai-config/skills/`（深度集成项目上下文）内容对应，前者用于插件分发，后者在 clone 模板的项目中使用。

---

## 文档导航

| 文档 | 用途 |
|---|---|
| [WORKFLOW-GUIDE.md](./WORKFLOW-GUIDE.md) | 4阶段完整流程 + 各命令输入输出说明，首次使用必读 |
| [CLAUDE.md](./CLAUDE.md) | 各阶段详细规范说明（4万字完整版） |
| [EXAMPLE.md](./EXAMPLE.md) | 完整使用示例 |

---

## 版本

| 版本 | 日期 | 更新 |
|---|---|---|
| v3.0 | 2026-04-14 | Phase 6：Marketplace 插件化，7个自包含技能 |
| v2.0 | 2026-04-06 | Phase 5：规范增强，工作流完整文档 |
| v1.0 | 2026-03-20 | 初始版本，Phase 1-4 |
