# 技能：技术设计

## 技能描述

在需求评估和输出物确认完成后，由架构师代理主导执行技术设计。  
产出可供开发直接落地的设计文档，覆盖架构、数据库、接口、关键实现路径四个维度。

## 触发指令

- `/design` - 对指定需求启动完整技术设计
- `/design --db` - 仅输出数据库设计
- `/design --api` - 仅输出接口设计
- `/design --check` - 检查设计文档完整性（不生成新内容）

## 处理流程

```
输入：approved 的需求文档（/intake 输出）+ 原型文件（若存在）
       ↓
[Step 1] 加载上下文并校验输入
         必须存在（缺失则终止并提示先执行对应命令）：
         - docs/requirements/backlog/REQ-XXXXXXXX.md  ← /intake 输出
         可选读取（存在则必须读）：
         - docs/prototype/REQ-XXXXXXXX.html / REQ-XXXXXXXX-wireframe.md  ← /intake 或 /prototype 输出
         ↓
         检测项目类型（二选一）：
         ├─ 【全新项目】src/main/java/ 和 src/ 均不存在
         │   → 跳过代码扫描
         │   → 读取 .ai-config/rules/01_tech_stack.mdc 确定基础技术栈约定
         │   → 架构影响分析中标注"全新项目，从零建立"
         └─ 【已有项目】存在现有代码
             → 扫描 backend: src/main/java/；frontend: src/ 或 frontend/src/
             → 读取 docs/db/（已有表结构）、docs/api/（已有接口）
             → 扫描 docs/requirements/done/（历史需求，排查依赖）
         ↓
         检测项目结构：
         - 前后端分离：package.json + pom.xml / *.csproj / requirements.txt 同时存在
         ↓
[Step 2] 架构影响分析
         - 判断本次需求是：全新项目 / 新增模块 / 改造已有功能 / 跨模块联动
         - 识别受影响的前端页面模块和后端服务模块
         - 全新项目：定义基础模块划分（如 user/auth/business）
         - 全新项目：**必须输出"项目骨架规划"节**（见输出格式），供 /code 阶段直接生成骨架文件
         - 确定是否需要引入新技术组件（缓存、消息队列等）
         ↓
[Step 3] 数据库设计（后端）
         - 新增/修改表设计（含字段、类型、索引、约束）
         - 数据迁移脚本策略（新表 / 加字段 / 数据填充）
         ↓
[Step 4] 接口设计（前后端契约）
         - 定义 RESTful 接口（URL、Method、请求/响应结构）
         - 标注鉴权方式和权限要求
         - 定义统一错误码
         - 这是前后端联调的契约，前端设计需与此对齐
         ↓
[Step 4.5] 前端 UI 设计（若项目含前端，必须执行）
         - 页面清单：列出本次新增或改造的页面及其路由
         - 组件拆分：为每个页面设计组件树（页面级 view + 可复用 component）
         - 状态管理：标注哪些数据需要放 Pinia/Vuex Store，哪些是本地状态
         - API 调用层：明确每个页面/组件调用哪些后端接口（对应 Step 4）
         ↓
[Step 5] 关键实现路径
         - 描述核心业务流程的前后端协作时序（用户操作 → 前端请求 → 后端处理 → 响应渲染）
         - 标注技术风险点和解决方案
         ↓
[Step 6] 输出设计文档，等待团队确认
```

---

## 上下文扫描规则

| 扫描目标 | 目的 | 适用场景 |
|---|---|---|
| `docs/requirements/backlog/REQ-XXXXXXXX.md` | 需求来源（必读） | 所有项目 |
| `docs/prototype/REQ-XXXXXXXX*` | 需求阶段已生成的原型/截图描述（若存在必读） | 所有项目 |
| `.ai-config/rules/01_tech_stack.mdc` | 确定基础技术栈约定 | 所有项目（全新项目必读） |
| `src/main/java/` 目录结构 | 了解现有后端模块划分 | 已有项目 |
| `src/` 或 `frontend/src/`（views/、components/） | 了解现有前端页面和组件 | 已有项目 |
| `docs/db/` 或 MCP schema 工具 | 避免重复建表，了解已有字段 | 已有项目 |
| `docs/api/` | 接口命名和版本保持一致 | 已有项目 |
| `docs/requirements/done/` | 排查与历史功能的依赖 | 已有项目 |

