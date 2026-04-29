---
kind: code-progress
need_id: REQ-XXXXXXXX-XXX
stage: code
status: in-progress         # in-progress | done | blocked
current_task: T1            # 当前正在执行的任务 ID；全部 done 时为 "—"
total_tasks: 6              # 来自 design.md 任务表的总条数
done_tasks: 0
updated_at: 2026-04-29T10:30:00Z
session_count: 1            # 第几次 /pg:code 会话（断点续作时 +1）
---

# 编码进度断点 · REQ-XXXXXXXX-XXX

> 由 `/pg:code` **每完成一个 T 立即更新**；`--resume` 入口读本文件恢复执行。
> **不要手动编辑 status / current_task / commit_hash 字段**——AI 自动维护。

## 一、任务进度表

> 来源：`docs/design/REQ-XXXXXXXX-XXX-design.md` 的 `## 任务拆解` 章节
> 状态枚举：⏳ pending · 🟡 doing · ✅ done · ❌ blocked

| ID | 任务 | 状态 | 输出文件 | 单测 | commit hash | 完成时间 |
|---|---|---|---|---|---|---|
| T1 | DB migration | ⏳ pending | — | — | — | — |
| T2 | UserService | ⏳ pending | — | — | — | — |
| T3 | UserController | ⏳ pending | — | — | — | — |
| T4 | 前端 API client | ⏳ pending | — | — | — | — |
| T5 | 前端页面 | ⏳ pending | — | — | — | — |
| T6 | 集成 + e2e | ⏳ pending | — | — | — | — |

## 二、当前断点（仅当 status=in-progress 时填写）

> 用于 `--resume` 接续。每次 Write/Edit 后必须更新本节。

- **正在做**：T3 UserController 的 `PUT /users/:id` 接口
- **已写到**：`src/main/java/.../controller/UserController.java`，第 87 行
- **进度细节**：
  - [x] 类骨架 + 依赖注入
  - [x] GET /users/:id（含参数校验）
  - [x] POST /users（含参数校验）
  - [ ] PUT /users/:id ← **下次从这里继续**
  - [ ] DELETE /users/:id
  - [ ] 单测骨架
- **下次接续指令**：
  1. 读 design.md 的 T3 验收对应（A2、A3）
  2. 在 UserController.java 第 88 行追加 PUT 方法实现
  3. 调用 `userService.update(id, dto)` + try-catch 业务异常
  4. 完成后跑 `mvn test -Dtest=UserControllerTest`
- **阻塞 / 待解决**（如有）：
  - 无 / 「等 DBA 复核 V002 迁移脚本，复核完成后再继续 T3」

## 三、上下文快照（断点续作必读）

> 重启会话时 AI 必须重新加载以下上下文，不能凭 progress 表猜。

| # | 文件 | 用途 |
|---|---|---|
| 1 | `docs/design/REQ-XXX-design.md` | 任务表 + 接口设计 + 实现路径 |
| 2 | `docs/requirements/backlog/REQ-XXX.md` | acceptance（验收对应回到此处） |
| 3 | `docs/_context/project-map.md`（老项目） | 不可变约束 / 项目原则 / 视觉基线 |
| 4 | `docs/_context/skill-registry.md`（若存在） | 可用 skill 清单 |
| 5 | 已生成的输出文件（progress 表"输出文件"列） | 接续编辑现有文件 |

## 四、会话历史

> 每次 `/pg:code` 会话结束时（无论是正常完成还是被中断）都追加一行。

| # | 起始时间 | 结束时间 | 完成任务 | 中断原因 |
|---|---|---|---|---|
| 1 | 2026-04-29 10:00 | 2026-04-29 12:30 | T1 → T2 全部 done；T3 进行中 87/150 行 | 上下文限制 |
| 2 | — | — | — | — |

## 五、健康度自检（每次更新时跑）

- [ ] progress 表的 `done_tasks` 与表中 ✅ 行数一致
- [ ] `current_task` ID 在表里存在且状态为 🟡 doing
- [ ] 所有 ✅ done 的任务都有非空 commit hash
- [ ] 所有 ✅ done 的输出文件在仓库中确实存在（git log 可查）
- [ ] 若 status=done，progress 表中所有 T 必须 ✅
