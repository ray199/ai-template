---
name: deliver
description: 交付 - 汇总所有输出物，生成部署步骤和回滚方案，归档需求至 docs/delivery/
argument-hint: [REQ-XXXXXXXX]
---

请执行**交付准备（阶段6）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/delivery/SKILL.md

**执行步骤：**
1. 汇总本次需求所有输出物（需求文档、设计文档、代码、测试报告、审查报告）
2. 生成交付说明文档至 docs/delivery/$ARGUMENTS-delivery.md，包含：
   - 功能清单（每项功能完成状态）
   - 代码变更清单（新增/修改的文件）
   - 部署步骤（前置条件、执行步骤、验证方法）
   - 回滚方案（停服 → DB回滚 → 启动旧版本）
   - 交付检查清单（代码质量、文档、部署、发布）
   - 已知限制和后续优化建议
3. 将需求文档从 docs/requirements/backlog/ 移动到 docs/requirements/done/
4. 执行最终交付检查清单确认

完成后，本次需求交付流程结束 ✅