> ⚠️ **已有项目**：扫描结果必须引用来源，不允许凭空推断现有代码结构。  
> ✅ **全新项目**：无现有代码可扫描，基于 `01_tech_stack.mdc` 和需求文档定义初始结构，在设计文档中标注"全新项目"。

---

## 数据库设计规范（Java 8 + MyBatis 场景）

### 建表规则
- 所有新表必须包含：`id (BIGINT AUTO_INCREMENT PK)`、`create_time (DATETIME)`、`update_time (DATETIME)`、`is_deleted (TINYINT DEFAULT 0)`
- 字段命名：下划线分隔小写（`user_name`），与 Java 字段通过 MyBatis 映射
- 软删除：使用 `is_deleted` 字段，**禁止**物理删除业务数据
- 索引命名：`idx_表名_字段名`，唯一索引：`uk_表名_字段名`
- 敏感字段（手机号、身份证）必须标注加密存储说明

### 数据迁移策略
- 新表：提供完整 DDL
- 加字段：提供 `ALTER TABLE` 语句 + 存量数据填充 SQL
- 结构变更：说明是否需要停服窗口，提供回滚方案

---

## 接口设计规范

### URL 命名规则
```
POST   /api/{version}/{模块}/{资源}          # 创建
GET    /api/{version}/{模块}/{资源}/{id}     # 详情
PUT    /api/{version}/{模块}/{资源}/{id}     # 全量更新
PATCH  /api/{version}/{模块}/{资源}/{id}     # 部分更新
DELETE /api/{version}/{模块}/{资源}/{id}     # 删除（软删除）
GET    /api/{version}/{模块}/{资源}/list     # 列表/分页
```

### 请求/响应结构规范
```java
// 统一响应体（项目已有 Result 类时，沿用现有定义）
{
  "code": 200,          // 业务状态码，200=成功，非200=失败
  "msg": "success",
  "data": {},           // 响应数据
  "traceId": "xxx"      // 链路追踪 ID（可选）
}

// 分页响应
{
  "code": 200,
  "data": {
    "total": 100,
    "pages": 10,
    "current": 1,
    "records": []
  }
}
```

### 错误码规范
- 格式：`{模块编号}{错误类型}{序号}`，例如 `USER_001`（用户模块参数错误001）
- 新增错误码必须在本文档中登记，避免不同需求产生重复错误码

---

## 完整输出格式

