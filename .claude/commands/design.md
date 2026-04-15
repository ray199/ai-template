---
name: design
description: 技术设计 - 架构影响分析、DB设计、接口设计、实现路径，输出 docs/design/ 文档
argument-hint: [REQ-XXXXXXXX]
---

请执行**技术设计（阶段2 子步骤A）**。

需求ID：$ARGUMENTS

执行规范参考：@.ai-config/skills/technical-design/SKILL.md

**执行前校验（缺少任一文件则终止，提示用户补充缺失步骤）：**
- `docs/requirements/backlog/$ARGUMENTS.md` 必须存在 → 来自 `/intake`，缺失请先执行 `/intake`
- 若 `docs/design/$ARGUMENTS-design.md` 已存在 → 提示用户确认是否覆盖重新设计
- 可选读取：`docs/prototype/$ARGUMENTS*.html` 或 `$ARGUMENTS*-wireframe.md`（/intake 生成的原型）

**执行步骤：**
1. 读取需求文档（docs/requirements/backlog/$ARGUMENTS.md）和工作量评估结论
2. 若存在原型文件（docs/prototype/$ARGUMENTS*），读取并在设计中引用
3. 检测项目是否为前后端分离（package.json + 后端构建文件同时存在）
4. 检测项目类型：全新项目（无现有代码）或已有项目（见规范）
5. 以架构师代理角色执行技术设计，覆盖以下维度：
   - 架构影响分析（全新项目：定义初始模块；已有项目：受影响模块）
   - 数据库设计（DDL、迁移脚本、回滚方案）
   - 接口设计（前后端契约：URL / Method / 请求响应 / 错误码）
   - 前端 UI 设计（若含前端）：页面清单、组件拆分、状态管理、API调用层规划
   - 关键实现路径（前后端协作时序、并发场景、技术风险）
6. 输出技术设计文档至 docs/design/$ARGUMENTS-design.md
7. 列出"待评审确认项"，等待人工确认

完成后，告知用户确认设计无误后执行 `/code $ARGUMENTS` 开始编码。
