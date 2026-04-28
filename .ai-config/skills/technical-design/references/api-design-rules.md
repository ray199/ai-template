# 接口设计规范

## URL 命名规则

```
POST   /api/{version}/{模块}/{资源}          # 创建
GET    /api/{version}/{模块}/{资源}/{id}     # 详情
PUT    /api/{version}/{模块}/{资源}/{id}     # 全量更新
PATCH  /api/{version}/{模块}/{资源}/{id}     # 部分更新
DELETE /api/{version}/{模块}/{资源}/{id}     # 删除（软删除）
GET    /api/{version}/{模块}/{资源}/list     # 列表/分页
```

## 请求 / 响应结构

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

## 错误码规范

- 格式：`{模块编号}{错误类型}{序号}`，例如 `USER_001`（用户模块参数错误001）
- 新增错误码必须在本文档中登记，避免不同需求产生重复错误码
- 4xx 类错误：客户端传参 / 状态错误，例如 `USER_001` 参数缺失、`USER_002` 已存在
- 5xx 类错误：服务端异常 / 依赖不可用，例如 `USER_500` 内部错误

## 鉴权与权限

- 公开接口标注 `@Public` 注解（或路径前缀 `/api/public/...`）
- 登录态接口走 JWT 拦截器统一注入 `userId`
- 角色 / 权限校验在 Controller 层用注解，禁止在 Service 层手动判断
- 详细方案见 `.ai-config/rules/middleware/auth.md`
