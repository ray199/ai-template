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
