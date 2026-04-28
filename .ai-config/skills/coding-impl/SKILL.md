# 技能：编码实现

## 技能描述

根据已确认的技术设计文档，驱动后端开发代理和 DBA 代理有序执行编码任务。确保每个编码子任务有输入、有输出、有完成标准，并在提交前完成自检。

## 触发指令

- `/pg:code` - 启动编码实现（需提供 need_id），前后端同时生成
- `/pg:code --backend` - 仅执行后端编码
- `/pg:code --frontend` - 仅执行前端编码（Vue 页面/组件/API层）
- `/pg:code --db` - 仅执行数据库变更（DDL + 迁移脚本）
- `/pg:code --check` - 对已生成代码执行规范自检（不生成新代码）

## 处理流程

```
输入（按工作量等级）：
  S 级    → docs/requirements/backlog/REQ-XXXXXXXX.md（直接读需求，跳过设计阶段）
  M/L/XL  → docs/design/REQ-XXXXXXXX-design.md（按设计文档拆任务）
       ↓
[Step 0] 项目版本上下文扫描 ⚠️ 必做，先于任何代码生成
         自动检测 Java / Vue / Python / .NET 版本及框架。
         详见 references/version-detection.md
         项目类型分支：
         ├─ 全新项目：先生成骨架文件（来自设计文档的"项目骨架规划"节），再生成业务代码
         └─ 已有项目：直接进入 Step 1，沿用原项目包结构（扫现有 .java 文件的 package 声明确认）
       ↓
[Step 1] 读取输入文档，拆解编码任务
         按设计文档（M/L/XL 强制有"## 任务拆解"章节）逐 T 推进
         后端任务层次：DB 变更 → Entity/DO → Mapper/Repository → Service → Controller → VO/DTO
         前端任务层次：API 调用层 → Store → 路由 → 页面 view → 业务组件
       ↓
[Step 2] 执行 DB 变更（后端）
         生成 DDL 到 resources/db/migration/。详见 references/db-migration-rules.md
         触发 dba 代理复核（表结构复杂时）
       ↓
[Step 3] 自底向上生成后端代码
         Mapper → Entity → Service → Controller
       ↓
[Step 3.5] 生成前端代码（若含前端）
         API 层 → Store → 页面 view → 业务组件。详见 templates/frontend-vue.md
       ↓
[Step 4] 代码规范自检
         对照 references/self-check-rules.md 逐项过；前端补对照 vue-code-review-checklist.md
       ↓
[Step 5] 生成测试骨架
         后端：详见 templates/backend-test.md
         前端：详见 templates/frontend-vue.md 的"前端测试骨架"节
       ↓
[Step 6] 输出编码完成报告，front-matter `self_check_passed: true` 才能流转
         详见 templates/code-report.md
```

---

## 编码任务拆解格式

每项编码任务用以下格式记录，确保可追踪：

```markdown
### 任务：[任务名称]
- **负责代理**：backend_dev / dba / frontend_dev
- **输入**：[依赖的设计文档章节 / 前置任务 ID]
- **输出文件**：
  - `src/main/java/.../entity/XxxDO.java`
  - `src/main/java/.../mapper/XxxMapper.java`
- **完成标准**：
  - [ ] 文件已生成
  - [ ] 规范自检通过
  - [ ] 单元测试骨架已生成（Service 层）
```

---

## 子文件索引（lazy-load）

按需加载，AI 在执行对应步骤前 Read 对应文件即可：

| 子文件 | 用于 | 何时加载 |
|---|---|---|
| `references/version-detection.md` | Step 0：4 种语言的版本扫描逻辑 + 输出格式 + 版本对代码生成的影响 | 每次 /pg:code 必读 |
| `references/self-check-rules.md` | Step 4：通用 / Java 版本 / MyBatis / 事务 / 异常 / 安全自检清单 | Step 4 时读 |
| `references/db-migration-rules.md` | Step 2：DB 迁移脚本的命名 / 内容 / 模板 | 涉及 DB 变更时读 |
| `templates/frontend-vue.md` | Step 3.5：Vue 项目 API 层 + 页面 + 测试骨架模板 | 项目含前端时读 |
| `templates/backend-test.md` | Step 5：Service 层 JUnit 测试骨架 | 后端必读 |
| `templates/code-report.md` | Step 6：编码完成报告模板（带 schema 字段） | 输出时读 |

---

## 关键约束

1. **Step 0 不能跳过** — 不识别版本就生成代码会出现 `var` 写在 JDK 8 项目里这种坑
2. **老项目不得改 invariants** — `docs/_context/project-map.md` 里声明的不可变约束严格遵守
3. **任务拆解粒度** — 严格按设计文档的 T1 / T2 / ... 推进，不擅自合并或拆分（L/XL 强制有任务表）
4. **self_check_passed: true** — 编码完成报告 front-matter 里这个字段必须为 true，否则 schema 校验失败，不允许流转 /pg:check
5. **DB 脚本必须幂等** — `IF NOT EXISTS` / `IF EXISTS`，且必须附回滚语句
6. **包名不擅改** — 老项目沿用现有包结构；新项目按设计文档"项目骨架规划"声明的根包名

---

## 与其他阶段的衔接

```
/pg:design ──▶ design.md（任务拆解 T1-T6）──▶ /pg:code ──▶ code-report.md ──▶ /pg:check
                                                  ↑
                                                 Step 0-6（本技能）
```

- 上游：design.md 的任务拆解决定本阶段的任务序列
- 下游：code-report.md 的 self_check_passed 决定能否流转 /pg:check
