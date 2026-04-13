---
name: code
description: 编码实现 - 根据技术设计生成 Entity/Mapper/Service/Controller/VO 及测试骨架
argument-hint: [REQ-XXXXXXXX]
---

请执行**编码实现（阶段3）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/coding-impl/SKILL.md

**执行步骤：**
1. 【Step 0】版本上下文扫描 - 检测 Java 版本（pom.xml）和前端版本（package.json），确定代码风格
2. 读取 docs/design/$ARGUMENTS-design.md 技术设计文档
3. 按照技术设计生成源代码：
   - DB迁移脚本：src/main/resources/db/migration/
   - Entity / Mapper / Service / Controller / VO
   - 单元测试骨架
4. 执行编码规范自检（代码风格、安全、事务、异常处理）
5. 输出编码完成报告至 docs/design/$ARGUMENTS-code-report.md

完成后，告知用户执行 `/test $ARGUMENTS` 进行测试验证。
