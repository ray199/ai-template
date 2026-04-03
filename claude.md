# Claude Code 开发规范

这个文件定义了整个AI编程流程从需求接入到交付的规范和工作流程，确保使用Claude Code等AI工具时有明确的流程和输出物标准。

## 核心设计理念

- **流程清晰**：明确的阶段划分，每个阶段有明确的输入、输出和确认点
- **输出物标准化**：每个阶段输出的文档、代码都有规范，便于追踪和管理
- **自动检查**：每个阶段完成后都有自检清单，确保质量
- **人工确认点**：关键阶段需要人工确认后才能进入下一阶段，避免偏离预期

## 工作流程全景

```
┌──────────────────────────────────────────────────────────────────┐
│                简化4阶段 AI编程工作流程                          │
└──────────────────────────────────────────────────────────────────┘

原始需求输入
    ↓
【阶段1】需求接入与工作量评估
    Step 1：需求结构化 - AI检查完整性
    Step 2：工作量评估 - 需求分析师 + 架构师联合评估 (S/M/L/XL)
    Step 3：输出物规范 - 根据工作量确定文档规格
    Step 4：质量检查 - 自动/人工/终审（按等级分级）
    输出：结构化需求文档 + 评估报告
    ↓
【阶段2】代码编写
    - 技术设计（M/L/XL必需，S可跳过） ⚡
    - 源代码生成（Entity/Mapper/Service/Controller/VO）
    - DB迁移脚本（表变更）+ 单元测试骨架
    输出：源代码 + 脚本 + 测试 + 编码完成报告
    ↓
【阶段3】测试验证
    - 单元 + 集成测试执行
    - 人工Code Review（并行）
    - 问题修复 + 重新审查
    输出：测试报告 + 审查报告（通过标准）
    ↓
【阶段4】交付使用
    - 部署前检查 + 灾备验证
    - 执行部署 + 上线发布
    - 交付文档整理
    输出：发布总结 + 上线文档
    ↓
交付完成 ✅

【关键创新】工作量分级 (S/M/L/XL) 决定输出物规格和审查严度
  ➜ S：快速迭代（跳过设计，AI自动检查）
  ➜ M：标准流程（轻量设计，人工确认）
  ➜ L/XL：高质量（完整设计，人工终审）
```

## 各阶段详细说明

### 【阶段1】需求接入与工作量评估

**整体目标**
将原始需求转化为标准结构化文档，执行工作量联合评估（需求分析师 + 架构师），根据评估结果确定输出物规范和检查方式。

**完整流程（4步）**

```
原始需求输入
   ↓
【Step 1】需求结构化（需求分析师）
   - 选择模板（from_prd / from_verbal），填充字段
   - AI自动完整性检查
   - 存在缺失 → 输出澄清 → 补充 → 重新检查
   - 通过后分配 need_id → docs/requirements/backlog/
   ↓
【Step 2】工作量联合评估
   - 需求分析师：业务维度评估（5个维度打分）
   - 架构师代理：技术维度评估（4个维度打分）
   - 综合判定工作量等级（S / M / L / XL）
   ↓
【Step 3】根据工作量确定输出物规范
   - S/M：轻量/标准版，无需补充
   - L：完整版 + 技术思路骨架
   - XL：完整版 + 迭代拆分计划 + 原型
   ↓
【Step 4】输出物质量检查（自动 or 人工）
   - S：AI全自动 ✅
   - M：AI初检 + 人工确认
   - L/XL：AI初检 + 人工终审
   - 通过后进入【阶段2：代码编写】
```

---

#### Step 1：需求结构化 + 智能补全

**触发指令：** `/intake`

**输入示例**（任意形式都可以）

T1 - 一句话：
```
/intake
给用户加个角色权限
```

T2 - 零散：
```
/intake
昨天产品说要做角色管理，Admin能配置菜单，deadline好像是月底
```

T4 - 完整PRD：
```
/intake
[粘贴完整的PRD文档内容...]
```

**自动执行的Step 0A和0B**

当你触发 `/intake` 时，系统**自动**执行：

```
1. 【Step 0A】项目上下文感知（5-10秒）
   ✅ 扫描项目目录 → 识别新/旧项目
   ✅ 加载技术栈、历史需求、已有模块
   → 输出：项目上下文摘要 + 可用资源
   
2. 【Step 0B】输入质量识别（2-3秒）
   ✅ T1（一句话）→ 推荐3问引导
   ✅ T2（零散）→ 推荐推断+澄清
   ✅ T3（半结构化）→ 推荐补全+确认
   ✅ T4（完整PRD）→ 直接结构化
   → 输出：质量等级 + 推荐策略
```

