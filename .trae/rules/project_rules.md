# 项目工作流规则（Trae 适配层）

> **事实源**：`.ai-config/workflow.md`。本文件只做触发映射和薄引用。
> 修改契约一律改 workflow.md，不要改本文件里的业务规则。

Trae 不支持斜杠命令占位符（`$ARGUMENTS`），所以用户的自然语言触发 + AI 按本规则路由到对应阶段。

---

## 触发词识别

用户说下列任一短语时，AI 按对应阶段执行。**Trae 端支持双触发**：标准前缀 `/pg:xxx`（与 Claude Code 一致）或简写 `/xxx`（无前缀）都能识别。

| 用户可能说 | 对应阶段 | 契约章节 |
|---|---|---|
| `/pg:init` 或 `/init` / "初始化项目" / "接入老项目" | init | `.ai-config/workflow.md` §2.1 |
| `/pg:explore <想法>` 或 `/explore` / "我想做 xxx 但没想清楚" | explore | §2.0 |
| `/pg:intake <内容>` 或 `/intake` / "接入这个需求：..." | intake | §2.2 |
| `/pg:design <REQ-id>` 或 `/design` / "给 REQ-xxx 做技术设计" | design | §2.3 |
| `/pg:code <REQ-id>` 或 `/code` / "实现 REQ-xxx" | code | §2.4 |
| `/pg:check <REQ-id>` 或 `/check` / "测试并审查" | check | §2.5 |
| `/pg:deliver <REQ-id>` 或 `/deliver` / "交付上线" | deliver | §2.6 |
| `/pg:prototype <REQ-id>` 或 `/prototype` / "生成原型" | prototype | §2.7 |

**识别失败或 REQ-id 缺失**：反问用户，不得猜测。

**和 Claude Code 的差异**：Claude Code 严格 `/pg:xxx`（命名空间），Trae 因为不强制斜杠语法，所以双识别更友好。建议团队逐渐统一使用 `/pg:xxx` 格式以保持跨平台一致。

---

## 阶段执行要点（每阶段必做动作）

### /pg:explore（可选，pre-intake）
- 参考：`.ai-config/skills/idea-exploration/SKILL.md`
- 适用：用户想法模糊，连 /pg:intake 三个基础问题（目标 / 时间 / 不做什么）都答不清楚
- 5 步：问题框定 → 维度拆解 → 候选方案 → 边界扫坑 → 未知识别（可中途停止）
- 产出：`docs/_exploration/EXPLORE-YYYYMMDD-<slug>.md`
- **不分配 need_id，不进 backlog，不走 schema 校验**
- 下一步：想清楚了 → /pg:intake / 要验证 → POC / 不做 → 归档 dropped/

### /pg:init
- 参考：`.ai-config/skills/init/SKILL.md`
- 自动检测新 / 老项目、技术栈（java / python / dotnet / node+vue / react / go / typescript）
- 老项目必须生成 `docs/_context/project-map.md`，`invariants` 段非空
- 后置校验：目录完整 + `validate-doc.js project-map`（老项目）

### /pg:intake
- 参考：`.ai-config/skills/intake-requirement/SKILL.md`、`workload-evaluation.md`、`pseudo_checklist.md`
- **Step 0 优先：扫 `docs/_exploration/`**，若有未归档草稿先列出来让用户选是否引用为 background 输入；引用则状态改为 `graduated`
- **草稿预览**：Step 1 字段填好后、写盘前必须先把结构化结果展示给用户，等用户确认或调整后才落盘
- **Step 4 强制中断点 · 按等级逐项询问**：按 workload 动态展示清单：
  - **M/L/XL 可选**（S 级不展示）：**PRD 可读版**（叙事性人话版给业务方/老板看，从 requirement.md 自动转写，不走 schema 校验，路径 `docs/requirements/backlog/REQ-xxx-prd.md`，模板见 `intake-requirement/templates/prd-readable.md`）
  - 所有等级可选：**UI 原型**（XL 必须）→ 选 Y 衔接 /pg:prototype
  - **必填字段草稿审核**（M+: tech_sketch；L+: + stakeholders/non_functional/risks；XL+: + iteration_plan/milestones）→ 用户回 [Y/调整]，不允许 N
  - AI 必须**停下等用户逐项回复**
- 产出：`docs/requirements/backlog/REQ-YYYYMMDD-XXX.md`（front-matter 按 workflow.md §3.1）
- **并行冲突软提示**：若填写了 `affects_modules`，扫描 backlog 其他在制品需求的同字段，有交集就打印警告（不阻断）
- 后置校验（强制）：`node .ai-config/scripts/validate-doc.js requirement <REQ-id>`
- 路由：XS/S → /pg:code；M/L/XL → /pg:design；伪需求 🔴 → 修复后重跑

### /pg:design
- 前置：backlog 文档存在，`workload ∈ {M, L, XL}`
- 参考：`.ai-config/skills/technical-design/SKILL.md`
- **老项目强制 `## 现状基线` 章节**（schema 会校验存在性）：
  ```markdown
  ## 现状基线
  - 涉及模块：<...>
  - 现有行为（改动前）：<...>
  - 已知坑 / 历史包袱：<...>
  - 本次保留 vs 重写：<...>
  ```
