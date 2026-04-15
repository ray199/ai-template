# AI编程工作流指南

覆盖 **需求接入 → 设计+编码 → 测试+审查 → 交付上线** 四个大阶段，5个核心命令。

---

## 整体流程图

```
原始需求（任意形式）
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  阶段1  需求接入                                     │
│  /intake → 结构化 + 工作量评估 + 伪需求扫描（一步）  │
│  输出：backlog/REQ-xxx.md + 明确下一步指令           │
└──────────────────────────┬──────────────────────────┘
                           │ AI 自动告知路径
          ┌────────────────┴──────────────────┐
          │ S 等级                             │ M / L / XL 等级
          ▼                                   ▼
┌─────────────────┐              ┌────────────────────────────────┐
│  阶段2  编码     │              │  阶段2  设计+编码               │
│  /code          │              │  /design → 技术设计文档         │
│  （跳过设计）    │              │  /code   → 源代码 + 迁移脚本    │
└────────┬────────┘              └───────────────┬────────────────┘
         │                                       │
         └──────────────────┬────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────┐
│  阶段3  测试+审查                                    │
│  /check → 测试用例设计 + 代码审查（一步）            │
│  输出：test报告 + review报告 + 明确下一步指令        │
└──────────────────────────┬──────────────────────────┘
                           │ AI 自动告知路径
          ┌────────────────┴──────────────────┐
          │ 无🔴问题                           │ 有🔴问题
          ▼                                   ▼
┌─────────────────┐              ┌────────────────────┐
│  阶段4  交付     │              │  修复后重跑 /check  │
│  /deliver       │              └────────────────────┘
└─────────────────┘
```

---

## 阶段1：需求接入

### 目标
将任意形式的原始需求转化为结构化文档，同步完成工作量评估和伪需求扫描，输出明确的下一步指令。用户只需运行一个命令。

### 命令 `/intake`

**输入**：原始需求（任意形式均可）
- T1 一句话："给用户加个角色权限"
- T2 零散描述："产品要做权限管理，Admin能配置菜单，deadline月底"
- T3 半结构化：部分填写的需求表格
- T4 完整PRD：标准产品需求文档

**自动执行步骤**：
```
Step 0A  项目上下文感知（自动）
         扫描项目目录 → 识别技术栈、历史需求、已有模块
Step 0B  输入质量识别（自动）
         T1 → 3个引导问题
         T2 → AI推断 + 最多3个澄清
         T3 → 自动补全 + 最多2个确认
         T4 → 直接结构化，无需问答
Step 1   需求结构化
         自动补全可推断字段（✅自动 / ⚠️推断 / ❓缺失）
         完整性检查：6个核心字段必须非空
         分配 need_id，保存至 docs/requirements/backlog/
Step 2   工作量联合评估
         业务维度5项 + 技术维度4项联合打分
         判定等级：S / M / L / XL
Step 3   伪需求扫描
         A 重复建设  B 价值存疑  C 逻辑冲突  D 技术可行性
         🔴 阻断 → 必须解决  🟡 警告 → 人工决定  🟢 通过
Step 4   输出物推荐（扫描通过后）
         是否需要 Spec / UI原型 / 迭代计划
```

**输出**：
- `docs/requirements/backlog/REQ-YYYYMMDD-XXX.md` 结构化需求文档 + 评估报告

**命令结束时 AI 明确告知**：
- S 等级 → 直接运行 `/code REQ-xxx`
- M/L/XL → 先运行 `/design REQ-xxx`
- 有 🔴 阻断项 → 解决后重新运行 `/intake`

---

### 工作量分级

评估同时给出 S/M/L/XL 等级，决定后续阶段深度：

| 等级 | 特征 | 工期 | 设计 | 审查方式 |
|---|---|---|---|---|
| **S** | 新增字段、简单改动、≤1个页面 | 1-2天 | 跳过 | AI自动 |
| **M** | 新增模块、2-4个页面、新表 | 3-5天 | 轻量版 | AI初检+人工确认 |
| **L** | 跨模块改造、5+页面、有技术风险 | 1-2周 | 完整版 | AI初检+人工终审 |
| **XL** | 整体重构、需拆分迭代 | 4周+ | 完整版+迭代计划 | 三级评审 |

---

## 阶段2：设计+编码

### 命令 `/design REQ-XXXXXXXX`（M/L/XL必需，S跳过）

**输入**：
- `docs/requirements/backlog/REQ-XXXXXXXX.md`（需求文档）