**Step 1执行方式**（根据质量采用对应策略）

- **T1用户体验**：看到3个关键问题 → 回答 → 自动生成完整文档（3-5分钟）
- **T2用户体验**：看到推断内容 + 3个澄清问题 → 确认+回答 → 自动生成文档（5-10分钟）
- **T3用户体验**：看到完整草稿 + 2个确认问题 → 确认 → 进入Step 2（2-3分钟）
- **T4用户体验**：直接获得完整结构化文档 → 进入Step 2（1分钟）

**关键特性：自动补全**

所有可以从项目上下文推断的字段会自动填写，标注来源：

```
技术栈 ✅ [自动从 .ai-config/rules/01_tech_stack.mdc]
影响模块 ⚠️ [推断：可能涉及 user 模块]
相似历史需求 ⚠️ [推断：检测到REQ-20240310-002类似]
```

用户可以直接确认或修改这些推断，**避免重复填写已知信息**。

**输出物规范**

完整的结构化需求文档，保存至 `docs/requirements/backlog/REQ-XXXXXXXX.md`

**完成标准**
- [ ] 6个核心字段全部填写（need_id / title / priority / deadline / goal / acceptance）
- [ ] 自动补全的字段都标注了来源
- [ ] 所有澄清问题都已回答（T1需3问，T2需3问，T3需2问，T4需0问）
- [ ] 文档已分配ID并保存到backlog目录

---

#### Step 2：工作量联合评估

**触发指令：** `/evaluate-workload REQ-XXXXXXXX`

**评估维度**

参考 `.ai-config/skills/intake-requirement/workload-evaluation.md`，分别由两个角色评估：

**需求分析师 - 业务维度（5项）**
| 维度 | 低（1分） | 中（2分） | 高（3分） |
|---|---|---|---|
| 涉及页面数 | 0-1 | 2-4 | 5+ |
| 涉及接口数 | 0-2 | 3-6 | 7+ |
| 数据库变更 | 无 | 改字段/索引 | 新表/重构 |
| 影响已有功能 | 无 | 局部 | 跨模块/核心 |
| 数据迁移 | 无 | 可自动化 | 需人工 |

**架构师 - 技术维度（4项）**
| 维度 | 低（1分） | 中（2分） | 高（3分） |
|---|---|---|---|
| 架构变更范围 | 无 | 单模块 | 跨模块/新组件 |
| 引入新技术 | 否 | 轻量 | 重型/第三方 |
| 性能/并发挑战 | 无要求 | 百级QPS | 高并发/大数据 |
| 安全/权限变更 | 无 | 局部 | 核心逻辑 |

**工作量等级判定**

| 条件 | 等级 | 工期 |
|---|---|---|
| 业务分 ≤ 7 且 技术分 ≤ 6，无3分项 | **S** | 1-2天 |
| 业务分 8-10 或 技术分 7-8，最多1个3分项 | **M** | 3-5天 |
| 业务分 11-13 或 技术分 9-10，有1-2个3分项 | **L** | 1-2周 |
| 业务分 ≥ 14 或 技术分 ≥ 11，多个3分项，或跨迭代 | **XL** | 需拆分 |

> 兜底规则：单个3分项且涉及核心业务 → 升L；多个3分项或跨迭代 → 升XL

**输出物规范**

```markdown
# 工作量联合评估报告

- **need_id**: REQ-XXXXXXXX
- **最终等级**: S / M / L / XL
- **推荐输出物**: [根据等级列出]
```

**完成标准**
- [ ] 业务和技术维度均已评分
- [ ] 最终等级已确定
- [ ] 推荐输出物已明确

---

#### Step 3：根据工作量确定输出物规范

根据最终等级，确定该需求需要什么规格的输出物：

**S等级（轻量版）**
- 必填字段：6个（need_id + title + priority + deadline + goal + acceptance）
- 无需补充，直接进入检查

**M等级（标准版）**
- 必填字段：10个（S的全部 + background + scope.in/out + tech_constraints + acceptance≥2条）
- 检查方式：AI初检 + 人工确认

**L等级（完整版）**
- 必填字段：15个（M的全部 + stakeholders + non_functional + risks + tech_sketch + acceptance≥3条）
- 需补充：技术思路骨架、干系人、非功能需求、风险点
- 可选：UI原型（涉及前端时建议）
- 检查方式：AI初检 + 人工终审

**XL等级（超大型，需拆分）**
- 必填字段：L的全部 + iteration_plan + milestones
- 需补充：迭代拆分计划（拆分为多个L/M）、里程碑
- 必须：UI原型（如有前端）
- 检查方式：AI初检 + 人工终审 + 团队评审

