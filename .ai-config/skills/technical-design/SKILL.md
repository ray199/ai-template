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

### Step 0 · 前置物全集（设计前必读）

| # | 文件 | 必读条件 | 在设计中的作用 |
|---|---|---|---|
| 1 | `docs/requirements/backlog/REQ-XXXXXXXX.md` | 总是必读 | What + Why + acceptance + scope + tech_sketch |
| 2 | `docs/requirements/backlog/REQ-XXXXXXXX-prd.md` | 若存在必读 | PRD 可读版的用户故事 + 主流程 |
| 3 | `docs/prototype/REQ-XXXXXXXX.{html,wireframe.md,figma}` | 若存在必读 | 决定接口入参出参 + UI 规划 |
| 4 | `docs/_exploration/EXPLORE-*.md`（status: graduated 关联本 REQ） | 若存在必读 | 候选方案对比 + 已知坑 + 待答问题 |
| 5 | `docs/_context/project-map.md` | 老项目必读 | 模块 / 表 / 接口 / **不可变约束** / 项目原则 / 视觉基线 |

⚠️ 必读项缺失或为空 → 必须先告诉用户缺什么，让用户补全或显式跳过；不得边设计边猜。

### 项目结构 / 历史扫描（辅助）

| 扫描目标 | 目的 | 适用场景 |
|---|---|---|
| `.ai-config/rules/01_tech_stack.mdc` | 基础技术栈约定 | 所有项目（全新项目必读） |
| `src/main/java/` 目录结构 | 现有后端模块划分 | 已有项目 |
| `src/` 或 `frontend/src/` | 现有前端页面和组件 | 已有项目 |
| `docs/db/` 或 MCP schema 工具 | 避免重复建表 | 已有项目 |
| `docs/api/` | 接口命名和版本一致 | 已有项目 |
| `docs/requirements/done/` | 历史功能依赖 | 已有项目 |

> ⚠️ **已有项目**：扫描结果必须引用来源，不允许凭空推断现有代码结构。
> ✅ **全新项目**：基于 `01_tech_stack.mdc` 和需求文档定义初始结构，标注"全新项目"。

### 前置物 → 设计输出的映射

| 前置物字段 | 映射到 design 的哪一节 |
|---|---|
| requirement.acceptance | "六、任务拆解"的"验收对应"列（每条 A 至少 1 个 T 覆盖） |
| prototype 页面清单 | "四、前端 UI 设计" |
| prototype 表单字段 / 表格列 | "三、接口设计"入参出参 |
| PRD 用户故事 / 主流程 | "五、关键实现路径"主流程时序 |
| exploration 候选方案 | "一、架构影响分析"中"技术组件决策" |
| exploration 已知坑 | "五、关键实现路径"中"技术风险点" |
| project-map 模块清单 | "受影响模块"表（必须只填已有模块名，不能创造） |
| project-map 不可变约束 / 项目原则 | 整体不得违反 |
| project-map 视觉基线 | "四、前端 UI 设计"必须沿用现有视觉 |

---

## 子文件索引（lazy-load）

| 子文件 | 用于 | 何时加载 |
|---|---|---|
| `references/db-design-rules.md` | Step 3 数据库设计：建表规则、迁移策略、表结构示例 | Step 3 时读 |
| `references/api-design-rules.md` | Step 4 接口设计：URL 规则、请求响应、错误码、鉴权 | Step 4 时读 |
| `references/task-breakdown-methodology.md` | Step 5.5 任务拆解：6 标准、估时、3 模式、5 反模式、重构专项 | L/XL 必读，M 建议 |
| `templates/design-doc-template.md` | Step 6 输出：完整设计文档模板（一到七节） | Step 6 时读 |

---

## 关键约束（schema 强制 + 写盘前自检 + 写盘后修复循环）

### 写盘前必查清单（强制门——不通过就不要写盘）

design.md 必须严格按以下结构输出。**少一节都会被 schema 阻断**：

- 含 `# 技术设计文档` H1 标题
- 含 `## 一、架构影响分析` ~ `## 五、关键实现路径` + `## 七、待评审确认项`
- **【老项目（`docs/_context/project-map.md` 存在）】必含 `## 现状基线`** ⚠️ schema 强制
- **【L / XL】必含 `## 任务拆解`**（表头：ID / 任务 / 依赖 / 验收对应 / 预估 / 备注；至少 1 行 `T<数字>`）⚠️ schema 强制
- **【重构 / 迁移类需求】**任务表后追加"迁移顺序"段 + "回滚边界"段
- front-matter：`need_id` / `stage: design` / `status: draft|approved`；老项目 `invariants_respected: true`

完整模板见 `templates/design-doc-template.md`——**直接照搬七节结构填内容，不要自己创造章节顺序**。

### 写盘后自检 + 修复循环

```
1. 写盘后立即跑：node .ai-config/scripts/validate-doc.js design REQ-xxx
2. 退出码 0 → ✅ 完成，告知用户进入 /pg:code
3. 退出码非 0 → 按报错提示自动补章节后重写 design.md，重试最多 3 次
4. 重试 3 次仍失败 → 停止，把错误信息原样告诉用户人工介入
```

⚠️ **不允许把 schema 失败丢给用户处理**——这是 AI 自己写出来的产物，自己自检 / 修复才合理。
⚠️ **不允许在 schema 失败时直接告诉用户"进入下一步"**——会破坏 git pre-commit hook 的强制门。

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
