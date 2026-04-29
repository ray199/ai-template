# 技能：编码实现

## 技能描述

根据已确认的技术设计文档，驱动后端开发代理和 DBA 代理有序执行编码任务。确保每个编码子任务有输入、有输出、有完成标准，并在提交前完成自检。

## 触发指令

- `/pg:code` - 启动编码实现（需提供 need_id），前后端同时生成
- `/pg:code --backend` - 仅执行后端编码
- `/pg:code --frontend` - 仅执行前端编码（Vue 页面/组件/API层）
- `/pg:code --db` - 仅执行数据库变更（DDL + 迁移脚本）
- `/pg:code --check` - 对已生成代码执行规范自检（不生成新代码）

## 处理流程

```
输入（按工作量等级）：
  S 级    → docs/requirements/backlog/REQ-XXXXXXXX.md（直接读需求，跳过设计阶段）
  M/L/XL  → docs/design/REQ-XXXXXXXX-design.md（按设计文档拆任务）
       ↓
[Step 0] 项目版本上下文扫描 ⚠️ 必做，先于任何代码生成
         自动检测 Java / Vue / Python / .NET 版本及框架。
         详见 references/version-detection.md
         项目类型分支：
         ├─ 全新项目：先生成骨架文件（来自设计文档的"项目骨架规划"节），再生成业务代码
         └─ 已有项目：直接进入 Step 0.5，沿用原项目包结构（扫现有 .java 文件的 package 声明确认）
       ↓
[Step 0.5] 断点检测（必做）— 详见下方"断点续作机制"
         检查 docs/code/REQ-XXX-progress.md 是否存在：
         ├─ 不存在 → 全新执行，进入 Step 1（执行末尾创建 progress.md）
         ├─ 存在且 status=done → 询问用户是否要重做（默认拒绝，避免覆盖已交付代码）
         └─ 存在且 status=in-progress / blocked → 进入"断点恢复模式"：
            1. 读 progress 表的 ✅ done 行，跳过这些 T
            2. 读"二、当前断点"段，定位 🟡 doing 的 T 和文件行号
            3. 读"三、上下文快照"，重新加载 design.md / requirement.md / project-map
            4. 从断点行号续写；当前 T 完成后立即更新 progress 并 commit
       ↓
[Step 1] 读取输入文档，拆解编码任务
         按设计文档（M/L/XL 强制有"## 任务拆解"章节）逐 T 推进
         首次执行时基于任务表初始化 progress.md（所有 T 状态为 ⏳ pending）
         后端任务层次：DB 变更 → Entity/DO → Mapper/Repository → Service → Controller → VO/DTO
         前端任务层次：API 调用层 → Store → 路由 → 页面 view → 业务组件
       ↓
[Step 2~3.5] 按 T 顺序执行编码 ⚠️ 每个 T 完成必做 4 件事
         ① 把 progress 表对应行从 ⏳ pending → 🟡 doing（开始时）
         ② 写代码 + 单测 + 自检（每次 Write/Edit 后更新"二、当前断点"段的行号）
         ③ T 完成时：状态 🟡 → ✅ done，填输出文件 / commit hash / 完成时间
         ④ git commit 单测和代码（commit hash 写回 progress 表）
         详见下方"断点续作机制 · 每 T 维护协议"
       ↓
[Step 4] 代码规范自检
         对照 references/self-check-rules.md 逐项过；前端补对照 vue-code-review-checklist.md
       ↓
[Step 5] 生成测试骨架
         后端：详见 templates/backend-test.md
         前端：详见 templates/frontend-vue.md 的"前端测试骨架"节
       ↓
[Step 6] 输出编码完成报告 + 关闭 progress.md
         ① code-report.md 的 front-matter `self_check_passed: true` 才能流转
         ② progress.md 状态置 done，current_task 置 —，done_tasks=total_tasks
         详见 templates/code-report.md + templates/code-progress.md
```

---

## 编码任务拆解格式

每项编码任务用以下格式记录，确保可追踪：

```markdown
### 任务：[任务名称]
- **负责代理**：backend_dev / dba / frontend_dev
- **输入**：[依赖的设计文档章节 / 前置任务 ID]
- **输出文件**：
  - `src/main/java/.../entity/XxxDO.java`
  - `src/main/java/.../mapper/XxxMapper.java`
- **完成标准**：
  - [ ] 文件已生成
  - [ ] 规范自检通过
  - [ ] 单元测试骨架已生成（Service 层）
```

---

## 子文件索引（lazy-load）

按需加载，AI 在执行对应步骤前 Read 对应文件即可：

| 子文件 | 用于 | 何时加载 |
|---|---|---|
| `references/version-detection.md` | Step 0：4 种语言的版本扫描逻辑 + 输出格式 + 版本对代码生成的影响 | 每次 /pg:code 必读 |
| `references/self-check-rules.md` | Step 4：通用 / Java 版本 / MyBatis / 事务 / 异常 / 安全自检清单 | Step 4 时读 |
| `references/db-migration-rules.md` | Step 2：DB 迁移脚本的命名 / 内容 / 模板 | 涉及 DB 变更时读 |
| `templates/frontend-vue.md` | Step 3.5：Vue 项目 API 层 + 页面 + 测试骨架模板 | 项目含前端时读 |
| `templates/backend-test.md` | Step 5：Service 层 JUnit 测试骨架 | 后端必读 |
| `templates/code-report.md` | Step 6：编码完成报告模板（带 schema 字段） | 输出时读 |
| `templates/code-progress.md` | Step 0.5 / Step 2~6：断点进度文件模板（每 T 维护） | 必读 |

