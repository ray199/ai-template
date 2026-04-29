---
name: design
description: 技术设计 - 架构影响、DB、接口、前端 UI 设计、L/XL 任务拆解
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.3 节（/pg:design）** 的契约执行。

需求ID：$ARGUMENTS

---

## ⚠️ 输出 design.md 前必查清单（强制门——不通过就不要写盘）

design.md 必须严格按以下结构输出。**少一节都会被 schema 校验阻断**。在写盘前**主动跑一遍**这个清单：

- [ ] 含 `# 技术设计文档` H1 标题
- [ ] 含 `## 一、架构影响分析`
- [ ] 含 `## 二、数据库设计`
- [ ] 含 `## 三、接口设计`
- [ ] 含 `## 四、前端 UI 设计`（若涉及前端，老项目沿用 project-map 的视觉基线）
- [ ] 含 `## 五、关键实现路径`
- [ ] **【老项目（`docs/_context/project-map.md` 存在）】必含 `## 现状基线`** ⚠️ schema 强制
- [ ] **【workload ∈ {L, XL}】必含 `## 任务拆解`**（表头：ID / 任务 / 依赖 / 验收对应 / 预估 / 备注；至少 1 行 `T<数字>`）⚠️ schema 强制
- [ ] **【重构 / 迁移类需求】**任务拆解后必须追加"迁移顺序"段 + "回滚边界"段
- [ ] 含 `## 七、待评审确认项`
- [ ] front-matter 含 `need_id` / `stage: design` / `status: draft|approved`；老项目 `invariants_respected: true`

完整模板见 `@.ai-config/skills/technical-design/templates/design-doc-template.md`——直接照搬七节结构填内容，不要自己创造章节顺序。

---

**执行规范参考**：@.ai-config/skills/technical-design/SKILL.md

**前置校验（缺一终止）**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在
- 该需求 `workload` ∈ {M, L, XL}（XS/S 级不需要设计）

---

## Step 0 · 前置物全集扫描（必做，按顺序读全）

设计前必须读完以下来源，缺哪份会让设计漂移到错的方向：

| # | 文件 | 是否必读 | 设计中的作用 |
|---|---|---|---|
| 1 | `docs/requirements/backlog/$ARGUMENTS.md`（需求文档） | ✅ 必读 | What + Why + acceptance + scope；M+ 的 tech_sketch 字段是设计骨架的初版 |
| 2 | `docs/requirements/backlog/$ARGUMENTS-prd.md`（PRD 可读版） | ⚠️ 若存在必读 | 业务方表述的"用户故事 / 主流程"，设计的接口 + 状态机要能讲通这套流程 |
| 3 | `docs/prototype/$ARGUMENTS.html` / `-wireframe.md`（原型） | ⚠️ 若存在必读 | 直接决定接口设计（页面字段 / 表格列 / 表单项 → 接口入参出参）和 UI 规划 |
| 4 | `docs/_exploration/EXPLORE-*.md`（探索笔记，如有 graduated 关联本 REQ） | ⚠️ 若存在必读 | "候选方案对比 / 已知的坑 / 待答问题"——设计要承接探索阶段的决策，不能重新摸索 |
| 5 | `docs/_context/project-map.md`（老项目上下文） | ✅ 老项目必读 | 模块清单 / 表清单 / 接口清单 / **不可变约束** / 项目原则 / 视觉基线 |
| 6 | `docs/_context/skill-registry.md`（项目可用 skill 清单） | 若存在必读 | 决定额外加载哪些脚手架 / 领域 / 工具 skill
| 6 | `docs/_context/constitution.md`（已合并到 project-map，跳过） | — | 已弃用 |

⚠️ **必读项缺失或为空时不得开始设计**——先告诉用户缺什么，让用户决定补全或显式跳过。

---

### 多 REQ 隔离规则（防漏读 / 多读 / 错读）

⚠️ AI 在读前置物时必须**严格按 REQ-id 匹配**，不得借用其他 REQ 的产出物：

