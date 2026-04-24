---
name: check
description: 测试 + 代码审查，输出验收结论
argument-hint: [REQ-XXXXXXXX]
---

按 @.ai-config/workflow.md 第 **2.5 节（/check）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：
- @.ai-config/skills/testing/SKILL.md
- @.ai-config/skills/code-review/SKILL.md
- @.ai-config/skills/code-review/checklists.md

**前置校验（缺一终止）**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在
- 若 `workload` ∈ {M, L, XL}：`docs/design/$ARGUMENTS-code-report.md` 必须存在
- XS / S 级允许不做独立 report，只需 PR 描述覆盖测试 + 审查结论

**执行方式（按等级分级，做减法）**：

- **XS / S**：生成接口测试 curl 片段 + 5 维度 PR review 清单，结论写入 PR 描述。**不生成独立 test/review md**。
- **M**：生成 `docs/test/$ARGUMENTS-test.md` + `docs/review/$ARGUMENTS-review.md`
- **L / XL**：同 M，额外加并发和性能测试

**后置校验（强制门，仅 M/L/XL）**：

```bash
node .ai-config/scripts/validate-doc.js check $ARGUMENTS
```

**下一步**：
- 无 🔴 → `/deliver $ARGUMENTS`
- 有 🔴 → 修复后重跑 `/check`
