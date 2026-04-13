---
name: design
description: 技术设计 - 架构影响分析、DB设计、接口设计、实现路径，输出 docs/design/ 文档
argument-hint: [REQ-XXXXXXXX]
---

请执行**技术设计（阶段2 子步骤A）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/technical-design/SKILL.md

**执行步骤：**
1. 读取 docs/requirements/ 下对应需求文档和工作量评估报告
2. 以架构师代理角色执行技术设计，覆盖四个维度：
   - 架构影响分析（受影响模块、技术组件决策）
   - 数据库设计（DDL、迁移脚本、回滚方案）
   - 接口设计（接口清单、请求/响应示例、错误码）
   - 关键实现路径（核心流程、并发场景、技术风险）
3. 输出技术设计文档至 docs/design/$ARGUMENTS-design.md
4. 列出"待评审确认项"，等待人工确认

完成后，告知用户确认设计无误后执行 `/code $ARGUMENTS` 开始编码。
