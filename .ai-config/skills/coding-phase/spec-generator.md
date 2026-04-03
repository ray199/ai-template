# Spec自动生成技能

## 目标

在第二阶段编码开始前，自动根据第一阶段的输出物（需求文档、原型、PRD）生成**技术实现规范(Spec)**，作为编码的明确指导，确保编码方向清晰、无歧义。

**触发时机**：工作量评估完成，进入Step 3前自动执行

**输入**：
- 需求文档（结构化）
- 原型（HTML/Figma/草图）（若有）
- 项目规范文件（.ai-config/rules/）
- 项目现有代码（参考）

**输出**：完整的技术实现规范（Spec）文件，包含5个部分

---

## Spec的定义和价值

### 什么是Spec

Spec = **Specification**（规范）是一份**代码级的技术指导文档**，比需求文档更具体、更技术化。

```
【需求文档】（业务层面）
  - 做什么（what）
  - 为什么（why）
  - 例子：支持用户权限管理

【Spec】（技术层面）
  - 怎么做（how）
  - 用什么技术栈
  - 具体的数据结构、接口定义、算法设计
  - 例子：user表的字段定义、权限检查的实现方式、API接口详细定义
```

### Spec的价值

```
【对开发人员】
  ✅ 无需频繁询问需求，Spec就是指导
  ✅ 编码前完全清楚"要实现什么"和"怎么实现"
  ✅ 减少返工（Spec定义好了，就不会偏离需求）
  ✅ 开发效率提升 20-30%

【对Code Reviewer】
  ✅ 有明确的Review标准（对标Spec）
  ✅ 发现问题时可直接指向Spec的哪一部分
  ✅ Review效率提升

【对项目经理】
  ✅ 可以更准确地跟踪进度（按Spec条目）
  ✅ 清晰的交付物定义
  ✅ 减少scope creep（功能蔓延）
```

---

## Spec的五个组成部分

### Part 1: 数据库设计规范（DB Spec）

从需求文档提取信息，自动生成DB设计：

```markdown
# DB Spec - REQ-XXXXXXXX

## 1. 核心实体

### 实体：User（用户）
**来源**：需求文档的"目标"和"scope.in"

**字段定义**：
| 字段名 | 类型 | 长度 | 约束 | 说明 | 来源 |
|---|---|---|---|---|---|
| id | BIGINT | - | PK, AUTO_INCREMENT | 用户ID | 系统规范 |
| username | VARCHAR | 50 | UNIQUE, NOT NULL | 用户名 | PRD: "支持用户名注册" |
| email | VARCHAR | 100 | UNIQUE, NOT NULL | 邮箱 | PRD: "邮箱注册" |
| password | VARCHAR | 255 | NOT NULL | 密码(加密) | PRD: "密码安全存储" |
| status | ENUM | - | NOT NULL, DEFAULT='ACTIVE' | 状态 | PRD: "用户冻结功能" |
| created_at | DATETIME | - | NOT NULL, DEFAULT=CURRENT_TIMESTAMP | 创建时间 | 系统规范 |
| updated_at | DATETIME | - | - | 更新时间 | 系统规范 |
| is_deleted | TINYINT | 1 | NOT NULL, DEFAULT=0 | 软删除标记 | 系统规范 |

**索引规划**：
- PRIMARY KEY: id
- UNIQUE INDEX: username, email
- NORMAL INDEX: status, created_at (查询优化)

**关系**：
- User 1:N Order (一个用户有多个订单)
- User 1:N Permission (一个用户有多个权限)

---

## 2. 迁移脚本规划

**脚本名**: V20240315_001__create_users_table.sql

**内容**：CREATE TABLE语句
**回滚方案**：DROP TABLE users

**初始化**：插入默认管理员账户
```

**Spec生成规则**：

