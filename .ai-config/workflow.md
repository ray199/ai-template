# AI 编程工作流 · 跨平台事实源

> 本文件是**唯一事实源**。Claude Code / Cursor / Codex / Trae 等不同平台的命令配置都应引用本文件，不要把执行逻辑写到各自的适配层里。
>
> 修改工作流时只改这一份。

---

## 0. 术语

- **命令（command）**：用户显式触发的工作流入口，5 个：`/pg:init` `/pg:intake` `/pg:design` `/pg:code` `/pg:check` `/pg:deliver`，加 1 个可选 `/pg:prototype`
- **产出物（artifact）**：命令执行后必须生成的文件，受 schema 约束
- **前置校验（precondition）**：命令开始前必须满足的文件存在性 / 字段条件，不满足即终止
- **后置校验（postcondition）**：命令结束后对产出物跑 schema 检查，失败即回退状态

---

## 1. 工作量等级

| 等级 | 触发条件 | 工期 | 需要 `/pg:design` | 需要 `/pg:prototype` | 需要 `/pg:check` 独立报告 |
|---|---|---|---|---|---|
| **XS** | 改文案、加字段、调样式，≤ 30 分钟 | <1 天 | 否 | 否 | 否（合并到 PR 描述） |
| **S** | 单文件新增、≤ 1 个页面 | 1-2 天 | 否 | 否 | 否（合并到 PR 描述） |
| **M** | 新增模块、2-4 页面、新表 | 3-5 天 | 是（轻量） | 视情况 | 是 |
| **L** | 跨模块改造、5+ 页面、有技术风险 | 1-2 周 | 是（完整） | 强烈建议 | 是 |
| **XL** | 整体重构、需拆分迭代 | 4 周+ | 是（完整 + 拆分） | 必须 | 是 |

**XS 快车道**：允许跳过 `/pg:intake` 结构化阶段。只要在 git commit 里写 `XS: 一句话描述` 即可，走 PR review 流程。

---

## 2. 命令契约

### 2.0 `/pg:explore <想法>`（可选，pre-intake）

**目的**：模糊想法的前置脑暴——用户连 /pg:intake 的三个基础问题都答不清楚时使用。

**输入**：一句话想法（"我想做 xxx 平台" / "要不要引入 xxx" / "类似 yyy 但有差异"）。

**流程**（5 步，可中途停止）：
1. 问题框定（5 Whys：谁痛 / 凑合代价 / 已有方案为什么不够）
2. 维度拆解（按场景挑：生命周期 / 权限 / 数据 / 交互 / 运维 / 扩展 / 性能 / 集成）
3. 候选方案对比（2–3 个差异化路径）
4. 边界与陷阱扫描
5. 未知识别（谁来答 / 不答的代价）

**产出**：`docs/_exploration/EXPLORE-YYYYMMDD-<slug>.md`

**关键约束**：
- 不分配 need_id，不进 backlog
- 不走 schema 校验（草稿状态）
- 不计工作量（XS/S/M/L/XL 不适用）

**下一步**：
- 想清楚了 → `/pg:intake`（探索笔记作为 background 输入，填写效率大幅提高）
- 要验证 → 列出 POC / 调研 / 访谈动作
- 决定不做 → 归档到 `docs/_exploration/dropped/`

执行细节见 `.ai-config/skills/idea-exploration/SKILL.md`。

---

### 2.1 `/pg:init`

**目的**：检测项目语言和现状，建立 `.ai-config/` 和 `docs/` 骨架。

**前置校验**：无。

**执行步骤**：
1. 扫描项目根目录（pom.xml / package.json / requirements.txt / *.csproj）识别技术栈
2. 判定项目类型：`new`（无业务代码）/ `existing`（有业务代码）
3. 新项目：生成 `docs/`、`.ai-config/` 目录骨架
4. 老项目：额外生成 `docs/_context/project-map.md`（表清单 / 接口清单 / 模块清单 / 不可变约束）
5. 老项目可选：扫 src/ 提取视觉基线写入 project-map 的 `## 视觉基线` 段
6. **生成或追加 CLAUDE.md**（必做）：检测项目根目录大写 `CLAUDE.md`：无则按 `.ai-config/skills/init/templates/claude-md-template.md` 生成；有则检查是否引用 workflow.md，未引用询问用户是否追加规范引用块。**严格用大写文件名**——Claude Code 官方约定
7. **Skill Registry 生成**（必做）：扫 3 个位置的 skill（`.ai-config/skills/`、`.claude/skills/`、用户级 `~/.claude/skills/` 或 `%APPDATA%/Claude/skills/`），按类型（脚手架/领域/工具）分类生成 `docs/_context/skill-registry.md`，让 `/pg:design` `/pg:code` 知道项目里有什么 skill 可用。registry 不走 schema 校验。具体见 init SKILL Step 5.6

