---
name: deliver
description: 交付 - 上线前检查清单(代码/DB/配置/测试/文档)，归档所有输出物，输出交付报告至 docs/delivery/
argument-hint: [REQ-XXXXXXXX]
---

# 技能：交付

代码审查通过后，执行上线前最后检查和交付收尾。确保需求从「代码合并」到「上线验证」全链路可追踪、可回滚。

需求ID：$ARGUMENTS

## 处理流程

```
[Step 1] 上线前检查清单（逐项确认）
         ↓
[Step 2] 输出交付报告（运维快查）
         路径：docs/delivery/REQ-XXXXXXXX-delivery.md
         内容：功能清单、影响范围、回滚方案、遗留问题
         ↓
[Step 3] 整理需求归档包（永久存档）
         路径：docs/requirements/done/REQ-XXXXXXXX/
         内容：requirement.md / design.md / test-report.md
               review-report.md / delivery-note.md
         ↓
[Step 4] 需求状态流转：backlog → done
```

> **两个输出物说明**  
> `docs/delivery/` 面向运维/发布团队，独立快查，无需翻阅需求目录。  
> `docs/requirements/done/` 是完整的需求生命周期归档，面向项目回溯和管理。  
> 两者同时生成，目的不同，互不替代。

## 上线前检查清单

### 代码层面
- [ ] PR 已通过代码审查（无 🔴 阻断性问题）
- [ ] 代码已合并到目标分支，构建通过
- [ ] 无冲突代码

### 数据库层面
- [ ] DDL 迁移脚本已在测试环境执行并验证
- [ ] 迁移脚本幂等性已确认（重复执行不报错）
- [ ] 回滚脚本已准备并测试可用

### 配置层面
- [ ] 新增配置项已在所有环境（dev/test/prod）同步更新
- [ ] 无硬编码环境配置（IP、密码）遗留在代码中

### 测试层面
- [ ] 测试报告验收结论为 ✅ 通过
- [ ] 所有 P0/P1 问题已关闭
- [ ] 回归测试通过

### 文档层面
- [ ] API 文档已更新
- [ ] 技术设计文档最终版已归档
- [ ] 如有破坏性变更，已通知相关调用方

## 交付文档归档路径

```
docs/requirements/done/REQ-XXXXXXXX/
  ├── requirement.md     # 需求文档（最终版）
  ├── design.md          # 技术设计文档
  ├── test-report.md     # 测试报告
  ├── review-report.md   # 代码审查报告
  └── delivery-note.md   # 交付说明
```

## 输出格式

保存交付报告至 `docs/delivery/REQ-XXXXXXXX-delivery.md`：

```markdown
# 交付报告

- **need_id**：REQ-XXXXXXXX
- **需求标题**：[需求标题]
- **交付时间**：YYYY-MM-DD HH:mm
- **需求状态**：✅ done

---

## 上线前检查结论

- ✅ 代码层面：全部通过
- ✅ 数据库层面：迁移脚本已验证
- ✅ 测试层面：测试通过（P0/P1 问题清零）
- ✅ 文档层面：已归档

---

## 本次交付内容

[简要描述实现了什么功能，1-3句话]

## 影响范围

| 模块 | 变更类型 | 说明 |
|---|---|---|

## 上线回滚方案

1. 代码回滚：`git revert {commit hash}` 或回滚上一个 tag
2. 数据库回滚：执行 `docs/requirements/done/REQ-XXXXXXXX/rollback.sql`

---

## 遗留事项（下一版本跟进）

[如无，填写"无"]

---

**本次需求已完成交付。** ✅
```

完成后，将需求文档从 `backlog/` 移动至 `done/REQ-XXXXXXXX/`，并更新 `status: done`。
