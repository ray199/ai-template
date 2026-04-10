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
输入：approved 的需求文档 + 已确认的输出物清单（Spec / 原型 / 迭代计划）
       ↓
[Step 1] 加载上下文
         - 读取需求文档（docs/requirements/approved/REQ-XXXXXXXX.md）
         - 扫描现有代码库结构（src/main/java/）
         - 读取已有数据库表结构（docs/db/ 或 MCP 工具）
         - 读取已有接口文档（docs/api/）
         ↓
[Step 2] 架构影响分析
         - 判断本次需求是新功能 / 改造已有功能 / 纯新模块
         - 识别受影响的模块和下游依赖
         - 确定是否需要引入新技术组件（缓存、消息队列等）
         ↓
[Step 3] 数据库设计
         - 新增/修改表设计（含字段、类型、索引、约束）
         - 数据迁移脚本策略（新表 / 加字段 / 数据填充）
         ↓
[Step 4] 接口设计
         - 定义 RESTful 接口（URL、Method、请求/响应结构）
         - 标注鉴权方式和权限要求
         - 定义统一错误码
         ↓
[Step 5] 关键实现路径
         - 描述核心业务流程的实现思路（伪代码 / 时序说明）
         - 标注技术风险点和解决方案
         ↓
[Step 6] 输出设计文档，等待团队确认
```

---

## 上下文扫描规则

| 扫描目标 | 目的 | 工具 |
|---|---|---|
| `src/main/java/` 目录结构 | 了解现有模块划分 | 代码搜索 |
| `docs/db/` 或 MCP schema 工具 | 避免重复建表，了解已有字段 | Read / MCP |
| `docs/api/` | 接口命名和版本保持一致 | Read |
| `docs/requirements/done/` | 排查与历史功能的依赖 | Read |

> ⚠️ 扫描结果必须引用来源，不允许凭空推断现有代码结构。

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
[新增模块 / 改造已有模块 / 跨模块联动]

### 受影响模块
| 模块 | 影响程度 | 说明 |
|---|---|---|
| user 模块 | 高 | 新增接口，需调整 Service 层 |
| order 模块 | 低 | 只读依赖，无变更 |

### 技术组件决策
| 组件 | 是否引入 | 理由 |
|---|---|---|
| Redis 缓存 | ✅ 引入 | 高频查询接口，需缓存用户基础信息 |
| MQ | ❌ 不引入 | 本期为同步流程，无异步需求 |

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

## 四、关键实现路径

### 核心流程：[主流程名称]

```
1. Controller 接收请求，@Valid 校验参数
2. Service.method() 开启事务
   2.1 查询 XXX，判断状态
   2.2 若状态不符，抛出 BusinessException(XXX_003)
   2.3 写入数据库
   2.4 清除 Redis 缓存 key: "xxx:cache:{id}"
3. 返回结果
```

### 并发场景处理
[说明是否有并发风险，如有，给出加锁或幂等设计方案]

### 技术风险点
| 风险 | 概率 | 影响 | 应对方案 |
|---|---|---|---|
| 缓存击穿 | 中 | 高 | 加分布式锁，防止缓存同时失效 |

---

## 五、待评审确认项

> ⚠️ 以下事项需要团队评审后确认

- [ ] 数据库方案是否符合 DBA 规范（建议 `/dba-review` 触发 DBA 代理复核）
- [ ] 接口版本号是否与现有规划一致
- [ ] [其他需要确认的决策点]

确认通过后请回复：`/design-confirm REQ-XXXXXXXX`
```

---

## 技术设计文档存放规范

- 路径：`docs/design/REQ-XXXXXXXX-design.md`
- 版本管理：每次修订追加版本号（v1.0 → v1.1），保留修订说明
- 归档：需求完成后，设计文档随需求一起移入 `done/` 目录
