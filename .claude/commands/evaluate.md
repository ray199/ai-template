---
name: evaluate
description: 工作量评估 - 需求分析师+架构师联合评估，输出 S/M/L/XL 等级和原型判定
argument-hint: [REQ-XXXXXXXX]
---

请执行**工作量联合评估（阶段1 Step 2-4）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/evaluate-requirement/SKILL.md

**执行步骤：**
1. 读取 docs/requirements/backlog/$ARGUMENTS.md 需求文档
2. 【Step 2】工作量联合评估
   - 需求分析师角色：业务维度评分（5项）
   - 架构师角色：技术维度评分（4项）
   - 综合判定等级：S / M / L / XL
3. 【Step 3】根据等级确定输出物规范 + 自动原型判定（判断是否需要生成原型）
4. 【Step 4】输出物质量检查（S全自动，M人工确认，L/XL人工终审）
5. 输出工作量评估报告

完成后，告知用户下一步：
- S等级 → 直接执行 `/code $ARGUMENTS`
- M/L/XL等级 → 先执行 `/design $ARGUMENTS`
