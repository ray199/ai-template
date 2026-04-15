---
name: init
description: 项目初始化 - 检测项目语言和现状，创建 .ai-config/ 规范目录和 docs/ 文档目录结构，适用于新项目首次接入和老项目补充规范
argument-hint: [可选: new | existing | 语言名如 java/vue/python/dotnet]
---

请执行**项目初始化**。

可选参数：$ARGUMENTS（不填则自动检测）

## Step 1：检测项目结构与技术栈

> **默认假设：所有项目均为前后端分离架构。** 扫描时优先识别前端和后端两个子目录/子项目。

### 1A. 项目结构识别

扫描根目录，按以下模式判断结构类型：

**前后端分离（分目录）**
```
frontend/ 或 web/ 或 client/    ← 前端子目录
backend/ 或 server/ 或 api/     ← 后端子目录
```

**前后端分离（根目录平铺）**
```
根目录同时存在：
  package.json（含 vue/react 等前端依赖）
  pom.xml / build.gradle / requirements.txt / *.csproj
```

**纯后端项目**（仅有后端文件，无前端依赖）

**纯前端项目**（仅有 package.json，无后端框架）

### 1B. 前端技术栈检测

扫描 `package.json`（根目录或 frontend/ 下）：

| 检测条件 | 技术栈 | 加载 Profile |
|---|---|---|
| 含 `"vue"` 依赖 | Vue / Node | `profiles/node_vue.mdc` |
| 含 `"react"` 依赖 | React | `profiles/node_vue.mdc`（通用前端规范） |
| 含 `"next"` 依赖 | Next.js | `profiles/node_vue.mdc` |
| 仅有 `tsconfig.json` | 纯 TypeScript | `profiles/typescript.mdc` |
| 未识别 | — | 询问用户 |

### 1C. 后端技术栈检测

| 检测文件 | 技术栈 | 加载 Profile |
|---|---|---|
| `pom.xml` / `build.gradle` | Java / Spring | `profiles/java_spring.mdc` |
| `requirements.txt` / `pyproject.toml` | Python | `profiles/python.mdc` |
| `*.csproj` / `*.sln` | C# / .NET | `profiles/dotnet_csharp.mdc` |
| 未识别 | — | 询问用户 |

### 1D. 特殊依赖检测（在后端检测后追加）

| 检测条件 | 标注 |
|---|---|
| `pom.xml` 含 `spring-ai` | ⚠️ 引入 Spring AI，设计阶段需补充 AI 架构章节 |
| `package.json` 含 `openai` / `langchain` | ⚠️ 引入前端 AI SDK |
| `requirements.txt` 含 `langchain` / `openai` | ⚠️ 引入 Python AI 框架 |

### 1E. 全新项目识别

若同时满足以下条件：无 `pom.xml` / `build.gradle` / `requirements.txt` / `*.csproj`，无 `package.json`，无 `src/` 目录
→ 标记为 **全新项目**，Step 1B/1C 无法自动检测，**必须向用户询问以下信息**：

```
检测到全新项目（无任何源代码），请确认技术栈：
1. 后端语言和框架版本？（如：Java 17 + Spring Boot 3.2）
2. 是否包含前端？若有，框架？（如：Vue 3 + Vite）
3. 数据库？（如：MySQL 8）
4. 是否引入 AI 框架？（如：Spring AI / LangChain / 无）
5. 项目根包名？（如：com.example.myapp）
```

用户确认后，将技术栈信息写入 `01_tech_stack.mdc`，供后续 `/design` 读取。

> ⚠️ `/init` **不生成任何源代码**。项目骨架（pom.xml、src/ 目录、package.json 等）在 `/code` 阶段根据 `/design` 的骨架规划生成。

---

## Step 2：初始化规范目录

创建 `.ai-config/rules/` 结构（已存在的不覆盖）：

**前后端分离项目 — 同时创建前端 + 后端两个 Profile：**

前端 Profile（按检测结果）：
```
profiles/node_vue.mdc      ← Vue / React / Next.js 项目
```

后端 Profile（按检测结果选一）：
```
profiles/java_spring.mdc   ← Java / Spring Boot 项目
profiles/python.mdc        ← Python / FastAPI / Django / Flask 项目
profiles/dotnet_csharp.mdc ← C# / .NET 项目
```

常见组合示例：
| 前端 | 后端 | 加载的 Profile |
|---|---|---|
| Vue / React | Java Spring | `node_vue.mdc` + `java_spring.mdc` |
| Vue / React | Python | `node_vue.mdc` + `python.mdc` |
| Vue / React | C# .NET | `node_vue.mdc` + `dotnet_csharp.mdc` |
| 无前端 | Java / Python / C# | 仅加载对应后端 profile |

**`01_tech_stack.mdc` 前后端分离模板：**
```markdown
# 技术栈说明

## 前端
- 框架：[Vue 3 / React / Next.js]
- 构建工具：[Vite / Webpack]
- UI 框架：[Element Plus / Ant Design / 其他]
- 状态管理：[Pinia / Vuex / Redux]

## 后端
- 语言：[Java / Python / C#]
- 框架：[Spring Boot x.x / FastAPI / .NET x]
- ORM：[MyBatis-Plus / JPA / SQLAlchemy / EF Core]
- 数据库：[MySQL / PostgreSQL / 其他]

## 特殊组件（如有）
- AI 框架：[Spring AI / LangChain / 无]
- 缓存：[Redis / 无]
- 消息队列：[RabbitMQ / Kafka / 无]
```

---

## Step 3：初始化文档目录结构

创建以下目录（已存在的不覆盖）：

```
docs/
  requirements/
    backlog/       ← /intake 输出的需求文档
    done/          ← /deliver 归档的已完成需求
  design/          ← /design 输出的技术设计文档
  test/            ← /check 输出的测试报告
  review/          ← /check 输出的代码审查报告
  delivery/        ← /deliver 输出的运维快查报告
```

---

## Step 4：老项目特殊处理（有代码但无文档）

若检测到已有代码但无 `docs/` 目录：
1. 扫描根目录一级结构，列出已有模块
2. 输出提示：
   ```
   ⚠️ 检测到已有代码，已创建 docs/ 目录结构
   无需补历史文档，直接 /intake 开始接入新需求即可
   ```
3. 不阻断流程

> 全新项目无需任何特殊处理：`/init` 只负责创建 AI 工作流目录，项目源代码骨架（pom.xml、src/、package.json 等）由 `/code` 阶段根据 `/design` 输出的骨架规划自动生成。

---

## Step 5：输出初始化报告

```
## ✅ 项目初始化完成

**项目类型**：[全新项目 / 已有项目]
**项目架构**：[前后端分离 / 纯后端 / 纯前端]
**前端技术栈**：[Vue 3 / React / 无]
**后端技术栈**：[Java Spring Boot x.x / Python FastAPI / 无]
**特殊组件**：[Spring AI / 无]
**加载规范**：profiles/[前端profile] + profiles/[后端profile]

### 规范和文档目录
- ✅ .ai-config/rules/01_tech_stack.mdc（已预填，请补充具体版本号）
- ✅ docs/requirements/backlog/
- ✅ docs/requirements/done/
- ✅ docs/design/
- ✅ docs/test/
- ✅ docs/review/
- ✅ docs/delivery/

### 需要手动完成的配置
- [ ] 补充 01_tech_stack.mdc 中的具体版本号
- [ ] 确认前后端目录结构是否正确识别（全新项目确认技术栈填写无误）

---

**下一步**：运行 `/intake` 开始接入第一个需求
```
