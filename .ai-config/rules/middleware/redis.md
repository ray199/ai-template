# 中间件规范：Redis

> 跨语言通用。各语言 profile 在 "中间件约束" 节引用本文件。只列强制规则，每条都能说清守门的风险。

## 1. Key 设计（强制）

- **命名格式**：`<app>:<module>:<entity>:<id>[:<field>]`，分隔符只能用冒号 `:`，禁止下划线 `_` 或连字符
  - 好：`pangeo:user:session:u123:token`
  - 坏：`user_session_u123` / `userSession.u123`
- **长度限制**：key 总长 ≤ 128 字符；超过时用固定长度的 hash（如 SHA1 前 16 位）替换后缀
- **命名空间隔离**：不同应用或不同环境（dev/staging/prod）不得共享同一个 Redis 实例的同一 DB；若共享实例，必须用 `<app>:<env>:` 前缀隔离

## 2. TTL 策略（强制）

- **所有 key 必须设置 TTL**，除非业务上明确为长期数据（例如配置项），且在代码注释中写明"长期有效"
- 默认 TTL 上限：7 天。超过 7 天必须 code review 确认
- **缓存穿透防护**：查询不存在的数据也必须缓存空值（`null` 或哨兵字符串），TTL 控制在 30 秒到 5 分钟
- **缓存雪崩防护**：同一类 key 的 TTL 必须加随机扰动（±10%），防止同时过期

## 3. 禁用命令（强制）

- **禁止 KEYS**：阻塞主线程。必须用 `SCAN` 游标迭代
- **禁止 FLUSHDB / FLUSHALL**：生产环境禁用，测试环境要求双人确认
- **禁止大 Value**：单个 String 不得超过 100KB；Hash/List/Set/ZSet 单个元素数量不得超过 10000
- **禁止同步的 KEYS 遍历清理**：批量删除必须用 `UNLINK`（Redis 4.0+）而非 `DEL`

## 4. 分布式锁（若使用）

- 必须使用 `SET key value NX PX <毫秒>`（SETNX + EXPIRE 两步非原子，禁用）
- value 必须是唯一标识（UUID / 线程 ID + 时间戳），释放时用 Lua 脚本判断 value 再删除
- 锁超时必须短于业务最大执行时间；超时自动释放需要业务能接受重复执行（幂等兜底）
- 不要用 Redis 分布式锁做强一致性场景（如扣库存、金额变动），这类场景用 DB 乐观锁或分布式事务

## 5. Pipeline 和事务

- 批量操作超过 3 次往返必须用 `Pipeline` 合并
- `MULTI/EXEC` 不是真正的事务（没有回滚），只是批量执行；业务必须能接受"部分成功"的后果
- Lua 脚本适合需要原子性的复合操作，但脚本复杂度不得超过 100 行

## 6. 客户端连接

- 必须使用连接池，禁止每次操作新建连接
- 连接池最大连接数：CPU 核数 × 4 起步，按压测调整
- 读写分离的场景（主从）：只读 key 走从节点，有一致性要求的读走主节点

## 7. 监控告警（至少）

- 命中率 < 80% 告警
- 内存使用率 > 80% 告警
- 慢查询（> 10ms）记日志并告警
- 连接池等待超时告警

## 8. 语言特定

| 语言 | 推荐客户端 | 注意点 |
|---|---|---|
| Java | Spring Data Redis + Lettuce（替代 Jedis） | 避免 `RedisTemplate` 默认 JDK 序列化，改 Jackson |
| Python | `redis-py` 4.x+ | 使用 async 版本时不要混用同步 API |
| .NET | `StackExchange.Redis` | 单例 `ConnectionMultiplexer`，不要频繁 `GetDatabase` |
| Node | `ioredis` | 避免 `redis` 官方包旧版（callback 风格） |
| Go | `go-redis/redis/v9` | context 必须传入，控制超时 |

## 9. 典型反面案例（禁止）

```python
# ❌ 没有 TTL，Redis 被当成持久化存储
redis.set("user:profile:123", json.dumps(profile))

# ✅ 显式 TTL + 空值保护
redis.setex("user:profile:123", 3600, json.dumps(profile) if profile else "null")
```

```java
// ❌ 非原子锁
if (redis.setnx(key, uuid) == 1) { redis.expire(key, 30); ... }

// ✅ 原子 SET NX PX
redis.set(key, uuid, SetArgs.Builder.nx().px(30_000));
```
