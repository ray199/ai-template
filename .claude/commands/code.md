---
name: code
description: 编码实现 - 生成源码 + DB 脚本 + 测试骨架
argument-hint: [REQ-XXXXXXXX | --frontend | --backend | --db]
---

按 @.ai-config/workflow.md 第 **2.4 节（/code）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：@.ai-config/skills/coding-impl/SKILL.md

**前置校验（缺一终止）**：
- `docs/requirements/backlog/$ARGUMENTS.md` 存在
- 若 `workload` ∈ {M, L, XL}：`docs/design/$ARGUMENTS-design.md` 必须存在
- 老项目必须读取 `docs/_context/project-map.md`，沿用原包结构，不得改动 `invariants` 声明的部分

**代码规范参考**：
- 通用：@.ai-config/rules/02_code_style.mdc
- 安全：@.ai-config/rules/03_security.mdc
- 语言专项：@.ai-config/skills/code-review/java-code-review-checklist.md / vue-code-review-checklist.md / dotnet-code-review-checklist.md / python-code-review-checklist.md

**后置校验（强制门，按等级分级）**：

- XS / S：跳过 code-report，但 commit message 必须覆盖变更摘要（走 `.ai-config/scripts/git-hooks/commit-msg`）
- M / L / XL：
  ```bash
  node .ai-config/scripts/validate-doc.js code-report $ARGUMENTS
  ```

**下一步**：`/check $ARGUMENTS`