**完成标准**
- [ ] 已根据等级补充缺失字段
- [ ] 补充内容符合对应等级规范

---

#### Step 4：输出物质量检查

**检查规则（按工作量分级）**

**S等级 - AI全自动检查** ✅
- 6个核心字段全部非空 → 通过，直接进阶段2

**M等级 - AI初检 + 人工确认**
- AI检查：10个字段完整性 + 格式合规
- 人工确认：业务逻辑准确、目标可达

**L等级 - AI初检 + 人工终审**
- AI检查：15个字段完整性 + tech_sketch存在
- 人工终审：方案可行性、风险评估、架构一致性

**XL等级 - AI初检 + 人工终审 + 团队评审**
- AI检查：字段完整 + 拆分合理性
- 人工终审：整体方向、拆分粒度
- 团队评审：资源分配、依赖关系确认

**完成标准**
- [ ] 所有字段检查通过
- [ ] 无阻断性问题
- [ ] （如有）人工终审已通过
- [ ] （XL）团队评审已通过
- 准备进入【阶段2：代码编写】

---

### 【阶段2】代码编写

**触发指令：** `/code REQ-XXXXXXXX`

**目标**
根据需求文档和工作量等级，执行技术设计（如需）和代码编写，产出可运行的源代码、测试和部署脚本。

**执行流程（根据工作量分级）**

```
需求文档（已评估工作量等级）
   ↓
IF 工作量 == S THEN
   跳过设计，直接代码编写 → 生成代码 → 单元测试
ELSE IF 工作量 IN [M, L, XL] THEN
   执行技术设计 → 设计评审 → 代码编写 → 单元测试
END IF
   ↓
产出：源代码 + DB脚本 + 测试骨架 + 编码完成报告
```

**执行代理：** 架构师代理（设计）+ 后端开发代理（编码）

---

#### 子步骤A：技术设计（M/L/XL工作量必需）

**触发指令：** `/design REQ-XXXXXXXX`

**目标**
为M/L/XL等级的需求生成技术设计文档，覆盖架构、数据库、接口、实现路径四个维度。

**执行代理：** 架构师代理

**输出物规范**

**技术设计文档** (`docs/design/REQ-XXXXXXXX-design.md`)

```markdown
# 技术设计文档

- **need_id**: REQ-XXXXXXXX
- **设计版本**: v1.0
- **设计日期**: YYYY-MM-DD
- **设计者**: architect
- **状态**: 待评审

---

## 一、架构影响分析

### 变更类型
[ 新增模块 / 改造已有模块 / 纯新功能 ]

### 受影响模块
| 模块 | 影响程度 | 说明 |
|---|---|---|
| user模块 | 高 | 新增查询接口，Service层需扩展 |
| auth模块 | 低 | 只读依赖，无变更 |

### 技术组件决策
| 组件 | 是否引入 | 理由 |
|---|---|---|
| Redis | ❌ 否 | 暂无缓存需求 |
| MQ | ❌ 否 | 全同步流程 |

---

## 二、数据库设计

### 新增/修改表

#### 表：user_extend
> 存储用户扩展信息（手机、地址等）

\`\`\`sql
CREATE TABLE \`user_extend\` (
  \`id\` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  \`user_id\` BIGINT NOT NULL COMMENT '用户ID',
  \`phone\` VARCHAR(20) NOT NULL COMMENT '手机号',
  \`address\` VARCHAR(255) COMMENT '地址',
  \`create_time\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`update_time\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  \`is_deleted\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_user_extend_user_id\` (\`user_id\`),
  INDEX \`idx_user_extend_phone\` (\`phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户扩展信息表';
\`\`\`

### 数据迁移脚本
[DDL语句或ALTER语句]

### 回滚方案
[说明如何回滚的方案]

---

## 三、接口设计

### 接口清单
| 接口名 | Method | URL | 权限 | 说明 |
|---|---|---|---|---|
| 创建用户 | POST | /api/v1/user | 登录用户 | 注册新用户 |
| 获取用户信息 | GET | /api/v1/user/{id} | 登录用户 | 查询单个用户详情 |
| 更新用户信息 | PUT | /api/v1/user/{id} | 登录用户 | 全量更新用户信息 |
| 删除用户 | DELETE | /api/v1/user/{id} | 管理员 | 软删除用户 |

### 接口详细说明

#### POST /api/v1/user - 创建用户

**请求头**
\`\`\`
Authorization: Bearer {token}
Content-Type: application/json
\`\`\`

**请求体**
\`\`\`json
{
  "username": "string, 必填, 用户名, 3-20字符",
  "password": "string, 必填, 密码, 8-32字符",
  "email": "string, 必填, 邮箱",
  "phone": "string, 可选, 手机号"
}
\`\`\`

**响应**
\`\`\`json
{
  "code": 200,
  "msg": "success",
  "data": {
    "user_id": 123,
    "username": "john_doe"
  }
}
\`\`\`

**错误码**
| 错误码 | 说明 | 触发场景 |
|---|---|---|
| USER_001 | 用户名已存在 | username重复 |
| USER_002 | 邮箱格式错误 | email不合法 |
| USER_003 | 密码强度不足 | password过弱 |

---

## 四、关键实现路径

### 核心流程：用户注册

\`\`\`
1. Controller 接收请求，@Valid 校验参数
2. Service.register() 开启事务
   2.1 查询username是否已存在
   2.2 若存在，抛出 USER_001 异常
   2.3 密码使用 bcrypt 加密
   2.4 写入user表和user_extend表
   2.5 发送欢迎邮件（异步，不影响主流程）
3. 返回注册成功响应，包含user_id
\`\`\`

### 并发场景处理
- **用户名重复**：数据库唯一索引保证
- **邮箱重复**：业务判断，防止注册重复

### 技术风险点
| 风险 | 概率 | 影响 | 应对方案 |
|---|---|---|---|
| 邮件发送失败 | 中 | 低 | 邮件异步发送，失败重试 |
| 密码明文泄露 | 低 | 高 | 前端HTTPS + bcrypt加密 |

---

## 五、待评审确认项

> ⚠️ 以下事项需要团队评审后确认

- [ ] 数据库设计是否符合DBA规范
- [ ] 接口版本号是否与现有规划一致
- [ ] 是否有遗漏的错误处理场景
- [ ] 邮件通知是否需要改为消息队列异步处理

确认无异议后回复：`/design-confirm REQ-XXXXXXXX`
```

