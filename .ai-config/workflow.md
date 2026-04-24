# AI 编程工作流 · 跨平台事实源

> 本文件是**唯一事实源**。Claude Code / Cursor / Codex / Trae 等不同平台的命令配置都应引用本文件，不要把执行逻辑写到各自的适配层里。
>
> 修改工作流时只改这一份。

---

## 0. 术语

- **命令（command）**：用户显式触发的工作流入口，5 个：`/init` `/intake` `/design` `/code` `/check` `/deliver`，加 1 个可选 `/prototype`
- **产出物（artifact）**：命令执行后必须生成的文件，受 schema 约束
- **前置校验（precondition）**：命令开始前必须满足的文件存在性 / 字段条件，不满足即终止
- **后置校验（postcondition）**：命令结束后对产出物跑 schema 检查，失败即回退状态

---

## 1. 工作量等级

| 等级 | 触发条件 | 工期 | 需要 `/design` | 需要 `/prototype` | 需要 `/check` 独立报告 |
|---|---|---|---|---|---|
| **XS** | 改文案、加字段、调样式，≤ 30 分钟 | <1 天 | 否 | 否 | 否（合并到 PR 描述） |
| **S** | 单文件新增、≤ 1 个页面 | 1-2 天 | 否 | 否 | 否（合并到 PR 描述） |
| **M** | 新增模块、2-4 页面、新表 | 3-5 天 | 是（轻量） | 视情况 | 是 |
| **L** | 跨模块改造、5+ 页面、有技术风险 | 1-2 周 | 是（完整） | 强烈建议 | 是 |
| **XL** | 整体重构、需拆分迭代 | 4 周+ | 是（完整 + 拆分） | 必须 | 是 |

**XS 快车道**：允许跳过 `/intake` 结构化阶段。只要在 git commit 里写 `XS: 一句话描述` 即可，走 PR review 流程。

---

## 2. 命令契约

### 2.1 `/init`

**目的**：检测项目语言和现状，建立 `.ai-config/` 和 `docs/` 骨架。

**前置校验**：无。

**执行步骤**：
1. 扫描项目根目录（pom.xml / package.json / requirements.txt / *.csproj）识别技术栈
2. 判定项目类型：`new`（无业务代码）/ `existing`（有业务代码）
3. 新项目：生成 `docs/`、`.ai-config/` 目录骨架
4. 老项目：额外生成 `docs/_context/project-map.md`（表清单 / 接口清单 / 模块清单 / 不可变约束）

**后置校验**：
- `.ai-config/workflow.md` 存在
- 老项目必须有 `docs/_context/project-map.md` 非空

**产出物**：目录结构 + `project-map.md`（老项目）

---

### 2.2 `/intake <需求描述>`

**目的**：需求结构化 + 工作量评估 + 伪需求扫描，一步完成。

**前置校验**：无。

**执行步骤**：
1. 【Step 0A】项目上下文感知：读取 `docs/_context/project-map.md`（若存在）+ 扫描历史 `docs/requirements/done/`
2. 【Step 0B】输入质量识别：T1（一句话）/ T2（零散）/ T3（半结构化）/ T4（完整 PRD），按质量决定澄清问题数量
3. 【Step 1】结构化：按等级填写字段（XS：2 个；S：6 个；M：10 个；L：15 个；XL：L + 拆分计划）
4. 【Step 2】工作量评估：业务 5 维 + 技术 4 维打分，判等级
5. 【Step 3】伪需求扫描：重复建设 / 价值存疑 / 逻辑冲突 / 技术可行性
6. 【Step 4】（若 ≥M）原型必需性判定
7. 【Step 5】并行冲突软提示：若填写 `affects_modules`，扫 `docs/requirements/backlog/*.md` 其他 in-flight 需求并打印交集（仅提示，不阻断）

**后置校验**：运行 `validate-doc.js requirement <need_id>`，失败退出码 1。

**产出物**：`docs/requirements/backlog/REQ-YYYYMMDD-XXX.md`（带 YAML front-matter）

