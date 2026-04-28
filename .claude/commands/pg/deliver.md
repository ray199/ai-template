---
name: deliver
description: 交付 - 上线步骤 + 回滚方案 + 归档 + 沉淀
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.6 节（/pg:deliver）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：@.ai-config/skills/delivery/SKILL.md

**前置校验（缺一终止）**：
- `workload` ∈ {M, L, XL}：`docs/test/$ARGUMENTS-test.md` + `docs/review/$ARGUMENTS-review.md` 存在
- 测试报告 `conclusion: pass` 且 `blockers: 0`
- 审查报告 `conclusion: pass` 且 `blockers: 0`
- XS / S：PR 已合并且 PR 描述包含测试 + 审查结论

**后置校验（强制门）**：

```bash
node .ai-config/scripts/validate-doc.js delivery $ARGUMENTS
```

**归档动作**：把 `docs/requirements/backlog/$ARGUMENTS.md` 及关联文档移到 `docs/requirements/done/$ARGUMENTS/`。

**收尾沉淀（两个提示，不阻断）**：

交付完成后在给用户的最后一段输出里追加这两问，一次性让用户答：

1. **回写 project-map**：
   ```
   📝 本次是否发现新的项目不变量 / 技术债 / 架构决策需要沉淀到 docs/_context/project-map.md？
      如是，请直接列出（格式：- [invariant|debt|decision] 一句话描述）
      我会 append 到 project-map 的 "## 追加记录" 小节下，带本 REQ 号和日期。
   ```

2. **review 回流规则**：
   ```
   📝 本次 review 是否发现可沉淀到 .ai-config/rules/ 的反模式？
      如是，列一句话，我会在 docs/_changelog/ 记一条待沉淀项（下次规则升级时批处理）。
   ```

用户答"无"就跳过，答具体内容就执行写入动作。整段不做强制校验，也不影响归档结果。
