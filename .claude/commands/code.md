---
name: code
description: 编码实现 - 根据需求或设计文档生成 Entity/Mapper/Service/Controller/VO 及测试骨架
argument-hint: [REQ-XXXXXXXX]
---

请执行**编码实现（阶段2）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/coding-impl/SKILL.md

**输入来源（根据工作量等级）：**
- S 等级 → 读取 `docs/requirements/backlog/$ARGUMENTS.md`（需求文档，无设计文档）
- M/L/XL → 读取 `docs/design/$ARGUMENTS-design.md`（技术设计文档）

如不确定等级，读取需求文档中的工作量评估结论。

**执行步骤：**
1. 【Step 0】版本上下文扫描 - 检测项目主语言（pom.xml / package.json），确定版本和代码风格
2. 读取输入文档（需求文档或设计文档，取决于等级）
3. 按照文档内容生成源代码：
   - DB迁移脚本：src/main/resources/db/migration/
   - Entity / Mapper / Service / Controller / VO
   - 单元测试骨架（Service层）
4. 执行编码规范自检（代码风格、安全、事务、异常处理）
5. 输出编码完成报告至 docs/design/$ARGUMENTS-code-report.md

完成后，告知用户执行 `/check $ARGUMENTS` 进行测试与代码审查。
