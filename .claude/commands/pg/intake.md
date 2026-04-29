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
     [2] EXPLORE-20260420-permission.md（2026-04-20，status: graduated）
     输入编号引用对应笔记作为 background 输入；输入 N 跳过；输入 A 引用全部
   ```
   ⚠️ **必须停下等用户回复后再继续**，不得自行猜测引用与否。

2. 若用户引用某份：
   - 把笔记内容作为 background 输入，自动填入 `background` 字段
   - 把"问题框定 / 维度拆解 / 候选方案"等关键结论作为字段补全的依据
   - 跳过相同维度的澄清问题（笔记已答过的不再问）
   - 状态：`status: draft` → 改成 `status: graduated`

3. 若用户跳过：照常走 Step 0A-Step 5

**草稿预览（生成前必做的强制中断点）**：

完成 Step 1 字段填写后、写盘前，先把结构化结果展示给用户预览：

```
📝 已结构化为如下需求文档（尚未落盘）：
  need_id: REQ-YYYYMMDD-XXX
  title: ...
  workload: M
  acceptance:
    - ...

确认无误请回复 [Y]，否则告诉我哪里要改（字段名 + 新值）。
```

⚠️ **必须停下等用户回 Y 或调整指令后才能落盘**，不得自行写入 `docs/requirements/backlog/REQ-xxx.md`。

**并行冲突软提示（不阻断）**：

生成 requirement 文档落盘后，若填写了 `affects_modules: [...]`（可选字段），多做一步：

1. 扫描 `docs/requirements/backlog/*.md` 其他仍在流转中的需求
2. 对比各自的 `affects_modules`；若有交集，打印：
   ```
   ⚠️ 并行需求提示：
     本需求 affects_modules=[user, auth] 与以下需求有交集：
       REQ-20260420-003（affects_modules=[auth]，stage: design）
       REQ-20260422-001（affects_modules=[user]，stage: code）
     建议：开工前与相关需求负责人对齐接口 / 表结构修改计划。
   ```
3. 仅提示，不阻断流转。

**后置校验（强制门）**：

```bash
node .ai-config/scripts/validate-doc.js requirement <need_id>
```

退出码非 0 则不得告知用户进入下一阶段，必须先修正产出物。

**Step 4 · 推荐输出物（强制中断点 · 逐项询问）**：

工作量评估完成后，列出本等级推荐的**附加产出物**（requirement.md 已生成；这里只问额外的）：

```
📦 工作量 [X] 级建议生成以下附加输出物：

  □ [1] UI 原型（推荐/必需，分项得分 X 分）
  □ [2] 技术思路骨架（M/L/XL 必填字段，已尝试从笔记提取）
  □ [3] 迭代拆分计划 + 里程碑（仅 XL 必填）

请逐项决定（在 [ ] 内填 Y/N）：
  [1] Y/N？
  [2] Y/N？
  [3] Y/N？

或者输入 A 全部生成、N 全部跳过、S 选择性输入（如 1Y 2N 3Y）。
```

⚠️ **必须停下等用户回复**。AI 不得自行判定后跳过本步——这是用户的决策点，不是 AI 的判定点。

**用户回复后立刻执行**：
- `[1] Y` → 自动衔接 `/pg:prototype REQ-xxx`，完成原型生成
- `[2] Y` → 把 `tech_sketch` 字段从笔记提取的草稿转写为正式段，写入需求文档
- `[3] Y` → 在需求文档追加 `iteration_plan` + `milestones` 段
- 任一 N → 跳过，但在最终"下一步告知"里再次提醒可单独跑对应命令

**下一步路由（依据需求文档 `workload` 字段）**：
- `XS` / `S` → `/pg:code <need_id>`
- `M` / `L` / `XL` → `/pg:design <need_id>`
- 伪需求扫描 🔴 → 修复后重跑 `/pg:intake`
- Step 4 中选 N 的项目 → 提醒 `/pg:prototype <need_id>` 或单独补 `tech_sketch` / `iteration_plan` 字段