**下一步告知**：
- XS/S → `/code REQ-xxx`
- M/L/XL → `/design REQ-xxx`
- 🔴 阻断 → 解决后重跑 `/intake`

---

### 2.3 `/design REQ-xxx`

**目的**：技术设计文档。

**前置校验**：
- `docs/requirements/backlog/REQ-xxx.md` 存在且 `workload in [M, L, XL]`
- 若 `docs/design/REQ-xxx-design.md` 已存在则确认覆盖

**执行步骤**：
1. 读取需求文档 + project-map（若老项目）
2. 架构影响分析（新项目：模块定义；老项目：严格遵守 project-map 的 `invariants`）
3. **现状基线（仅老项目，强制）**：在 design 文档正文写 `## 现状基线` 章节，列出：涉及模块、现有行为（改动前的输入输出语义）、已知坑、本次保留 vs 重写
4. 数据库设计：DDL、迁移脚本、回滚方案
5. 接口设计：URL / Method / 请求响应 / 错误码
6. 前端 UI 设计（若含前端）：页面、组件、状态、API 调用层
7. 关键实现路径 + 风险点

**后置校验**：运行 `validate-doc.js design REQ-xxx`。老项目 schema 会校验 `## 现状基线` 章节存在性。

**产出物**：`docs/design/REQ-xxx-design.md`

**下一步**：`/code REQ-xxx`

---

### 2.4 `/code REQ-xxx [--frontend|--backend|--db]`

**目的**：生成源代码 + 数据库脚本 + 测试骨架。

**前置校验**：
- `docs/requirements/backlog/REQ-xxx.md` 存在
- 若 workload ∈ {M,L,XL}：`docs/design/REQ-xxx-design.md` 必须存在

**执行步骤**：
1. 【Step 0】版本上下文扫描：检测项目技术栈 + 新老项目分支
2. 读取输入文档（XS/S 读需求，M/L/XL 读设计）
3. 生成后端代码（Entity / Mapper / Service / Controller / VO / 迁移脚本 / 测试骨架）
4. 生成前端代码（若含前端）：页面 / 组件 / Hook / API 调用层
5. 自检：命名、日志、异常、事务、权限、@Valid

**后置校验**：
- 运行 `validate-doc.js code-report REQ-xxx`
- 若 workload ∈ {XS, S}：允许不生成 code-report，但 commit message 必须覆盖变更摘要
- 若 workload ∈ {M, L, XL}：`docs/design/REQ-xxx-code-report.md` 必须存在

**产出物**：源代码 + 迁移脚本 + （M/L/XL）code-report.md

**下一步**：`/check REQ-xxx`

---

### 2.5 `/check REQ-xxx`

**目的**：测试用例设计 + 代码审查。

**前置校验**：
- `docs/requirements/backlog/REQ-xxx.md` 存在
- 若 workload ∈ {M,L,XL}：`docs/design/REQ-xxx-code-report.md` 存在

**执行步骤（分级执行）**：

**XS / S 级**：
1. 生成接口测试脚本（curl 片段）
2. 让 PR reviewer 按 5 维度 checklist 手动过（代码质量 / 架构 / 安全 / 可维护性 / 业务完整性）
3. 结论写入 PR 描述，**不生成独立 test/review md**

**M 级**：
1. 生成测试用例集 + 接口测试脚本
2. 执行 5 维度代码审查
3. 产出 `docs/test/REQ-xxx-test.md` + `docs/review/REQ-xxx-review.md`（可合并为单份 `REQ-xxx-qa.md`）

**L / XL 级**：
1. 同 M 级，但必须两份独立文档
2. 增加并发场景测试、性能基线

**后置校验**：运行 `validate-doc.js check REQ-xxx`。

**产出物**：（M/L/XL）test.md + review.md；（XS/S）PR 描述块

**下一步**：
- 无 🔴 → `/deliver REQ-xxx`
- 有 🔴 → 修复后重跑 `/check`

---

### 2.6 `/deliver REQ-xxx`

**目的**：上线前检查 + 归档。

