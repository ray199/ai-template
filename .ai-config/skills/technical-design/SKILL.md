# 技能：技术设计

## 技能描述

在需求评估和输出物确认完成后，由架构师代理主导执行技术设计。
产出可供开发直接落地的设计文档，覆盖架构、数据库、接口、关键实现路径、任务拆解五个维度。

## 触发指令

- `/pg:design` - 对指定需求启动完整技术设计
- `/pg:design --db` - 仅输出数据库设计
- `/pg:design --api` - 仅输出接口设计
- `/pg:design --check` - 检查设计文档完整性（不生成新内容）

## 处理流程

```
输入：approved 的需求文档（/pg:intake 输出）+ 原型文件（若存在）
       ↓
[Step 1] 加载上下文并校验输入
         必须存在：docs/requirements/backlog/REQ-XXXXXXXX.md
         可选读取：docs/prototype/REQ-XXXXXXXX.html / -wireframe.md
         项目类型分支：
         ├─ 全新项目：跳过代码扫描，读 .ai-config/rules/01_tech_stack.mdc 定基础约定
         └─ 已有项目：扫 src/ + docs/db/ + docs/api/ + docs/requirements/done/
       ↓
[Step 2] 架构影响分析
         判断变更类型（全新 / 新增模块 / 改造 / 跨模块）
         识别受影响前后端模块
         全新项目：必须输出"项目骨架规划"节供 /pg:code 使用
         决定是否引入新组件（缓存、MQ 等）
       ↓
[Step 3] 数据库设计    详见 references/db-design-rules.md
       ↓
[Step 4] 接口设计     详见 references/api-design-rules.md
       ↓
[Step 4.5] 前端 UI 设计（若含前端）
         页面清单 + 组件树 + 状态管理 + API 调用层
       ↓
[Step 5] 关键实现路径
         核心流程时序、并发场景、技术风险点
       ↓
[Step 5.5] 任务拆解（L/XL 强制；M 建议）
         详见 references/task-breakdown-methodology.md
         重构类需求额外列"迁移顺序"和"回滚边界"
       ↓
[Step 6] 输出设计文档    模板见 templates/design-doc-template.md
         等待团队确认
```

---

## 上下文扫描规则

| 扫描目标 | 目的 | 适用场景 |
|---|---|---|
| `docs/requirements/backlog/REQ-XXXXXXXX.md` | 需求来源（必读） | 所有项目 |
| `docs/prototype/REQ-XXXXXXXX*` | 原型/截图描述（若存在必读） | 所有项目 |
| `.ai-config/rules/01_tech_stack.mdc` | 基础技术栈约定 | 所有项目（全新项目必读） |
| `src/main/java/` 目录结构 | 现有后端模块划分 | 已有项目 |
| `src/` 或 `frontend/src/` | 现有前端页面和组件 | 已有项目 |
| `docs/db/` 或 MCP schema 工具 | 避免重复建表 | 已有项目 |
| `docs/api/` | 接口命名和版本一致 | 已有项目 |
| `docs/requirements/done/` | 历史功能依赖 | 已有项目 |

> ⚠️ **已有项目**：扫描结果必须引用来源，不允许凭空推断现有代码结构。
> ✅ **全新项目**：基于 `01_tech_stack.mdc` 和需求文档定义初始结构，标注"全新项目"。

---

## 子文件索引（lazy-load）

| 子文件 | 用于 | 何时加载 |
|---|---|---|
| `references/db-design-rules.md` | Step 3 数据库设计：建表规则、迁移策略、表结构示例 | Step 3 时读 |
| `references/api-design-rules.md` | Step 4 接口设计：URL 规则、请求响应、错误码、鉴权 | Step 4 时读 |
| `references/task-breakdown-methodology.md` | Step 5.5 任务拆解：6 标准、估时、3 模式、5 反模式、重构专项 | L/XL 必读，M 建议 |
| `templates/design-doc-template.md` | Step 6 输出：完整设计文档模板（一到七节） | Step 6 时读 |

---

## 关键约束（schema 强制）

1. **老项目正文必须有 `## 现状基线`** —— schema 检查章节存在
2. **L / XL 必须有 `## 任务拆解`** —— schema 检查章节存在 + 表头列名（ID / 任务 / 依赖 / 验收 / 预估）+ 至少一行 `T<数字>` 任务
3. **front-matter 必填**：`need_id` / `stage: design` / `status: draft|approved`
4. **老项目 `invariants_respected: true`**
5. **重构类需求**：任务表后追加"迁移顺序" + "回滚边界"段（schema 暂不强制，但评审项必查）

---

## 文档存放规范

- 路径：`docs/design/REQ-XXXXXXXX-design.md`
- 版本管理：每次修订追加版本号（v1.0 → v1.1），保留修订说明
- 归档：需求完成后随 `/pg:deliver` 移入 `docs/requirements/done/REQ-XXXXXXXX/`

---

## 与其他阶段的衔接

```
/pg:intake ──▶ requirement.md（acceptance A1-A4）
                  ↓
              本技能（设计）
                  ↓
/pg:design ──▶ design.md（任务表 T1-T6 引用 A1-A4）
                  ↓
/pg:code ──▶ 按 T1-T6 顺序执行
```

- 上游：requirement.md 的 acceptance 编号被任务表引用
- 下游：design.md 的任务表是 /pg:code 的执行序列源
