> **[Trae 兼容版]** 对应 Claude Code 命令 `/pg:init`，调用方式：`@init`  
> 如需修改执行逻辑，同步修改 `.claude/commands/init.md`

---

# 技能：项目初始化

检测项目结构和技术栈，创建规范目录和文档目录结构。

> **默认假设：所有项目均为前后端分离架构。**

## Step 1：检测项目结构与技术栈

### 1A. 项目结构识别

扫描根目录，按以下模式判断：

**前后端分离（分目录）**
```
frontend/ 或 web/ 或 client/    ← 前端子目录
backend/ 或 server/ 或 api/     ← 后端子目录
```

**前后端分离（根目录平铺）**：根目录同时存在 `package.json`（含前端依赖）和 `pom.xml` / `requirements.txt` 等

**纯后端** / **纯前端**（单一技术栈）

### 1B. 前端技术栈检测

扫描 `package.json` 的 `dependencies`：

| 依赖命中 | 技术栈 | 加载 Profile |
|---|---|---|
| `vue` | Vue 2/3 | `profiles/node_vue.mdc` |
| `react` + `next` | Next.js | `profiles/react.mdc` + `profiles/typescript.mdc`（若有 TS） |
| `react`（无 next） | React SPA | `profiles/react.mdc` + `profiles/typescript.mdc`（若有 TS） |
| 仅 TS 无前端框架 | TS 库/工具 | `profiles/typescript.mdc` |
| 未识别 | — | 询问用户 |

### 1C. 后端技术栈检测

| 检测文件 | 技术栈 | 加载 Profile |
|---|---|---|
| `pom.xml` / `build.gradle` | Java / Spring | `profiles/java_spring.mdc` |
| `requirements.txt` / `pyproject.toml` | Python | `profiles/python.mdc` |
| `go.mod` | Go | `profiles/go.mdc` |
| `*.csproj` / `*.sln` | C# / .NET | `profiles/dotnet_csharp.mdc` |
| `package.json` + Node 服务端依赖（express/nest/fastify/koa/hono） | Node 服务端 | `profiles/typescript.mdc`（TS）或基础规则 |
| 未识别 | — | 询问用户 |

### 1D. 特殊依赖检测

- `pom.xml` 含 `spring-ai` → ⚠️ 引入 Spring AI，设计阶段需补充 AI 架构章节
- 任何项目检测到 LLM / OpenAI / Anthropic / LangChain 依赖 → 加载 [`middleware/ai-llm.md`](../../rules/middleware/ai-llm.md)
- 检测到 Redis / RocketMQ / Kafka / RabbitMQ 依赖 → 加载对应 `middleware/*.md`

### 1E. 全新项目识别

若无 `pom.xml` / `package.json` / `src/` → 标记为**全新项目**，必须向用户询问技术栈（后端框架版本、是否含前端、数据库、是否引入 AI 框架、根包名），在 Step 4 执行骨架生成。

## Step 2：初始化规范目录

**前后端分离项目同时创建前端 + 后端两个 Profile（按检测结果选择）：**

| 前端 | 后端 | 加载的 Profile |
|---|---|---|
| Vue | Java Spring | `node_vue.mdc` + `java_spring.mdc` |
| Vue | Python | `node_vue.mdc` + `python.mdc` |
| Vue | Go | `node_vue.mdc` + `go.mdc` |
| Vue | C# .NET | `node_vue.mdc` + `dotnet_csharp.mdc` |
| React（TS） | Java / Python / Go / .NET | `react.mdc` + `typescript.mdc` + 对应后端 |
| React（JS） | — 同上 — | `react.mdc` + 对应后端 |
| 无前端 | Java / Python / Go / C# | 仅加载对应后端 profile |

**中间件 Profile 按需叠加**：无论语言，只要检测到 Redis / MQ / JWT / LLM 等依赖，都必须加载 `.ai-config/rules/middleware/` 下对应规范。

## Step 3：初始化文档目录结构

创建以下目录（已存在的不覆盖）：

```
docs/
  requirements/backlog/   ← @intake 输出位置
  requirements/done/      ← @deliver 归档位置
  design/                 ← @design 输出位置
  test/                   ← @check 输出位置
  review/                 ← @check 输出位置
  delivery/               ← @deliver 输出位置
```

## Step 4：老项目特殊处理（有代码但无 docs/ 目录）

有代码但无 `docs/` → 创建目录结构，提示"直接 `@intake` 开始"，不阻断流程

> `@init` **不生成任何源代码**。全新项目的项目骨架（pom.xml、src/、package.json 等）由 `@code` 阶段根据 `@design` 输出的骨架规划生成。

## Step 5.5：生成或追加 CLAUDE.md（必做）

CLAUDE.md 是 Claude Code 启动时自动加载的项目级指令文件，必须生成。模板见 `templates/claude-md-template.md`。

### 处理逻辑

