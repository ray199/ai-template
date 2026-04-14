---
name: init
description: 项目初始化 - 检测项目语言和现状，创建 .ai-config/ 规范目录和 docs/ 文档目录结构，适用于新项目首次接入和老项目补充规范
argument-hint: [可选: new | existing | 语言名如 java/vue/python/dotnet]
---

# 技能：项目初始化

检测项目语言和现状，创建规范目录和文档目录结构。新项目和老项目均适用。

可选参数：$ARGUMENTS（不填则自动检测）

## 处理流程

```
[Step 1] 检测项目现状
         ├─ 语言检测（按优先级）
         │    pom.xml / build.gradle         → Java
         │    package.json（含 vue 依赖）    → Vue/Node
         │    requirements.txt / pyproject.toml → Python
         │    *.csproj / *.sln              → C#/.NET
         │    tsconfig.json（无 package.json）→ 纯 TypeScript
         │    未识别                         → 询问用户
         │
         ├─ 规范成熟度检测
         │    有 .ai-config/ → 已初始化，仅补全缺失部分
         │    无 .ai-config/ → 需完整初始化
         │
         └─ 文档现状检测
              有 docs/       → 检查子目录是否完整
              有 src/ 无 docs/ → 老项目无文档（见下方特殊处理）
              两者都没有     → 全新项目
         ↓
[Step 2] 初始化规范目录（.ai-config/ 不存在或不完整时）
         创建目录结构（已存在的不覆盖）：
         .ai-config/rules/01_tech_stack.mdc  ← 根据检测语言预填技术栈
         .ai-config/rules/profiles/[语言].mdc ← 复制对应规范 Profile
         ↓
[Step 3] 初始化文档目录结构
         创建以下目录（已存在的不覆盖）：
         docs/requirements/backlog/   ← /ai:intake 输出位置
         docs/requirements/done/      ← /ai:deliver 归档位置
         docs/design/                 ← /ai:design 输出位置
         docs/test/                   ← /ai:check 输出位置
         docs/review/                 ← /ai:check 输出位置
         docs/delivery/               ← /ai:deliver 输出位置
         ↓
[Step 4] 老项目特殊处理（有 src/ 但无 docs/）
         1. 扫描 src/ 一级目录，列出已有模块
         2. 输出警告提示：
            ⚠️ 检测到已有代码模块：[模块列表]
            已创建 docs/ 目录结构，无需补历史文档，直接 /ai:intake 开始
         3. 不阻断流程
         ↓
[Step 5] 输出初始化报告
```

## 输出格式

```
## ✅ 项目初始化完成

**项目类型**：[新项目 / 老项目-有文档 / 老项目-无文档]
**检测语言**：[Java / Vue / Python / C# / TypeScript]
**加载规范**：profiles/[语言].mdc

### 创建的目录和文件
- ✅ docs/requirements/backlog/
- ✅ docs/requirements/done/
- ✅ docs/design/
- ✅ docs/test/
- ✅ docs/review/
- ✅ docs/delivery/
- ✅ .ai-config/rules/01_tech_stack.mdc（已预填技术栈信息）

### 需要手动完成的配置
- [ ] 补充 .ai-config/rules/01_tech_stack.mdc 中的具体版本号（若自动读取不完整）

---

**下一步**：运行 `/ai:intake` 开始接入第一个需求
```
