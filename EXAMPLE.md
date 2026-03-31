# 使用示例

## AI工具识别指南

### 如何让AI工具识别此模板

#### Claude Code
1. **目录结构**：确保 `.ai-config` 目录位于项目根目录
2. **文件格式**：所有配置文件使用标准的 Markdown 格式
3. **识别方式**：
   - Claude Code 会自动扫描项目根目录下的 `.ai-config` 目录
   - 识别 `rules/` 目录下的规范文件
   - 识别 `agents/` 目录下的代理配置
   - 识别 `skills/` 目录下的技能定义

#### Trae IDE
1. **目录结构**：确保 `.ai-config` 目录位于项目根目录
2. **文件格式**：所有配置文件使用标准的 Markdown 格式
3. **识别方式**：
   - Trae IDE 会自动识别 `.ai-config` 目录
   - 支持通过工具面板直接使用技能
   - 支持通过指令触发代理
   - 提供可视化的技能和代理管理界面

### 推荐使用方式

#### Claude Code
```
# 让 Claude Code 按照此模板的规范进行开发
请参考 .ai-config 目录下的规范文件，按照以下步骤进行开发：

1. 首先生成开发计划
2. 然后生成前端原型
3. 接着实现后端API
4. 最后进行代码审查和测试

技术栈：React + Node.js + PostgreSQL
```

#### Trae IDE
1. **打开项目**：在 Trae IDE 中打开包含此模板的项目
2. **使用技能**：通过工具面板或指令触发技能
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
   ```
3. **触发代理**：通过指令触发专业代理
   ```
   # 触发DBA代理
   任务：设计数据库表结构
   项目：用户管理系统
   需求：
   - 用户注册和登录功能
   - 用户列表管理（增删改查）
   - 用户详情查看
   - 用户信息编辑
   技术栈：PostgreSQL
   ```

## 完整使用方法

### 场景：开发一个简单的用户管理系统

#### 1. 环境准备

1. **克隆模板**：将此模板克隆到项目根目录
   ```bash
   # 克隆模板到当前目录
   git clone <模板仓库地址> .
   ```

2. **安装依赖**：
   ```bash
   # 安装项目依赖
   npm install
   ```

3. **配置环境变量**：创建 `.env` 文件并配置必要的环境变量
   ```
   # .env
   # 数据库配置
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_NAME=user_management
   
   # 服务器配置
   PORT=3000
   NODE_ENV=development
   
   # 认证配置
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   ```

#### 2. 生成开发计划

使用 write-plan 技能生成详细的开发计划：

```
# 开发计划生成

项目需求：
- 用户注册和登录功能
- 用户列表管理（增删改查）
- 用户详情查看
- 用户信息编辑

技术栈：
- 前端：React + TypeScript + Tailwind CSS
- 后端：Node.js + Express + PostgreSQL
- 认证：JWT
- 部署：Docker

项目结构：
- frontend/：前端代码
- backend/：后端代码
- shared/：共享代码和类型定义
```

**预期输出**：
- 详细的开发计划文档
- 项目结构建议
- 技术选型理由
- 开发时间估计

#### 3. 生成前端原型

使用 generate-prototype 技能生成前端原型：

```
# 前端原型生成

页面需求：
- 登录页面：包含用户名、密码输入框和登录按钮，支持表单验证
- 首页：包含用户列表、搜索功能和添加用户按钮
- 详情页：展示用户详细信息，包括基本信息和操作历史
- 编辑页：编辑用户信息，支持表单验证
- 注册页面：新用户注册功能

技术栈：
- 前端：React + TypeScript + Tailwind CSS
- 状态管理：React Context + useReducer
- 路由：React Router
- 表单处理：React Hook Form
- 验证：Yup
```

**预期输出**：
- 静态HTML/CSS原型文件
- 组件结构设计
- 交互流程图
- 响应式设计方案

#### 4. 数据库设计与实现

使用 DBA 技能设计和实现数据库：

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

**预期输出**：
- 数据库模型设计
- 表结构SQL语句
- 索引设计
- 数据库配置建议

**4.1 数据库设计**

```sql
-- 创建用户表
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

-- 创建操作历史表
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

**4.2 数据库优化建议**