**后置校验**：
- `.ai-config/workflow.md` 存在
- 项目根目录 `CLAUDE.md`（大写）存在
- 老项目必须有 `docs/_context/project-map.md` 非空
- skill-registry.md 存在（即使内容为空——表示已扫描，没找到额外 skill）

**产出物**：目录结构 + `CLAUDE.md`（按需）+ `project-map.md`（老项目）+ `skill-registry.md`

---

### 2.2 `/pg:intake <需求描述>`

**目的**：需求结构化 + 工作量评估 + 伪需求扫描，一步完成。

**前置校验**：无。

**执行步骤**：
1. 【Step 0】**Exploration 引用**：扫 `docs/_exploration/`（排除 `dropped/`），列出所有 EXPLORE-*.md 草稿让用户选择是否引用为 background；引用则该笔记 `status: draft → graduated`，且后续 Step 0B/Step 1 跳过笔记已答的维度
2. 【Step 0A】项目上下文感知：读取 `docs/_context/project-map.md`（若存在）+ 扫描历史 `docs/requirements/done/`
3. 【Step 0B】输入质量识别：T1（一句话）/ T2（零散）/ T3（半结构化）/ T4（完整 PRD），按质量决定澄清问题数量
4. 【Step 1】结构化:按等级填写字段（XS:2 个；S:6 个；M:10 个；L:15 个；XL:L + 拆分计划）。**写盘前必须给用户预览，确认后才落盘**
5. 【Step 2】工作量评估：业务 5 维 + 技术 4 维打分，判等级
6. 【Step 3】伪需求扫描：重复建设 / 价值存疑 / 逻辑冲突 / 技术可行性
7. 【Step 4】产出物清单 — **强制中断点 · 按等级逐项询问**：按 workload 动态展示清单，分【已完成】（requirement.md 已落盘）+【待决定】两块。**AI 必须停下等用户逐项回复，不得自行判定后跳过**。
   - **PRD 可读版**（仅 M / L / XL 可选；S 级不展示）：从 requirement.md 自动转写为给业务方 / 老板看的人话版本，落盘 `docs/requirements/backlog/REQ-xxx-prd.md`。模板见 `intake-requirement/templates/prd-readable.md`。**不走 schema 校验**（叙事性文档）。S 级不展示理由：单文件小改动给业务方写正式 PRD 是小题大做
   - **UI 原型**（所有等级可选；XL 必须）：选 Y 衔接 /pg:prototype
   - **必填字段**（M+：tech_sketch；L+：+ stakeholders / non_functional / risks；XL+：+ iteration_plan / milestones）：AI 已生成草稿，用户审核 [Y/调整]——不允许 N（schema 强制）
8. 【Step 5】并行冲突软提示：若填写 `affects_modules`，扫 `docs/requirements/backlog/*.md` 其他 in-flight 需求并打印交集（仅提示，不阻断）

**后置校验**：运行 `validate-doc.js requirement <need_id>`，失败退出码 1。

**产出物**：`docs/requirements/backlog/REQ-YYYYMMDD-XXX.md`（带 YAML front-matter）

**下一步告知**：
- XS/S → `/pg:code REQ-xxx`
- M/L/XL → `/pg:design REQ-xxx`
- 🔴 阻断 → 解决后重跑 `/pg:intake`

---

### 2.3 `/pg:design REQ-xxx`

**目的**：技术设计文档。

**前置校验**：
- `docs/requirements/backlog/REQ-xxx.md` 存在且 `workload in [M, L, XL]`
- 若 `docs/design/REQ-xxx-design.md` 已存在则确认覆盖

**执行步骤**：
1. **Step 0 · 前置物全集扫描**（必做）：按下表顺序读全。缺必读项必须先告诉用户补全或显式跳过，不得边设计边猜：
   | 文件 | 必读条件 | 在设计中的作用 |
   |---|---|---|
   | `docs/requirements/backlog/REQ-xxx.md` | 总是必读 | What + Why + acceptance + scope + tech_sketch |
   | `docs/requirements/backlog/REQ-xxx-prd.md`（PRD 可读版） | 若存在必读 | 业务方表述的用户故事 + 主流程 |
   | `docs/prototype/REQ-xxx.{html,wireframe.md,figma}` | 若存在必读 | 决定接口入参出参 + UI 规划 |
   | `docs/_exploration/EXPLORE-*.md`（front-matter `graduated_to == REQ-xxx`） | 若存在必读 | 候选方案对比 + 已知坑 + 待答问题 |
   | `docs/_context/project-map.md` | 老项目必读 | 模块 / 表 / 接口 / **不可变约束** / 项目原则 / 视觉基线 |
   
   **多 REQ 隔离规则（防漏 / 多读）**：
   - 探索笔记**只读 graduated_to == REQ-xxx 的**；老笔记无此字段时主动问用户后回写
   - 禁止引用其他 REQ 的 design.md / code-report.md（除非用户显式说"参考 REQ-yyy"）
   - done/ 历史 REQ 产出物只在用户显式提及时读
   - 必读缺失 → 阻断；若存在必读缺失 → 软告警让用户确认