- 老项目必须读 `docs/_context/project-map.md` 并遵守 `invariants` 和（可选的）`项目原则`
- **L / XL 强制 `## 任务拆解` 章节**（M 建议；schema 会校验存在性 + 表头）：
  ```markdown
  ## 任务拆解
  | ID | 任务 | 依赖 | 验收对应 | 预估 | 备注 |
  |---|---|---|---|---|---|
  | T1 | <任务> | — | A1 | 0.5d | |
  | T2 | <任务> | T1 | A1, A2 | 1d | |

  **关键路径**：T1 → T2 → ...
  **并行机会**：<...>
  ```
  - 每行任务 ID 必须 `T<数字>`
  - 必须有"验收对应"列，引用 requirement.md 中的 acceptance 编号（A1/A2...）
  - 至少 1 行任务
- **重构 / 迁移类需求**：任务表后必须加"迁移顺序"和"回滚边界"段
- 后置校验：`node .ai-config/scripts/validate-doc.js design <REQ-id>`

### /pg:code
- 前置：backlog 存在；M/L/XL 需 design 存在
- 参考：`.ai-config/skills/coding-impl/SKILL.md`
- 代码规范：
  - 通用：`.ai-config/rules/02_code_style.mdc`
  - 安全：`.ai-config/rules/03_security.mdc`
  - 语言专项（自动按技术栈选）：`.ai-config/rules/profiles/{java_spring, python, dotnet_csharp, node_vue, react, go, typescript}.mdc`
  - 中间件（按需）：`.ai-config/rules/middleware/{redis, rocketmq, auth, logging, api-client, ai-llm}.md`
  - 审查清单：`.ai-config/skills/code-review/{java, vue, dotnet, python}-code-review-checklist.md`
- 老项目必须沿用原包结构，禁止改动 `invariants` 声明的部分
- 后置校验（M/L/XL）：`node .ai-config/scripts/validate-doc.js code-report <REQ-id>`
- XS/S 跳过 code-report，commit 走 `.ai-config/scripts/git-hooks/commit-msg`

### /pg:check
- 前置：backlog 存在；M/L/XL 需 code-report 存在
- 参考：`.ai-config/skills/testing/SKILL.md`、`code-review/SKILL.md`、`code-review/checklists.md`
- 分级产出：
  - **XS/S**：curl 测试片段 + 5 维度 review 清单，结论写 PR 描述，不生成独立 md
  - **M**：`docs/test/<REQ>-test.md` + `docs/review/<REQ>-review.md`
  - **L/XL**：同 M，额外并发 / 性能测试
- 后置校验（M/L/XL 强制）：`node .ai-config/scripts/validate-doc.js check <REQ-id>`
- 有 🔴 blocker → 修复后重跑，不得进入 /pg:deliver

### /pg:deliver
- 前置：test + review 的 `conclusion: pass` 且 `blockers: 0`
- 参考：`.ai-config/skills/delivery/SKILL.md`
- 归档：`docs/requirements/backlog/<REQ>.md` → `docs/requirements/done/<REQ>/`
- 后置校验（强制）：`node .ai-config/scripts/validate-doc.js delivery <REQ-id>`
- **收尾两问（不阻断）**：
  1. 是否有新的不变量 / 技术债 / 架构决策要沉淀到 `project-map.md` 的 `## 追加记录`（带 REQ 号 + 日期）
  2. 本次 review 是否有可沉淀到 `.ai-config/rules/` 的反模式，有则写一条到 `docs/_changelog/rules-candidates.md`
- 用户答"无"就跳过

### /pg:prototype
- 前置：backlog 存在
- 参考：`.ai-config/skills/prototype-generation/SKILL.md`、`references/style-selection.md`、`html-prototype-generator.md`；制造业用 `redoe-prototype-style/SKILL.md`
- **Step 0 · 视觉基线扫描**（强制中断点）：扫 `docs/prototype/*.html` + `src/`（package.json/SCSS/tailwind/现有组件）+ project-map 的不可变约束 / 项目原则，提取现有视觉基线
- 分流：命中基线 → 默认沿用为方案 A（5 选 1 降为备选）；仅命中 UI 库 → 用 UI 库默认主题；完全无基线 → 走 5 选 1
- 必须**停下等用户确认风格选择**后才生成。沿用基线模式导入项目 design token，避免视觉漂移
- 输出：`docs/prototype/<REQ>.html` 或 `-wireframe.md`

---

## 通用硬规则（所有阶段共享）

1. **产出物文件名**：严格按 workflow.md §3 约定，文件名里的 REQ-id 必须匹配 `^REQ-\d{8}-\d{3}$`
2. **后置校验退出码非 0**：不得告知用户进入下一阶段，必须先修产出物再重跑
3. **XS 级不走 /pg:intake**：直接 git commit `XS: <描述>` 交 commit-msg hook 把关
4. **老项目识别**：`docs/_context/project-map.md` 存在即判为老项目，后续阶段触发对应强制约束
5. **规则红线**：安全（`03_security.mdc`）和通用代码风格（`02_code_style.mdc`）始终适用，禁止以"用户没要求"为由绕开

---

## 与 Claude Code / Cursor 的关系

本文件与 `.claude/commands/pg/` 里的 8 份命令文件是**同一契约的不同平台适配**。事实源永远是 `.ai-config/workflow.md` + `validate-doc.js`，任何工作流变更只改这两者，本文件被动同步。