- **性能优化**：为常用查询字段创建索引
- **安全优化**：使用参数化查询防止SQL注入
- **备份策略**：定期执行数据库备份
- **监控配置**：设置数据库性能监控

#### 5. 实现后端API

**5.1 API实现**

```javascript
// backend/src/routes/auth.js
const express = require('express');
const { register, login } = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;

// backend/src/routes/users.js
const express = require('express');
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/users');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
```

**5.2 启动后端服务**

```bash
# 启动后端开发服务器
npm run dev:backend

# 构建后端生产版本
npm run build:backend

# 启动后端生产服务器
npm start:backend
```

#### 6. 实现前端应用

**6.1 组件结构**

```
frontend/src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Users/
│   │   ├── UserList.jsx
│   │   ├── UserDetail.jsx
│   │   └── UserForm.jsx
│   └── Layout/
│       ├── Header.jsx
│       └── Sidebar.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── HomePage.jsx
│   ├── UserDetailPage.jsx
│   └── UserEditPage.jsx
├── services/
│   └── api.js
├── context/
│   └── AuthContext.jsx
└── App.jsx
```

**6.2 启动前端服务**

```bash
# 启动前端开发服务器
npm run dev:frontend

# 构建前端生产版本
npm run build:frontend

# 预览前端生产版本
npm run preview:frontend
```

#### 7. 代码审查

使用 code-review 技能审查代码：

```
# 代码审查

代码文件：
- frontend/src/components/Auth/Login.jsx
- frontend/src/services/api.js
- backend/src/controllers/auth.js
- backend/src/middleware/auth.js

审查重点：
- 代码质量和可读性
- 安全性（特别是认证和授权）
- 性能优化
- 最佳实践和规范遵循
```

**预期输出**：
- 代码审查报告
- 问题和改进建议
- 安全漏洞检测
- 性能优化建议

#### 8. 运行测试

**8.1 前端测试**

```bash
# 运行前端单元测试
npm test:frontend

# 运行前端端到端测试
npm run e2e:frontend
```

**8.2 后端测试**

```bash
# 运行后端单元测试
npm test:backend

# 运行后端集成测试
npm run integration:backend
```

**8.3 测试覆盖率**

```bash
# 生成测试覆盖率报告
npm run coverage
```

#### 9. 部署上线

**9.1 Docker配置**

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**9.2 Docker Compose配置**

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - DB_NAME=user_management
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=user_management
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**9.3 部署命令**

```bash
# 构建和启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

## 扩展技能

### 创建新技能

1. **在 `skills/` 目录下创建新的技能文件夹**，例如 `deploy/`

2. **编写 `SKILL.md` 文件**：
   ```markdown
   # 技能：部署服务

   ## 技能描述
   该技能用于自动化部署服务到不同环境。

   ## 输入格式
   ```
   # 部署服务

   环境：production
   服务：backend
   版本：v1.0.0
   ```
   ```

   ## 输出格式
   - 部署命令执行结果
   - 部署状态报告
   - 访问URL
   ```

3. **编写 `implementation.js` 文件** 实现部署逻辑

4. **在 `hooks.json` 中配置触发时机**：
   ```json
   {
     "on_deploy": [
       "trigger_skill:deploy"
     ]
   }
   ```

#### 数据库DBA技能示例

1. **在 `skills/` 目录下创建新的技能文件夹**，例如 `database-dba/`

