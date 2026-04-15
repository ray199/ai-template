> **[Trae 兼容版]** 对应 Claude Code 命令 `/intake`，调用方式：`@intake 需求内容`  
> 如需修改执行逻辑，同步修改 `.claude/commands/intake.md`

---

# 技能：需求接入（阶段1完整流程）

将任意形式的原始需求转化为结构化文档，同步完成工作量评估和伪需求扫描，输出明确的下一步指令。

执行规范参考：@intake-requirement/SKILL.md

**执行步骤：**

1. 【Step 0A】项目上下文感知
   - 扫描项目目录，加载技术栈、历史需求、已有模块
   - 输出项目上下文摘要 + 可自动补全的字段

2. 【Step 0B】输入质量识别
   - T1（一句话）→ 3个引导问题
   - T2（零散）→ AI主动推断 + 最多3个澄清
   - T3（半结构化）→ 自动补全 + 最多2个确认
   - T4（完整PRD）→ 直接结构化，无需问答

3. 【Step 1】需求结构化
   - 自动补全可推断字段，标注来源（✅自动 / ⚠️推断 / ❓缺失）
   - 完整性检查：need_id / title / priority / deadline / goal / acceptance 必须非空
   - 分配 need_id，保存至 docs/requirements/backlog/REQ-YYYYMMDD-XXX.md

4. 【Step 2】工作量联合评估（参考 @intake-requirement/workload-evaluation.md）
   - 需求分析师：业务维度5项评分
   - 架构师：技术维度4项评分
   - 综合判定等级：S / M / L / XL

5. 【Step 3】伪需求扫描（参考 @evaluate-requirement/SKILL.md）
   - A 重复建设检查
   - B 价值存疑检查
   - C 逻辑冲突检查
   - D 技术可行性检查
   - 结论：🔴 阻断 / 🟡 警告 / 🟢 通过

6. 【Step 4】输出物推荐（仅在伪需求扫描通过后执行）
   - 根据工作量等级推荐是否需要 Spec / UI原型 / 迭代计划

**完成后，明确告知下一步（使用 Step 1 分配的 need_id）：**
- S 等级 → `@code REQ-XXXXXXXX`（跳过设计）
- M/L/XL 等级 → `@design REQ-XXXXXXXX`
- 有 🔴 阻断项 → 需先解决阻断问题，再重新执行 `@intake`