**完成标准**
- [ ] 架构影响分析已完成
- [ ] 数据库设计完整（含DDL、迁移、回滚）
- [ ] 接口设计完整（含请求/响应示例、错误码）
- [ ] 关键实现路径清晰
- [ ] 技术风险点已识别
- [ ] 团队已评审确认

---

### 【阶段3】编码实现

**触发指令：** `/code REQ-XXXXXXXX`

**目标**
根据技术设计文档驱动代码生成，确保每个编码任务有清晰的输入输出和完成标准。

**执行代理：** 后端开发代理、DBA代理

**输出物规范**

1. **代码文件**（根据设计生成）
   - 数据库迁移脚本：`src/main/resources/db/migration/Vxxxxxxxxxx__desc.sql`
   - Entity类：`src/main/java/.../entity/XxxDO.java`
   - Mapper接口和XML：`src/main/java/.../mapper/XxxMapper.java` + `XxxMapper.xml`
   - Service接口和实现：`src/main/java/.../service/XxxService.java` + `impl/XxxServiceImpl.java`
   - Controller：`src/main/java/.../controller/XxxController.java`
   - VO/DTO：`src/main/java/.../vo/XxxVO.java`
   - 测试骨架：`src/test/java/.../service/XxxServiceImplTest.java`

2. **编码完成报告** (`docs/design/REQ-XXXXXXXX-code-report.md`)
   ```markdown
   # 编码完成报告
   
   - **need_id**: REQ-XXXXXXXX
   - **完成时间**: YYYY-MM-DD
   - **执行代理**: backend_dev
   
   ---
   
   ## 生成文件清单
   
   | 文件路径 | 类型 | 说明 | 状态 |
   |---|---|---|---|
   | src/main/.../entity/UserDO.java | Entity | 用户实体 | ✅ |
   | src/main/.../mapper/UserMapper.java | Mapper | 数据访问 | ✅ |
   | src/main/.../service/UserService.java | Service | 业务接口 | ✅ |
   | src/main/.../service/impl/UserServiceImpl.java | Service实现 | 业务逻辑 | ✅ |
   | src/main/.../controller/UserController.java | Controller | 接口入口 | ✅ |
   | src/main/resources/db/migration/Vxxxxxxxxxx__add_user_table.sql | DDL | DB迁移脚本 | ✅ |
   | src/test/.../service/UserServiceImplTest.java | 测试 | Service单元测试 | ✅ |
   
   ---
   
   ## 规范自检结果
   
   ### 通用规范
   - ✅ 包名符合规范
   - ✅ 无System.out.println，使用@Slf4j
   - ✅ 无魔法值，常量已定义
   - ✅ 方法长度合理
   
   ### Java 8规范
   - ✅ 使用Stream API
   - ✅ 使用Optional处理null
   - ✅ 使用LocalDateTime
   
   ### MyBatis规范
   - ✅ Mapper方法名清晰
   - ✅ 业务逻辑在Service层
   - ✅ 无N+1问题
   - ✅ 未使用SELECT *
   
   ### 事务规范
   - ✅ 写操作加@Transactional
   - ✅ 指定rollbackFor = Exception.class
   
   ### 异常处理规范
   - ✅ 使用BusinessException
   - ✅ 异常已记录日志
   - ✅ 权限校验已覆盖
   
   ### 安全规范
   - ✅ 参数使用@Valid校验
   - ✅ 敏感数据已脱敏
   
   ---
   
   ## 待开发者确认
   
   - [ ] 业务逻辑实现符合设计文档
   - [ ] 单元测试骨架已填充或标注TODO
   - [ ] DB迁移脚本已在开发环境验证
   - [ ] 代码自检结果已通过
   
   确认完毕请回复：`/code-confirm REQ-XXXXXXXX`
   ```

