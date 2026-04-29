---
name: prototype
description: 按需手动生成原型（HTML / Figma / 线框图）
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.7 节（/pg:prototype）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：
- @.ai-config/skills/prototype-generation/SKILL.md
- @.ai-config/skills/prototype-generation/references/style-selection.md
- @.ai-config/skills/prototype-generation/html-prototype-generator.md
- 制造业专用：@.ai-config/skills/redoe-prototype-style/SKILL.md

**前置校验**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在

---

## Step 0 · 视觉基线扫描（HTML 原型必做，强制中断点）

⚠️ **生成 HTML 之前必须扫描以下来源**，提取项目现有视觉基线：

1. `docs/prototype/*.html`（其他 REQ 已生成的原型）
   → 提取 CSS 变量 / 字体 / UI 库类名
2. `src/` 下现有前端工程（若存在）
   → `package.json` 的 UI 库依赖（element-plus / ant-design-vue / vant 等）
   → `tailwind.config.js` / `src/styles/variables.scss` / `src/styles/index.scss` 等 design token
   → `src/views/` `src/components/` 现有组件命名约定
3. `docs/_context/project-map.md` 的 `## 不可变约束` / `## 项目原则`
   → 若提到 UI 框架 / 设计语言，必须遵守

**扫描结果分流**：
- 命中现有视觉基线 → 走【模式 A · 沿用基线】（详见 `references/style-selection.md`）
- 仅命中 UI 库 → 走【模式 B · UI 库默认主题】
- 完全无基线（新项目）→ 走【模式 C · 5 选 1 风格库】

⚠️ **必须把扫描结果展示给用户**，并停下等用户确认风格选择后才能进入生成步骤。
默认推荐"沿用基线"，避免视觉漂移。

---

**输出位置**：`docs/prototype/$ARGUMENTS.html` 或 `-wireframe.md` 或 `.figma`

**注意**：原型必需性判定已在 `/pg:intake` Step 4 中执行；只有需要重新生成 / 调整时才单独跑本命令。

**生成后建议**：把生成的原型链接添加到 `docs/requirements/backlog/$ARGUMENTS.md` 的 `prototype_link` 字段。