---

## 断点续作机制（大项目 / 长会话必读）

### 为什么需要

L / XL 级需求一次会话很难做完——上下文限制、网络中断、用户主动暂停都可能导致 `/pg:code` 半路停下。
没有进度持久化时，下一次 AI 不知道做到哪里，只能重新读 design 推断，容易**重做**或**漏做**。

### `docs/code/REQ-XXX-progress.md` 是事实源

- 用 `templates/code-progress.md` 创建
- 走 schema 校验：`node .ai-config/scripts/validate-doc.js code-progress REQ-XXX`
- 必须**每完成一个 T 立即更新**，而不是等全部做完才写
- progress.md **入 git**，与代码同 commit，提供"代码 ↔ 进度"双向追溯

### 每 T 维护协议（强制）

```
开始 T_n 时：
  ① progress 表 T_n 行：⏳ pending → 🟡 doing
  ② 把 fm.current_task 改成 T_n
  ③ 把"二、当前断点"段重写为 T_n 的接续指令
  ④ 把 fm.updated_at 改成当前 ISO 时间

T_n 内每次 Write/Edit 后：
  仅更新"二、当前断点"段的"已写到"行（文件路径 + 行号）
  其他字段不动，避免污染 git diff

T_n 完成时（单测通过 + 自检通过）：
  ① progress 表 T_n 行：🟡 doing → ✅ done，填 输出文件/单测/完成时间
  ② git add <T_n 涉及的代码文件 + progress.md> && git commit
  ③ 把 commit hash 写回 progress 表的 commit hash 列（再 amend 一次提交）
  ④ fm.done_tasks +1
  ⑤ 若还有 pending 的 T → 进入下一个 T（执行"开始 T_n 时"流程）
     若全部完成 → status=done，current_task=—，进入 Step 6 输出 code-report
```

### `--resume` 入口

用户可显式触发恢复：

```
/pg:code REQ-XXX --resume
```

执行逻辑：

1. 读 `docs/code/REQ-XXX-progress.md`，校验 schema
2. 跳过所有 ✅ done 的 T（不重新生成代码）
3. 找到 🟡 doing 的 T（最多 1 个）
4. 读"二、当前断点"段 → 知道当前在哪个文件第几行 / 下一步要做什么
5. 读"三、上下文快照"列出的 5 类文件 → 重建上下文
6. 从断点续写；T 完成后按"每 T 维护协议"推进

> 不带 `--resume` 时：若检测到 in-progress 的 progress 文件，AI **必须主动询问**"上次中断在 T_n，是否续作？"，而不是无脑重头开始。

### 中断 / 阻塞场景

| 场景 | progress 字段 | 用户接续方式 |
|---|---|---|
| 上下文耗尽 | status=in-progress，断点段写明位置 | `/pg:code REQ-XXX --resume` |
| 等外部输入（DBA 复核 / 接口契约确认） | status=blocked，"阻塞 / 待解决"段写清楚 | 解决后 `/pg:code REQ-XXX --resume` |
| 用户主动暂停 | 同 in-progress | 同上 |
| 全部完成 | status=done，current_task=— | 自动进入 `/pg:check` |

### 与 design.md 的对应

`design.md` 的 `## 任务拆解` 表是**只读规划**，progress 表是**可写状态**。
两者 ID 必须严格对应（progress.T1 = design.T1）。如果运行中发现需要新增任务，应先回头改 design.md 再同步更新 progress。

---

## 关键约束

1. **Step 0 不能跳过** — 不识别版本就生成代码会出现 `var` 写在 JDK 8 项目里这种坑
2. **老项目不得改 invariants** — `docs/_context/project-map.md` 里声明的不可变约束严格遵守
3. **任务拆解粒度** — 严格按设计文档的 T1 / T2 / ... 推进，不擅自合并或拆分（L/XL 强制有任务表）
4. **self_check_passed: true** — 编码完成报告 front-matter 里这个字段必须为 true，否则 schema 校验失败，不允许流转 /pg:check
5. **DB 脚本必须幂等** — `IF NOT EXISTS` / `IF EXISTS`，且必须附回滚语句
6. **包名不擅改** — 老项目沿用现有包结构；新项目按设计文档"项目骨架规划"声明的根包名
7. **progress.md 必维护** — L / XL 级需求强制，M 级建议；每个 T 完成必更新 + commit，schema 校验失败要在下一次 commit 前修复

---

## 与其他阶段的衔接

```
/pg:design ──▶ design.md（任务拆解 T1-T6）──▶ /pg:code ──▶ code-report.md ──▶ /pg:check
                                                  ↑
                                                 Step 0-6（本技能）
```

- 上游：design.md 的任务拆解决定本阶段的任务序列
- 下游：code-report.md 的 self_check_passed 决定能否流转 /pg:check