**执行步骤**：
```
Step 1  加载上下文
        读取需求文档、原型文件（docs/prototype/REQ-xxx*，若存在）
        全新项目：读 01_tech_stack.mdc（src/ 不存在时跳过代码扫描）
        已有项目：扫描 src/main/java/、src/、docs/db/、docs/api/
Step 2  架构影响分析
        全新项目：定义初始模块划分 + 输出"项目骨架规划"节（依赖清单/目录结构）
        已有项目：识别受影响模块和下游依赖
        确定是否引入新技术组件（Redis / MQ 等）
Step 3  数据库设计
        新增/修改表的DDL
        数据迁移脚本策略 + 回滚方案
Step 4  接口设计
        RESTful接口清单（URL / Method / 权限 / 请求响应 / 错误码）
Step 4.5 前端UI设计（若项目含前端）
        页面清单（路由 / 对应 view 文件）
        组件拆分（页面级 view + 可复用 component）
        状态管理规划（Pinia/Vuex Store vs 本地 ref）
        API调用层规划（每个页面调用哪些接口）
Step 5  关键实现路径
        核心流程前后端协作时序
        技术风险点及应对方案
Step 6  输出设计文档，列出待评审确认项
```

**输出**：
- `docs/design/REQ-XXXXXXXX-design.md`（含架构分析、DB设计、接口设计、实现路径）

---

### 命令 `/code REQ-XXXXXXXX`

**输入**：
- `docs/design/REQ-XXXXXXXX-design.md`（M/L/XL）
- 或直接读取需求文档（S等级）

**执行步骤**：
```
Step 0  版本上下文扫描 + 项目类型检测
        检测 JDK / Spring Boot / Vue 版本
        全新项目（pom.xml 和 src/ 均不存在）→ 先读设计文档"项目骨架规划"节，
        生成骨架文件（pom.xml / Application.java / application.yml / package.json 等），
        提示验证可启动后继续
Step 1  读取设计文档，拆解编码任务
Step 2  执行DB变更（优先）
        生成迁移脚本：src/main/resources/db/migration/Vyyyymmdd_nn__desc.sql
Step 3  逐层生成后端代码（自底向上）
        Mapper → Entity → Service（接口+实现）→ Controller → VO/DTO
Step 3.5 生成前端代码（若含前端）
        API调用层：src/api/xxx.js
        页面组件：src/views/xxx/（列表页 / 详情页）
        业务组件：src/components/xxx/（弹窗 / 表单）
        路由更新：src/router/index.js
        Store模块：src/stores/（仅需全局状态时）
Step 4  代码规范自检（后端 + 前端）
Step 5  生成测试骨架
        后端：src/test/java/.../XxxServiceImplTest.java
        前端：Hook 单元测试骨架（Vitest）
Step 6  输出编码完成报告
```

**输出**：
- 后端代码（Entity / Mapper / Service / Controller / VO）
- 前端代码（views / components / api / router，若含前端）
- `src/main/resources/db/migration/Vyyyymmdd_nn__desc.sql`（DB迁移脚本）
- 测试骨架（后端 JUnit + 前端 Vitest）
- `docs/design/REQ-XXXXXXXX-code-report.md`（前后端文件清单 + 规范自检结果）

---

## 阶段3：测试+审查

### 目标
对已完成编码的需求，依次执行测试用例设计和代码审查，给出明确的验收结论。用户只需运行一个命令。

### 命令 `/check REQ-XXXXXXXX`

**输入**：
- `docs/requirements/backlog/REQ-XXXXXXXX.md`（验收标准来源）
- `docs/design/REQ-XXXXXXXX-design.md`
- `docs/design/REQ-XXXXXXXX-code-report.md`
- 本次需求相关的所有代码文件

**第一部分：测试验证**
```
Step 1  读取验收标准（acceptance字段）→ 作为测试用例来源
Step 2  生成测试用例集
        正常路径 / 边界值 / 异常场景 / 权限场景 / 回归场景
Step 3  生成接口测试脚本（curl / Postman格式）
Step 4  记录问题（P0阻断 / P1严重 / P2一般 / P3建议）
Step 5  输出测试报告 → docs/test/REQ-XXXXXXXX-test.md
```

**第二部分：代码审查**
```
Step 6  读取 code-report 中的文件清单，逐一读取所有源代码文件（前端+后端）
Step 7  5维度审查
        ① 代码质量     命名/逻辑/规范/日志
        ② 架构合理性   模块划分/依赖关系；前端：组件拆分是否合理
        ③ 安全性       SQL注入/XSS/权限/敏感数据
        ④ 可维护性     注释/错误处理/测试覆盖
        ⑤ 业务完整性   覆盖所有验收标准；前端页面是否与原型对齐
        前端额外对照 vue-code-review-checklist.md
Step 8  标注：🔴 阻断性 / 🟡 警告性 / ✅ 赞扬点
Step 9  输出审查报告 → docs/review/REQ-XXXXXXXX-review.md
```