**编码过程中的自检清单**

| 检查项 | 检查内容 |
|---|---|
| **代码规范** | 遵循《02_code_style.mdc》 |
| **安全规范** | 遵循《03_security.mdc》 |
| **命名规范** | 参考包名、类名、方法名规范 |
| **日志使用** | 使用@Slf4j + log.xxx，无System.out |
| **异常处理** | 抛出BusinessException，记录堆栈 |
| **事务处理** | 写操作加@Transactional |
| **数据校验** | 参数使用@Valid校验 |
| **权限校验** | 接口权限验证已覆盖 |

**完成标准**
- [ ] 所有设计中的代码文件已生成
- [ ] 代码规范自检已通过
- [ ] DB迁移脚本已生成且可执行
- [ ] 单元测试骨架已生成
- [ ] 编码完成报告已生成
- [ ] 开发者已确认所有输出

---

### 【阶段4】测试与验证

**触发指令：** `/test REQ-XXXXXXXX`

**目标**
执行单元测试、集成测试和系统测试，生成测试报告和覆盖率报告。

**执行代理：** QA工程师代理

**输出物规范**

1. **单元测试完成报告** (`docs/test/REQ-XXXXXXXX-unit-test.md`)
   ```markdown
   # 单元测试报告
   
   - **need_id**: REQ-XXXXXXXX
   - **测试日期**: YYYY-MM-DD
   - **测试类型**: Unit Test
   
   ---
   
   ## 测试执行摘要
   
   | 指标 | 数值 |
   |---|---|
   | 总测试数 | 15 |
   | 通过数 | 15 |
   | 失败数 | 0 |
   | 成功率 | 100% |
   | 代码覆盖率 | 92% |
   | 分支覆盖率 | 85% |
   
   ---
   
   ## 测试用例清单
   
   ### UserServiceImpl
   - ✅ testRegister_success - 正常注册用户
   - ✅ testRegister_usernameDuplicate - 用户名重复时抛出异常
   - ✅ testRegister_invalidEmail - 邮箱格式错误时抛出异常
   - ✅ testLogin_success - 正常登录
   - ✅ testLogin_userNotFound - 用户不存在时返回错误
   - ✅ testLogin_passwordWrong - 密码错误时返回错误
   
   ---
   
   ## 覆盖率详情
   
   | 类 | 语句覆盖 | 分支覆盖 | 说明 |
   |---|---|---|---|
   | UserServiceImpl | 95% | 90% | 充分覆盖主流程和异常分支 |
   | UserController | 88% | 80% | 覆盖核心接口，部分边界场景未测 |
   | UserMapper | 100% | - | SQL执行，无分支 |
   
   ---
   
   ## 存在的问题和改进建议
   
   - [ ] 无阻断性问题
   - [ ] 建议：缓存失效场景建议补充集成测试
   
   确认无误请回复：`/test-confirm REQ-XXXXXXXX`
   ```

2. **集成测试报告** （如有）
   ```markdown
   # 集成测试报告
   
   - **need_id**: REQ-XXXXXXXX
   - **测试日期**: YYYY-MM-DD
   - **测试环境**: 测试库
   
   ---
   
   ## 核心流程集成测试
   
   ### 用户注册流程
   - ✅ 前端 → Controller → Service → DB → 邮件通知
   - ✅ 并发注册（100并发，成功99个，失败1个重复）
   - ✅ 异常回滚（注册失败时DB无脏数据）
   
   ### 用户登录流程
   - ✅ 正常登录 → token生成 → 权限校验
   - ✅ 多次登录 → token更新 → 旧token失效
   
   ---
   
   ## 性能测试
   
   | 接口 | QPS | 平均响应时间 | P99响应时间 | 说明 |
   |---|---|---|---|---|
   | POST /api/v1/user | 500 | 50ms | 150ms | 满足预期 |
   | GET /api/v1/user/{id} | 2000 | 10ms | 50ms | 优于预期 |
   
   ---
   
   ## 存在的问题
   
   - [ ] 无阻断性问题，可上线
   
   确认无误请回复：`/test-confirm REQ-XXXXXXXX`
   ```

