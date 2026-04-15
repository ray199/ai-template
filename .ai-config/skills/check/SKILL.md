> **[Trae 兼容版]** 对应 Claude Code 命令 `/check`，调用方式：`@check REQ-XXXXXXXX`  
> 如需修改执行逻辑，同步修改 `.claude/commands/check.md`

---

# 技能：测试与审查（阶段3完整流程）

**执行前校验（缺少任一必须文件则终止，提示用户补充缺失步骤）：**
- `docs/requirements/backlog/REQ-XXXXXXXX.md` 必须存在 → 来自 `@intake`，缺失请先执行 `@intake`
- `docs/design/REQ-XXXXXXXX-code-report.md` 必须存在 → 来自 `@code REQ-XXXXXXXX`，缺失请先执行 `@code REQ-XXXXXXXX`
- 可选读取（存在则必须读）：`docs/design/REQ-XXXXXXXX-design.md`（技术设计文档，M/L/XL 等级）
- 读取编码完成报告中列出的所有源代码文件（前后端文件清单）

**执行步骤：**

**第一部分：测试验证**（参考 @testing/SKILL.md）

1. 读取需求验收标准（acceptance 字段）作为测试用例来源
2. 生成后端测试用例集（正常路径 + 边界值 + 异常场景 + 权限场景 + 回归场景）
3. 生成接口测试脚本（curl / Postman 格式）
4. 若项目含前端，额外生成：
   - Hook 单元测试骨架（Vitest）
   - 组件交互人工验收清单（按页面逐项列出）
   - 前后端联调验证要点（字段名、分页格式、错误码、Token过期等）
5. 记录发现的问题（P0 阻断 / P1 严重 / P2 一般 / P3 建议）
6. 输出测试报告至 docs/test/REQ-XXXXXXXX-test.md

**第二部分：代码审查**（参考 @code-review/checklists.md）

7. 读取编码完成报告中的生成文件清单，逐一审查所有源代码文件（前端+后端）
8. 执行5个维度审查：
   - 代码质量（命名、逻辑、无魔法值、日志规范）
   - 架构合理性（模块划分、依赖关系；前端：组件拆分是否合理）
   - 安全性（SQL注入、XSS、权限校验、敏感数据脱敏）
   - 可维护性（注释、错误处理、测试覆盖）
   - 业务完整性（是否覆盖所有验收标准，前端页面是否与原型对齐）
9. 前端代码额外对照 @coding-phase/vue-code-review-checklist.md
10. 标注：🔴 阻断性问题 / 🟡 警告性问题 / ✅ 赞扬点
11. 输出审查报告至 docs/review/REQ-XXXXXXXX-review.md

**完成后，明确告知下一步：**
- 无 🔴 阻断性问题 → 执行 `@deliver REQ-XXXXXXXX`
- 有 🔴 阻断性问题 → 修复后重新执行 `@check REQ-XXXXXXXX`
