---
name: design
description: 技术设计 - 架构影响、DB、接口、前端 UI 设计、L/XL 任务拆解
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.3 节（/pg:design）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：@.ai-config/skills/technical-design/SKILL.md

**前置校验（缺一终止）**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在
- 该需求 `workload` ∈ {M, L, XL}（XS/S 级不需要设计）
- 老项目必须先阅读 `docs/_context/project-map.md` 并在设计中声明遵守 `invariants`

**项目宪法（必读）**：若 `docs/_context/constitution.md` 存在，必须先读，设计中不得违反"## 项目原则"任一条款。

**老项目现状基线（强制章节）**：

若 `docs/_context/project-map.md` 存在 → 设计文档正文必须包含：

```markdown
## 现状基线

- 涉及模块：<module A / module B ...>
- 现有行为（改动前）：<方法 / 接口 / 作业的当前输入输出语义>
- 已知坑 / 历史包袱：<从 project-map 或代码中发现，本次不绕开就会踩的>
- 本次保留 vs 重写：<逐项说明>
```

**任务拆解（L / XL 强制；M 建议）**：

L / XL 级 design 必须包含 `## 任务拆解` 章节。多人协作和重构场景下，缺这块就漏 / 错序高发：

```markdown
## 任务拆解

| ID | 任务 | 依赖 | 验收对应 | 预估 | 备注 |
|---|---|---|---|---|---|
| T1 | DB migration：新增 role / role_permission 表 | — | A1 | 0.5d | 老项目保留 user_id 外键 |
| T2 | RoleRepository + Unit Test | T1 | A1 | 1d | |
| T3 | RoleService 业务逻辑 + 缓存 | T2 | A1, A2 | 1.5d | Redis key 设计 |
| T4 | UserController /users/{id}/roles 接口 | T3 | A2 | 0.5d | |
| T5 | 前端权限组管理页面 | T3（接口契约定稿即可） | A3 | 2d | 可与 T4 并行 |
| T6 | 集成测试 + e2e | T4, T5 | A1-A4 | 1d | |

**关键路径**：T1 → T2 → T3 → T4 → T6（共 4.5 天）
**并行机会**：T5 在 T3 接口契约定稿后即可启动，与 T4 并行
```

强制项：
- 每行任务 ID 必须是 `T<数字>` 形式
- 必须有"验收对应"列，引用 requirement.md 里的 acceptance 编号（A1/A2...）
- 至少 1 行任务

**重构 / 迁移类需求额外要求**：

若需求标题 / affects_modules 涉及"重构、改造、迁移"等场景，任务表后必须追加：

```markdown
**迁移顺序**（标注每步的可逆点和不可逆点）：
1. <步骤 1>，可独立合并：是 / 否
2. <步骤 2>，可独立合并：是 / 否
...
**回滚边界**：在第 N 步之前可一键回滚，第 N 步之后只能前滚
```

schema 会校验任务拆解章节存在性 + 表头列名。

**后置校验（强制门）**：

```bash
node .ai-config/scripts/validate-doc.js design $ARGUMENTS
```

**下一步**：`/pg:code $ARGUMENTS`
