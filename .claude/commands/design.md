---
name: design
description: 技术设计 - 架构影响、DB、接口、前端 UI 设计
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.3 节（/design）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：@.ai-config/skills/technical-design/SKILL.md

**前置校验（缺一终止）**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在
- 该需求 `workload` ∈ {M, L, XL}（XS/S 级不需要设计）
- 老项目必须先阅读 `docs/_context/project-map.md` 并在设计中声明遵守 `invariants`

**老项目现状基线（强制章节）**：

若 `docs/_context/project-map.md` 存在 → 设计文档正文必须包含：

```markdown
## 现状基线

- 涉及模块：<module A / module B ...>
- 现有行为（改动前）：<方法 / 接口 / 作业的当前输入输出语义>
- 已知坑 / 历史包袱：<从 project-map 或代码中发现，本次不绕开就会踩的>
- 本次保留 vs 重写：<逐项说明>
```

schema 会检查章节存在性，缺章节会在后置校验阶段报错。

**后置校验（强制门）**：

```bash
node .ai-config/scripts/validate-doc.js design $ARGUMENTS
```

**下一步**：`/code $ARGUMENTS`
