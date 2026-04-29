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

2. 若用户引用某份：
   - 把笔记内容作为 background 输入，自动填入 `background` 字段
   - 把"问题框定 / 维度拆解 / 候选方案"等关键结论作为字段补全的依据
   - 跳过相同维度的澄清问题（笔记已答过的不再问）
   - 状态：`status: draft` → 改成 `status: graduated`

3. 若用户跳过：照常走 Step 0A-Step 5

**并行冲突软提示（不阻断）**：

生成 requirement 文档时，若填写了 `affects_modules: [...]`（可选字段），在返回给用户"下一步"之前，多做一步：

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

**下一步路由（依据需求文档 `workload` 字段）**：
- `XS` / `S` → `/pg:code <need_id>`
- `M` / `L` / `XL` → `/pg:design <need_id>`
- 伪需求扫描 🔴 → 修复后重跑 `/pg:intake`
