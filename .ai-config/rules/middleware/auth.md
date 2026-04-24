# 中间件规范：鉴权（JWT / OAuth / Session）

> 覆盖三种主流鉴权模式的强制规则。具体框架用法见各语言 profile。

## 1. 认证 vs 授权（概念必分清）

- **认证（Authentication）**：你是谁 → Token / Session 的颁发和校验
- **授权（Authorization）**：你能做什么 → RBAC / ABAC / 资源 owner 校验
- 代码中这两层必须分开。不要在同一个拦截器里做权限判断

## 2. 选型指南

| 场景 | 推荐方案 | 原因 |
|---|---|---|
| 内部管理后台 | Session + Cookie | 简单，可随时失效 |
| 面向 C 端 App / 小程序 | JWT（短期 Access Token + Refresh Token） | 无状态，易扩展 |
| 多系统 SSO | OAuth 2.0 + OIDC | 标准协议 |
| 服务间调用 | mTLS 或内部签名 Token | 不要用用户 Token 透传 |
| API 开放给第三方 | OAuth 2.0 Client Credentials | 标准 |

## 3. JWT 规范（强制）

### 3.1 基础规则

- **算法**：生产必须用 `RS256` / `ES256`（非对称），禁止 `HS256` 单机密钥 + `none` 算法
- **过期时间**：Access Token ≤ 30 分钟；Refresh Token ≤ 14 天
- **必须校验 `exp` / `iss` / `aud`**：很多库默认不校 `aud`，要显式配置
- **禁止在 Token 中放敏感字段**：密码、手机号、身份证、金额等
- **Token 长度**：控制在 1KB 内（否则 Header 超长引起代理问题）

### 3.2 刷新和吊销

- **Refresh Token 必须存 DB / Redis**，支持单个吊销
- **Access Token 无状态不可吊销**，要接受"最坏等 30 分钟生效"的损失；强一致性场景必须配合黑名单
- **Token 刷新**必须旋转（rotate）：一次 refresh 用完就失效，新签一对
- **登出**：吊销 Refresh Token + 可选地把 Access Token 加黑名单（BloomFilter 节省存储）

### 3.3 典型漏洞

- `alg=none` 伪造 → 强制校验算法白名单
- 密钥泄漏（Git 提交了密钥）→ 必须从配置中心 / KMS 读取，永不进代码
- 长期 Token 不刷新 → 强制 Access Token 短期
- 越权：只验了认证没验资源 owner → 每个接口必须做资源归属校验

## 4. OAuth 2.0 规范（强制）

### 4.1 授权码流程（Authorization Code）

- 必须使用 PKCE（Proof Key for Code Exchange），即使 confidential client 也建议用
- `state` 参数必须校验，防 CSRF
- `redirect_uri` 必须白名单精确匹配，**禁止使用通配符**
- `code` 有效期 ≤ 10 分钟，且只能用一次

### 4.2 隐式流程（Implicit）

- **已废弃，禁止新项目使用**。用 Authorization Code + PKCE 替代

### 4.3 Client Credentials

- 用于服务间调用。Client Secret 必须从配置中心读取
- 不要给 Client Credentials 的 Token 过大权限，按最小权限 scope 设计

### 4.4 Refresh Token

- 必须支持旋转
- 必须绑定 Client 和用户，禁止跨客户端使用

## 5. Session / Cookie 规范（强制）

- Cookie 必须设：`HttpOnly` + `Secure`（HTTPS）+ `SameSite=Lax` 或 `Strict`
- Session ID 长度 ≥ 128 bit 随机熵
- 登录成功必须 regenerate session ID（防 session fixation）
- 绝不在 URL 中传 Session ID（防 Referer 泄漏）
- Session 存储：单机用内存、分布式用 Redis，不要用 DB（性能差）
- 登出必须服务端销毁 Session，不能只删 Cookie

## 6. 授权（RBAC / 资源归属）

### 6.1 基础 RBAC

- 三要素：用户 → 角色 → 权限（URL/按钮/数据范围）
- 角色不要过细：起步 5-10 个角色够用；过度细分退化为"每人一角色"
- 权限变更必须审计日志：谁、何时、把谁的什么权限改成什么

### 6.2 资源归属（Owner Check）

- 所有涉及用户资源的接口，必须校验资源是否属于当前用户：
  ```
  GET /orders/{id}
  → 查询后必须校验 order.userId == currentUser.id
  ```
- 这是最常见的越权漏洞来源。写接口时必须默认加这层校验，除非明确标注"管理员接口"

### 6.3 数据范围

- 列表查询默认只看自己的数据：`WHERE user_id = :currentUser`
- 管理员能看全部的接口必须显式标注 `@AdminOnly` 并做日志审计

## 7. 密码存储（强制）

- 必须用慢哈希：bcrypt（cost ≥ 10）/ scrypt / argon2
- 禁用 MD5 / SHA1 / 单次 SHA256（即使加盐）
- 密码不允许出现在任何日志中
- 忘记密码用一次性 Token，有效期 ≤ 30 分钟

## 8. 典型框架

| 框架/语言 | 鉴权框架 | 注意点 |
|---|---|---|
| Spring | Spring Security 6.x + JWT filter | 避免 `WebSecurityConfigurerAdapter`（已 deprecated） |
| Django | `django.contrib.auth` + DRF SimpleJWT | Session + JWT 混用要注意 CSRF |
| FastAPI | `fastapi-jwt-auth` / `authlib` / OAuth2PasswordBearer | 所有路由显式 Depends |
| .NET | `Microsoft.AspNetCore.Authentication.JwtBearer` | 必须配 `ValidateIssuer/Audience/Lifetime/Key` 全为 true |
| Node Express | `passport` + `jsonwebtoken` | 注意 `jsonwebtoken` 默认不检 `aud` |
| Go | `golang-jwt/jwt/v5` + middleware | gin-contrib/cors 的 `AllowAllOrigins=true` 与 Cookie 认证不兼容 |

## 9. 反面案例

```javascript
// ❌ HS256 + 密钥写死
jwt.sign(payload, 'secret123')

// ✅ RS256 + 从 KMS 读私钥
jwt.sign(payload, readPrivateKeyFromKms(), { algorithm: 'RS256', expiresIn: '15m' })
```

```java
// ❌ 只校验了登录，没校验资源归属
@GetMapping("/orders/{id}")
public Order get(@PathVariable Long id) { return orderRepo.findById(id).get(); }

// ✅ 显式 owner check
@GetMapping("/orders/{id}")
public Order get(@PathVariable Long id, @AuthenticationPrincipal User u) {
    Order o = orderRepo.findById(id).orElseThrow();
    if (!o.getUserId().equals(u.getId())) throw new ForbiddenException();
    return o;
}
```
