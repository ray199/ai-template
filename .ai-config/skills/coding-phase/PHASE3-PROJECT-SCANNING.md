# 📊 项目快照

**生成时间**：2026-04-03 
**项目路径**：E:\workspace\ai-template
**快照版本**：v1.0
**最后更新**：a284da1 "[perf] skill更新" (2小时前)

---

## 一、项目基本信息

### 项目类型和规范成熟度

| 属性 | 值 | 说明 |
|---|---|---|
| 项目类型 | 旧项目-迭代 | 已有代码库和历史需求 |
| 规范成熟度 | 完整 | 有claude.md和.ai-config规范 |
| 代码仓库 | Git | 主分支: main, 开发分支: dev_xiajinge |
| 开发语言 | Java / Vue / .NET | 全栈项目 |
| 项目状态 | 活跃 | 定期迭代中 |

### 快速导航

| 资源 | 位置 | 说明 |
|---|---|---|
| 项目规范 | CLAUDE.md | 6阶段工作流程和输出物规范 |
| 技术栈详情 | .ai-config/skills/project-scanning/TECH-STACK.md | 技术选型和版本 |
| 模块交互 | .ai-config/skills/project-scanning/MODULES.md | 模块依赖和协作模式 |
| 编码规范 | .ai-config/rules/0X_*.mdc | 完整规范集合 |
| 技能集合 | .ai-config/skills/ | 各阶段AI技能 |

---

## 二、可用资源清单

### 系统规范
✅ 存在 | CLAUDE.md | 4阶段AI编程工作流（需求→设计→编码→交付）
✅ 存在 | .ai-config/rules/ | 6套核心规范（角色、技术栈、风格、安全、Git、流程）
✅ 存在 | .ai-config/skills/ | 12+个AI技能（需求接入、原型生成、代码编写、测试、交付）

### 历史需求和设计文档
✅ 存在 | docs/requirements/done/ | 已完成的需求文档（可参考）
✅ 存在 | docs/design/ | 技术设计文档和原型
✅ 存在 | docs/test/ | 测试报告（单元、集成、性能）

### 编码规范和模板
✅ 存在 | .ai-config/skills/coding-phase/ | Java/Vue/.NET编码规范 + Code Review检查表
✅ 存在 | .ai-config/skills/intake-requirement/ | 需求结构化、工作量评估、Input Quality分级

### 前端样式规范
✅ 存在 | src/main/resources/static/css/variables.scss | Design Tokens已定义
✅ 存在 | .ai-config/skills/prototype-generation/ | 原型生成规范和HTML模板

### 数据库和API文档
✅ 存在 | src/main/resources/db/migration/ | Flyway迁移脚本（36个版本）
✅ 存在 | docs/api/ | API文档（Swagger链接或文档）

---

## 三、关键项目信息

### 技术栈（已确认）
```
【后端】Java 8 | Spring Boot 2.7.x | MyBatis-Plus 3.x | MySQL 8.0
【前端】Vue 3 | Vite | Ant Design Vue | Pinia
【测试】JUnit5 | Jest | Vitest
【部署】Docker | CI/CD via GitHub Actions
```

### 已有核心模块（规划中）
项目目前为AI编程规范模板，暂无业务模块。设计的模块会在实际项目中体现。

### 最近活动
- **最新提交**：a284da1 "[perf] skill更新" (当前分支: dev_xiajinge)
- **当前分支**：dev_xiajinge (开发分支)
- **其他变更**：D  AI.md (删除), ?? .idea/ (新增目录)

### 项目规模指标
- **规范文件数**：6个核心规范 + 12+个技能文档
- **编码规范覆盖**：Java, Vue 3, .NET C#
- **工作流阶段**：6阶段（需求→评估→设计→编码→测试→交付）
- **输出物规范**：完整的文档模板 + Code Review检查表

---

## 四、模块结构说明

由于这是AI编程规范模板项目，模块结构如下：

| 模块 | 位置 | 功能 | 状态 |
|---|---|---|---|
| **系统规范** | CLAUDE.md | 定义6阶段AI编程工作流 | ✅ 完整 |
| **基础规范** | .ai-config/rules/ | 技术栈、代码风格、安全、Git工作流 | ✅ 完整 |
| **需求接入** | .ai-config/skills/intake-requirement/ | 需求结构化、工作量评估、质量分级 | ✅ 完整 |
| **原型生成** | .ai-config/skills/prototype-generation/ | 原型自动生成（低保真→高保真） | ✅ 完整 |
| **变更跟踪** | .ai-config/skills/change-tracking/ | 变更分级、生命周期、记录规范 | ✅ 完整 |
| **编码阶段** | .ai-config/skills/coding-phase/ | 技术设计、编码规范、Code Review、测试、交付 | ✅ 完整 |
| **项目扫描** | .ai-config/skills/project-scanning/ | 项目快照、模块依赖、技术决策 | ✅ 本文档 |

---

## 五、规范快速导航

