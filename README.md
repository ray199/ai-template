# AI编程规范模板

一套基于 Claude Code 的规范驱动开发工作流，覆盖**需求接入 → 技术设计 → 编码实现 → 测试审查 → 交付上线**的完整闭环。

核心思路：根据需求复杂度（S/M/L/XL）自动匹配输出物规格和审查严度，一句话需求和完整 PRD 都能处理。

---

## 工作流

```
原始需求（一句话 / 零散描述 / 完整PRD）
    ↓
【阶段1】需求接入
/pg:intake    需求结构化 + 工作量评估 + 伪需求扫描（一步完成）
           → 告知下一步：/pg:design（M/L/XL）或 /pg:code（S）
    ↓
【阶段2】设计+编码
/pg:design    技术设计（M/L/XL）→ docs/design/REQ-xxx-design.md
/pg:code      生成源代码 + DB迁移脚本 + 测试骨架
    ↓
【阶段3】测试+审查
/pg:check     测试用例设计 + 代码审查（一步完成）
           → 告知下一步：/pg:deliver（通过）或 重跑/pg:check（有问题）
    ↓
【阶段4】交付上线
/pg:deliver   上线前检查 + 文档归档 → docs/requirements/done/REQ-xxx/
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
/pg:init      /pg:intake    /pg:design    /pg:code    /pg:check    /pg:deliver
```


---

## 目录结构

```
.
├── .ai-config/              # AI 规范配置
│   ├── rules/               # 技术栈、代码规范、安全、Git 工作流等约束
│   ├── agents/              # 角色代理（架构师、后端开发、QA等）
│   └── skills/              # 各阶段详细执行技能
│
├── .claude/
│   └── commands/            # 项目级斜杠命令（/pg:init /pg:intake /pg:design /pg:code /pg:check /pg:deliver）
│
├── docs/                    # 所有阶段输出文档（由命令自动生成）
│   ├── requirements/        # 需求文档（backlog / done）
│   ├── design/              # 技术设计文档 + 编码完成报告
│   ├── test/                # 测试报告
│   ├── review/              # 审查报告
│   ├── delivery/            # 交付文档
│   └── prototype/           # 原型文件（/pg:intake 自动生成）
│
└── claude.md                # 完整规范（各阶段详细说明）
```

---

## 文档导航

| 文档 | 用途 |
|---|---|
| [claude.md](./claude.md) | 各阶段详细规范说明（完整版） |

---

## 版本

| 版本 | 日期 | 更新 |
|---|---|---|
| v4.0 | 2026-04-15 | Phase 8-10：前后端全链路覆盖、跨阶段校验、新项目骨架、首次上线清单 |
| v3.0 | 2026-04-14 | Phase 6-7：Trae 兼容入口、多语言规范、文档格式标准化 |
| v2.0 | 2026-04-06 | Phase 4-5：工作流完整文档、规范增强、原型自动生成 |
| v1.0 | 2026-03-20 | Phase 1-3：需求接入、变更跟踪、项目自动扫描 |
