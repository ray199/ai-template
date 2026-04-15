---
name: deliver
description: 交付 - 汇总所有输出物，生成部署步骤和回滚方案，归档需求至 docs/requirements/done/
argument-hint: [REQ-XXXXXXXX]
---

请执行**交付（阶段4）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/delivery/SKILL.md

**执行前校验（缺少任一必须文件或验收未通过则终止）：**
- `docs/test/$ARGUMENTS-test.md` 必须存在 → 来自 `/check $ARGUMENTS`，缺失请先执行 `/check $ARGUMENTS`
- `docs/review/$ARGUMENTS-review.md` 必须存在 → 来自 `/check $ARGUMENTS`
- 读取测试报告中的**验收结论**字段：必须为 ✅ 通过，若为 ❌ 阻断则终止并提示先修复 P0/P1 问题
- 读取审查报告中的**审查结论**字段：必须无 🔴 阻断性问题，否则终止并提示先修复

**执行步骤：**
1. 上线前检查清单（逐项确认）
   - 首先判断上线类型：
     - **增量发布**（`docs/requirements/done/` 下已有历史归档）→ 执行标准检查清单
     - **全新系统首次上线**（`done/` 为空，或需求文档标注"全新项目"）→ 额外执行"首次上线专属检查"（含环境准备、数据库初始化、外部服务配置、首次启动验证）
   - 后端：DDL迁移脚本验证、配置项同步、回滚方案
   - 前端（若含前端）：`npm run build` 构建成功、dist 已部署、环境变量已配置
2. 生成交付报告至 `docs/delivery/$ARGUMENTS-delivery.md`（运维快查用）：
   - 功能清单（每项功能完成状态）
   - 代码变更清单（新增/修改的文件）
   - 上线回滚方案
   - 已知遗留问题
3. 归档需求生命周期至 `docs/requirements/done/$ARGUMENTS/`（永久存档，文件保持原名复制）：
   - `$ARGUMENTS.md`（需求文档，从 `docs/requirements/backlog/` 移入）
   - `$ARGUMENTS-design.md`（技术设计文档，从 `docs/design/` 复制）
   - `$ARGUMENTS-code-report.md`（编码完成报告，从 `docs/design/` 复制）
   - `$ARGUMENTS-test.md`（测试报告，从 `docs/test/` 复制）
   - `$ARGUMENTS-review.md`（代码审查报告，从 `docs/review/` 复制）
   - `$ARGUMENTS-delivery.md`（交付说明，从 `docs/delivery/` 复制）
4. 将需求文档从 `docs/requirements/backlog/` 移至 `docs/requirements/done/$ARGUMENTS/`，更新 `status: done`

完成后，本次需求交付流程结束 ✅