2. **编写 `SKILL.md` 文件**：
   ```markdown
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
   ```

   ## 输出格式
   - 详细的数据库设计方案或优化建议
   - SQL语句（如果适用）
   - 配置建议
   - 实施步骤
   ```

3. **在需要时使用技能**：
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

### 使用自定义代理

#### DevOps代理

1. **在 `agents/` 目录下创建新的代理配置文件**，例如 `devops.md`

2. **定义代理的角色定位和核心职责**：
   ```markdown
   # 角色定位：DevOps工程师

   ## 核心职责
   1. **基础设施管理**：管理和维护服务器、网络和存储
   2. **CI/CD配置**：设置和维护持续集成和持续部署流程
   3. **监控和告警**：配置系统监控和告警机制
   4. **自动化运维**：编写自动化脚本和工具
   ```

3. **在需要时触发代理**：
   ```
   # 触发DevOps代理
   trigger_agent:devops

   任务：配置CI/CD流程
   项目：用户管理系统
   环境：production
   ```

#### DBA代理

1. **在 `agents/` 目录下创建新的代理配置文件**，例如 `dba.md`

2. **定义代理的角色定位和核心职责**：
   ```markdown
   # 角色定位：数据DBA

   ## 核心职责
   1. **数据库设计**：根据业务需求设计合理的数据库表结构和关系模型
   2. **SQL优化**：编写高效的SQL语句，优化查询性能
   3. **数据库性能调优**：监控和优化数据库性能，确保系统稳定运行
   4. **数据库安全**：确保数据库的安全性，包括权限管理和数据加密
   5. **数据备份与恢复**：制定和执行数据备份策略，确保数据安全
   ```

3. **在需要时触发代理**：
   ```
   # 触发DBA代理
   trigger_agent:dba

   任务：设计数据库表结构
   项目：用户管理系统
   需求：
   - 用户注册和登录功能
   - 用户列表管理（增删改查）
   - 用户详情查看
   - 用户信息编辑
   技术栈：PostgreSQL
   ```

## 最佳实践

1. **保持技能更新**：定期更新技能库，确保技能的有效性和先进性
2. **遵循规范**：严格按照 `rules/` 目录下的规范进行开发
3. **自动化流程**：利用 `hooks.json` 配置自动化触发行为
4. **持续改进**：根据项目需求不断优化和扩展技能
5. **文档化**：为每个技能和代理编写详细的文档
6. **测试驱动**：采用测试驱动开发方法，确保代码质量
7. **代码审查**：定期进行代码审查，发现和解决问题
8. **安全意识**：关注安全最佳实践，防止安全漏洞

## 常见问题

### 技能不生效
- **问题**：技能触发后没有响应
- **解决方案**：
  1. 检查技能的触发格式是否正确
  2. 确保技能的实现文件存在且格式正确
  3. 检查 `mcp/settings.json` 中技能加载配置是否开启

### 代理无响应
- **问题**：触发代理后没有响应
- **解决方案**：
  1. 检查代理配置文件是否存在
  2. 确保代理的角色定位和职责定义清晰
  3. 检查 `mcp/settings.json` 中代理配置是否正确

### 钩子不触发
- **问题**：配置的钩子没有触发
- **解决方案**：
  1. 检查 `hooks.json` 中的配置是否正确
  2. 确保触发条件满足
  3. 检查相关技能是否存在

### 环境变量配置错误
- **问题**：服务启动失败，提示环境变量错误
- **解决方案**：
  1. 检查 `.env` 文件是否存在
  2. 确保所有必要的环境变量都已配置
  3. 检查环境变量的值是否正确

### 数据库连接失败
- **问题**：服务无法连接到数据库
- **解决方案**：
  1. 检查数据库服务是否运行
  2. 确保数据库连接字符串正确
  3. 检查数据库用户权限是否正确

## 故障排除

### 服务启动失败

**症状**：服务无法启动，显示错误信息

**排查步骤**：
1. 查看服务日志，了解具体错误信息
2. 检查依赖是否正确安装
3. 验证配置文件是否正确
4. 检查端口是否被占用

### API响应错误

**症状**：API请求返回错误状态码

**排查步骤**：
1. 检查API路由是否正确配置
2. 验证请求参数是否符合要求
3. 查看后端日志，了解具体错误原因
4. 检查数据库连接是否正常

### 前端页面无法加载

**症状**：前端页面显示空白或错误信息

**排查步骤**：
1. 检查浏览器控制台，查看错误信息
2. 验证前端资源是否正确加载
3. 检查API请求是否成功
4. 确认前端路由配置是否正确

## 总结

通过使用此模板，您可以：

1. **规范开发流程**：遵循标准化的开发流程，确保代码质量和一致性
2. **提高开发效率**：利用预定义的技能和代理，减少重复工作
3. **确保代码质量**：通过代码审查和测试，提高代码质量和可靠性
4. **实现自动化**：通过钩子配置，实现开发流程的自动化
5. **支持团队协作**：为团队提供统一的开发规范和工具

此模板设计为可扩展的，您可以根据项目需求添加新的技能和代理，定制开发流程。