```
Step 1: 从需求文档提取实体
  ├─ scope.in 中提到的对象 → 对应的表
  ├─ 验收标准中涉及的数据 → 对应的字段
  └─ 非功能需求中的约束 → 对应的索引

Step 2: 应用项目规范
  ├─ 自动添加 id, created_at, updated_at, is_deleted
  ├─ 应用命名规范 (snake_case)
  └─ 应用默认值规范

Step 3: 生成迁移脚本
  ├─ Flyway格式（V+时间戳+描述）
  └─ 包含回滚方案
```

### Part 2: API接口规范（API Spec）

从需求和原型提取信息，自动生成API设计：

```markdown
# API Spec - REQ-XXXXXXXX

## 1. 接口清单

**来源**：PRD的功能清单 + 原型的操作流程

| HTTP方法 | 端点 | 功能 | 权限 | 来自PRD | 验收标准 |
|---|---|---|---|---|---|
| GET | /api/v1/users | 用户列表 | USER | "查询用户列表" | "支持分页、搜索、排序" |
| POST | /api/v1/users | 创建用户 | PUBLIC | "创建用户" | "参数校验、唯一性检查" |
| GET | /api/v1/users/{id} | 用户详情 | USER | "查询用户详情" | "不存在返回404" |
| PUT | /api/v1/users/{id} | 更新用户 | OWNER | "编辑用户信息" | "权限检查、冲突处理" |
| DELETE | /api/v1/users/{id} | 删除用户 | ADMIN | "删除用户" | "软删除、权限检查" |

---

## 2. 接口详细定义

### POST /api/v1/users - 创建用户

**来源**：PRD的"创建用户"功能 + 原型的表单

**请求**：
```json
{
  "username": "string (3-50 chars, 必填)",
  "email": "string (email format, 必填)",
  "password": "string (8+ chars, 必填)"
}
```

**验证规则**（来自PRD的验收标准）：
- username: 长度 3-50，唯一
- email: 格式校验，唯一
- password: 最少8字符，安全存储（bcrypt）

**响应** (成功 200)：
```json
{
  "code": 200,
  "data": {
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**错误响应**（来自PRD的"不做"清单）：
- 400: USER_NAME_DUPLICATE (用户名已存在)
- 400: INVALID_EMAIL (邮箱格式错误)
- 400: WEAK_PASSWORD (密码强度不足)
- 500: INTERNAL_ERROR

---

## 3. 认证和授权

**来源**：原型中的"权限控制"说明

| 接口 | 需要认证 | 需要权限 | 规则 |
|---|---|---|---|
| GET /users | ✅ | ROLE_USER | 任何登录用户 |
| POST /users | ❌ | - | 公开（注册） |
| PUT /users/{id} | ✅ | 自己或ADMIN | 仅能修改自己或管理员 |
| DELETE /users/{id} | ✅ | ADMIN | 仅管理员 |
```

**Spec生成规则**：

```
Step 1: 从PRD提取接口需求
  ├─ 功能清单 → 接口 CRUD
  ├─ 验收标准 → 请求/响应格式
  └─ "不做"清单 → 不包含的接口

Step 2: 从原型提取细节
  ├─ 用户输入表单 → 请求字段
  ├─ 列表显示 → 响应字段
  ├─ 按钮权限 → 接口权限
  └─ 错误提示 → 错误码

Step 3: 应用项目规范
  ├─ RESTful设计
  ├─ 统一的响应格式
  ├─ 标准的HTTP状态码
  └─ 标准的错误码体系
```

### Part 3: 前端实现规范（Frontend Spec）

从原型和需求提取信息，生成前端实现指导：

```markdown
# Frontend Spec - REQ-XXXXXXXX

## 1. 页面结构

**来源**：原型的页面清单

### 页面：UserList（用户列表）
**原型位置**：docs/prototype/REQ-XXXXXXXX.html#user-list
**路由**：/users
**权限**：ROLE_USER

**页面组成**：
- 顶部: 搜索条件 + 按钮组
  ├─ 搜索框（username）
  ├─ 状态筛选（下拉框）
  ├─ 新增按钮（权限检查）
  └─ 导出按钮（权限检查）

- 中部: 用户表格
  ├─ 列：ID、用户名、邮箱、状态、创建时间、操作
  ├─ 分页：10条/页
  ├─ 排序：支持按邮箱、创建时间排序
  └─ 行操作：编辑、删除

- 底部: 分页控件

---

## 2. 组件定义

### 组件：UserTable

**来源**：原型中的表格部分

**Props**：
```typescript
interface Props {
  users: User[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  sortBy?: 'email' | 'created_at';
}
```

**Emits**：
```typescript
{
  'update:page': (page: number) => void;
  'edit': (userId: number) => void;
  'delete': (userId: number) => void;
}
```

**功能**：
- 渲染用户表格
- 分页切换
- 行操作（编辑、删除）
- 加载状态展示
- 空数据提示

---

## 3. 样式规范

**来源**：原型的设计规范

**Design Tokens**：
```scss
// 从原型提取的颜色
$primary-color: #1890ff;      // 按钮主色
$text-primary: rgba(0,0,0,0.85);  // 文字主色
$border-color: #d9d9d9;       // 边框颜色

// 从原型提取的间距
$spacing-md: 12px;            // 表格cell间距
$spacing-lg: 16px;            // 模块间距

// 从原型提取的字体
$font-size-base: 14px;        // 表格文字大小
$font-size-sm: 12px;          // 辅助文字大小
```

**响应式设计**：
- 桌面端（≥1024px）：原型完全呈现
- 平板（768-1023px）：表格可滚动
- 手机（<768px）：卡片式列表

---

## 4. 状态管理（Pinia Store）

**来源**：原型中的数据交互

```javascript
// stores/userStore.js
export const useUserStore = defineStore('user', () => {
  // State（来自API响应的数据）
  const users = ref<User[]>([]);
  const total = ref(0);
  const loading = ref(false);
  
  // Actions（来自原型中的操作）
  const fetchUsers = async (query: QueryParams) => { ... }
  const createUser = async (dto: UserDTO) => { ... }
  const updateUser = async (id, dto) => { ... }
  const deleteUser = async (id) => { ... }
});
```
```

**Spec生成规则**：

```
Step 1: 从原型提取页面和组件
  ├─ 页面清单 → 路由定义
  ├─ 原型中的模块 → 组件拆分
  └─ 用户交互 → 事件和Emits

Step 2: 从原型提取设计规范
  ├─ 颜色使用 → Design Tokens
  ├─ 字体和间距 → 样式变量
  └─ 响应式设计 → 媒体查询

Step 3: 从需求提取功能
  ├─ 验收标准 → 功能清单
  ├─ 权限控制 → 权限检查规则
  └─ 数据流 → 状态管理设计
```

### Part 4: 后端业务逻辑规范（Service Spec）

从需求提取业务规则，生成实现指导：

```markdown
# Service Spec - REQ-XXXXXXXX

## 1. 业务规则

**来源**：需求文档的验收标准和"scope"部分

### 规则：用户创建

**触发条件**：用户提交注册表单

**前置条件**（来自验收标准）：
- 用户名长度 3-50
- 邮箱格式合法
- 密码最少8字符
- 用户名和邮箱都要唯一

**执行步骤**：
1. 参数校验（@Valid）
2. 查询 username/email 是否已存在
3. 如存在，抛出 BusinessException(USER_NAME_DUPLICATE)
4. 密码使用 bcrypt 加密
5. 创建 UserDO
6. 写入数据库（事务）
7. 返回 UserDTO

**错误处理**：
| 异常 | 错误码 | 消息 | HTTP状态 |
|---|---|---|---|
| 用户名重复 | USER_NAME_DUPLICATE | 用户名已存在 | 400 |
| 邮箱重复 | EMAIL_DUPLICATE | 邮箱已注册 | 400 |
| 密码太弱 | WEAK_PASSWORD | 密码强度不足 | 400 |
| 数据库异常 | DB_ERROR | 系统异常 | 500 |

**后置条件**（来自非功能需求）：
- 响应时间 < 500ms
- 结果可缓存 1小时

---

## 2. 关键流程

**来源**：需求中的"流程"描述 或 原型中的交互流程

### 流程：用户权限检查

**触发**：每个需要权限的接口

**步骤**：
1. 从Token提取 user_id 和 role
2. 查询数据库获取用户的权限列表
3. 判断是否拥有当前操作的权限
4. 如无权限，抛出 PermissionDeniedException

**优化**：
- 权限列表缓存（Redis）
- 缓存失效时间：30分钟
```

**Spec生成规则**：

```
Step 1: 从验收标准提取业务规则
  ├─ "支持xxx时xxx" → if-then 规则
  ├─ "不支持xxx" → 限制条件
  └─ "当xxx时xxx" → 业务流程

Step 2: 从非功能需求提取约束
  ├─ 性能要求 → 缓存策略
  ├─ 并发要求 → 并发控制方案
  └─ 可靠性要求 → 重试和降级

Step 3: 定义错误处理
  ├─ 验收标准中的失败情况 → 错误码
  ├─ 业务异常 → BusinessException 定义
  └─ 系统异常 → 通用处理规则
```

### Part 5: 测试规范（Test Spec）

从需求和验收标准生成测试用例：

```markdown
# Test Spec - REQ-XXXXXXXX

## 1. Controller层测试（必需，覆盖≥90%）

**来源**：需求的验收标准 + API定义

### 测试用例：POST /api/v1/users

#### TC-001: 正常创建用户 - 200 OK
**前置条件**：用户名/邮箱不存在
**输入**：
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
**期望**：200, 返回 user_id
**来源**：PRD的"支持创建用户"

#### TC-002: 用户名已存在 - 400
**前置条件**：john_doe 已存在
**输入**：同上
**期望**：400, 错误码 USER_NAME_DUPLICATE
**来源**：PRD的验收标准"唯一性检查"

#### TC-003: 参数校验失败 - 400
**输入**：username 为空
**期望**：400, 返回验证错误
**来源**：PRD的验收标准"参数校验"

#### TC-004: 权限不足 - 403
**权限**：普通用户尝试删除他人账户
**期望**：403 Forbidden
**来源**：PRD的权限清单

---

## 2. Service层测试

**关键场景**（来自验收标准）：
- ✅ 正常创建
- ✅ 唯一性冲突
- ✅ 密码加密
- ✅ 权限检查
- ✅ 并发创建（race condition）

---

## 3. 集成测试

**场景**（来自原型的完整交互流程）：
- ✅ 用户注册 → 登录 → 编辑信息 → 删除账户的完整流程
```

**Spec生成规则**：

```
Step 1: 从验收标准提取测试用例
  ├─ 每个验收标准 → 至少一个通过用例
  └─ 每个限制条件 → 至少一个失败用例

Step 2: 从API定义提取边界测试
  ├─ 参数类型 → 边界值测试
  ├─ 参数长度 → 长度限制测试
  └─ 组合参数 → 组合场景测试

Step 3: 定义Controller层必填6场景
  ├─ 200 OK (正常)
  ├─ 400 Bad Request (参数/业务异常)
  ├─ 401 Unauthorized (认证失败)
  ├─ 403 Forbidden (权限不足)
  ├─ 404 Not Found (资源不存在)
  └─ 500 Internal Server Error (系统异常)
```

---

## Spec生成的完整流程

```
【输入】第一阶段输出物
  ├─ 需求文档（结构化）
  ├─ 原型（HTML/Figma）（若有）
  ├─ 项目现有规范（.ai-config/rules/）
  └─ 项目代码库（参考）

  ↓
【Step 1】信息提取和分类
  ├─ 从需求提取：实体、字段、验收标准、权限、错误
  ├─ 从原型提取：页面、组件、交互、样式、设计规范
  ├─ 从规范提取：命名、结构、约束、规则
  └─ 从代码提取：现有模式、技术栈、风格

  ↓
【Step 2】自动化生成5个Spec部分
  ├─ DB Spec：数据库表结构、索引、关系
  ├─ API Spec：接口定义、请求/响应、错误码
  ├─ Frontend Spec：页面、组件、样式、状态管理
  ├─ Service Spec：业务规则、流程、异常处理
  └─ Test Spec：测试用例、覆盖范围、场景

  ↓
【Step 3】跨部分一致性检查
  ├─ DB表 ↔ API请求字段：字段名、类型是否一致
  ├─ API响应 ↔ Frontend组件：数据结构是否兼容
  ├─ Service规则 ↔ Test用例：是否覆盖所有规则
  └─ 原型 ↔ Frontend样式：设计规范是否一致

  ↓
【输出】完整的技术实现规范（Spec）
  ├─ docs/spec/REQ-XXXXXXXX-db-spec.md
  ├─ docs/spec/REQ-XXXXXXXX-api-spec.md
  ├─ docs/spec/REQ-XXXXXXXX-frontend-spec.md
  ├─ docs/spec/REQ-XXXXXXXX-service-spec.md
  ├─ docs/spec/REQ-XXXXXXXX-test-spec.md
  └─ docs/spec/REQ-XXXXXXXX-spec-summary.md（汇总）
```

---

## Spec的质量检查清单

### 自动检查

```
✅ 一致性检查
   ├─ 每个DB表都有对应的API端点
   ├─ 每个API字段都有DB表支持
   ├─ 每个验收标准都有测试用例
   └─ 每个原型组件都有前端规范

✅ 完整性检查
   ├─ DB Spec: 所有实体都有字段定义
   ├─ API Spec: 所有接口都有请求/响应
   ├─ Frontend Spec: 所有页面都有组件定义
   ├─ Service Spec: 所有功能都有业务规则
   └─ Test Spec: 所有API都有6个必填测试场景

✅ 规范性检查
   ├─ 命名是否遵循规范（snake_case/camelCase/PascalCase）
   ├─ HTTP方法是否正确（GET/POST/PUT/DELETE）
   ├─ 数据类型是否明确（VARCHAR(50) vs VARCHAR）
   └─ 错误码是否统一格式（UPPER_SNAKE_CASE）
```

### 人工检查点

```
⚠️ 业务逻辑合理性
   - 规则之间有矛盾吗？
   - 优先级顺序对吗？
   - 异常处理是否完整？

⚠️ 性能可行性
   - 数据库查询是否会N+1？
   - 缓存策略是否合理？
   - 并发处理是否充分？

⚠️ 与现有系统的兼容性
   - 新接口与旧接口是否冲突？
   - 新表是否与旧表的关系正确？
   - 新规则是否与现有规范一致？
```

---

## Spec的使用流程

```
【编码前】
1. 生成Spec（自动）
2. 人工审查Spec
3. 需求方确认Spec
   ↓
【编码中】
1. 按照Spec编码
2. Spec是编码的唯一指南（无需反复询问）
3. Spec中没有的，不做
   ↓
【Code Review】
1. Review时对标Spec
2. 发现不符合Spec的代码，标为P0
3. Review时无需重新理解需求，只需对标Spec
   ↓
【测试】
1. Test Spec中定义的所有用例都必须通过
2. 追加的测试需满足一致性检查
```

---

## 完成标准

Spec生成技能完成标准：

- [ ] Spec的5个组成部分都有完整的定义
- [ ] 信息提取规则清晰（从需求→DB/API/Frontend）
- [ ] 自动生成算法可行（可从需求文档和原型提取）
- [ ] 一致性检查规则完整（5个检查维度）
- [ ] Spec文件格式统一（都是Markdown）
- [ ] 质量检查清单覆盖自动检查和人工检查
- [ ] 与编码规范(pre-coding-checklist.md)的接口清晰
- [ ] Spec可作为Code Review的对标文档
