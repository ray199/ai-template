---
name: intake
description: 需求接入 - 结构化 + 工作量评估 + 伪需求扫描
argument-hint: [需求描述、飞书消息、会议纪要或完整PRD]
---

按 @.ai-config/workflow.md 第 **2.2 节（/pg:intake）** 的契约执行。

需求输入：$ARGUMENTS

**执行规范参考**：
- @.ai-config/skills/intake-requirement/SKILL.md
- @.ai-config/skills/intake-requirement/workload-evaluation.md
- @.ai-config/skills/intake-requirement/pseudo_checklist.md

**Step 0 优先：扫描 docs/_exploration/（必做）**：

若 `docs/_exploration/` 目录存在，列出 EXPLORE-*.md 让用户选择是否引用为 background。
⚠️ **必须停下等用户回复后再继续**。引用则笔记 `status: draft → graduated`，跳过笔记已答的维度。

**草稿预览（强制中断点）**：

完成 Step 1 字段填写后、写盘前必须先把结构化结果展示给用户预览。
⚠️ **必须停下等用户回 Y 或调整指令后才能落盘** `docs/requirements/backlog/REQ-xxx.md`。

**并行冲突软提示（不阻断）**：

若填写了 `affects_modules`，扫描其他在制品需求并打印交集警告。

**后置校验（强制门）**：

```bash
node .ai-config/scripts/validate-doc.js requirement <need_id>
```

退出码非 0 则不得告知用户进入下一阶段。

---

## Step 4 · 产出物清单 + 附加项询问（强制中断点）

⚠️ **AI 必须按用户实际 workload 等级动态构造清单**。
⚠️ **必须停下等用户逐项回复后才能进入 Step 5**。

清单分两类：
- **【已完成】**——Step 1 已落盘的产出物（让用户安心知道 PRD 主体已生成）
- **【待决定】**——附加产出物（含必填字段草稿审核 + 可选 PRD 可读版 / UI 原型）

### S 级清单

```
📦 工作量 S 级 · 产出物清单

【已完成】
  ✅ 结构化需求文档：docs/requirements/backlog/REQ-xxx.md（开发 / AI 用，schema-controlled）

【待决定 · 附加产出物】
  □ [1] UI 原型（仅当涉及前端页面变更时建议；判定得分 X 分）
        → Y 自动跑 /pg:prototype REQ-xxx
        → N 跳过

请回 [Y/N]：
```

### M 级清单

```
📦 工作量 M 级 · 产出物清单

【已完成】
  ✅ 结构化需求文档（10 个核心字段已填）

【待决定 · 附加产出物】
  □ [1] PRD 可读版（给业务方看的人话版）→ Y 生成 -prd.md / N 跳过
  □ [2] UI 原型（[视情况/推荐]，得分 X 分）→ Y 衔接 /pg:prototype / N 跳过
  □ [3] tech_sketch（M 必填字段，AI 已生成草稿）→ 请审核：
        【草稿】受影响模块：... | 初步架构思路：... | 关键决策点：...
        → Y 写入 / 调整 [新内容]

请逐项回复：
  [1] Y/N？
  [2] Y/N？
  [3] Y / 调整 ...？
```

### L 级清单

```
📦 工作量 L 级 · 产出物清单

【已完成】
  ✅ 结构化需求文档

【待决定 · 附加产出物】
  □ [1] PRD 可读版 → Y 生成 -prd.md / N 跳过
  □ [2] UI 原型（强烈建议，得分 X 分）→ Y 衔接 /pg:prototype
  □ [3] tech_sketch（L 必填，已生成草稿）→ Y / 调整 [...]
  □ [4] stakeholders（L 必填）→ Y / 调整 [...]
  □ [5] non_functional（L 必填，性能/兼容/安全）→ Y / 调整 [...]
  □ [6] risks（L 必填，至少 1 项）→ Y / 调整 [...]

请逐项回复 [Y/N/调整]。
```

### XL 级清单

```
📦 工作量 XL 级 · 产出物清单

【已完成】
  ✅ 结构化需求文档（10 字段，含 acceptance ≥3 含 BDD）

【待决定 · 附加产出物】
  □ [1] PRD 可读版（给业务方 / 老板，强烈建议）→ Y 生成 -prd.md / N 跳过
  □ [2] UI 原型（必须，得分 X 分）→ Y 衔接 /pg:prototype
  □ [3] tech_sketch（必填，已生成草稿）→ Y / 调整 [...]
  □ [4] stakeholders（必填）→ Y / 调整 [...]
  □ [5] non_functional（必填）→ Y / 调整 [...]
  □ [6] risks（必填 ≥1 项）→ Y / 调整 [...]
  □ [7] iteration_plan（XL 必填，已拆分草稿）→ Y / 调整
  □ [8] milestones（XL 必填，已生成时间节点）→ Y / 调整

请逐项回复。也可输入 A 全部接受默认草稿；S 选择性输入（如 1Y 2Y 3 调整 ...）。
```

### 用户回复后立刻执行

| 用户选 | AI 动作 |
|---|---|
| `[1] Y`（PRD 可读版） | 按 `templates/prd-readable.md` 模板，从 requirement.md 字段转写，生成 `docs/requirements/backlog/REQ-xxx-prd.md`。**不走 schema 校验** |
| `[k] Y`（UI 原型） | 衔接 `/pg:prototype REQ-xxx` 命令 |
| `[k] Y`（必填字段） | 把对应字段草稿写入需求文档 |
| `[k] 调整 [新内容]` | 按用户指定的内容写入对应字段 |
| `[k] N` | 仅 PRD 可读版 / UI 原型可选 N（其他都是 schema 必填） |

⚠️ **必填字段（tech_sketch / stakeholders / non_functional / risks / iteration_plan / milestones）不允许 N**——schema 会拦。AI 必须改问"那要怎么填？"

**下一步路由**：
- `XS` / `S` → `/pg:code <need_id>`
- `M` / `L` / `XL` → `/pg:design <need_id>`
- 伪需求扫描 🔴 → 修复后重跑 `/pg:intake`
- PRD 可读版 / UI 原型选 N → 提醒可单独补
