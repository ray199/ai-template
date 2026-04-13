---
name: test
description: 测试验证 - 补充单元测试用例，检查覆盖率，输出测试报告至 docs/test/
argument-hint: [REQ-XXXXXXXX]
---

请执行**测试验证（阶段4）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/testing/SKILL.md

**执行步骤：**
1. 读取已生成的单元测试骨架文件
2. 以 QA 工程师代理角色执行测试分析：
   - 补充单元测试用例（正常流程 + 异常分支 + 边界值）
   - 检查核心流程集成测试覆盖
   - 验证代码覆盖率是否达到 ≥80%
3. 输出单元测试报告至 docs/test/$ARGUMENTS-unit-test.md
4. 如有集成测试，输出至 docs/test/$ARGUMENTS-integration-test.md
5. 列出发现的问题（阻断性 / 警告性）

完成后，告知用户确认测试通过后执行 `/review $ARGUMENTS` 进行代码审查。
