---
name: review
description: 代码审查 - 多维度审查代码质量/安全/架构，标注阻断性问题，输出 docs/review/ 报告
argument-hint: [REQ-XXXXXXXX]
---

请执行**代码审查（阶段5）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/code-review/SKILL.md

**执行步骤：**
1. 读取本次需求相关的所有代码文件和技术设计文档
2. 以 Senior Developer 角色执行多维度审查：
   - 代码质量（命名、逻辑、性能、规范）
   - 架构合理性（模块划分、依赖关系）
   - 安全性（SQL注入、XSS、权限校验、敏感数据）
   - 可维护性（注释、测试覆盖、错误处理、日志）
   - 业务完整性（是否覆盖验收标准）
3. 输出代码审查报告至 docs/review/$ARGUMENTS-review.md
4. 明确标注：
   - 🔴 阻断性问题（必须修复）
   - 🟡 警告性问题（建议改进）
   - ✅ 赞扬点

若有阻断性问题，告知用户修复后执行 `/review $ARGUMENTS` 重新审查。
若无阻断性问题，告知用户执行 `/deliver $ARGUMENTS` 准备交付。
