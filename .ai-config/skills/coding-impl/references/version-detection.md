# 版本上下文扫描

> 在 `/pg:code` 生成任何代码之前必须执行。目的：确保生成的代码语法、包名、API 与项目实际版本一致。

按项目类型选择对应章节：Java / Vue / Python / .NET。

---

## Java 项目

### 自动扫描逻辑
```
1. 优先读取 pom.xml
   ├─ <java.version> 或 <maven.compiler.source>  → JDK 版本
   ├─ <parent> spring-boot-starter-parent version → Spring Boot 版本
   ├─ 搜索 spring-ai 依赖                         → Spring AI 是否引入
   └─ 搜索 spring-cloud 依赖                      → Spring Cloud 是否引入

2. 若无 pom.xml，读取 build.gradle / build.gradle.kts
   ├─ java { sourceCompatibility / targetCompatibility }
   └─ plugins { id 'org.springframework.boot' version '...' }

3. 若仍无法确定，读取
   ├─ .java-version / .sdkmanrc / .tool-versions
   └─ Dockerfile（FROM eclipse-temurin:xx）

4. 若全部无法确定 → 输出询问，人工确认后继续
```

### 输出格式
```
────────────────────────────────────────────
  项目版本上下文（自动检测）
────────────────────────────────────────────
  JDK 版本      : [8 / 11 / 17 / 21 / ❓未检测到]
  Spring Boot   : [2.x / 3.x / ❓未检测到]
  构建工具      : [Maven / Gradle]
  Spring AI     : [✅ 已引入 / ❌ 未引入]
  Spring Cloud  : [✅ 已引入 / ❌ 未引入]
  其他关键依赖  : [MyBatis-Plus / JPA / Security / ...]

  适用规范      : java_spring.mdc §[对应版本章节]
  包名前缀      : [javax.* / jakarta.*（Spring Boot 3.x）]
────────────────────────────────────────────
```

### 版本对代码生成的影响
| 版本条件 | 代码生成调整 |
|---|---|
| JDK ≥ 17 | 纯数据 DTO/VO 优先生成 `record`，而非 Lombok `@Data` |
| JDK ≥ 21 | 线程池考虑 Virtual Threads；`switch` 可用 pattern matching |
| Spring Boot 3.x | 所有包名使用 `jakarta.*`，Security 用 Lambda DSL |
| Spring AI 已引入 | AI 调用封装在 Service 层，使用 `ChatClient` 标准 API |
| JDK 8 | 严格限制语法，禁止 `var`/`record`/`text blocks` 等 |

---

## Vue 项目

### 自动扫描逻辑
```
1. 读取 package.json
   ├─ dependencies.vue          → Vue 版本（^2.x / ^3.x）
   ├─ devDependencies.vite      → 构建工具 Vite（通常 Vue 3）
   ├─ devDependencies.@vue/cli-service → Vue CLI（通常 Vue 2/3）
   ├─ dependencies.vuex         → 状态管理 Vuex（Vue 2 概率高）
   ├─ dependencies.pinia        → 状态管理 Pinia（Vue 3）
   ├─ dependencies.vue-router   → 路由版本（^3.x / ^4.x）
   └─ engines.node              → Node.js 版本要求

2. 检查配置文件
   ├─ vite.config.js / vite.config.ts  → Vite 项目
   ├─ vue.config.js                    → Vue CLI 项目
   └─ tsconfig.json 存在               → TypeScript 已引入

3. 若无法确定 → 人工确认后继续
```

### 输出格式
```
────────────────────────────────────────────
  前端版本上下文（自动检测）
────────────────────────────────────────────
  Vue 版本       : [2.x / 3.x / ❓未检测到]
  Node.js 版本   : [16 / 18 / 20 / ❓]
  构建工具       : [Vite / Vue CLI / Webpack]
  状态管理       : [Vuex / Pinia / 无]
  路由版本       : [Vue Router 3 / Vue Router 4 / 无]
  UI 框架        : [Element UI / Element Plus / Ant Design Vue / 其他 / 无]
  TypeScript     : [✅ 已引入 / ❌ 未引入]

  适用规范       : node_vue.mdc §[对应版本章节]
  代码风格       : [Options API / Composition API + <script setup>]
────────────────────────────────────────────
```

### 版本对前端代码生成的影响
| 版本条件 | 代码生成调整 |
|---|---|
| Vue 2 | Options API（data/methods/computed/watch），Vuex，Vue Router 3 |
| Vue 3 | `<script setup>` + Composition API，Pinia，Vue Router 4 |
| TypeScript 已引入 | Props/Emits 用泛型定义，API 返回值有类型，禁止 `any` |
| TypeScript 未引入 | JSDoc 注释补充类型说明 |
| Element UI（Vue 2）| 组件前缀 `el-`，使用 `$message` / `$confirm` |
| Element Plus（Vue 3）| 组件前缀 `el-`，使用 `ElMessage` / `ElMessageBox`（按需导入）|
| Vant（移动端） | 组件前缀 `van-`，注意 rem 适配方案 |