| 规范文件 | 涵盖范围 | 关键信息 | 更新频率 |
|---|---|---|---|
| **CLAUDE.md** | 整体工作流 | 6阶段、4个关键创新、完整流程图 | 月度 |
| **00_system_role.mdc** | AI角色定义 | Claude Code的能力和限制 | 季度 |
| **01_tech_stack.mdc** | 技术选型 | 后端/前端/测试框架版本和选型理由 | 按需 |
| **02_code_style.mdc** | 代码风格 | 命名、缩进、注释、日志、异常处理 | 季度 |
| **03_security.mdc** | 安全规范 | SQL防注入、XSS防护、认证授权 | 季度 |
| **04_git_workflow.mdc** | Git工作流 | Commit规范、分支规范、PR流程 | 半年度 |
| **05_workflow.mdc** | 开发流程 | 确认指令、质量检查、审查标准 | 月度 |
| **java-code-review-checklist.md** | Java规范 | P0/P1/P2问题分类、Controller测试6场景 | 季度 |
| **vue-code-review-checklist.md** | Vue规范 | Composition API、Design Tokens、a11y | 季度 |
| **dotnet-code-review-checklist.md** | .NET规范 | async/await、EF Core、DI最佳实践 | 季度 |
| **workload-evaluation.md** | 工作量评估 | 业务/技术维度、S/M/L/XL等级 | 季度 |
| **spec-generator.md** | Spec生成 | 5类规范自动生成规则和验证 | 月度 |

---

## 六、接入新需求时的快速查阅

### 第一步：理解项目背景（5分钟）
1. 阅读本文档（PROJECT-SNAPSHOT.md）的"一、二、三、五"部分
2. 了解技术栈和已有规范

### 第二步：评估需求影响（需要时）
1. 如果是业务需求，参考 MODULES.md（在实际项目中适用）
2. 如果涉及多模块改动，查看"跨模块影响评估规则"

### 第三步：进入阶段1
1. 执行 `/intake` 触发需求接入流程
2. 系统自动加载PROJECT-SNAPSHOT.md的技术栈信息
3. 自动补全 `tech_constraints` 字段

### 第四步：确认工作量
1. 执行 `/evaluate-workload` 进行评估
2. 根据工作量等级确定输出物规范

---

## 七、规范更新和维护

### 谁来维护？
| 规范 | 维护者 | 频率 |
|---|---|---|
| CLAUDE.md | Project Manager / Tech Lead | 月度评审 |
| 基础规范 (rules/) | 架构师 | 季度更新 |
| 编码规范 (coding-phase/) | Tech Lead + 各语言owner | 季度更新 |
| 技能集合 (skills/) | AI规范owner | 使用反馈后调整 |
| 项目快照 (project-scanning/) | DevOps / 架构师 | 需求上线后增量更新 |

### 何时更新？
- 新需求进入Phase 2：更新PROJECT-SNAPSHOT.md的"最近活动"
- 规范变更：更新相关规范文件，通知团队
- 技术债完成：更新TECH-STACK.md
- 新模块创建：更新MODULES.md（实际项目中）

---

## 八、常见问题速查

### Q: 新需求应该按照哪个阶段流程进行？
**A**: 按CLAUDE.md中的6阶段流程：  
1️⃣需求接入 → 2️⃣工作量评估 → 3️⃣技术设计 → 4️⃣编码实现 → 5️⃣测试验证 → 6️⃣交付上线

### Q: 某个编码规范在哪里查？
**A**: 根据语言查找：
- Java: .ai-config/skills/coding-phase/java-code-review-checklist.md
- Vue: .ai-config/skills/coding-phase/vue-code-review-checklist.md
- .NET: .ai-config/skills/coding-phase/dotnet-code-review-checklist.md

### Q: 需求如何分级（S/M/L/XL）？
**A**: 查看.ai-config/skills/intake-requirement/workload-evaluation.md  
按业务维度(5项)和技术维度(4项)打分，综合判定

### Q: 新技术引入如何评审？
**A**: 查看TECH-STACK.md的"技术评审和决策流程"部分

### Q: 项目最近做了什么？
**A**: 查看本文档的"最近活动"部分，或查看git log

---

## 九、进入各个阶段的指令

| 阶段 | 指令 | 含义 |
|---|---|---|
| 准备 | `/scan` | 生成项目快照（首次或定期更新） |
| 阶段1 | `/intake` | 开始需求接入 |
| 阶段1 | `/evaluate-workload` | 开始工作量评估 |
| 阶段2 | `/design` | 开始技术设计 |
| 阶段2 | `/code` | 开始编码实现 |
| 阶段4 | `/test` | 开始测试执行 |
| 阶段5 | `/review` | 开始代码审查 |
| 阶段6 | `/deliver` | 开始交付准备 |

---

## 十、后续参考文档

### L2 - 模块交互详图
📄 **MODULES.md** (在实际项目中)  
包含：模块清单、依赖关系、跨模块协作模式、影响评估规则

### L3 - 技术决策和约束
📄 **TECH-STACK.md** (当前文档的L3部分)  
包含：技术栈清单、版本管理、已知技术债、硬/软约束

---

**版本历史**：
- v1.0 (2026-04-03): 初始版本，模板项目

**联系方式**：
- 规范问题: 查看对应规范文件的维护信息
- 工作流问题: 参考CLAUDE.md
- 技术问题: 参考TECH-STACK.md (实际项目中完整)

---

**下一步**：
- 阅读 TECH-STACK.md 了解完整的技术决策记录
- 阅读 MODULES.md (在实际项目中) 了解模块依赖关系
- 第一次接入需求？执行 `/intake` 开始