```markdown
# 技术设计文档

- **need_id**：REQ-XXXXXXXX
- **标题**：[需求标题]
- **设计版本**：v1.0
- **设计日期**：YYYY-MM-DD
- **设计者**：architect
- **状态**：待评审

---

## 一、架构影响分析

### 变更类型
[全新项目（从零建立）/ 新增模块 / 改造已有模块 / 跨模块联动]

### 原型/截图参考
> 若 /intake 阶段有截图或原型图，在此说明UI参考来源。
[来自 docs/prototype/REQ-XXXXXXXX.html / 无]

### 受影响模块（已有项目填写；全新项目填写"初始模块规划"）
| 模块 | 影响程度 | 说明 |
|---|---|---|
| user 模块 | 高 | 新增接口，需调整 Service 层 |
| order 模块 | 低 | 只读依赖，无变更 |

### 技术组件决策
| 组件 | 是否引入 | 理由 |
|---|---|---|
| Redis 缓存 | ✅ 引入 | 高频查询接口，需缓存用户基础信息 |
| MQ | ❌ 不引入 | 本期为同步流程，无异步需求 |

### 项目骨架规划（全新项目必填，已有项目跳过）

> `/code` 阶段将根据此节生成项目骨架文件，**已有项目删除本节**。

**基础信息**
- 根包名：`com.pangeo.{项目名}`（磐吉奥集团统一规范，如 `com.pangeo.oa`、`com.pangeo.erp`）
- 后端框架版本：Spring Boot x.x + JDK xx
- 前端框架版本：Vue x + Vite x（若含前端）

**后端依赖清单（pom.xml）**
| 依赖 | 说明 |
|---|---|
| spring-boot-starter-web | Web MVC |
| mybatis-plus-boot-starter | ORM |
| mysql-connector-j | 数据库驱动 |
| lombok | 简化代码 |
| spring-boot-starter-validation | 参数校验 |
| flyway-core | DB 版本管理 |
| [spring-ai-openai-spring-boot-starter] | 若含 Spring AI |
| [spring-boot-starter-data-redis] | 若含 Redis |

**后端基础目录结构**
```
src/main/java/{basePackage}/
  ├── Application.java          # 启动类（@MapperScan）
  ├── config/                   # 配置类（MybatisPlusConfig 等）
  ├── exception/                # GlobalExceptionHandler、BusinessException
  ├── common/                   # Result 统一响应体、常量
  ├── entity/                   # 实体类（/code 填充）
  ├── mapper/                   # Mapper 接口（/code 填充）
  ├── service/ + impl/          # Service（/code 填充）
  ├── controller/               # Controller（/code 填充）
  └── vo/                       # VO/DTO（/code 填充）
src/main/resources/
  ├── application.yml           # 数据库、端口、日志配置（含 AI Key 占位符）
  └── db/migration/             # Flyway 脚本（/code 填充）
```

**前端依赖清单（package.json，若含前端）**
| 依赖 | 说明 |
|---|---|
| vue | Vue 3 |
| vite | 构建工具 |
| element-plus | UI 组件库 |
| axios | HTTP 客户端 |
| pinia | 状态管理 |
| vue-router | 路由 |

**前端基础目录结构**
```
src/
  ├── main.js                   # 应用入口（挂载 Element Plus/Pinia/Router）
  ├── App.vue                   # 根组件
  ├── router/index.js           # 路由配置骨架
  ├── stores/                   # Pinia Store
  ├── api/request.js            # Axios 实例（拦截器、Token 注入）
  ├── api/                      # API 调用层（/code 填充）
  ├── views/                    # 页面组件（/code 填充）
  └── components/               # 通用组件（/code 填充）
.env.development                # VITE_API_BASE_URL=http://localhost:8080
.env.production                 # VITE_API_BASE_URL=请配置
```

---

## 二、数据库设计

### 新增/修改表

**表：xxx_table**
> 用途说明

```sql
CREATE TABLE `xxx_table` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `xxx_field`   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '字段说明',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted`  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '软删除标记 0-正常 1-已删除',
  PRIMARY KEY (`id`),
  INDEX `idx_xxx_table_xxx_field` (`xxx_field`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表用途说明';
```

### 数据迁移脚本
```sql
-- 新增字段示例
ALTER TABLE `existing_table` ADD COLUMN `new_field` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '字段说明' AFTER `existing_field`;

-- 存量数据填充（如有）
UPDATE `existing_table` SET `new_field` = 'default_value' WHERE `new_field` = '';
```

### 回滚方案
[说明如何回滚，包含 DDL 回滚语句]

---

## 三、接口设计

### 接口清单
| 接口名称 | Method | URL | 权限 |
|---|---|---|---|
| 创建XXX | POST | /api/v1/xxx | 登录用户 |
| 获取XXX详情 | GET | /api/v1/xxx/{id} | 登录用户 |

### 接口详细说明

**POST /api/v1/xxx — 创建XXX**

**请求头**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**
```json
{
  "field1": "string，必填，说明",
  "field2": 0
}
```