---

## Python 项目

### 自动扫描逻辑
```
1. 读取 pyproject.toml → [tool.poetry] python / [project] requires-python
2. 读取 .python-version → pyenv 声明版本
3. 读取 setup.cfg / setup.py → python_requires
4. 读取 Pipfile → [requires] python_version
5. 读取 Dockerfile → FROM python:x.x
6. 若全部无法确定 → 询问用户确认

同时检测 Web 框架依赖（requirements.txt / pyproject.toml）：
  - django / djangorestframework → Django + DRF
  - fastapi → FastAPI
  - flask → Flask
  - sqlalchemy → SQLAlchemy ORM
  - alembic → Alembic 迁移
```

### 输出格式
```
────────────────────────────────────────────
  Python 版本上下文（自动检测）
────────────────────────────────────────────
  Python 版本    : [3.8 / 3.10 / 3.11 / 3.12 / ❓未检测到]
  包管理工具     : [pip / Poetry / Pipenv / PDM]
  Web 框架       : [Django / FastAPI / Flask / 无]
  ORM            : [Django ORM / SQLAlchemy / 无]
  数据库迁移     : [Alembic / Django Migrations / 无]
  类型检查       : [mypy / pyright / 无]

  适用规范       : python.mdc §[对应版本章节]
────────────────────────────────────────────
```

### 版本对代码生成的影响
| 版本条件 | 代码生成调整 |
|---|---|
| Python ≤ 3.8 | 类型提示用 `from typing import Optional, List, Dict`，禁止 `X \| Y` 语法 |
| Python ≥ 3.10 | 可用 `match/case`，类型提示可用内置 `list[int]`、`X \| Y` |
| Python ≥ 3.11 | 可用 `TaskGroup`、`Self`，推荐用于新的异步并发场景 |
| FastAPI 项目 | 路由使用 `@app.get/post`，参数校验使用 Pydantic Model |
| Django 项目 | 视图用 ViewSet，序列化器显式声明 `fields`，禁止 `__all__` |
| SQLAlchemy 2.x | 使用 `Mapped[T]` + `mapped_column` 声明式风格 |

---

## C#/.NET 项目

### 自动扫描逻辑
```
1. 读取 *.csproj → <TargetFramework>（net6.0 / net7.0 / net8.0）
                 → <LangVersion>（10 / 11 / 12）
                 → <Nullable>（enable / disable）
2. 读取 global.json → "sdk": { "version": "..." }
3. 读取 Directory.Build.props → <TargetFramework>
4. 读取 Dockerfile → FROM mcr.microsoft.com/dotnet/aspnet:x.x
5. 若全部无法确定 → 询问用户确认

同时检测框架类型（.csproj / NuGet 依赖）：
  - Microsoft.AspNetCore.Mvc → Controller-based Web API
  - app.MapGet（Program.cs 中） → Minimal API
  - Microsoft.EntityFrameworkCore → EF Core
  - Dapper → Dapper ORM
```

### 输出格式
```
────────────────────────────────────────────
  .NET 版本上下文（自动检测）
────────────────────────────────────────────
  .NET 版本       : [6 / 7 / 8 / ❓未检测到]
  C# 版本         : [10 / 11 / 12 / ❓]
  API 风格        : [Controller-based / Minimal API / 混合]
  ORM             : [EF Core / Dapper / ADO.NET / 无]
  NRT（空引用）   : [✅ 已启用 / ❌ 未启用]

  适用规范        : dotnet_csharp.mdc §[对应版本章节]
────────────────────────────────────────────
```

### 版本对代码生成的影响
| 版本条件 | 代码生成调整 |
|---|---|
| .NET 6 / C# 10 | 文件级命名空间、`record struct`，禁止 `required` 修饰符 |
| .NET 7 / C# 11 | 可用 `required` 修饰符、原始字符串（`"""`）、List patterns |
| .NET 8 / C# 12 | 可用主构造函数、Collection expressions、`IExceptionHandler` |
| NRT 已启用 | 引用类型必须标注 `?`，禁止用 `!` 消除警告 |
| EF Core 项目 | 继承 BaseEntity，使用全局查询过滤器过滤软删除 |
| Minimal API | 路由在独立 `MapXxxEndpoints` 扩展方法中注册，禁止全写在 Program.cs |
