---
name: prototype
description: 按需手动生成原型（HTML / Figma / 线框图）
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.7 节（/prototype）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：
- @.ai-config/skills/prototype-generation/SKILL.md
- @.ai-config/skills/prototype-generation/html-prototype-generator.md
- 制造业专用：@.ai-config/skills/redoe-prototype-style/SKILL.md

**前置校验**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在

**输出位置**：`docs/prototype/$ARGUMENTS.html` 或 `-wireframe.md`

**注意**：原型必需性判定已在 `/intake` 中自动执行；只有需要重新生成时才单独跑本命令。