**完成标准**
- [ ] 所有核心功能单元测试已通过
- [ ] 代码覆盖率达到 ≥80%
- [ ] 重点流程集成测试已通过
- [ ] 性能指标满足要求
- [ ] 测试报告已生成
- [ ] QA已确认无阻断性问题

---

### 【阶段5】代码审查

**触发指令：** `/review REQ-XXXXXXXX`

**目标**
由人类开发者对代码进行专业审查，确保代码质量、架构合理性和可维护性。

**审查维度**

1. **代码质量**
   - 命名是否清晰易懂
   - 逻辑是否清晰，是否需要重构
   - 是否有明显的性能问题
   - 是否遵循项目规范

2. **架构合理性**
   - 模块划分是否合理
   - 依赖关系是否正确
   - 是否引入了不必要的复杂性

3. **安全性**
   - 是否有SQL注入风险
   - 是否有XSS风险
   - 是否有权限校验漏洞
   - 敏感信息是否妥善处理

4. **可维护性**
   - 是否有完整的注释和文档
   - 测试覆盖是否充分
   - 错误处理是否完善
   - 日志是否充分

5. **业务逻辑**
   - 是否符合技术设计文档
   - 是否完整覆盖验收标准

**输出物规范**

**代码审查报告** (`docs/review/REQ-XXXXXXXX-review.md`)

```markdown
# 代码审查报告

- **need_id**: REQ-XXXXXXXX
- **审查日期**: YYYY-MM-DD
- **审查者**: senior_developer
- **审查结论**: [通过 / 需改进 / 不通过]

---

## 一、质量评分

| 维度 | 评分 | 评语 |
|---|---|---|
| 代码质量 | ⭐⭐⭐⭐ | 代码风格规范，逻辑清晰 |
| 架构合理性 | ⭐⭐⭐⭐ | 模块划分合理，无冗余设计 |
| 安全性 | ⭐⭐⭐⭐⭐ | 权限校验完备，无明显漏洞 |
| 可维护性 | ⭐⭐⭐ | 注释较少，建议补充字段说明 |
| 业务完整性 | ⭐⭐⭐⭐⭐ | 完整覆盖设计文档和验收标准 |

---

## 二、发现的问题

### 🔴 阻断性问题（必须修复）

1. **UserServiceImpl.register()** - 缺少邮件发送失败的异常处理
   ```java
   // 当前代码：邮件异常会导致整个注册失败回滚
   sendWelcomeEmail(user);  // 需要try-catch处理
   ```
   **建议**：邮件发送失败不应该导致注册失败，改为异步发送
   
2. **UserController** - 缺少CSRF防护
   ```java
   // POST接口缺少@PostMapping的CSRF令牌校验
   ```
   **建议**：添加@RequestMapping的CSRF配置

### 🟡 警告性问题（建议改进）

3. **UserMapper.selectByUserId()** - 可考虑加缓存
   ```java
   // 这是个高频查询（根据文档预期2000 QPS），建议加缓存
   ```
   **建议**：在Service层添加Redis缓存逻辑

4. **测试覆盖** - UserController缺少集成测试
   ```java
   // 仅有单元测试，缺少HTTP层面的集成测试
   ```
   **建议**：补充MockMvc集成测试用例

---

## 三、赞扬点

✅ 错误处理完善，每个业务分支都有对应的异常定义
✅ 日志充分，关键路径都有info日志记录
✅ SQL优化到位，避免了N+1问题
✅ 并发安全，使用了适当的锁机制

---

## 四、审查清单

- [x] 代码符合项目风格规范
- [x] 功能完整实现了设计文档
- [x] 测试覆盖充分（>80%）
- [ ] 所有阻断性问题已修复（待修复）
- [x] 性能符合要求
- [x] 安全性通过评估

---

## 五、修改建议总结

| 问题 | 优先级 | 处理方式 |
|---|---|---|
| 邮件异常处理 | P0 | 必须修复后再合并 |
| CSRF防护 | P0 | 必须修复后再合并 |
| Redis缓存 | P1 | 可作为后续优化 |
| 集成测试 | P1 | 可作为后续补充 |

---

## 六、最终结论

- **当前状态**: ❌ 需要修复（阻断性问题×2）
- **预期修复时间**: 1-2小时
- **下一步**: 修复后重新请求审查

修复完成请回复：`/review-fix REQ-XXXXXXXX`，修复后可重新触发 `/review` 进行复审
```

