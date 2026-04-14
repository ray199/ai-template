---
name: prototype
description: 原型生成 - 根据需求自动判定原型形式（低保真/HTML/Figma），生成可视化原型用于需求沟通
argument-hint: [REQ-XXXXXXXX]
---

请执行**原型生成**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/prototype-generation/SKILL.md

**执行步骤：**

1. 读取 `docs/requirements/backlog/$ARGUMENTS.md`，分析需求特征
2. 执行原型必需性判定（4个维度，总分0-10分）：
   - 功能类型（0-3分）：是否涉及 UI / 交互
   - 复杂度（0-3分）：页面数、功能点、交互流程
   - 涉众（0-2分）：是否需要与非技术人员沟通
   - 验收标准（0-2分）：是否涉及 UI / 流程细节
3. 根据分数判定原型形式：
   - ≤2分 → 不需要原型，说明理由
   - 3-4分 → 低保真草图（ASCII 线框图）
   - 5-7分 → HTML 可交互原型
   - ≥8分 → HTML 完整原型 + Figma 设计说明
4. HTML 原型：展示 3 个设计风格方案（色板 + 字体 + 适用场景），用户选择后生成
5. 输出原型文件至 `docs/prototype/$ARGUMENTS.html`（或 `-wireframe.md`）

完成后，将原型链接更新至需求文档的 `prototype_link` 字段。
