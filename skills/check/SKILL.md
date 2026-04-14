---
name: check
description: 测试+审查 - 设计测试用例、代码审查，输出验收结论，一步完成阶段3全部工作
argument-hint: [REQ-XXXXXXXX]
---

# 技能：测试与审查（阶段3完整流程）

对已完成编码的需求，依次执行测试用例设计和代码审查，给出明确的验收结论。

需求ID：$ARGUMENTS

## 完整处理流程

**第一部分：测试验证**

```
Step 1  读取验收标准（acceptance字段）→ 作为测试用例来源
Step 2  生成测试用例集
        正常路径 / 边界值 / 异常场景 / 权限场景 / 回归场景
Step 3  生成接口测试脚本（curl / Postman格式）
Step 4  记录问题
        P0 阻断（不修复不验收）/ P1 严重（上线前修复）
        P2 一般（可计划修复）/ P3 建议（可选）
Step 5  输出测试报告 → docs/test/REQ-xxx-test.md
```

**执行前，读取以下输入文件：**
- `docs/requirements/backlog/REQ-XXXXXXXX.md`（验收标准来源）
- `docs/design/REQ-XXXXXXXX-design.md`（技术设计文档，M/L/XL 等级）
- `docs/design/REQ-XXXXXXXX-code-report.md`（编码完成报告，含生成文件清单）
- 编码完成报告中列出的所有源代码文件

**第二部分：代码审查**

```
Step 6  读取编码完成报告中的生成文件清单，逐一审查所有源代码文件
Step 7  5维度审查
        ① 代码质量     命名/逻辑/规范/日志
        ② 架构合理性   模块划分/依赖关系
        ③ 安全性       SQL注入/XSS/权限/敏感数据
        ④ 可维护性     注释/错误处理/测试覆盖
        ⑤ 业务完整性   覆盖所有验收标准
Step 8  标注：🔴 阻断性 / 🟡 警告性 / ✅ 赞扬点
Step 9  输出审查报告 → docs/review/REQ-xxx-review.md
```

## 完成后明确告知下一步

- 无 🔴 阻断性问题 → `/ai:deliver REQ-XXXXXXXX`
- 有 🔴 阻断性问题 → 修复后重新执行 `/ai:check REQ-XXXXXXXX`
