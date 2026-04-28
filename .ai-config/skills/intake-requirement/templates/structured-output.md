# 需求结构化输出样例

> Step 1 输出。落地到 `docs/requirements/backlog/REQ-YYYYMMDD-XXX.md`。

## 完整性检查通过时

```markdown
---
need_id: REQ-YYYYMMDD-XXX
title: [需求标题]
workload: M
priority: P1
deadline: YYYY-MM-DD
stage: intake
status: pending
goal: "..."
acceptance:
  - "当 X 时，系统应 Y"
  - "当 A 时，系统应 B"
affects_modules: [user, auth]
---

# 需求文档：[需求标题]

## 基本信息
[完整字段内容...]

## 背景与目标
[完整字段内容...]

## 范围（in / out）
- 包含：...
- 不包含：...

## 技术约束
- 技术栈：...
- 依赖系统：...
- 兼容性要求：...

## ✅ 完整性检查结果

所有必填字段已验证通过，准备进入【Step 2】工作量联合评估。
```

## 完整性检查未通过时（澄清问题清单）

```markdown
## ⚠️ 需要补充的信息

以下字段必须补充后才能进入工作量评估阶段：

| # | 字段 | 当前状态 | 需要确认 | 重要性 |
|---|---|---|---|---|
| 1 | goal | 未提及 | 目标需要可量化（"将 XX 从 XX 提升到 XX"） | 必须 |
| 2 | acceptance | 仅 1 条 | 至少需要 2 条验收标准（M 级） | 必须 |
| 3 | scope.out | 未提及 | 需要明确说明不做什么 | 建议 |

请补充上述字段后，使用指令 `/pg:intake REQ-XXXXXXXX` 重新提交。
```

## 无法解析或不符合规范时

```markdown
## ❌ 无法完成结构化

原始内容信息量不足，无法识别以下核心要素：
- [ ] 需求目标不明确（无法回答"为什么要做"）
- [ ] 功能边界未定义（不清楚做什么/不做什么）
- [ ] 验收标准不可验证（"做好一点"等模糊表述）
- [ ] 其他：[说明]

建议：
- 想法模糊：先走 `/pg:explore` 收敛
- 信息不足：参考模板 `templates/from_verbal.md` 补充信息后重新提交
```
