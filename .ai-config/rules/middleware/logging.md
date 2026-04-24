# 中间件规范：日志框架

> 跨语言通用。目标：有用、可搜、可脱敏、不雪崩。

## 1. 日志级别（强制）

| 级别 | 用途 | 生产环境默认开启 |
|---|---|---|
| ERROR | 业务异常、需要人工介入的系统错误 | ✅ 必开，配告警 |
| WARN | 业务约束违反、降级触发、可容忍异常 | ✅ 必开 |
| INFO | 关键业务节点（订单创建、支付成功等） | ✅ 必开 |
| DEBUG | 开发排查用，详细状态变化 | ❌ 默认关闭 |
| TRACE | 极细节（入参出参、SQL） | ❌ 生产严禁开启 |

- **禁止 ERROR 泛滥**：不是异常都是 ERROR。业务预期内的失败（如用户名已存在）用 WARN 或 INFO，只有"不应该发生"的才是 ERROR
- **不要"打日志当注释"**：DEBUG 级别的内容如果只是为了代码可读性，删掉改为代码注释

## 2. 结构化日志（强制）

生产环境必须用结构化日志（JSON），而不是拼字符串：

```java
// ❌ 无法被日志平台解析
log.info("user " + userId + " login from " + ip);

// ✅ 结构化
log.info("user login", kv("userId", userId), kv("ip", ip));
```

好处：ELK / Loki / Datadog 能按字段过滤和聚合。

## 3. 必须携带的字段（强制）

每条日志至少包含：

- `timestamp`：ISO 8601 带时区
- `level`：ERROR / WARN / INFO / DEBUG
- `service`：应用名
- `traceId`：分布式追踪 ID（全链路）
- `spanId`：当前调用的 span（可选）
- `message`：人类可读的事件
- `userId` / `tenantId`（如果上下文有）

实现机制：MDC（Java）/ ContextVar（Python）/ AsyncLocalStorage（Node）/ context（Go）

## 4. 敏感信息脱敏（强制）

**禁止在任何级别日志中输出**：
- 密码、密钥、Token、API Key（含 JWT 全文、OAuth access_token）
- 身份证号、银行卡号、手机号全号、邮箱全字符
- 用户密码 / 支付密码 / 答案（即使是失败输入）
- 医疗、法律等敏感业务数据

脱敏格式示例：
- 手机号：`138****5678`
- 身份证：`110***********1234`
- 邮箱：`a***@example.com`
- Token：只打前 4 位 + 长度：`eyJh... (len=256)`

**实现**：必须在日志框架层做自动脱敏（Logback PatternLayout 扩展 / Serilog Destructuring / Python LogFilter），不能靠开发人员自觉。

## 5. 异常日志（强制）

- ERROR / WARN 级别的异常必须带完整堆栈
- 不要丢失原异常：
  ```java
  // ❌ 丢失原因
  catch (IOException e) { throw new BizException("读取失败"); }

  // ✅ 链式
  catch (IOException e) { throw new BizException("读取失败", e); }
  ```
- 不要打印并再抛出（重复日志）：在捕获点处理一次即可

## 6. 性能控制（强制）

- **禁止在循环内打 DEBUG** 除非确认日志级别：`if (log.isDebugEnabled()) log.debug(...)`
- 大对象序列化（JSON 化）只在确认级别打开时才做
- 日志异步输出（AsyncAppender / BufferingHandler），主线程不阻塞
- 磁盘满不应该阻塞业务：配置丢弃策略（`discardOnFullQueue`）而非阻塞

## 7. 日志轮转与保留

- 单文件上限 100MB，超过按日 / 按大小切
- 本地保留 ≤ 7 天（节省磁盘）
- 远端（ELK / 对象存储）保留：
  - INFO / WARN：30 天
  - ERROR：90 天
  - 审计日志（登录、权限变更）：≥ 180 天（按法规）

## 8. 审计日志（独立）

以下事件必须单独记录到"审计日志"（与普通日志分流）：

- 登录 / 登出 / 登录失败
- 权限变更、角色分配
- 金额相关的变更（订单、支付、退款）
- 管理员对用户数据的访问

审计日志格式要比普通日志更严格：谁（userId / adminId）、何时（UTC）、何地（IP）、做了什么（action）、对谁（targetId）、结果（success / failed）。

## 9. 日志框架推荐

| 语言 | 推荐 | 不推荐 |
|---|---|---|
| Java | Logback（Spring Boot 默认）+ SLF4J | log4j 1.x（EOL） / log4j 2.x（注意 CVE-2021-44228） |
| Python | `logging` 标准库 + `python-json-logger` / `structlog` | `print` / `loguru` 在大规模项目 |
| .NET | Serilog（写 Sinks 灵活） | `System.Diagnostics.Trace` 老旧 |
| Node | `pino`（高性能）/ `winston`（易用） | `console.log`（生产禁用） |
| Go | `zap`（高性能）/ `slog`（标准库，Go 1.21+） | `log` 标准库（功能少） |

## 10. 集中式日志要求

若项目有集中式日志平台（ELK / Loki / Datadog）：

- 所有应用必须接入
- 日志格式统一 JSON
- `traceId` 贯通所有服务（接入 OpenTelemetry 或 SkyWalking）
- 生产告警规则必须 peer review：避免误报导致告警疲劳

## 11. 反面案例

```python
# ❌ 拼字符串、泄漏 Token、无 traceId
logger.info("call api with token " + token + " response " + str(resp))

# ✅ 结构化 + 脱敏 + 自动上下文
logger.info("api_call", extra={
    "api": "payment.create",
    "token_prefix": token[:4],
    "status": resp.status,
    "trace_id": get_trace_id(),
})
```

```java
// ❌ ERROR 泛滥，业务预期失败不是 ERROR
catch (UsernameAlreadyExistsException e) {
    log.error("user exists", e);
    throw e;
}

// ✅ WARN
catch (UsernameAlreadyExistsException e) {
    log.warn("register conflict, username={}", username);
    throw e;
}
```
