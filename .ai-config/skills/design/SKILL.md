> **[Trae 兼容版]** 对应 Claude Code 命令 `/design`，调用方式：`@design REQ-XXXXXXXX`  
> 如需修改执行逻辑，同步修改 `.claude/commands/design.md`

---

# 技能：技术设计（阶段2 子步骤A）

执行规范参考：@technical-design/SKILL.md

**执行步骤：**
1. 读取 docs/requirements/ 下对应需求文档和工作量评估报告
2. 检测项目是否为前后端分离（package.json + 后端构建文件同时存在）
3. 以架构师代理角色执行技术设计，覆盖以下维度：
   - 架构影响分析（受影响的前端页面模块和后端服务模块）
   - 数据库设计（DDL、迁移脚本、回滚方案）
   - 接口设计（前后端契约：URL / Method / 请求响应 / 错误码）
   - 前端 UI 设计（若含前端）：页面清单、组件拆分、状态管理、API调用层规划
   - 关键实现路径（前后端协作时序、并发场景、技术风险）
4. 输出技术设计文档至 docs/design/REQ-XXXXXXXX-design.md
5. 列出"待评审确认项"，等待人工确认

完成后，告知用户确认设计无误后执行 `@code REQ-XXXXXXXX` 开始编码。
