# 中间件规范：API 请求层

> 分两部分：**前端**（Axios / fetch 封装）和 **后端**（HTTP 客户端调外部服务）。

---

## A. 前端 API 请求层

### A1. 必须封装（强制）

禁止在页面 / 组件中裸调用 `axios.get(...)` 或 `fetch(...)`。所有请求必须经过统一封装层 `src/api/`，封装层职责：

1. 统一 baseURL（按环境配置）
2. 统一错误处理
3. 统一 Token 注入
4. 统一 loading / 重试策略
5. 统一响应解构

### A2. 目录结构（推荐）

```
src/api/
├── client.ts         # axios 实例（唯一）
├── interceptors.ts   # 请求/响应拦截器
├── types.ts          # 全局响应类型（如 ApiResponse<T>）
└── modules/
    ├── user.ts       # 按业务模块分文件
    ├── order.ts
    └── ...
```

### A3. Axios 配置规则（强制）

- `timeout`：必须显式设置，前端推荐 15 秒（上传下载场景单独配更长）
- `baseURL`：从环境变量读（`import.meta.env.VITE_API_BASE`），禁止硬编码
- `withCredentials`：跨域带 Cookie 时必须显式设置，并配合后端 CORS 白名单
- 响应拦截器必须处理：
  - 401 → 跳转登录 / 尝试刷新 Token
  - 403 → 显示无权限提示
  - 5xx → 统一错误提示 + 日志上报
  - 业务错误码（如 `{ code: 'ORDER_NOT_FOUND' }`）→ 抛出 BizError

### A4. Token 注入

- 请求拦截器从 store / localStorage 读取 Access Token，放 `Authorization: Bearer xxx`
- Access Token 过期（401）→ 用 Refresh Token 静默刷新一次，失败才跳登录
- 刷新期间的并发请求必须排队（单飞 singleflight），避免重复刷新

### A5. 取消重复请求（推荐）

同一请求在上一次未完成前再次发起时，取消旧请求（AbortController）。适用于：

- 搜索框输入（debounce + cancel）
- 页面快速切换（路由 beforeLeave 里 cancel）

### A6. 类型安全（TS 项目强制）

```typescript
// ✅ 响应类型泛型
interface ApiResponse<T> { code: string; data: T; message?: string }

function get<T>(url: string, params?: object): Promise<T> {
  return client.get<ApiResponse<T>>(url, { params }).then(r => r.data.data);
}

// 使用
const user = await get<User>('/users/123');
```

### A7. 反面案例

```typescript
// ❌ 组件内直接 fetch，无超时、无错误处理、无类型
const r = await fetch('/api/users/' + id);
const user = await r.json();

// ✅ 封装层
import { userApi } from '@/api/modules/user';
const user = await userApi.getById(id);
```

---

## B. 后端 HTTP 客户端（调外部服务）

### B1. 超时（强制）

所有出站 HTTP 调用必须设三类超时：

- **连接超时**（connect timeout）：1-3 秒
- **读超时**（read / socket timeout）：视业务，默认 5-10 秒
- **请求总超时**：视业务，不超过上游服务的 SLA

**没有超时配置 = 生产事故等待发生**。线程被卡住最终拖垮整个服务。

### B2. 重试（强制）

- 只对**幂等请求**（GET / PUT / DELETE）自动重试
- POST 重试必须确认对端幂等（有 Idempotency-Key）
- 重试次数 ≤ 3 次，指数退避（1s / 2s / 4s）
- 明确不重试的错误码：4xx（除 408/429）、业务错误

### B3. 熔断 / 限流（强制）

调用外部服务（特别是第三方）必须有熔断：

- 错误率阈值：50% / 10 秒窗口 → 打开熔断
- 熔断时间：30 秒
- 半开状态放 1 个请求试探

实现：Resilience4j（Java）/ polly（.NET）/ hystrix（已停更，不推荐）/ 自行基于 token bucket 实现

### B4. 连接池

- 必须用连接池（HttpClient / OkHttp / Requests with adapter）
- 每个目标主机最大连接数：20-50
- 空闲连接回收：5 分钟

### B5. 超时传递（Deadline Propagation）

被调方法从入口拿到的超时 deadline 必须向下游传递：

```
入口 HTTP：总超时 3 秒
  → 调用 Service A：剩 2.7 秒
    → 调用 DB：最多给 2 秒
```

不要让下游用默认超时 30 秒盖过入口的 3 秒。

### B6. 日志与监控

- 所有出站调用记录：URL / method / 耗时 / status / traceId
- 失败率和 P99 耗时接入监控
- 慢请求（> 1 秒）必须打 WARN 日志

### B7. 推荐客户端

| 语言 | 推荐 | 避免 |
|---|---|---|
| Java | OkHttp / Spring WebClient（响应式）| `HttpURLConnection`（API 老旧） |
| Python | `httpx`（支持 async）/ `requests`（同步） | `urllib`（API 不友好） |
| .NET | `HttpClient`（单例，不要频繁 new） | 频繁 new 导致 socket 耗尽 |
| Node | `axios` / `undici`（内置） | `request`（已废弃） |
| Go | `net/http` + 自定义 `*http.Client` | 默认 DefaultClient 无超时 |

### B8. 反面案例

```go
// ❌ 默认 client 无超时，可能挂到永远
resp, _ := http.Get("https://third-party.com/api")

// ✅ 显式超时 + 连接池
var client = &http.Client{
    Timeout: 5 * time.Second,
    Transport: &http.Transport{
        MaxIdleConns:    100,
        IdleConnTimeout: 90 * time.Second,
    },
}
resp, err := client.Get(url)
```

```java
// ❌ new 一个 RestTemplate 用一次就丢，线程池每次重建
new RestTemplate().getForObject(url, User.class);

// ✅ 注入单例
@Autowired RestTemplate restTemplate;
restTemplate.getForObject(url, User.class);
```

---

## C. 通用原则

1. **区分内部调用和外部调用**：内部服务调用可以信任更少的重试；外部三方必须重度防御
2. **所有失败可观察**：失败必须可以在日志和监控中追溯
3. **超时必须比业务 SLA 小**：否则上游已经超时，你还在等下游
4. **不要捕获 Throwable / Exception 静默吞掉**：至少 WARN + metrics
