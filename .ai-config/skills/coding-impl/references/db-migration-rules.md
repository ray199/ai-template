# DB 迁移脚本规范

## 文件命名
- 路径：`src/main/resources/db/migration/V{版本号}__{描述}.sql`
- 示例：`V20240315_01__add_user_extend_table.sql`
- 版本号格式：`yyyyMMdd_序号`（当天第几个脚本）

## 内容要求
- 必须幂等（`CREATE TABLE IF NOT EXISTS`，`ADD COLUMN IF NOT EXISTS`）
- 包含注释，说明本次变更目的
- 附上回滚语句（放在注释块中）

## 模板

```sql
-- ============================================================
-- 变更说明：新增 xxx_table 表，用于存储 [说明]
-- 需求编号：REQ-XXXXXXXX
-- 创建时间：YYYY-MM-DD
-- 回滚语句：DROP TABLE IF EXISTS `xxx_table`;
-- ============================================================

CREATE TABLE IF NOT EXISTS `xxx_table` (
  -- 字段定义
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[表说明]';
```
