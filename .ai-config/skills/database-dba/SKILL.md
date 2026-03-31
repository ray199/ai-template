# 技能：数据库DBA

## 技能描述
该技能提供数据库设计、SQL优化、性能调优和安全管理等数据库管理功能。

## 输入格式
```
# 数据库DBA任务

任务类型：[数据库设计|SQL优化|性能调优|安全配置|备份恢复]
项目名称：[项目名称]
技术栈：[PostgreSQL|MySQL|Oracle|SQL Server|MongoDB|其他]

## 详细需求
[详细描述任务需求]

## 现有环境（可选）
[描述现有的数据库环境，如版本、配置等]
```

## 输出格式
- 详细的数据库设计方案或优化建议
- SQL语句（如果适用）
- 配置建议
- 实施步骤

## 任务类型说明

### 数据库设计
- 设计数据库表结构
- 设计索引和约束
- 设计关系模型
- 提供SQL建表语句

### SQL优化
- 分析慢查询
- 优化SQL语句
- 提供索引建议
- 分析执行计划

### 性能调优
- 分析数据库性能瓶颈
- 调整数据库参数
- 提供缓存配置建议
- 提供硬件资源建议

### 安全配置
- 设计用户权限
- 配置数据加密
- 提供安全审计建议
- 防止SQL注入

### 备份恢复
- 设计备份策略
- 提供备份脚本
- 设计恢复方案
- 测试备份恢复流程

## 示例输入

### 数据库设计示例
```
# 数据库DBA任务

任务类型：数据库设计
项目名称：用户管理系统
技术栈：PostgreSQL

## 详细需求
- 用户注册和登录功能
- 用户列表管理（增删改查）
- 用户详情查看
- 用户信息编辑
- 记录用户操作历史

## 现有环境
- PostgreSQL 13
- 服务器内存：8GB
- 存储空间：100GB
```

### SQL优化示例
```
# 数据库DBA任务

任务类型：SQL优化
项目名称：电商系统
技术栈：MySQL

## 详细需求
优化以下查询语句，提高查询性能：

SELECT o.id, o.order_date, c.name, c.email 
FROM orders o 
JOIN customers c ON o.customer_id = c.id 
WHERE o.status = 'completed' 
AND o.order_date >= '2023-01-01' 
ORDER BY o.order_date DESC 
LIMIT 100;

## 现有环境
- MySQL 8.0
- 订单表数据量：100万条
- 客户表数据量：50万条
```

## 示例输出

### 数据库设计输出
```
# 数据库设计方案

## 1. 表结构设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### 操作历史表 (user_activities)
```sql
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  description TEXT,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_performed_at ON user_activities(performed_at);
```

## 2. 关系模型
- users 表与 user_activities 表是一对多关系
- 每个用户可以有多个操作历史记录

## 3. 性能优化建议
- 使用合适的索引覆盖常用查询
- 定期清理过期的操作历史记录
- 考虑对操作历史表进行分区（如果数据量很大）

## 4. 安全建议
- 密码使用bcrypt等算法进行哈希存储
- 限制用户权限，遵循最小权限原则
- 对敏感字段进行加密存储
```

### SQL优化输出
```
# SQL优化建议

## 1. 原始查询
```sql
SELECT o.id, o.order_date, c.name, c.email 
FROM orders o 
JOIN customers c ON o.customer_id = c.id 
WHERE o.status = 'completed' 
AND o.order_date >= '2023-01-01' 
ORDER BY o.order_date DESC 
LIMIT 100;
```

## 2. 执行计划分析
- 全表扫描 orders 表
- 全表扫描 customers 表
- 排序操作消耗大量资源

## 3. 优化建议

### 3.1 添加索引
```sql
-- 为 status 和 order_date 字段添加复合索引
CREATE INDEX idx_orders_status_order_date ON orders(status, order_date DESC);

-- 为 customer_id 字段添加索引
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- 为 id 字段添加索引（如果不存在）
CREATE INDEX idx_customers_id ON customers(id);
```

### 3.2 优化查询语句
```sql
SELECT o.id, o.order_date, c.name, c.email 
FROM (
  SELECT id, order_date, customer_id 
  FROM orders 
  WHERE status = 'completed' 
  AND order_date >= '2023-01-01' 
  ORDER BY order_date DESC 
  LIMIT 100
) o 
JOIN customers c ON o.customer_id = c.id;
```

## 4. 预期性能提升
- 查询执行时间减少80%以上
- 避免全表扫描
- 减少排序操作的资源消耗
```