2. 架构影响分析（新项目：模块定义；老项目：严格遵守 project-map 的 `invariants`）
3. **现状基线（仅老项目，强制）**：在 design 文档正文写 `## 现状基线` 章节，列出：涉及模块、现有行为（改动前的输入输出语义）、已知坑、本次保留 vs 重写
4. 数据库设计：DDL、迁移脚本、回滚方案
5. 接口设计：URL / Method / 请求响应 / 错误码
6. 前端 UI 设计（若含前端）：页面、组件、状态、API 调用层
7. 关键实现路径 + 风险点
8. **任务拆解（L / XL 强制；M 建议）**：在 design 文档正文写 `## 任务拆解` 章节，包含表格 `ID | 任务 | 依赖 | 验收对应 | 预估 | 备注`。每行 ID 必须 `T<数字>` 形式，"验收对应"列引用 requirement.md 中的 acceptance 编号（A1/A2...），至少 1 行任务。表格后注明关键路径和并行机会
9. **重构 / 迁移类需求额外要求**：任务表后追加"迁移顺序"段（每步标注是否可独立合并）和"回滚边界"（哪一步之前可回滚，哪一步是不可逆点）

**后置校验 + 自检修复循环**：写盘后立即跑 `validate-doc.js design REQ-xxx`：
- 退出码 0 → 完成，告知下一步 /pg:code
- 退出码非 0 → AI 必须按报错提示**自动补章节后重写** design.md，重试最多 3 次；3 次仍失败才告知用户人工介入
- **AI 不允许把 schema 失败丢给用户**，更不允许在失败时直接进入下一步

校验项：
- 老项目：`## 现状基线` 章节存在
- L / XL：`## 任务拆解` 章节存在 + 表头列名（ID / 任务 / 依赖 / 验收 / 预估）+ 至少一行 T<数字> 任务

**产出物**：`docs/design/REQ-xxx-design.md`

**下一步**：`/pg:code REQ-xxx`

---

### 2.4 `/pg:code REQ-xxx [--frontend|--backend|--db|--resume]`

**目的**：生成源代码 + 数据库脚本 + 测试骨架，**支持断点续作**。

**前置校验**：
- `docs/requirements/backlog/REQ-xxx.md` 存在
- 若 workload ∈ {M,L,XL}：`docs/design/REQ-xxx-design.md` 必须存在

**执行步骤**：
1. 【Step 0】版本上下文扫描：检测项目技术栈 + 新老项目分支
2. 【Step 0.5】**断点检测**：检查 `docs/code/REQ-xxx-progress.md`：
   - 不存在 → 全新执行；按 design 任务表初始化 progress.md（所有 T 状态 ⏳ pending）
   - 存在 status=in-progress / blocked → 进入断点恢复模式；不带 `--resume` 须主动询问"上次中断在 T_n，是否续作？"
   - 存在 status=done → 默认拒绝重做（保护已交付代码）
3. 读取输入文档（XS/S 读需求，M/L/XL 读设计 + progress）
4. **逐 T 执行**（每个 T 完成必维护 progress.md，详见下方协议）：
   - 后端代码：Entity / Mapper / Service / Controller / VO / 迁移脚本 / 测试骨架
   - 前端代码（若含前端）：页面 / 组件 / Hook / API 调用层
5. 自检：命名、日志、异常、事务、权限、@Valid
6. 全部 T 完成后输出 code-report.md，把 progress.md 状态置 done

**断点维护协议**（L / XL 强制；M 建议；XS/S 不要求）：

| 时机 | 必做动作 |
|---|---|
| 开始 T_n | 表格 T_n 行 `⏳ pending → 🟡 doing`；`fm.current_task=T_n`；重写"当前断点"段；刷新 `updated_at` |
| 每次 Write/Edit | 仅更新"当前断点"段的"已写到"行（文件路径 + 行号），其他不动 |
| T_n 完成 | 表格 `🟡 doing → ✅ done`，填输出文件 / 单测 / 完成时间；`git commit` 代码 + progress.md；commit hash 写回表格 + `git commit --amend --no-edit`；`fm.done_tasks +1` |
| 全部完成 | `fm.status=done`，`fm.current_task=—`，输出 code-report |