**响应**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 123
  }
}
```

**错误码**
| 错误码 | 说明 | 触发场景 |
|---|---|---|
| XXX_001 | 参数缺失 | field1 为空 |
| XXX_002 | 数据已存在 | 唯一键冲突 |

---

## 四、前端 UI 设计（若项目含前端）

> 纯后端项目跳过此节。前后端分离项目必须填写。

### 页面清单

| 页面名称 | 路由路径 | 对应 view 文件 | 变更类型 |
|---|---|---|---|
| XXX列表页 | /xxx/list | views/xxx/XxxList.vue | 新增 |
| XXX详情页 | /xxx/:id | views/xxx/XxxDetail.vue | 新增 |
| XXX编辑弹窗 | — | components/xxx/XxxEditDialog.vue | 新增 |

### 组件拆分（以主要页面为例）

```
XxxList.vue（页面级 view）
  ├── XxxSearchBar.vue（搜索栏，可复用）
  ├── XxxTable.vue（数据表格）
  │   └── XxxStatusTag.vue（状态标签，可复用）
  └── XxxEditDialog.vue（新增/编辑弹窗，可复用）
```

### 状态管理

| 数据 | 存储位置 | 理由 |
|---|---|---|
| 当前用户信息 | Pinia/Vuex Store | 跨页面共享，需持久化 |
| 列表查询参数 | 本地 ref | 仅当前页面使用，无需共享 |
| 字典/枚举数据 | Pinia/Vuex Store | 全局多处使用，避免重复请求 |

### API 调用层规划

| 前端操作 | 调用接口 | API 文件位置 |
|---|---|---|
| 加载XXX列表 | GET /api/v1/xxx/list | api/xxx.js → getXxxList() |
| 提交创建表单 | POST /api/v1/xxx | api/xxx.js → createXxx() |
| 保存编辑 | PUT /api/v1/xxx/:id | api/xxx.js → updateXxx() |
| 删除条目 | DELETE /api/v1/xxx/:id | api/xxx.js → deleteXxx() |

---

## 五、关键实现路径

### 核心流程：[主流程名称]

**后端实现**
```
1. Controller 接收请求，@Valid 校验参数
2. Service.method() 开启事务
   2.1 查询 XXX，判断状态
   2.2 若状态不符，抛出 BusinessException(XXX_003)
   2.3 写入数据库
   2.4 清除 Redis 缓存 key: "xxx:cache:{id}"
3. 返回结果
```

**前端实现**（若含前端）
```
1. 用户点击提交按钮 → 触发 handleSubmit()
2. 前端表单校验（ElForm.validate()）
3. 调用 api/xxx.js → createXxx(formData)
4. 成功：ElMessage.success('创建成功')，刷新列表，关闭弹窗
5. 失败：ElMessage.error(e.message)，保留表单状态
```

### 并发场景处理
[说明是否有并发风险，如有，给出后端加锁或前端防重复提交方案]

### 技术风险点
| 风险 | 概率 | 影响 | 应对方案 |
|---|---|---|---|
| 缓存击穿 | 中 | 高 | 加分布式锁，防止缓存同时失效 |
| 前端竞态条件 | 低 | 中 | 请求loading状态防重复，接口取消旧请求 |

---

## 七、待评审确认项

> ⚠️ 以下事项需要团队评审后确认

- [ ] 数据库方案是否符合 DBA 规范（建议 `/dba-review` 触发 DBA 代理复核）
- [ ] 接口版本号是否与现有规划一致
- [ ] 前端页面清单是否覆盖了所有验收场景（若含前端）
- [ ] [其他需要确认的决策点]

确认无误后，执行：`/code REQ-XXXXXXXX`
```

---

## 技术设计文档存放规范

- 路径：`docs/design/REQ-XXXXXXXX-design.md`
- 版本管理：每次修订追加版本号（v1.0 → v1.1），保留修订说明
- 归档：需求完成后，设计文档随需求一起移入 `done/` 目录
