---
name: intake
description: 需求接入 - 将原始需求结构化，输出标准需求文档至 docs/requirements/backlog/
argument-hint: [需求描述文字或完整PRD]
---

请执行**需求接入流程（阶段1）**。

用户输入的需求内容：$ARGUMENTS

执行规范参考：@.ai-config/skills/intake-requirement/SKILL.md

**执行步骤：**
1. 【Step 0A】项目上下文感知 - 扫描项目目录，加载技术栈、历史需求、已有模块
2. 【Step 0B】输入质量识别 - 判断输入类型（T1一句话/T2零散/T3半结构/T4完整PRD），选择对应策略
3. 【Step 1】需求结构化 - 填充标准模板，自动补全可推断字段
4. 输出结构化需求文档，分配 need_id，保存至 docs/requirements/backlog/

完成后，告知用户下一步可执行 `/evaluate REQ-XXXXXXXX` 进行工作量评估。