**`--resume` 入口**：跳过所有 ✅ done，从 🟡 doing 的 T 的"当前断点"行号续写；重新加载 design / requirement / project-map 重建上下文。

**后置校验**：
- 运行 `validate-doc.js code-report REQ-xxx`
- L / XL 级追加：`validate-doc.js code-progress REQ-xxx`（必须 status=done）
- 若 workload ∈ {XS, S}：允许不生成 code-report 和 progress；commit message 必须覆盖变更摘要
- 若 workload ∈ {M}：code-report 必须；progress 建议
- 若 workload ∈ {L, XL}：code-report + progress 都必须

**产出物**：源代码 + 迁移脚本 + （M/L/XL）code-report.md +（L/XL 强制）`docs/code/REQ-xxx-progress.md`

**下一步**：`/pg:check REQ-xxx`

---

### 2.5 `/pg:check REQ-xxx`

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
- 无 🔴 → `/pg:deliver REQ-xxx`
- 有 🔴 → 修复后重跑 `/pg:check`

---

### 2.6 `/pg:deliver REQ-xxx`

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

### 2.7 `/pg:prototype REQ-xxx`（可选）

**目的**：按需手动生成原型（HTML / Figma / 线框图）。`/pg:intake` Step 4 已询问；本命令用于单独生成或重新生成。

**前置校验**：`docs/requirements/backlog/REQ-xxx.md` 存在。

**执行步骤**（HTML 原型必做）：
1. **Step 0 · 视觉基线扫描**（强制中断点，按优先级读取）：
   - 优先级 1：读 `docs/_context/project-map.md` 的 `## 视觉基线` 段——若 `/pg:init` 已扫描记录，直接采用，跳过即时扫描
   - 优先级 2：项目无该段时即时扫 `docs/prototype/*.html` + `src/` + project-map 的不可变约束 / 项目原则
   - 扫描后建议把结果回写到 `## 视觉基线` 段，下次直接读
2. **Step 0.5 · 基线参照检查**（老项目专属强制中断点；新项目跳过）：
   - 解析当前 REQ 涉及的页面（从 design.md 的"页面清单"或 acceptance 推断）
   - 检查 `docs/prototype/baseline/<page>.html` 是否已存在
   - 不存在 → 主动询问用户是否反推（默认 N）；选 Y 则按 `prototype-generation/templates/baseline-snapshot.md` 规则从 `src/views/<Page>.vue` 反推 HTML 快照，落盘 `docs/prototype/baseline/`，并更新 `baseline/README.md`
   - 已存在 → 直接采用为"改动前"参照
3. 按结果分流（视觉基线）：命中 → 模式 A 沿用；仅命中 UI 库 → 模式 B 默认主题；完全无基线 → 模式 C 5 选 1
4. 必须把视觉基线 / 基线参照状态展示给用户，**停下等用户确认风格选择和是否反推基线**后才能生成
5. 生成新原型时：
   - 有基线参照 → 输出**双栏对比 HTML**（左"改动前 / 基线"，右"改动后 / 目标态"）+ 顶部"本次改动摘要"
   - 无基线参照 → 仅生成目标态原型（原行为）

**理由**：
- 视觉基线沿用 → 避免同项目多原型视觉漂移、老项目原型对不上现有页面
- 基线参照对比 → 业务方能直观看到"改动前 vs 改动后"，AI 生成新原型有锚点不会突兀，新需求评估更准确

**产出物**：`docs/prototype/REQ-xxx.{html|figma|md}`

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
  # M/L/XL 至少 1 条须为 BDD 格式（含 GIVEN/WHEN/THEN 或 给定/当/则）
  - "GIVEN 管理员已登录 · WHEN 提交角色配置 · THEN 写入 user_role 表并返回 200"
  - "当管理员配置角色时，系统应保存到 user_role 表"
affects_modules: [user, auth]      # 可选；填了会参与 /pg:intake 并行冲突软提示
# M/L/XL 额外字段见 .ai-config/rules/06_requirement.mdc
---
```

### 3.1.1 PRD 可读版（backlog/REQ-xxx-prd.md，可选）

给业务方 / 老板 / 非技术干系人看的人话版本，由 `/pg:intake` Step 4 询问用户后可选生成。

**特点**：
- **不走 schema 校验**——叙事性文档，强加 schema 会僵化
- **信息源**：从 `REQ-xxx.md` 字段自动转写（background