```
检测根目录 CLAUDE.md：
├── 不存在 → 直接从模板复制（替换 <项目名> 等占位符）
│
└── 已存在：
    检查是否引用 .ai-config/workflow.md
    ├── 已引用 → 不动（已合规）
    └── 未引用 → 询问用户"是否追加规范引用块？(Y/N)"
                 选 Y → 末尾追加规范引用段
                 选 N → 跳过，但提示"AI 可能不会自动遵守 pg: 规范"
```

### 关键约束

- **文件名严格用大写 `CLAUDE.md`**：Claude Code 官方约定，小写 `claude.md` 不识别
- **不覆盖已有内容**：保护用户已有的项目级指令
- 老项目接入时，CLAUDE.md 通常需要从模板生成；新项目则跟随 ai-template 自带的 CLAUDE.md

### 模板内容

完整模板见 `.ai-config/skills/init/templates/claude-md-template.md`。核心结构：

- 工作流概览（8 个命令）
- 工作量分级（XS-XL）
- 必读上下文（文件路径表）
- 自动化校验（硬门 + 软门）
- 提交规范（conventional commit + XS:）
- 多平台适配（Claude Code / Trae / Cursor / Codex）
- 设计原则（减法优先 / 事实源单一 / ...）
- 文档导航

## Step 5.6：建立 Skill Registry（项目级 + 用户级）

扫描所有可用的 skill，按类型分类写到 `docs/_context/skill-registry.md`，让后续 `/pg:design` `/pg:code` 等命令知道项目里有什么 skill 可用。

### 扫描来源（3 个位置必须都扫）

| 来源 | 路径 | 说明 |
|---|---|---|
| 本规范约定（项目级） | `.ai-config/skills/*/SKILL.md` | 团队共享，入 git |
| Claude Code 项目级 | `.claude/skills/*/SKILL.md` | 入 git；marketplace 安装的项目 skill / 团队第三方 skill 默认放这里 |
| Claude Code 用户级 | `~/.claude/skills/*/SKILL.md`（macOS/Linux）或 `%APPDATA%/Claude/skills/*/SKILL.md`（Win） | 个人偏好，不入 git |

### 分类规则（按 SKILL.md 中的 description 关键词）

| 类型 | 关键词 | AI 加载策略 |
|---|---|---|
| 脚手架 / 框架 | `scaffold` / `starter` / `framework` / `template` / `脚手架` / `骨架` | 强相关：写代码时**必读** |
| 领域 / 业务 | `domain` / `payment` / `auth` / `notification` / `领域` / `业务` | 按需：当 REQ 涉及对应领域时读 |
| 工具 / 通用 | `tool` / `general` / `utility` / `工具` | 按需：AI 按 description 自动判断 |
| 流程内置 | 本规范自带的 8 个 skill（init / intake-requirement / technical-design / ...） | 命令模板已显式引用，不进 registry |

### 输出 docs/_context/skill-registry.md 模板

```markdown
---
kind: skill-registry
generated_at: <ISO date>
generated_by: /pg:init
---

# 项目可用 Skill 清单

> 由 `/pg:init` 自动生成 + 团队补充。`/pg:design` 和 `/pg:code` 启动时读本清单挑选可用 skill。
> 修改后建议手动更新 `generated_at`。

## 脚手架 / 框架（强相关 · 写代码时必读）

- 路径：`.ai-config/skills/<scaffold-name>/SKILL.md`
  description：<从 SKILL.md 提取的描述>
  适用阶段：/pg:design, /pg:code
  来源：项目级 / 用户级

## 领域 / 业务（按场景使用）

- 路径：...
  description：...
  适用场景：当 REQ 涉及 <领域关键词> 时使用

## 工具 / 通用（AI 按描述自动判断）

- 路径：...
  description：...

## 用户级 skill（团队成员可能没有）

- 路径：~/.claude/skills/...
  description：...
  ⚠️ 团队其他成员可能没装；使用前 AI 必须告知用户
```

### 关键约束

- registry **不走 schema 校验**（叙事性清单）
- 项目级 skill 路径应为相对路径（`.ai-config/skills/...`），跨人可用
- 用户级 skill 路径用绝对路径或 `~`，仅当前用户机器有效；registry 整体入 git，但**用户级段在生成时附警告**："此段路径只在你机器上有效，commit 前请评估是否保留——若团队不需要见你的个人 skill 清单，可手动删除本段后再 commit"
- 团队加新 skill 后跑 `/pg:init` 即更新 registry；或手动改

## Step 6：输出初始化报告

```
## ✅ 项目初始化完成

**项目架构**：[前后端分离 / 纯后端 / 纯前端]
**前端技术栈**：[Vue 3 / React / 无]
**后端技术栈**：[Java Spring Boot x.x / Python / 无]
**特殊组件**：[Spring AI / 无]
**加载规范**：profiles/node_vue.mdc + profiles/java_spring.mdc

### 需要手动完成的配置
- [ ] 补充 01_tech_stack.mdc 中的具体版本号

**下一步**：使用 `@intake` 开始接入第一个需求
```
