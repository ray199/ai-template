---
name: init
description: 项目初始化 - 检测项目语言和现状，创建 .ai-config/ 规范目录和 docs/ 文档目录结构，适用于新项目首次接入和老项目补充规范
argument-hint: [可选: new | existing | 语言名如 java/vue/python/dotnet]
---

请执行**项目初始化**。

可选参数：$ARGUMENTS（不填则自动检测）

**执行步骤：**

## Step 1：检测项目现状

扫描项目根目录，判断以下状态：

**语言检测：**
- `pom.xml` / `build.gradle` → Java 项目
- `package.json`（含 vue 依赖）→ Vue/Node 项目
- `requirements.txt` / `pyproject.toml` → Python 项目
- `*.csproj` / `*.sln` → C#/.NET 项目
- `tsconfig.json`（无 package.json）→ 纯 TypeScript 项目
- 未识别 → 询问用户确认

**规范成熟度：**
- 有 `.ai-config/` → 已初始化，仅补全缺失部分
- 无 `.ai-config/` → 需要完整初始化

**文档现状：**
- 有 `docs/` → 检查子目录是否完整
- 无 `docs/` 但有 `src/`（老项目无文档）→ 补充文档目录结构，并提示需要补充的内容
- 无 `docs/` 无 `src/` → 新项目，完整初始化

## Step 2：初始化规范目录（若 `.ai-config/` 不存在或不完整）

创建以下结构（已存在的不覆盖）：

```
.ai-config/
  rules/
    01_tech_stack.mdc        ← 根据检测到的语言预填技术栈
    02_code_style.mdc        ← 通用代码风格规范（从模板复制）
    03_security.mdc          ← 通用安全规范（从模板复制）
    04_git_workflow.mdc      ← Git 工作流规范（从模板复制）
    05_workflow.mdc          ← 开发流程规范（从模板复制）
    profiles/
      [语言].mdc             ← 对应语言的规范 Profile
```

**`01_tech_stack.mdc` 预填模板（根据语言选择）：**
- Java 项目 → 预填 Spring Boot 版本（从 pom.xml 读取）、JDK 版本、数据库
- Vue 项目 → 预填 Vue 版本（从 package.json 读取）、构建工具、UI 框架
- Python 项目 → 预填 Python 版本（从 pyproject.toml/requirements.txt 读取）、Web 框架
- .NET 项目 → 预填 .NET 版本（从 .csproj 读取）、框架类型

## Step 3：初始化文档目录结构

创建以下目录和占位文件（已存在的不覆盖）：

```
docs/
  requirements/
    backlog/       ← /intake 输出的需求文档存放位置
    done/          ← /deliver 归档的已完成需求
  design/          ← /design 输出的技术设计文档
  test/            ← /check 输出的测试报告
  review/          ← /check 输出的代码审查报告
  delivery/        ← /deliver 输出的运维快查报告
```

## Step 4：针对老项目（有代码但无文档）的特殊处理

若检测到 `src/` 存在但 `docs/` 不存在：

1. 扫描 `src/` 一级目录，列出已有模块
2. 输出建议补充的文档清单：

```
检测到已有代码模块，建议补充以下文档：

□ docs/requirements/done/ - 将历史已完成功能记录为需求档案
□ docs/design/            - 将现有核心模块补充技术设计文档
□ .ai-config/rules/01_tech_stack.mdc - 填写当前技术栈版本
```

3. 询问用户：是否需要对已有代码进行"快照扫描"（输出当前模块架构摘要存入 docs/）

## Step 5：输出初始化报告

```
## ✅ 项目初始化完成

**项目类型**：[新项目 / 老项目-有文档 / 老项目-无文档]
**检测语言**：[Java / Vue / Python / C# / TypeScript]
**加载规范**：profiles/[语言].mdc

### 创建的目录和文件
- ✅ .ai-config/rules/01_tech_stack.mdc（已预填技术栈信息）
- ✅ docs/requirements/backlog/
- ✅ docs/requirements/done/
- ✅ docs/design/
- ✅ docs/test/
- ✅ docs/review/
- ✅ docs/delivery/

### 需要手动完成的配置
- [ ] 补充 .ai-config/rules/01_tech_stack.mdc 中的具体版本号
- [ ] [老项目] 确认已有模块列表是否准确

---

**下一步**：运行 `/intake` 开始接入第一个需求
```
