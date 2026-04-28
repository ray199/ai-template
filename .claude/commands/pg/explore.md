---
name: explore
description: 想法探索 - 模糊想法的前置脑暴（可选，产出不走 backlog）
argument-hint: [想法一句话描述]
---

按 @.ai-config/workflow.md 第 **2.0 节（/pg:explore）** 的契约执行。

想法：$ARGUMENTS

**执行规范参考**：@.ai-config/skills/idea-exploration/SKILL.md

**适用场景**：用户连 `/pg:intake` 的三个基础问题（目标 / 时间 / 不做什么）都还答不清楚时。需求明确直接走 `/pg:intake`。

**5 步流程（可中途停止）**：
1. 问题框定（5 Whys：谁痛 / 现状代价 / 已有方案为什么不够）
2. 维度拆解（按场景挑：生命周期 / 权限 / 数据 / 交互 / 运维 / 扩展 / 性能 / 集成）
3. 候选方案对比（2–3 个差异化路径，不是好中差）
4. 边界与陷阱扫描（按问题类型出通用坑清单）
5. 未知识别（谁来答 / 不答的代价）

**产出**：`docs/_exploration/EXPLORE-YYYYMMDD-<slug>.md`

**关键约束**：
- 不分配 need_id，不进 backlog
- 不走 schema 校验（产出是草稿）
- 不计工作量（XS/S/M/L/XL 不适用）
- 用户觉得想清楚了随时可以停

**下一步**：
- 足够清楚 → `/pg:intake`（把探索笔记作为 background 输入）
- 还要验证 → 列出 POC / 调研 / 访谈动作
- 决定不做 → 归档到 `docs/_exploration/dropped/`
