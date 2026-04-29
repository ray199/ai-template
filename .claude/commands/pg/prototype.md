---
name: prototype
description: 按需手动生成原型（HTML / Figma / 线框图）+ 老项目基线参照
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.7 节（/pg:prototype）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：
- @.ai-config/skills/prototype-generation/SKILL.md
- @.ai-config/skills/prototype-generation/references/style-selection.md
- @.ai-config/skills/prototype-generation/templates/baseline-snapshot.md
- @.ai-config/skills/prototype-generation/html-prototype-generator.md
- 制造业专用：@.ai-config/skills/redoe-prototype-style/SKILL.md

**前置校验**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在

---

## Step 0 · 视觉基线扫描（HTML 原型必做，强制中断点）

⚠️ 优先级 1：读 `docs/_context/project-map.md` 的 `## 视觉基线` 段（/pg:init 老项目分支已扫描记录）→ 直接采用
⚠️ 优先级 2：项目无该段 → 即时扫 `docs/prototype/*.html` + `src/`（package.json/SCSS/tailwind/现有组件）+ project-map 的不可变约束 / 项目原则；扫描后建议回写到 `## 视觉基线` 段

分流：
- 命中基线 → 模式 A 沿用基线（默认）
- 仅命中 UI 库 → 模式 B 用 UI 库默认主题
- 完全无基线 → 模式 C 走 5 选 1 风格库

---

## Step 0.5 · 基线参照检查（老项目专属，强制中断点）

⚠️ **仅当 docs/_context/project-map.md 存在时执行**（即老项目场景）。

**目的**：让业务方看到"改动前 vs 改动后"对比，而不只是"目标态"。

**流程**：

1. 解析当前 REQ 涉及的页面：
   - 优先读 `docs/design/$ARGUMENTS-design.md` 的"页面清单"段（M+ 等级有此段）
   - 否则从 `requirement.md` 的 acceptance / scope 推断
2. 对每个涉及页面，检查 `docs/prototype/baseline/<page-name>.html`：
   - **已存在** → 直接采用为"改动前"参照
   - **不存在** → 主动询问用户：
     ```
     📐 涉及页面 [UserList, UserDetail]，没有基线快照。
        是否现在从代码反推基线（推荐：业务方可看到改前 vs 改后对比）？
        [Y] 反推（5-10 分钟，扫描 src/views/UserList.vue 等转 HTML）
        [N] 跳过（默认；新原型仅展示目标态，不带对比）
     ```
3. 选 Y → 按 `templates/baseline-snapshot.md` 规则反推：
   - 扫 `src/views/<page>.vue` 的 `<template>` 部分
   - 用项目 UI 库的实际类名（el-* / a-* / van-*）
   - 表格列 / 表单字段从 v-model + props 推断
   - mock 数据填充
   - 落盘 `docs/prototype/baseline/<page>.html`
   - 同步更新 `docs/prototype/baseline/README.md` 记录"哪些页面已有基线"
4. 选 N → 跳过，本次原型仅展示目标态

⚠️ **必须停下等用户回复**。

---

## Step 1 · 生成新原型

**有基线参照时**（Step 0.5 反推或已存在）：
- 输出双栏对比 HTML：左侧"改动前（基线）"，右侧"改动后（目标态）"
- 顶部加一段"本次改动摘要"：说明哪些是改动 / 新增 / 删除

**无基线参照时**：
- 仅生成目标态原型（原行为）

模板见 `references/style-selection.md` + `html-prototype-generator.md`。

---

**输出位置**：
- 主原型：`docs/prototype/$ARGUMENTS.html` 或 `-wireframe.md`
- 基线快照（按需）：`docs/prototype/baseline/<page-name>.html`

**注意**：原型必需性判定已在 `/pg:intake` Step 4 中执行；只有需要重新生成 / 调整时才单独跑本命令。

**生成后建议**：把生成的原型链接添加到 `docs/requirements/backlog/$ARGUMENTS.md` 的 `prototype_link` 字段。