**输出**：
- `docs/test/REQ-XXXXXXXX-test.md`
- `docs/review/REQ-XXXXXXXX-review.md`

**命令结束时 AI 明确告知**：
- 无 🔴 阻断性问题 → 运行 `/deliver REQ-xxx`
- 有 🔴 阻断性问题 → 修复后重新运行 `/check REQ-xxx`

---

## 阶段4：交付上线

### 命令 `/deliver REQ-XXXXXXXX`

**输入**：
- 审查通过的代码（PR已合并）
- `docs/test/REQ-XXXXXXXX-test.md`（测试报告）
- `docs/review/REQ-XXXXXXXX-review.md`（代码审查报告）
- `docs/design/REQ-XXXXXXXX-design.md`（技术设计文档）

**执行步骤**：
```
Step 1  上线前检查清单（逐项确认）
        代码层面：PR已确认 / 所有🔴问题已关闭 / 构建通过
        数据库层面：迁移脚本已在测试环境验证 / 回滚脚本已准备
        配置层面：新增配置已同步至所有环境 / 无硬编码配置
        测试层面：验收结论✅通过 / P0/P1问题已关闭
        文档层面：API文档已更新 / 破坏性变更已通知调用方
Step 2  整理交付文档包
        归档需求文档、设计文档、测试报告、审查报告
Step 3  需求状态流转
        docs/requirements/backlog/ → docs/requirements/done/REQ-XXXXXXXX/
Step 4  输出交付报告
```

**输出**（两个，目的不同）：
- `docs/delivery/REQ-XXXXXXXX-delivery.md` — 运维快查报告（功能清单、回滚方案、遗留问题）
- `docs/requirements/done/REQ-XXXXXXXX/` — 需求生命周期归档，含：
  - `REQ-XXXXXXXX.md`（需求文档）
  - `REQ-XXXXXXXX-design.md`（技术设计文档）
  - `REQ-XXXXXXXX-code-report.md`（编码完成报告）
  - `REQ-XXXXXXXX-test.md`（测试报告）
  - `REQ-XXXXXXXX-review.md`（代码审查报告）
  - `REQ-XXXXXXXX-delivery.md`（交付说明）

---

## 命令速查

| 阶段 | 命令 | 主要输入 | 主要输出 | 下一步 |
|---|---|---|---|---|
| 准备 | `/init` | 项目根目录 | `.ai-config/` + `docs/` 目录结构 | `/intake` |
| 1 需求接入 | `/intake` | 原始需求（任意形式） | `backlog/REQ-xxx.md` + 评估报告 | AI 告知 |
| 2 设计+编码 | `/design REQ-xxx` | 需求文档（M/L/XL时） | `design/REQ-xxx-design.md` | `/code` |
| 2 设计+编码 | `/code REQ-xxx` | 设计文档（或需求文档） | 源代码 + 迁移脚本 + 测试骨架 | `/check` |
| 3 测试+审查 | `/check REQ-xxx` | 代码 + 需求 + 设计文档 | `test/` + `review/` 报告 | AI 告知 |
| 4 交付上线 | `/deliver REQ-xxx` | 全部输出物 | `delivery/` 报告 + `done/REQ-xxx/` 归档 | 完成 |

---

## 输出物目录

```
docs/
├── requirements/
│   ├── backlog/
│   │   └── REQ-xxx.md              ← /intake 输出（待开发）
│   └── done/
│       └── REQ-xxx/                ← /deliver 归档（完整生命周期）
│           ├── REQ-xxx.md
│           ├── REQ-xxx-design.md
│           ├── REQ-xxx-code-report.md
│           ├── REQ-xxx-test.md
│           ├── REQ-xxx-review.md
│           └── REQ-xxx-delivery.md
├── design/
│   ├── REQ-xxx-design.md           ← /design 输出
│   └── REQ-xxx-code-report.md      ← /code 输出
├── test/
│   └── REQ-xxx-test.md             ← /check 输出
├── review/
│   └── REQ-xxx-review.md           ← /check 输出
├── delivery/
│   └── REQ-xxx-delivery.md         ← /deliver 输出
└── prototype/
    └── REQ-xxx.html                ← /intake 自动生成（若需要）
```

---

## 参考文档

| 文档 | 说明 |
|---|---|
| `CLAUDE.md` | 各阶段完整规范说明（4万字） |
| `.ai-config/rules/01_tech_stack.mdc` | 技术栈约束 |
| `.ai-config/rules/02_code_style.mdc` | 代码规范 |
| `.ai-config/rules/03_security.mdc` | 安全规范 |
| `.ai-config/skills/*/SKILL.md` | 各命令的详细执行逻辑 |
