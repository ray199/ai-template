---
name: check
description: 测试+审查 - 设计测试用例、代码审查，输出验收结论，一步完成阶段3全部工作
argument-hint: [REQ-XXXXXXXX]
---

请执行**测试与审查（阶段3完整流程）**。

需求ID：$ARGUMENTS

**执行前，读取以下输入文件：**
- `docs/requirements/backlog/$ARGUMENTS.md`（需求文档，验收标准来源）
- `docs/design/$ARGUMENTS-design.md`（技术设计文档，若 M/L/XL 等级）
- `docs/design/$ARGUMENTS-code-report.md`（编码完成报告，含生成文件清单和自检结果）
- 编码完成报告中列出的所有源代码文件（Entity / Mapper / Service / Controller / VO 等）

**执行步骤：**

**第一部分：测试验证**（参考 @.ai-config/skills/testing/SKILL.md）

1. 读取需求验收标准（acceptance 字段）作为测试用例来源
2. 生成测试用例集（正常路径 + 边界值 + 异常场景 + 权限场景 + 回归场景）
3. 生成接口测试脚本（curl / Postman 格式）
4. 记录发现的问题（P0 阻断 / P1 严重 / P2 一般 / P3 建议）
5. 输出测试报告至 docs/test/$ARGUMENTS-test.md

**第二部分：代码审查**（参考 @.ai-config/skills/code-review/checklists.md 和 @.ai-config/rules/02_code_style.mdc）

6. 读取编码完成报告中的生成文件清单，逐一审查所有源代码文件
7. 执行5个维度审查：
   - 代码质量（命名、逻辑、无魔法值、日志规范）
   - 架构合理性（模块划分、依赖关系）
   - 安全性（SQL注入、XSS、权限校验、敏感数据脱敏）
   - 可维护性（注释、错误处理、测试覆盖）
   - 业务完整性（是否覆盖所有验收标准）
8. 标注：🔴 阻断性问题 / 🟡 警告性问题 / ✅ 赞扬点
9. 输出审查报告至 docs/review/$ARGUMENTS-review.md

**完成后，明确告知下一步：**
- 无 🔴 阻断性问题 → 执行 `/deliver $ARGUMENTS`
- 有 🔴 阻断性问题 → 修复后重新执行 `/check $ARGUMENTS`