**完成标准**
- [ ] 代码审查已完成
- [ ] 阻断性问题已修复并重新审查通过
- [ ] 代码审查报告已确认无遗留问题
- [ ] 准备好合并到主分支

---

### 【阶段6】交付

**触发指令：** `/deliver REQ-XXXXXXXX`

**目标**
整理交付物、生成交付文档和部署指南，准备生产发布。

**输出物规范**

**交付说明文档** (`docs/delivery/REQ-XXXXXXXX-delivery.md`)

```markdown
# 交付说明

- **need_id**: REQ-XXXXXXXX
- **交付日期**: YYYY-MM-DD
- **交付版本**: v1.0.0
- **交付者**: release_manager

---

## 一、功能清单

| 功能 | 状态 | 说明 |
|---|---|---|
| 用户注册 | ✅ 完成 | 支持邮箱/用户名注册 |
| 用户登录 | ✅ 完成 | 支持JWT Token认证 |
| 用户列表 | ✅ 完成 | 支持分页和搜索 |
| 用户信息编辑 | ✅ 完成 | 支持头像、手机、地址编辑 |
| 用户删除 | ✅ 完成 | 软删除，可恢复 |

---

## 二、代码变更清单

| 文件 | 变更类型 | 说明 |
|---|---|---|
| src/main/java/.../user/entity/UserDO.java | 新增 | 用户实体 |
| src/main/java/.../user/service/UserService.java | 新增 | 用户业务接口 |
| src/main/java/.../user/controller/UserController.java | 新增 | 用户API接口 |
| src/main/resources/db/migration/V20240315_01__add_user_table.sql | 新增 | DB迁移脚本 |
| pom.xml | 修改 | 新增jwt和bcrypt依赖 |

---

## 三、部署步骤

### 前置条件
- [ ] 目标环境DB已备份
- [ ] 目标环境已停止旧版本服务
- [ ] 目标环境Java版本≥1.8

### 部署步骤
1. **执行DB迁移脚本**
   ```bash
   # 在目标库执行以下脚本
   mysql -u root -p < V20240315_01__add_user_table.sql
   ```

2. **部署应用**
   ```bash
   # 上传新版本jar到服务器
   scp target/app-v1.0.0.jar user@server:/app/
   
   # 启动应用
   java -jar /app/app-v1.0.0.jar
   ```

3. **验证部署**
   ```bash
   # 检查健康状态
   curl http://localhost:8080/health
   
   # 验证新接口可用
   curl -X POST http://localhost:8080/api/v1/user \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"Test@123","email":"test@example.com"}'
   ```

### 回滚方案
若部署失败，执行以下回滚步骤：

1. **停止新版本服务**
   ```bash
   kill -9 {pid_of_new_version}
   ```

2. **回滚DB变更**
   ```bash
   mysql -u root -p < rollback.sql
   ```

3. **启动旧版本服务**
   ```bash
   java -jar /app/app-v0.9.0.jar
   ```

---

## 四、交付检查清单

### 代码质量检查
- [x] 代码已通过Code Review
- [x] 单元测试覆盖率 ≥80%
- [x] 集成测试已全部通过

### 文档检查
- [x] 技术设计文档已更新
- [x] API文档已更新（含错误码）
- [x] 部署指南已编写

### 部署检查
- [x] DB迁移脚本已测试
- [x] 回滚方案已验证
- [x] 性能监控告警已配置

### 发布检查
- [x] 发布计划已制定
- [x] 灾备方案已确认
- [x] 客户通知已发送

---

## 五、已知限制

- 当前版本不支持用户批量导入，后续可作为优化
- 用户头像暂不支持图片编辑功能，仅支持URL替换

---

## 六、联系信息

- **技术负责人**: developer@company.com
- **发布窗口**: 每周二 10:00-11:00
- **紧急回滚**: 可随时执行，需技术lead批准

交付完成，准备上线。
```

**完成标准**
- [ ] 所有功能验收标准已通过
- [ ] 代码已合并到主分支
- [ ] 部署脚本已测试可用
- [ ] 回滚方案已验证
- [ ] 发布文档已完成
- [ ] 交付物清单已确认

---

## 关键规范和工具

### 工作流程确认指令汇总

