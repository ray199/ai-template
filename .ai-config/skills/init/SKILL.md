> **[Trae 兼容版]** 对应 Claude Code 命令 `/init`，调用方式：`@init`  
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

扫描 `package.json`：Vue → `profiles/node_vue.mdc`，React/Next → 通用前端规范，未识别 → 询问用户

### 1C. 后端技术栈检测

| 检测文件 | 技术栈 | 加载 Profile |
|---|---|---|
| `pom.xml` / `build.gradle` | Java / Spring | `profiles/java_spring.mdc` |
| `requirements.txt` / `pyproject.toml` | Python | `profiles/python.mdc` |
| `*.csproj` / `*.sln` | C# / .NET | `profiles/dotnet_csharp.mdc` |
| 未识别 | — | 询问用户 |

### 1D. 特殊依赖检测

`pom.xml` 含 `spring-ai` → ⚠️ 引入 Spring AI，设计阶段需补充 AI 架构章节

### 1E. 全新项目识别

若无 `pom.xml` / `package.json` / `src/` → 标记为**全新项目**，必须向用户询问技术栈（后端框架版本、是否含前端、数据库、是否引入 AI 框架、根包名），在 Step 4 执行骨架生成。

## Step 2：初始化规范目录

**前后端分离项目同时创建前端 + 后端两个 Profile（按检测结果选择）：**

| 前端 | 后端 | 加载的 Profile |
|---|---|---|
| Vue / React | Java Spring | `node_vue.mdc` + `java_spring.mdc` |
| Vue / React | Python | `node_vue.mdc` + `python.mdc` |
| Vue / React | C# .NET | `node_vue.mdc` + `dotnet_csharp.mdc` |
| 无前端 | Java / Python / C# | 仅加载对应后端 profile |

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

## Step 4：全新项目骨架生成 / 老项目特殊处理

**4A. 全新项目骨架生成（Step 1E 标记为全新项目时执行）**

根据用户确认的技术栈生成最小可运行骨架：

- **Java Spring Boot 后端**：生成 `pom.xml`（含 web/mybatis-plus/数据库驱动/lombok/validation/flyway）、`Application.java`、`application.yml`（占位符）、基础包结构（entity/mapper/service/controller/vo/config/exception/common）、`db/migration/` 目录
- **Vue 3 前端（若含）**：生成 `package.json`（含 vue/vite/element-plus/axios/pinia/vue-router）、`vite.config.js`（含 API 代理）、`src/main.js`、`src/App.vue`、`src/router/`、`src/api/request.js`（axios 封装）、`.env.development` / `.env.production`
- **Spring AI（若选择）**：在 `pom.xml` 追加 `spring-ai-openai-spring-boot-starter`，在 `application.yml` 追加 AI 配置占位符

骨架生成后提示用户：补充 `application.yml` 数据库配置 → 验证可启动 → 再执行 `@intake`

**4B. 老项目特殊处理（有代码但无 docs/ 目录）**

有代码但无 `docs/` → 创建目录结构，提示"直接 `@intake` 开始"，不阻断流程

## Step 5：输出初始化报告

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
