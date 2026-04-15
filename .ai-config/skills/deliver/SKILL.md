> **[Trae 兼容版]** 对应 Claude Code 命令 `/deliver`，调用方式：`@deliver REQ-XXXXXXXX`  
> 如需修改执行逻辑，同步修改 `.claude/commands/deliver.md`

---

# 技能：交付（阶段4）

执行规范参考：@delivery/SKILL.md

**执行步骤：**
1. 上线前检查清单（逐项确认：代码/后端DB配置/前端构建部署/测试/文档层面）
   - 后端：DDL迁移脚本验证、配置项同步、回滚方案
   - 前端（若含前端）：`npm run build` 构建成功、dist 已部署、环境变量已配置
2. 生成交付报告至 `docs/delivery/REQ-XXXXXXXX-delivery.md`（运维快查用）：
   - 功能清单（每项功能完成状态）
   - 代码变更清单（新增/修改的文件）
   - 上线回滚方案
   - 已知遗留问题
3. 归档需求生命周期至 `docs/requirements/done/REQ-XXXXXXXX/`（永久存档，文件保持原名复制）：
   - `REQ-XXXXXXXX.md`（需求文档，从 `docs/requirements/backlog/` 移入）
   - `REQ-XXXXXXXX-design.md`（技术设计文档，从 `docs/design/` 复制）
   - `REQ-XXXXXXXX-code-report.md`（编码完成报告，从 `docs/design/` 复制）
   - `REQ-XXXXXXXX-test.md`（测试报告，从 `docs/test/` 复制）
   - `REQ-XXXXXXXX-review.md`（代码审查报告，从 `docs/review/` 复制）
   - `REQ-XXXXXXXX-delivery.md`（交付说明，从 `docs/delivery/` 复制）
4. 将需求文档从 `docs/requirements/backlog/` 移至 `docs/requirements/done/REQ-XXXXXXXX/`，更新 `status: done`

完成后，本次需求交付流程结束 ✅
