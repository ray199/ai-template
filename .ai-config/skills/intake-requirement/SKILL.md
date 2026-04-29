# 技能：需求接入与工作量评估

## 技能描述

将任意形式的原始需求（口头描述、飞书截图、简短消息、会议纪要等）转化为标准结构化需求文档，执行工作量联合评估（需求分析师 + 架构师），根据评估结果确定最终的输出物规范和质量检查方式。

5 步流程：自动项目上下文感知、输入质量识别、需求结构化、工作量评估、伪需求扫描。

## 触发指令

- `/pg:intake` - 接入一条新需求（自动执行完整流程）

## 完整处理流程

```
原始输入（任意形式：一句话 / 零散 / 完整 PRD / 截图）
   ↓
[Step 0] Exploration 引用（高优先级，必做）
   - 扫描 docs/_exploration/（排除 dropped/）下所有 EXPLORE-*.md
   - 按 created_at 倒序列出，让用户选是否引用为 background
   - 引用：笔记内容入 background 字段；后续 Step 跳过笔记已答的维度；笔记 status: draft → graduated
   - 跳过或无 EXPLORE 文件 → 进入 Step 0A
   ↓
[Step 0A] 项目上下文感知 ⚡ 自动
   - 扫描项目目录（识别新/旧项目、技术栈、历史需求、已有模块）
   - 详见 project-context.md
   ↓
[Step 0B] 输入质量识别 ⚡ 自动
   - T1（一句话）→ 引导式问答（3 问）
   - T2（零散/截图）→ AI 主动推断 + 最多 3 个澄清
   - T3（半结构化）→ 自动补全 + 最多 2 个确认
   - T4（完整 PRD）→ 直接结构化，无需问答
   - 详见 input-quality.md
   ↓
[Step 1] 需求结构化（写盘前必须给用户预览，确认后才落盘）
   - 利用上下文自动填字段，标注来源（✅ 自动 / ⚠️ 推断 / ❓ 缺失）
   - 完整性检查：6 个核心字段必须非空
   - 通过后分配 need_id → docs/requirements/backlog/REQ-YYYYMMDD-XXX.md
   - 详见 references/completeness-check.md（Step 1 部分）
   - 输出格式：templates/structured-output.md
   ↓
[Step 2] 工作量联合评估
   - 业务 5 维（涉及页面/接口/DB 变更/影响范围/数据迁移）
   - 技术 4 维（架构变更/引入新技术/性能挑战/安全权限）
   - 综合判 S / M / L / XL
   - 评分细则见 workload-evaluation.md
   - 输出格式：templates/workload-report.md
   ↓
[Step 3] 伪需求扫描
   - A 重复建设 / B 价值存疑 / C 逻辑冲突 / D 技术可行性
   - 详见 pseudo_checklist.md
   - 结论：🔴 阻断 / 🟡 警告 / 🟢 通过
   ↓
[Step 4] 输出物推荐（伪需求 🟢 后） — 强制中断点·逐项询问
   - S：无需额外输出物
   - M：视情况建议原型
   - L/XL：建议原型 + 迭代计划
   - 输出物完整性检查见 references/completeness-check.md（Step 3/4 部分）
   ↓
[Step 5] 并行冲突软提示（不阻断）
   - 若 affects_modules 与 backlog 其他在制品需求有交集，打印警告
   - 仅提示，不阻断流转
```

## 完成后明确告知下一步

- S 等级 → `/pg:code REQ-XXXXXXXX`（直接编码，跳过设计）
- M/L/XL → `/pg:design REQ-XXXXXXXX`（先做技术设计）
- 🔴 阻断 → 解决后重新执行 `/pg:intake`
- 想法模糊（连 6 字段都答不上来）→ 先走 `/pg:explore`

---

## 输入格式

直接粘贴原始内容即可，无需任何格式要求：

```
/pg:intake

[原始需求内容，直接粘贴]
```

支持：飞书消息、口头记录、会议纪要、技术提案、完整 PRD、一句话需求、截图描述。AI 自动识别质量等级（T1-T4），按对应策略处理。

详细输入质量分级和策略见 `input-quality.md`。

---

## 子文件索引（lazy-load）

| 子文件 | 用于 | 何时加载 |
|---|---|---|
| `project-context.md` | Step 0A：项目上下文感知（扫描技术栈、历史需求、模块） | 每次 /pg:intake 必读 |
| `input-quality.md` | Step 0B：输入质量分级 + T1-T4 处理策略 | 每次 /pg:intake 必读 |
| `workload-evaluation.md` | Step 2：业务 5 维 + 技术 4 维评分细则 + 兜底规则 | Step 2 时读 |
| `pseudo_checklist.md` | Step 3：4 类伪需求扫描判断标准 | Step 3 时读 |
| `references/completeness-check.md` | Step 1 + Step 3/4：完整性检查规则、AI 自动检查 | Step 1 / 3 / 4 时读 |
| `references/output-format-rules.md` | 文档格式规范（Word/飞书兼容） | 输出文档前读 |
| `templates/structured-output.md` | Step 1 输出样例（结构化文档 / 澄清问题 / 无法解析） | Step 1 输出时读 |
| `templates/workload-report.md` | Step 2 输出样例（业务+技术评估表 + 综合判定） | Step 2 输出时读 |
| `templates/from_prd.md` | T4 完整 PRD 输入的转换模板 | T4 场景读 |
| `templates/from_verbal.md` | T1/T2 口头/零散输入的转换模板 | T1/T2 场景读 |

---

## 关键约束（schema 强制）

1. **need_id 格式**：`^REQ-\d{8}-\d{3}$`
2. **title** ≤ 20 字
3. **acceptance** 数量按等级强制：XS/S ≥ 1 / M ≥ 2 / L/XL ≥ 3
4. **affects_modules**（可选）：填了会触发并行冲突软提示
5. **goal 必须可量化**——不可量化的目标不得通过 Step 1
6. **deadline 必须是日期或明确里程碑**——"尽快"不接受

详细 schema 见 `.ai-config/workflow.md` §3.1。

---

## 与其他阶段的衔接

```
原始需求
  ↓
（可选）/pg:explore ──▶ EXPLORE-xxx.md（草稿，模糊想法时用）
  ↓
本技能（/pg:intake）
  ├── XS/S → /pg:code（跳过设计）
  └── M/L/XL → /pg:design
                  ↓
              （任务表 T1-T6 引用 acceptance A1-A4）
```
