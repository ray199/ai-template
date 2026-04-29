---
name: code
description: 编码实现 - 生成源码 + DB 脚本 + 测试骨架（支持断点续作）
argument-hint: [REQ-XXXXXXXX | --frontend | --backend | --db | --resume]
---

按 @.ai-config/workflow.md 第 **2.4 节（/pg:code）** 的契约执行。

需求ID：$ARGUMENTS

**执行规范参考**：@.ai-config/skills/coding-impl/SKILL.md

**断点续作（Step 0.5 必做）**：

进入正式编码前先检查 `docs/code/$ARGUMENTS-progress.md`：

- **不存在** → 全新执行，按 design.md 任务表初始化 progress.md（所有 T 状态 ⏳ pending）
- **存在 status=in-progress / blocked**：
  - 不带 `--resume` → **必须主动询问**用户"上次中断在 T_n（断点段：...），是否续作？" 不要无脑重头开
  - 带 `--resume` → 直接进入断点恢复模式（跳过 ✅ done 的 T，从 🟡 doing 续写）
- **存在 status=done** → 询问用户是否真要重做（默认 No，避免覆盖已交付代码）

**每个 T 完成必做**（强制，详见 SKILL.md "断点续作机制 · 每 T 维护协议"）：

1. progress 表 T_n 行：🟡 doing → ✅ done（填输出文件 / 单测 / 完成时间）
2. `git add` 当前 T 涉及的代码文件 + progress.md → `git commit`
3. commit hash 写回 progress 表，再 `git commit --amend --no-edit`
4. fm.done_tasks +1，updated_at 刷新

**Skill Registry 加载**（若 `docs/_context/skill-registry.md` 存在）：

读 registry 内容，挑选适用本次编码的 skill 加载：
- **脚手架 / 框架** 段：所有项必读（强相关，影响代码风格 / 工程结构）
- **领域 / 业务** 段：按当前 REQ 涉及的领域名匹配（如本 REQ 涉及"支付"，加载 payment-* skill）
- **工具 / 通用** 段：按 description 自动判断
- **用户级** 段：使用前必须告知用户"该 skill 仅当前机器有，团队成员可能没装"

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
  node .ai-config/scripts/validate-doc.js code-progress $ARGUMENTS
  ```
  两份都须通过；progress.md 的 status 必须为 done 才能流转下一步。

**下一步**：`/pg:check $ARGUMENTS`
