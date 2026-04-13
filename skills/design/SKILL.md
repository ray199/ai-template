---
name: design
description: 技术设计 - 架构影响分析、数据库设计(DDL+迁移+回滚)、接口设计、关键实现路径，输出 docs/design/ 文档
argument-hint: [REQ-XXXXXXXX]
---

# 技能：技术设计

由架构师代理主导，产出可供开发直接落地的设计文档，覆盖架构、数据库、接口、关键实现路径四个维度。

需求ID：$ARGUMENTS

## 处理流程

```
[Step 1] 加载上下文
         - 读取需求文档（docs/requirements/approved/ 或 backlog/）
         - 扫描现有代码库结构（src/main/java/）
         - 读取已有数据库表结构（docs/db/ 或 MCP 工具）
         - 读取已有接口文档（docs/api/）
         ↓
[Step 2] 架构影响分析
         - 判断：新功能 / 改造已有功能 / 纯新模块
         - 识别受影响模块和下游依赖
         - 确定是否引入新技术组件（缓存、消息队列等）
         ↓
[Step 3] 数据库设计
         - 新增/修改表（字段、类型、索引、约束）
         - 数据迁移脚本策略
         - 回滚方案
         ↓
[Step 4] 接口设计
         - RESTful 接口（URL、Method、请求/响应结构）
         - 鉴权方式和权限要求
         - 统一错误码定义
         ↓
[Step 5] 关键实现路径
         - 核心业务流程（伪代码/时序说明）
         - 技术风险点和解决方案
         ↓
[Step 6] 输出设计文档，等待团队确认
```

## 数据库设计规范

**建表规则：**
- 所有新表必须包含：`id BIGINT AUTO_INCREMENT PK`、`create_time DATETIME`、`update_time DATETIME`、`is_deleted TINYINT DEFAULT 0`
- 字段命名：下划线分隔小写（`user_name`）
- 软删除：使用 `is_deleted`，禁止物理删除业务数据
- 索引命名：`idx_表名_字段名`，唯一索引：`uk_表名_字段名`

**DDL 模板：**
```sql
CREATE TABLE `xxx_table` (
  `id`          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `xxx_field`   VARCHAR(64) NOT NULL DEFAULT '' COMMENT '字段说明',
  `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted`  TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '软删除标记 0-正常 1-已删除',
  PRIMARY KEY (`id`),
  INDEX `idx_xxx_table_xxx_field` (`xxx_field`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表用途说明';
```

## 接口设计规范

**URL 命名规则：**
```
POST   /api/{version}/{模块}/{资源}          # 创建
GET    /api/{version}/{模块}/{资源}/{id}     # 详情
PUT    /api/{version}/{模块}/{资源}/{id}     # 全量更新
PATCH  /api/{version}/{模块}/{资源}/{id}     # 部分更新
DELETE /api/{version}/{模块}/{资源}/{id}     # 删除（软删除）
GET    /api/{version}/{模块}/{资源}/list     # 列表/分页
```

**统一响应体：**
```json
{ "code": 200, "msg": "success", "data": {}, "traceId": "xxx" }
```

**错误码格式：** `{模块编号}{错误类型}{序号}`，例如 `USER_001`

## 输出格式

保存至 `docs/design/REQ-XXXXXXXX-design.md`：

```markdown
# 技术设计文档

- **need_id**：REQ-XXXXXXXX
- **设计版本**：v1.0
- **设计日期**：YYYY-MM-DD
- **状态**：待评审

---

## 一、架构影响分析

### 变更类型
[新增模块 / 改造已有模块 / 跨模块联动]

### 受影响模块
| 模块 | 影响程度 | 说明 |
|---|---|---|

### 技术组件决策
| 组件 | 是否引入 | 理由 |
|---|---|---|

---

## 二、数据库设计
[DDL + 迁移脚本 + 回滚方案]

---

## 三、接口设计
[接口清单 + 详细说明 + 错误码]

---

## 四、关键实现路径
[核心流程 + 并发场景 + 技术风险]

---

## 五、待评审确认项
- [ ] 数据库方案是否符合 DBA 规范
- [ ] 接口版本号是否与现有规划一致

确认通过后请回复：`/ai:code REQ-XXXXXXXX`
```

完成后告知用户下一步：`/ai:code REQ-XXXXXXXX`
