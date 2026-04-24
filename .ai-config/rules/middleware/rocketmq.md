# 中间件规范：RocketMQ

> 适用 RocketMQ 4.x / 5.x。Kafka / RabbitMQ 复用大部分原则，差异见末尾。

## 1. Topic 与 Tag 设计（强制）

- **Topic 命名**：`<app>-<domain>-<action>`，小写中划线，如 `pangeo-order-paid`
- **Topic 数量控制**：单应用 Topic 不超过 50 个；细分用 Tag，不要为每种子场景新建 Topic
- **Tag 命名**：大写+下划线，如 `ORDER_CREATED`、`ORDER_CANCELLED`
- **广播 Topic 与点对点 Topic 分开**，命名前缀区分：`bc-` 表示广播

## 2. 消息生产（强制）

- **禁止在 DB 事务内发送普通消息**（发送后事务回滚会导致消息已出，下游不可回退）
  - 正确做法：事务消息（RocketMQ 4.3+ 的 TransactionMQProducer）
  - 或 Outbox 模式：事务内写消息到 outbox 表，后台任务扫表发送
- **必须设置 messageId 或业务主键**（在消息 body 或 header 中），用于下游幂等去重
- **必须设置超时**：`sendTimeout` 默认 3 秒，重试次数默认 2 次（共 3 次）
- 同步发送用于关键消息（确认成功才返回）；异步用于高吞吐且容忍丢失的场景，必须提供回调处理失败

## 3. 消息消费（强制）

- **消费者必须幂等**。实现方式（至少一种）：
  - 业务唯一键 + DB unique index，insert 失败即重复
  - Redis `SET key NX` 做消费记录去重（注意 TTL 要覆盖最大重试窗口 + 时钟漂移）
- **消费失败策略**：
  - 明确可重试的业务异常 → 抛出由 MQ 重试（默认 16 次退避）
  - 明确不可重试的（参数错、幂等撞库）→ 记日志入死信表，返回消费成功
  - 不要吞异常：否则 MQ 认为成功，下次不会重投
- **消费并发度**：单消费者线程数起步 20，按下游压测调整；消费阻塞会导致堆积
- **批量消费**：开启后必须在代码里处理"部分成功"的情况，不支持回滚某条消息
- **顺序消息**：同一 MessageQueue 串行消费，业务 shardingKey 必须保证同一业务主键落到同一队列

## 4. 死信队列（强制）

- 所有消费组必须配置 DLQ 监控告警：`%DLQ%<ConsumerGroup>` Topic 有消息 → 告警
- DLQ 消息保留至少 3 天
- 死信处理必须有人工介入流程，不能自动重投（除非明确知道原因）

## 5. 事务消息使用场景

适合"本地事务 + 消息发送"需要保证一致性的场景：
1. 半消息发送（Prepared）
2. 执行本地事务
3. 根据本地事务结果 commit 或 rollback 半消息
4. 必须实现 `TransactionListener.checkLocalTransaction`（MQ 回查）

**注意**：checkLocalTransaction 必须能准确判断事务状态；如果本地事务状态查不到（例如数据库 rollback 了），返回 ROLLBACK。

## 6. 消息大小与吞吐

- 单条消息 body 不得超过 4MB（RocketMQ 默认上限）
- 建议控制在 256KB 以内；超大内容放对象存储（OSS/S3），消息只放引用 URL
- 生产者吞吐压力大时开启 `vipChannel` 和异步发送

## 7. 命名与配置约定

- ProducerGroup 命名：`<app>-producer`
- ConsumerGroup 命名：`<app>-<business>-consumer`
- **同一 ConsumerGroup 不能混合订阅不同 Topic**（会互相干扰 offset）
- 集群消费（CLUSTERING）是默认模式；广播消费（BROADCASTING）只用于客户端本地缓存失效这类场景

## 8. 监控告警（至少）

- 消息堆积（未消费消息数）> 阈值告警
- 消费 TPS 突降 50% 告警
- DLQ 有消息立即告警
- 生产端发送失败率 > 1% 告警

## 9. 语言客户端

| 语言 | 客户端 | 注意点 |
|---|---|---|
| Java | rocketmq-client 4.x / 5.x | 优先 5.x，原生支持 gRPC |
| Python | rocketmq-client-python | 功能较少，顺序消息支持有限 |
| .NET | RocketMQ.Client（官方 5.x） | 4.x 客户端已停更 |
| Node | rocketmq-client-nodejs | 实验性，生产慎用；建议走后端代理 |
| Go | rocketmq-client-go v2 | 社区活跃 |

## 10. 与 Kafka / RabbitMQ 的差异

- **Kafka**：无事务消息（事务是 producer-level 的原子写入多 partition）；幂等仍需业务保证；顺序通过 partition 保证
- **RabbitMQ**：无事务消息；有 publisher confirm 和 mandatory；幂等必须业务实现；队列和 exchange 概念更灵活
- **通用规则**（幂等消费、死信监控、避免事务内发送、Outbox 模式）对三者都适用

## 11. 反面案例

```java
// ❌ 事务内发消息，事务回滚后消息已发出
@Transactional
public void createOrder(Order o) {
    orderRepo.save(o);
    mq.send(new Message("order-created", o.getId().toString()));
    if (invalid(o)) throw new BizException();  // 回滚！但消息已发
}

// ✅ 事务消息或 Outbox
@Transactional
public void createOrder(Order o) {
    orderRepo.save(o);
    outboxRepo.save(new Outbox("order-created", o.getId()));
}
// 后台扫 outbox 发送，发送成功后标记已发
```
