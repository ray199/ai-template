# 数据库设计规范

> 适用于 Java + MyBatis / MyBatis-Plus 场景。其他 ORM（JPA / Hibernate / EF Core / SQLAlchemy）有专属语义时按对应 profile 调整。

## 建表规则

- 所有新表必须包含：`id (BIGINT AUTO_INCREMENT PK)`、`create_time (DATETIME)`、`update_time (DATETIME)`、`is_deleted (TINYINT DEFAULT 0)`
- 字段命名：下划线分隔小写（`user_name`），与 Java 字段通过 MyBatis 映射
- 软删除：使用 `is_deleted` 字段，**禁止**物理删除业务数据
- 索引命名：`idx_表名_字段名`，唯一索引：`uk_表名_字段名`
- 敏感字段（手机号、身份证）必须标注加密存储说明

## 数据迁移策略

- 新表：提供完整 DDL
- 加字段：提供 `ALTER TABLE` 语句 + 存量数据填充 SQL
- 结构变更：说明是否需要停服窗口，提供回滚方案
- 迁移脚本规范见 `coding-impl/references/db-migration-rules.md`

## 表结构示例

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
