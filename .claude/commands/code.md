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
1. 【Step 0】版本上下文扫描 - 检测项目技术栈（pom.xml / package.json 等），确定前后端版本
2. 读取输入文档（需求文档或设计文档，取决于等级）
3. 生成后端代码：
   - DB迁移脚本：src/main/resources/db/migration/
   - Entity / Mapper / Service / Controller / VO
   - 后端单元测试骨架（Service层 JUnit）
4. 生成前端代码（若项目含前端）：
   - API调用层：src/api/xxx.js（封装后端接口）
   - 页面组件：src/views/xxx/（列表页/详情页等）
   - 业务组件：src/components/xxx/（弹窗、表单等）
   - 路由配置更新：src/router/
   - Store模块（仅需全局状态时）：src/stores/ 或 src/store/
   - 前端测试骨架：Hook单元测试（Vitest）
5. 执行编码规范自检（后端：Java规范；前端：vue-code-review-checklist）
6. 输出编码完成报告至 docs/design/$ARGUMENTS-code-report.md（前后端分别列文件清单）

完成后，告知用户执行 `/check $ARGUMENTS` 进行测试与代码审查。