| 阶段 | 指令 | 含义 |
|---|---|---|
| 阶段0 | `/intake` | 开始需求接入 |
| 阶段0 | `/intake-confirm REQ-XXX` | 确认需求完整 |
| 阶段1 | `/evaluate REQ-XXX` | 开始需求评估 |
| 阶段1 | `/evaluate-confirm REQ-XXX` | 确认评估结果和输出物 |
| 阶段2 | `/design REQ-XXX` | 开始技术设计 |
| 阶段2 | `/design-confirm REQ-XXX` | 确认设计方案 |
| 阶段3 | `/code REQ-XXX` | 开始编码实现 |
| 阶段3 | `/code-confirm REQ-XXX` | 确认代码完整 |
| 阶段4 | `/test REQ-XXX` | 开始测试执行 |
| 阶段4 | `/test-confirm REQ-XXX` | 确认测试通过 |
| 阶段5 | `/review REQ-XXX` | 开始代码审查 |
| 阶段5 | `/review-fix REQ-XXX` | 提交修复后重新审查 |
| 阶段6 | `/deliver REQ-XXX` | 开始交付准备 |

### 规范文件索引

使用这些规范文件指导各阶段工作：

- **系统角色定义**: `.ai-config/rules/00_system_role.mdc` - 定义Claude Code的角色和能力
- **技术栈规范**: `.ai-config/rules/01_tech_stack.mdc` - 指定技术选型和版本要求
- **代码风格规范**: `.ai-config/rules/02_code_style.mdc` - 命名、注释、目录结构标准
- **安全规范**: `.ai-config/rules/03_security.mdc` - 防SQL注入、XSS、鉴权等
- **Git工作流**: `.ai-config/rules/04_git_workflow.mdc` - Commit、分支、PR规范
- **开发流程**: `.ai-config/rules/05_workflow.mdc` - 整体流程确认机制

### 文档管理

**需求文档**：`docs/requirements/`
- `backlog/` - 待评估的新需求
- `approved/` - 已评估的需求和评估报告
- `done/` - 已交付的需求（归档）

**设计文档**：`docs/design/`
- `REQ-XXX-design.md` - 技术设计文档
- `REQ-XXX-code-report.md` - 编码完成报告

**测试文档**：`docs/test/`
- `REQ-XXX-unit-test.md` - 单元测试报告
- `REQ-XXX-integration-test.md` - 集成测试报告

**审查文档**：`docs/review/`
- `REQ-XXX-review.md` - 代码审查报告

**交付文档**：`docs/delivery/`
- `REQ-XXX-delivery.md` - 交付说明

---

## 示例工作流

假设你有一个需求"为用户管理系统添加用户权限管理功能"，完整流程如下：

### 第1天：需求阶段
```
1. 提供原始需求
   /intake
   [粘贴需求描述]
   
2. 确认需求完整
   /intake-confirm REQ-20240315-001
   
3. 评估需求价值和复杂度
   /evaluate REQ-20240315-001
   
4. 根据推荐，生成Spec和原型
   /spec REQ-20240315-001
   /prototype REQ-20240315-001
   
5. 确认评估结果
   /evaluate-confirm REQ-20240315-001
```

### 第2-3天：设计阶段
```
1. 启动技术设计
   /design REQ-20240315-001
   
2. 与团队讨论设计方案
   [Code Review设计]
   
3. 确认设计无误
   /design-confirm REQ-20240315-001
```

### 第4-5天：开发阶段
```
1. 启动编码实现
   /code REQ-20240315-001
   
2. 验证代码质量
   /code-confirm REQ-20240315-001
```

### 第6天：测试阶段
```
1. 执行测试
   /test REQ-20240315-001
   
2. 确认测试通过
   /test-confirm REQ-20240315-001
```

### 第7天：审查和交付
```
1. 人工Code Review
   /review REQ-20240315-001
   
2. 修复问题（如有）
   [修复代码]
   /review-fix REQ-20240315-001
   
3. 准备交付
   /deliver REQ-20240315-001
   
4. 上线部署
   [执行部署脚本]
```

---

## 快速开始

1. **第一次使用？** 从阅读这个文件开始
2. **有新需求？** 按照"示例工作流"执行各阶段
3. **遇到问题？** 参考对应阶段的"完成标准"检查清单
4. **需要定制？** 修改 `.ai-config/rules/` 下的规范文件

---

## 反馈和改进

这个规范是活的文档，会随着项目演进而优化。如果你有以下情况，请记录在内存系统：

- 某个阶段的规范不适用，需要调整
- 发现了规范中的遗漏或冲突
- 团队有新的最佳实践可以纳入

持续改进，让流程越来越高效！
