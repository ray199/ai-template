---
name: deliver
description: 交付 - 汇总所有输出物，生成部署步骤和回滚方案，归档需求至 docs/requirements/done/
argument-hint: [REQ-XXXXXXXX]
---

请执行**交付（阶段4）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/delivery/SKILL.md

**执行步骤：**
1. 上线前检查清单（逐项确认：代码/DB/配置/测试/文档层面）
2. 生成交付报告至 `docs/delivery/$ARGUMENTS-delivery.md`（运维快查用）：
   - 功能清单（每项功能完成状态）
   - 代码变更清单（新增/修改的文件）
   - 上线回滚方案
   - 已知遗留问题
3. 归档需求生命周期至 `docs/requirements/done/$ARGUMENTS/`（永久存档）：
   - `requirement.md`（需求文档最终版）
   - `design.md`（技术设计文档）
   - `test-report.md`（测试报告）
   - `review-report.md`（代码审查报告）
   - `delivery-note.md`（交付说明）
4. 将需求文档从 `docs/requirements/backlog/` 移至 `docs/requirements/done/$ARGUMENTS/`，更新 `status: done`

完成后，本次需求交付流程结束 ✅
