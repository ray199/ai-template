# 使用教程

> 一份面向不同角色的"何时该做什么"的速查手册。
> 比 README 更具体（写了"你是产品经理拿到需求该怎么办"），比 SKILL.md 更轻量（不讲实现细节，只讲操作步骤）。

## 目录

- [5 分钟速览](#5-分钟速览)
- [按角色看](#按角色看)
- [按场景看](#按场景看)
- [按工作量等级看](#按工作量等级看)
- [FAQ](#faq)
- [附录：速查表](#附录速查表)

---

## 5 分钟速览

如果你**只看一节**，看这个。

```
我是谁？我该用哪些命令？
├── 产品 / 业务   → /pg:explore（想法模糊时）+ /pg:intake（提需求）
├── 架构师       → /pg:design（M/L/XL）+ review 阶段
├── 一线开发      → /pg:code + 自检 + commit
├── QA / 测试    → /pg:check
├── DBA         → /pg:design --db 复核
└── 老板 / PM    → 看 docs/requirements/{backlog,done}/

我在哪个阶段？我该输出什么？
├── 想法模糊     → exploration 草稿
├── 接需求       → requirement.md
├── 设计        → design.md（M+ 含任务拆解）
├── 编码        → 源码 + DB 脚本 + code-report
├── 测试        → test.md + review.md（M+）
├── 交付        → delivery.md + 归档 done/
└── 沉淀        → project-map.md 追加记录 + rules-candidates
```

---

## 按角色看

### 产品经理 / 业务方

**你的核心命令**：`/pg:explore`、`/pg:intake`

**典型一天**：
1. 收集业务需求（飞书消息 / 会议纪要 / 用户反馈）
2. 想法模糊时先 `/pg:explore`，5 步收敛后落到草稿
3. 想法清楚后 `/pg:intake`，AI 自动结构化 + 工作量评估
4. 需求落到 `docs/requirements/backlog/REQ-xxx.md` 后告知开发

**典型不该做的事**：
- 不要绕过 `/pg:intake` 直接在飞书甩 PRD 给开发——会丢失工作量评估和伪需求扫描
- 不要写技术方案——那是架构师的活，你只管 What 和 Why

---

### 架构师 / 技术 lead

**你的核心命令**：`/pg:design`（M/L/XL）

**典型一天**：
1. 看 `docs/requirements/backlog/` 哪些 REQ 是 M/L/XL 等待设计
2. 跑 `/pg:design REQ-xxx`
3. AI 生成 design.md 草稿，你校对：
   - 老项目：检查 `## 现状基线` 段是否准确
   - L/XL：检查 `## 任务拆解` 表的依赖、并行性、估时合理性
   - 重构类：检查"迁移顺序"和"回滚边界"是否清晰
4. 评审会 / 私下确认后改 status: approved，提 PR
5. 持续 review code 阶段产出（code-report.md + 源码）

**典型不该做的事**：
- 不要让 design.md 的任务拆解里出现"实现整个 X 模块" 5 天的大任务——拆到 ≤2 天
- 不要在 design 阶段直接写代码——会跳过任务表对齐

---

### 一线开发

**你的核心命令**：`/pg:code` + commit

**典型一天**：
1. 从 backlog 领一个 REQ
2. 看 design.md 的任务拆解（M/L/XL）或直接看需求（XS/S）
3. 跑 `/pg:code REQ-xxx`
4. AI 按 Step 0-6 生成代码 + DB 脚本 + 测试骨架 + code-report
5. 检查 code-report 的 `self_check_passed: true`
6. commit + 推 PR
   - commit-msg hook 校验 conventional commit
   - pre-commit hook 跑 schema 校验
7. 等 QA 跑 `/pg:check`

**XS 级流程**（小修改）：
- 不走 `/pg:code`，直接改代码
- `git commit -m "XS: 描述"` —— 必须 `XS:` 前缀，否则 hook 拒绝

**典型不该做的事**：
- 不要在 `/pg:design` 已写好任务表的情况下擅自合并任务——破坏依赖图
- 不要在 self_check_passed 为 false 的情况下推 PR——schema 会拦
- 不要修改老项目 `docs/_context/project-map.md` 里 `## 不可变约束` 声明的部分

---

### QA / 测试

**你的核心命令**：`/pg:check`

**典型一天**：
1. 看哪些 REQ 已交付到 code 阶段（有 code-report.md）
2. 跑 `/pg:check REQ-xxx`
3. AI 按等级生成产出物：
   - XS/S：5 维 review 清单 + curl 测试，写入 PR 描述
   - M：独立 test.md + review.md
   - L/XL：同 M + 并发 / 性能测试
4. 跑测试，如有 blocker 让开发修
5. blockers: 0 + conclusion: pass 才能进 deliver 阶段

**典型不该做的事**：
- 不要忽略 design.md 中的 acceptance（A1-A4），每条 A 都应至少有一个测试用例
- 不要在 review.md 里写"代码风格不好"这种笼统话——指出具体行号和违反的规则编号

---

### DBA

**你的核心命令**：`/pg:design --db` 复核 + 主动看 design.md 的"二、数据库设计"段

**典型一天**：
1. 看哪些 REQ 涉及 DB 变更（design.md 的"二、数据库设计"段非空）
2. 复核：
   - 字段类型 / 索引设计合理？
   - DDL 是否幂等（IF NOT EXISTS）？
   - 回滚语句是否在注释块里？
   - 是否有性能风险（大表加列、影响在线流量）？
3. 在 review.md 里加 review_dba 段（或独立评论）
4. /pg:code 阶段生成的 V*.sql 脚本，跑 dry-run 验证

**典型不该做的事**：
- 不要让 N+1 查询通过 review——批量操作必须用 `<foreach>`
- 不要让无索引的查询接口上线——查询频率 > 1 QPS 必须有索引

---

### 老板 / 项目负责人

**你不直接跑命令**，看这两个目录：

- `docs/requirements/backlog/` —— 在做什么（按 priority + workload 排序）
- `docs/requirements/done/` —— 已交付什么（看 delivery.md 里的上线日期）

CI 还会跑 `validate-doc.js all`，每个 PR 触发，确保产出物 schema 合规。看到 ✅ 就放心，看到 ❌ 找对应负责人。

---

## 按场景看

### 场景 1 · 新人入职第一天

**目标**：30 分钟内能知道项目长什么样、规范怎么用。

```
1. clone 项目
   git clone <repo> && cd <repo>

2. 读 3 份文档（按这个顺序）：
   ├── README.md                              （5 分钟，整体了解）
   ├── docs/_context/project-map.md           （10 分钟，本项目独有，老项目必读）
   └── .ai-config/workflow.md                 （15 分钟，规范契约）

3. 装 git hooks（一次性）
   git config core.hooksPath .ai-config/scripts/git-hooks
   chmod +x .ai-config/scripts/git-hooks/*

4. 找一个 done/ 目录里已交付的 REQ 当样例
   ls docs/requirements/done/

5. 第一个任务：领一个 backlog 里的 S 级 REQ 上手，跟一遍流程
```

**重要提示**：不要一开始就读所有 SKILL.md（共 9 份）。AI 在执行命令时会按需加载，你只要会用命令即可。

---

### 场景 2 · 产品提了个新需求

**2.1 · 想法清楚（直接 /pg:intake）**

```
PM 在 Claude Code / Trae 里：
  /pg:intake 后台用户列表加批量导出 Excel/CSV，最多 1 万条，给运营用

AI 输出：
  [识别为 T3 半结构化输入]
  [自动补全字段]
  [工作量评估：S（业务 4 + 技术 2）]
  [伪需求扫描：🟢 通过]

产出：docs/requirements/backlog/REQ-20260428-001.md
下一步：S 级 → 走 /pg:code，不走 /pg:design
```

**2.2 · 想法模糊（先 /pg:explore）**

```
PM：
  /pg:explore 我想做一个 BI 报表平台，但只有几个 HTML 报表，不知道平台化要考虑啥

AI 进入 5 步流程：
  Step 1（5 Whys）→ 反问 3 个问题
  Step 2（维度拆解）→ 列生命周期 / 权限 / 数据源 / 交互 / 运维...
  Step 3（候选方案）→ 自研 vs Superset 二开 vs 嵌入 BI
  Step 4（坑清单）→ 数据权限 × 功能权限交叉、大查询拖库...
  Step 5（未知识别）→ 谁来答数据量级、首批用户...

产出：docs/_exploration/EXPLORE-20260428-bi-platform.md（草稿）

几天后想清楚了 → /pg:intake，把探索笔记当 background 输入
```

**2.3 · XS 级（不走 /pg:intake）**

```
PM 在飞书甩一句："注册按钮文案改成'立即开通'"

开发直接：
  git checkout -b xs-register-cta
  [改代码]
  git commit -m "XS: 注册按钮文案改为'立即开通'"

commit-msg hook 校验前缀通过 → PR review → 合并
全程不进 docs/，不写 design / test / review
```

---

### 场景 3 · 开发接到一个 REQ 开始干

```
开发拿到 REQ-20260428-002（M 级，权限分组功能）：

1. 看 design 文档（架构师已写好）
   cat docs/design/REQ-20260428-002-design.md
   ├── 一、架构影响分析
   ├── 二、数据库设计
   ├── 三、接口设计
   ├── 四、前端 UI 设计
   ├── 五、关键实现路径
   ├── 六、任务拆解（L/XL 必有）
   │     T1 → T2 → T3 → T4 → T5 → T6
   └── 七、待评审确认项

2. 按任务表 T1 开始：
   /pg:code REQ-20260428-002

   AI 执行：
     Step 0：扫 pom.xml → JDK 17 + Spring Boot 3.x
     Step 1：读 design 文档 + 任务表
     Step 2：生成 DB migration（V20260428_01__add_role_table.sql）
     Step 3：生成 Mapper / Entity / Service / Controller
     Step 3.5：生成前端 API / 页面 / 组件
     Step 4：自检
     Step 5：生成测试骨架
     Step 6：写 code-report.md

3. commit + 推 PR
4. 准备进 /pg:check 阶段
```

---

### 场景 4 · QA 拿到 REQ 做测试

```
QA 看到 code-report 已落地：
  /pg:check REQ-20260428-002

AI 执行：
  1. 读 requirement.md（acceptance A1-A4）
  2. 读 design.md（任务表 T1-T6 + 验收对应）
  3. 读 code-report.md（实际改动文件）
  4. 按等级生成测试用例：
     - M：标准接口测试 + 5 维 review
     - L/XL：+ 并发场景 + 性能基线
  5. 跑测试 / 让 QA 跑
  6. 产出：
     - docs/test/REQ-xxx-test.md
     - docs/review/REQ-xxx-review.md

schema 校验：blockers: 0 + conclusion: pass 才能进 /pg:deliver

发现 blocker：
  - 不进 deliver，回开发修
  - 重跑 /pg:check
```

---

### 场景 5 · 上线交付

```
所有 blocker 清掉后：
  /pg:deliver REQ-20260428-002

AI 执行：
  1. 校验：test conclusion=pass + review conclusion=pass + blockers=0
  2. 生成 docs/delivery/REQ-xxx-delivery.md（上线步骤 + 回滚方案）
  3. 归档：把所有文档移到 docs/requirements/done/REQ-xxx/
  4. 收尾两问（不阻断）：
     问 1：本次有发现新的不变量 / 技术债 / 架构决策要写到 project-map 吗？
     问 2：review 有发现可沉淀回 .ai-config/rules/ 的反模式吗？

     答"无"跳过；答具体内容则 append 到对应文件
  5. schema 校验：rollback_verified: true
```

---

### 场景 6 · 老项目第一次接入这套规范

```
1. 把 .ai-config/、.claude/、.trae/、.github/、.gitignore、CLAUDE.md 拷到老项目根
   不要覆盖老项目已有的 docs/ 或源码

2. 装 git hooks
   git config core.hooksPath .ai-config/scripts/git-hooks
   chmod +x .ai-config/scripts/git-hooks/*

3. AI 扫描代码生成 project-map.md 模板
   /pg:init existing

4. 关键一步：人工填写 ## 不可变约束
   不能让 AI 凭空猜，必须是团队真知道哪些不能改：

   - [ ] 禁止修改 user 表的主键结构
   - [ ] /api/v1/* 接口签名不得变更（旧客户端兼容）
   - [ ] 根包名沿用 com.example.legacy
   - [ ] 用户密码必须保持 bcrypt（不接受其他算法）

5. （可选）从 invariants 抽出"长期理念"独立成 constitution.md
   cp .ai-config/constitution-template.md docs/_context/constitution.md
   人工编辑

6. 之后所有 /pg:design 和 /pg:code 都会自动遵守这些约束
```

---

### 场景 7 · 紧急 hotfix（XS 级 bug 修复）

```
线上挂了，必须立刻修：

1. 不走 /pg:intake，直接修
2. commit message 必须有 XS: 前缀
   git commit -m "XS: hotfix 修复登录页空指针"
3. PR 描述里写：
   - 影响范围
   - 修复方式（一句话）
   - 验证步骤（curl 或截图）
4. team 5 维 review（按 PR 模板）
5. 合并 → 上线 → 监控
6. 补充：next sprint 在 docs/_changelog/rules-candidates.md 加一条
   "考虑加登录页空值检查"，下次规则升级时批处理
```

---

### 场景 8 · 重构 / 迁移类需求（L/XL）

**关键差异**：design.md 必须有"迁移顺序"和"回滚边界"段，不只是任务表。

例：把 user_role 字段从 user 表迁到独立 user_role 表

design.md 的 `## 任务拆解` 之后必须追加：

```
迁移顺序：
1. 兼容期：新 user_role 表上线但不切流量             —— 可独立合并：是
2. 双写期：新旧结构同时写，读老表                     —— 可独立合并：是
3. 影子读期：开关切到新表读，监控数据一致性             —— 可独立合并：是
4. 切读：开关全开新表读                              —— 可独立合并：是（一键开关）
5. 停写老 user.role 字段 + 数据迁移完成校验            —— 可独立合并：否（不可逆）
6. 删除老字段 / 清理代码                             —— 可独立合并：是（独立 REQ 更稳）

回滚边界：1-4 步任意时点可一键回滚到老结构；
          进入第 5 步后只能前滚或申请数据库回放。
```

每个步骤是一个独立的 PR，不能打包合并。

---

## 按工作量等级看

| 等级 | 产出物清单 | 流程 | 工期 |
|---|---|---|---|
| **XS** | 仅 git commit message | git 快车道 | <1 天 |
| **S** | requirement.md + 源码 + PR review 块 | intake → code → check（PR）→ deliver | 1-2 天 |
| **M** | + design.md + code-report + test.md + review.md + delivery.md | 完整流程 | 3-5 天 |
| **L** | 同 M（design 含任务拆解 / acceptance ≥3 / 必含 1 条 BDD） | 完整流程，审查更严 | 1-2 周 |
| **XL** | 同 L + iteration_plan + milestones | 拆分迭代 | 4 周+ |

---

## FAQ

**Q1：M 级和 L 级到底怎么区分？**
看判分：业务 5 维 + 技术 4 维。M 是 8-13 分；L 是 14+ 或触发兜底（核心鉴权 / 跨多模块 / 性能瓶颈）。`/pg:intake` 自动判，不需要你记规则。

**Q2：写 design 时不知道某个字段怎么填？**
让 AI 用占位符 `（待填写）`，提交后 schema 校验会阻断，补填后再 commit。

**Q3：team 里有人不用 Claude Code，就用 IDE 直接写代码可以吗？**
可以。pre-commit hook 会拦住不合规的 commit。规范不依赖 AI 工具，git hooks + CI 就够。

**Q4：能跨 REQ 协作吗？**
能。`affects_modules` 字段填上后，`/pg:intake` 会自动扫 backlog 其他在制品需求并打印交集警告。

**Q5：我们的某条规则觉得太严，能改吗？**
能。改 `.ai-config/workflow.md` 和 `validate-doc.js`，PR 说明改的理由（守的什么风险消失了 / 太松了 / 太严了）。原则：减法优先。

**Q6：跨平台冲突怎么办？比如同一项目有 Trae 和 Claude Code 用户。**
不冲突。事实源是 `.ai-config/workflow.md`，两个平台都引用它。Trae 用户打 `/intake xxx` 或 `/pg:intake xxx` 都能识别（双识别）；Claude Code 严格 `/pg:intake xxx`。

**Q7：规范文件 / skill 太多了，AI 真能全吞下去吗？**
不需要全吞。SKILL.md 是渐进式结构——主文件短，详细规则在 `references/` 和 `templates/`。AI 在对应阶段才按需加载。

**Q8：我的项目类型不在 7 种 profile 里（比如 Rust）怎么办？**
两种办法：(a) 临时用 `02_code_style.mdc` + `03_security.mdc` 通用规则；(b) 仿造 `profiles/go.mdc` 写一份 `profiles/rust.mdc` 加到团队规范。

**Q9：BDD 格式（GIVEN/WHEN/THEN）必须写吗？**
- XS / S：不强制，旧式"当...时，系统应..."就够
- M / L / XL：至少 1 条 acceptance 必须是 BDD 格式（schema 强制）

**Q10：AI 生成的代码不符合我们项目的某条独特约定，怎么办？**
两种办法：(a) 在 design.md 里显式声明该约定；(b) 把约定写进 `docs/_context/project-map.md` 的 `## 不可变约束` 或 `docs/_context/constitution.md` 的 `## 项目原则`，之后 AI 必读。

---

## 附录：速查表

### 命令速查

| 命令 | 谁触发 | 何时 | 产出 |
|---|---|---|---|
| `/pg:init` | 项目接入者 | 项目第一天 | `.ai-config/`、`docs/`、project-map.md |
| `/pg:explore` | PM / 任何人 | 想法模糊时 | exploration 草稿 |
| `/pg:intake` | PM | 接需求时 | requirement.md |
| `/pg:design` | 架构师 | M/L/XL 设计 | design.md |
| `/pg:code` | 开发 | 开始编码 | 源码 + code-report |
| `/pg:check` | QA | 测试 + review | test.md + review.md |
| `/pg:deliver` | 开发 / PM | 上线后 | delivery.md + 归档 |
| `/pg:prototype` | PM / 设计师 | 需要原型时 | HTML / Figma / wireframe |

### 文件路径速查

```
.ai-config/                           ← 规范本身
├── workflow.md                       ← 事实源，改契约只改它
├── constitution-template.md          ← 项目宪法模板
├── rules/                            ← 通用规则（02 风格 / 03 安全 / 04 git / 05 工作流 / 06 需求）
│   ├── profiles/                     ← 7 种语言专项
│   └── middleware/                   ← 6 种中间件
├── skills/                           ← 9 个执行技能（渐进式：SKILL + references/ + templates/）
└── scripts/
    ├── validate-doc.js               ← 产出物 schema 校验
    └── git-hooks/                    ← pre-commit + commit-msg

docs/                                 ← 项目产出
├── _context/
│   ├── project-map.md                ← 老项目必有：技术栈、模块、表、接口、不可变约束
│   ├── constitution.md               ← 可选：项目长期原则
│   └── （无别的）
├── _exploration/                     ← /pg:explore 草稿
├── _changelog/
│   └── rules-candidates.md           ← /pg:deliver 增量回流的反模式
├── requirements/
│   ├── backlog/REQ-xxx.md            ← /pg:intake 写入
│   └── done/REQ-xxx/                 ← /pg:deliver 归档
├── design/
│   ├── REQ-xxx-design.md             ← /pg:design 产出
│   └── REQ-xxx-code-report.md        ← /pg:code 产出
├── test/REQ-xxx-test.md              ← /pg:check 产出
├── review/REQ-xxx-review.md          ← /pg:check 产出
├── delivery/REQ-xxx-delivery.md      ← /pg:deliver 产出
└── prototype/REQ-xxx.{html,figma,md} ← /pg:prototype 产出
```

### 双层校验体系

**硬门**（git hooks + CI，机械、阻断）：
- `pre-commit`：本次涉及的 REQ-*.md 跑 schema 校验
- `commit-msg`：conventional commit 或 `XS:` 前缀
- CI workflow：PR 触发 `validate-doc.js all`
- 阶段后置：requirement / design / code-report / check / delivery / project-map / constitution 全部 schema

**软门**（AI 软提示，上下文相关、不阻断）：
- `/pg:intake` 并行需求冲突提示（基于 `affects_modules`）
- `/pg:design` 老项目"现状基线"章节强制；L/XL 强制任务拆解
- `/pg:code` constitution"项目原则"必读
- `/pg:deliver` 收尾两问

---

## 反馈

教程是活文档。觉得哪个场景没覆盖到 / 哪段不准 / 哪句话不清楚，直接改本文件 PR。也可以在 `docs/_changelog/rules-candidates.md` 留言，下次规范升级时一并处理。
