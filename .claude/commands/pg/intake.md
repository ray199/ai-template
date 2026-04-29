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

**Step 0 优先：扫描 docs/_exploration/（在执行 Step 0A 之前必做）**：

若 `docs/_exploration/` 目录存在，列出其中所有 `EXPLORE-*.md` 文件（排除 `dropped/` 子目录）：

1. 按 `created_at` 倒序展示给用户：
   ```
   📓 检测到以下未归档的探索笔记，是否引用？
     [1] EXPLORE-20260427-bi-platform.md（2026-04-27，status: draft）
     输入编号引用对应笔记作为 background 输入；输入 N 跳过；输入 A 引用全部
   ```
   ⚠️ **必须停下等用户回复后再继续**。

2. 若用户引用某份：
   - 把笔记内容作为 background 输入，自动填入 `background` 字段
   - 把"问题框定 / 维度拆解 / 候选方案"等关键结论作为字段补全的依据
   - 跳过相同维度的澄清问题（笔记已答过的不再问）
   - 状态：`status: draft` → 改成 `status: graduated`

**草稿预览（生成前必做的强制中断点）**：

完成 Step 1 字段填写后、写盘前必须先把结构化结果展示给用户预览。
⚠️ **必须停下等用户回 Y 或调整指令后才能落盘** `docs/requirements/backlog/REQ-xxx.md`。

**并行冲突软提示（不阻断）**：

requirement 文档落盘后，若填写了 `affects_modules: [...]`，扫描其他在制品需求并打印交集警告（仅提示）。

**后置校验（强制门）**：

```bash
node .ai-config/scripts/validate-doc.js requirement <need_id>
```

退出码非 0 则不得告知用户进入下一阶段，必须先修正产出物。

---

## Step 4 · 推荐附加产出物（强制中断点 · 按等级逐项询问）

⚠️ **AI 必须按用户实际 workload 等级动态构造清单**——不要列出无关等级的项。
⚠️ **必须停下等用户逐项回复后才能进入 Step 5**。

### 按等级展示的清单

**XS 级**：不走 /pg:intake，跳过本步。

**S 级**：
```
📦 工作量 S 级附加产出物：

  □ [1] UI 原型（仅当涉及前端页面变更时建议；判定得分 X 分）
        → 选 Y 自动跑 /pg:prototype REQ-xxx
        → 选 N 跳过

请回 [Y/N]：
```

**M 级**：
```
📦 工作量 M 级附加产出物：

  □ [1] UI 原型（[视情况/推荐]，判定得分 X 分）→ 选 Y 自动跑 /pg:prototype
  □ [2] tech_sketch（M 必填字段，AI 已生成草稿）→ 请审核：
        【草稿】
        受影响模块：...
        初步架构思路：...
        关键决策点：...
        → 选 Y 写入需求文档
        → 选"调整 [新内容]"按你的修改写入

请逐项回复：
  [1] Y/N？
  [2] Y / 调整 ...？
```

**L 级**：
```
📦 工作量 L 级附加产出物：

  □ [1] UI 原型（强烈建议，判定得分 X 分）→ 选 Y 自动跑 /pg:prototype
  □ [2] tech_sketch（L 必填，已生成草稿）→ 请审核 → Y 写入 / 调整 [...]
  □ [3] stakeholders（L 必填）→ Y 写入 AI 推断的草稿 / 调整 [...]
  □ [4] non_functional（L 必填，性能/兼容性/安全）→ 同上
  □ [5] risks（L 必填，至少 1 项）→ 同上

请逐项回复 [Y/N/调整]。
```

**XL 级**：
```
📦 工作量 XL 级附加产出物：

  □ [1] UI 原型（必须，判定得分 X 分）→ 选 Y 自动跑 /pg:prototype
  □ [2] tech_sketch（已生成草稿）→ Y / 调整 [...]
  □ [3] stakeholders（已推断）→ Y / 调整 [...]
  □ [4] non_functional（已推断）→ Y / 调整 [...]
  □ [5] risks（已推断 ≥1 项）→ Y / 调整 [...]
  □ [6] iteration_plan（XL 必填，已拆分草稿）→ 请审核 → Y / 调整
  □ [7] milestones（XL 必填，已生成时间节点）→ Y / 调整

请逐项回复。也可输入 A 全部接受默认草稿；S 部分接受（如 1Y 2Y 3 调整 ...）。
```

### 用户回复后立刻执行

| 用户选 | AI 动作 |
|---|---|
| `[k] Y` | 把对应字段草稿写入需求文档（schema 必填字段必须落盘）；UI 原型项额外衔接 `/pg:prototype` |
| `[k] 调整 [新内容]` | 按用户指定的内容写入对应字段 |
| `[k] N` | 仅 UI 原型可选 N（其他都是 schema 必填，强制落盘）；UI 原型选 N 在最终下一步告知中再次提醒 |

⚠️ **必填字段（tech_sketch / stakeholders / non_functional / risks / iteration_plan / milestones）不允许 N**。如果 schema 强制要求但用户回 N，AI 必须改问"那要怎么填？"——不允许跳过。

**下一步路由（依据需求文档 `workload` 字段）**：
- `XS` / `S` → `/pg:code <need_id>`
- `M` / `L` / `XL` → `/pg:design <need_id>`
- 伪需求扫描 🔴 → 修复后重跑 `/pg:intake`
- UI 原型选 N → 提醒可单独跑 `/pg:prototype <need_id>`
