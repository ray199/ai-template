# Python 代码审查清单

> 用于 `/pg:check` 命令的代码审查阶段。基于检测到的 Python 版本和框架选择对应章节执行检查。

---

## 通用规范（所有 Python 项目必查）

### 代码风格
- [ ] 命名符合 PEP 8：函数/变量 `snake_case`，类 `PascalCase`，常量 `UPPER_SNAKE_CASE`
- [ ] 无 `print()` 在生产代码中（使用 `logging` 或框架 logger）
- [ ] 无裸 `except:`（至少写 `except Exception as e:`）
- [ ] 无 `eval()` / `exec()` / 不可信 `pickle` 的反序列化
- [ ] 无硬编码密钥/密码/Token（必须通过环境变量读取）
- [ ] 函数长度合理（建议不超过 50 行，超过须重构）

### 类型提示
- [ ] 对外 API 的参数和返回值必须有类型注解
- [ ] 核心业务函数必须有类型注解
- [ ] 没有在业务逻辑中使用 `Any`（边界层集中隔离除外）

### 异常处理
- [ ] 捕获异常后必须记录日志（`logger.error(...)` 含堆栈信息）
- [ ] 业务异常使用项目统一的自定义异常类，不直接 `raise Exception`
- [ ] 不吞异常（`except Exception: pass` 是禁止行为）

### 安全
- [ ] 所有外部输入（HTTP 入参、文件内容、MQ 消息）必须经过校验
- [ ] 数据库查询使用参数化（ORM 查询或带参数的 `cursor.execute`）
- [ ] 日志中无敏感信息（手机号、身份证、密码、Token）

---

## Python 版本特定检查

### Python 3.8 项目
- [ ] 类型提示使用 `from typing import Optional, List, Dict, Union`（禁止 `X | Y` 语法）
- [ ] 无 `match/case` 语句（3.10+）
- [ ] 无内置泛型语法 `list[int]`（3.9+，须用 `List[int]`）

### Python ≥ 3.10 项目
- [ ] 联合类型优先用 `X | Y`（替代 `Union[X, Y]`）
- [ ] 复杂条件分支检查是否适合改用 `match/case`（可读性更好）

### Python ≥ 3.11 项目
- [ ] 异步并发场景检查是否使用了 `TaskGroup`（替代手动 `gather`）
- [ ] 异常组场景是否使用 `ExceptionGroup` / `except*`

---

## 框架特定检查

### FastAPI 项目
- [ ] 路由已按模块拆分（`APIRouter`），禁止全写在 `main.py`
- [ ] 接口参数使用 Pydantic Model 校验（禁止手动 `if not param: raise`）
- [ ] 业务异常使用 `HTTPException(status_code=..., detail={...})`
- [ ] 数据库 Session 通过 `Depends(get_db)` 注入（禁止全局 Session）
- [ ] 异步路由函数用 `async def`，I/O 操作用 `await`
- [ ] 响应模型用 `response_model=` 参数声明，禁止直接返回 ORM 对象

### Django / DRF 项目
- [ ] 视图使用 Class-Based View 或 ViewSet（禁止超长函数视图）
- [ ] 序列化器显式声明 `fields`（禁止 `fields = "__all__"`）
- [ ] ORM 查询避免 N+1（使用 `select_related` / `prefetch_related`）
- [ ] 敏感接口已配置权限类（`permission_classes`）
- [ ] 分页使用全局分页器，禁止在视图手动切片

### Flask 项目
- [ ] 路由使用 Blueprint 分模块注册
- [ ] 统一响应格式（`jsonify({"code": ..., "msg": ..., "data": ...})`）
- [ ] 全局异常处理通过 `@app.errorhandler` 注册

---

## 数据访问检查

### SQLAlchemy 项目
- [ ] 使用 2.0 风格（`Mapped[T]` + `mapped_column`）还是 1.x 风格（与项目一致）
- [ ] 禁止字符串拼接 SQL（使用 ORM 查询或 `text()` 参数化）
- [ ] 查询结果按需选取字段（禁止 `SELECT *` 等价的全字段加载）
- [ ] Session 在请求结束后正确关闭（`try/finally` 或 `with Session`）
- [ ] 数据库迁移通过 Alembic 生成，禁止手写 DDL

### Django ORM 项目
- [ ] 批量操作使用 `bulk_create` / `bulk_update`（禁止循环单条 insert）
- [ ] 迁移文件通过 `makemigrations` 生成，禁止手动修改

---

## 测试检查
- [ ] 核心业务逻辑有单元测试（pytest）
- [ ] 测试覆盖正常路径、边界值、异常场景
- [ ] 外部依赖使用 `pytest-mock` / `unittest.mock` 隔离
- [ ] 测试不依赖外部服务（数据库、第三方 API）— 使用 fixture 或 mock