**前置校验**：
- workload ∈ {M,L,XL}：`docs/test/REQ-xxx-test.md` 和 `docs/review/REQ-xxx-review.md` 存在
- 测试结论为 ✅ 通过
- 审查无 🔴 阻断项

**执行步骤**：
1. 判定上线类型（增量 / 全新系统首次上线）
2. 生成部署步骤 + 回滚方案
3. 归档 `docs/requirements/backlog/REQ-xxx.md` → `docs/requirements/done/REQ-xxx/`（连同相关文档）
4. **收尾沉淀（两个软提示）**：
   - 询问用户是否有新不变量 / 技术债 / 架构决策要回写到 `docs/_context/project-map.md` 的"追加记录"小节（带 REQ 号 + 日期）
   - 询问 review 是否发现可沉淀回 `.ai-config/rules/` 的反模式，若有则追加到 `docs/_changelog/rules-candidates.md` 作批处理候选
   - 两项皆为提示，用户答"无"即跳过；**不阻断归档**

**后置校验**：运行 `validate-doc.js delivery REQ-xxx`。

**产出物**：`docs/delivery/REQ-xxx-delivery.md` + 归档目录；（按需）project-map.md 追加 + rules-candidates.md 追加。

---

### 2.7 `/prototype REQ-xxx`（可选）

**目的**：按需手动生成原型（HTML / Figma / 线框图）。`/intake` 已自动判定；需要重新生成时才单独跑。

---

## 3. 产出物 schema（front-matter 要求）

所有产出 md 必须有 YAML front-matter，字段由 `.ai-config/scripts/validate-doc.js` 强制校验。

### 3.1 需求文档（backlog/REQ-xxx.md）

```yaml
---
need_id: REQ-20260424-001          # 必填，格式 REQ-YYYYMMDD-XXX
title: 给用户加角色权限              # 必填，≤20 字
workload: L                        # 必填，枚举 XS|S|M|L|XL
priority: P1                       # 必填，枚举 P0|P1|P2
deadline: 2026-05-15               # 必填，ISO 日期
stage: intake                      # 必填，枚举 intake|design|code|check|delivered
status: pending                    # 必填，枚举 pending|in_progress|done|blocked
goal: "..."                        # 必填
acceptance:                        # 必填，≥1 条（M≥2，L≥3）
  - "当管理员配置角色时，系统应保存到 user_role 表"
affects_modules: [user, auth]      # 可选；填了会参与 /intake 并行冲突软提示
# M/L/XL 额外字段见 .ai-config/rules/06_requirement.mdc
---
```

### 3.2 设计文档（design/REQ-xxx-design.md）

```yaml
---
need_id: REQ-20260424-001
stage: design
reviewers: [architect]
status: draft                       # draft|approved
invariants_respected: true          # 老项目必须为 true
---
```

**老项目正文强制章节**：`## 现状基线`（schema 校验）。

### 3.3 编码完成报告（design/REQ-xxx-code-report.md）

```yaml
---
need_id: REQ-20260424-001
stage: code
files_added: [src/.../UserDO.java, ...]
files_modified: []
db_migrations: [V20260424_01__add_user_role.sql]
self_check_passed: true
---
```

### 3.4 测试报告（test/REQ-xxx-test.md）

```yaml
---
need_id: REQ-20260424-001
stage: check
test_pass_rate: 100
coverage: 92
blockers: 0                         # 数字，0 才能 /deliver
conclusion: pass                    # pass|fail
---
```

### 3.5 审查报告（review/REQ-xxx-review.md）

```yaml
---
need_id: REQ-20260424-001
stage: check
blockers: 0
warnings: 2
conclusion: pass                    # pass|fail
---
```

### 3.6 交付报告（delivery/REQ-xxx-delivery.md）

```yaml
---
need_id: REQ-20260424-001
stage: delivered
released_at: 2026-04-24
rollback_verified: true
---
```

### 3.7 项目上下文（_context/project-map.md，老项目）

```yaml
---
kind: project-map                   # 必填，固