| 项 | 规则 |
|---|---|
| `requirement.md` | 只读 `backlog/$ARGUMENTS.md`；找不到时退到 `done/$ARGUMENTS/$ARGUMENTS.md`（归档场景） |
| `prd.md` / `prototype` | 只读 `$ARGUMENTS-prd.md` / `$ARGUMENTS.html` 这种文件名精确匹配的 |
| `EXPLORE-*.md` | **只读 `graduated_to == $ARGUMENTS` 的笔记**——其他 REQ 的探索笔记不读 |
| 老笔记无 `graduated_to` 字段 | 主动问用户"是否本 REQ 的来源？"用户确认后再回写字段并引用 |
| 其他 REQ 的 `design.md` / `code-report.md` | **禁止引用**（除非用户显式说"参考 REQ-yyy"），避免设计抄来抄去 |
| `done/` 历史 REQ 产出物 | 只在用户显式提及时读；否则不读，避免噪声 |

漏 / 多读告警：
- 必读项缺失（requirement.md）→ 阻断
- 若存在必读项缺失（prd / prototype / exploration）→ 软告警 "项目里有 N 份 graduated 笔记但都不属于本 REQ；如果本 REQ 走过 /pg:explore 但没绑定，请确认"
- 探索笔记缺 `graduated_to` → 主动问 → 回写字段

---

**老项目现状基线（强制章节）**：

若 `docs/_context/project-map.md` 存在 → 设计文档正文必须包含 `## 现状基线` 章节，列出：涉及模块 / 现有行为 / 已知坑 / 本次保留 vs 重写。

**任务拆解（L / XL 强制；M 建议）**：

L / XL 级 design 必须包含 `## 任务拆解` 章节（schema 校验）。每行 ID 必须 `T<数字>` 形式，"验收对应"列引用 requirement.md 中的 acceptance 编号（A1/A2...），至少 1 行任务。

详细模板见 `.ai-config/skills/technical-design/templates/design-doc-template.md`。

**重构 / 迁移类需求**：任务表后追加"迁移顺序"段（每步标注是否可独立合并）和"回滚边界"段。

---

**前置物→设计输出的映射**（指导 AI 怎么用读到的内容）：

- requirement.acceptance ↔ design.task 表的"验收对应"列（每条 A 至少 1 个 T 覆盖）
- prototype 页面清单 ↔ design 的"四、前端 UI 设计"
- prototype 表单字段 / 表格列 ↔ design 的"三、接口设计"入参出参
- PRD 用户故事 ↔ design 的"五、关键实现路径"主流程
- exploration 候选方案 ↔ design 的"一、架构影响分析"中"技术组件决策"
- exploration 已知坑 ↔ design 的"五、关键实现路径"中"技术风险点"
- project-map 模块清单 ↔ design 的"受影响模块"表（必须只填已有模块名，不能创造）
- project-map 不可变约束 / 项目原则 ↔ design 整体不得违反
- project-map 视觉基线 ↔ design 的"四、前端 UI 设计"必须沿用现有视觉

---

**输出后自检 + 修复循环（在告知用户"完成"之前必做）**：

```
1. 写盘后立即跑：node .ai-config/scripts/validate-doc.js design $ARGUMENTS
2. 退出码 0 → ✅ 完成，告诉用户进入下一步 /pg:code
3. 退出码非 0 → 读取报错，按提示补全缺失章节后重写 design.md，再跑一遍
4. 重试 3 次仍失败 → 停止，把错误信息原样告诉用户让人工介入
```

⚠️ **不允许把 schema 失败丢给用户处理**——这是 AI 自己写出来的产物，自己自检 / 修复才合理。
⚠️ **不允许在 schema 失败时直接告诉用户"进入下一步"**——会破坏 git pre-commit hook 的强制门约束。

**下一步**：`/pg:code $ARGUMENTS`（仅当上面的自检 ✅ 之后）
