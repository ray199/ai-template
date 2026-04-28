# 代码规范自检清单

> 编码完成后，对照本清单逐项检查。不通过的项必须修复后才能流转到 `/pg:check`。

## 通用规范
- [ ] 包名全小写，符合 `com.example.project.modules.{模块名}.{层名}` 结构
- [ ] 类名、方法名、变量名符合命名规范（参考 `02_code_style.mdc`）
- [ ] 无 `System.out.println`，日志使用 `@Slf4j` + `log.info/warn/error`
- [ ] 无魔法值，常量统一定义在 `Constants` 或枚举类中
- [ ] 方法长度不超过 80 行，超过须重构提取子方法

## Java 版本特性规范（基于版本扫描结果）
- [ ] **JDK 8**：禁止使用 `var` / `record` / `text blocks` / `switch expressions`
- [ ] **JDK 8+**：日期处理使用 `java.time`，禁止 `Date` / `Calendar` / `SimpleDateFormat`
- [ ] **JDK 8+**：集合操作优先使用 Stream API；可能为 null 的值使用 `Optional`
- [ ] **JDK 8+**：初始化 `ArrayList` / `HashMap` 时指定初始容量
- [ ] **JDK 17+**：纯数据 DTO/VO 优先使用 `record`，而非 Lombok `@Data`
- [ ] **JDK 21+**：I/O 密集型线程池评估是否启用 Virtual Threads
- [ ] **Spring Boot 3.x**：包名全部为 `jakarta.*`，Security 使用 Lambda DSL

## MyBatis 规范
- [ ] Mapper 接口方法名语义清晰（`selectByUserId` 不写 `query1`）
- [ ] 禁止在 Mapper XML 中写业务逻辑，业务判断放 Service 层
- [ ] 批量操作使用 `<foreach>`，禁止在循环中调用 Mapper（N+1 问题）
- [ ] 查询必须指定需要的字段，禁止 `SELECT *`

## 事务规范
- [ ] Service 层写操作加 `@Transactional`，明确指定 `rollbackFor = Exception.class`
- [ ] 禁止在 `@Transactional` 方法内调用同类的非事务方法（事务失效）
- [ ] 长事务场景（含远程调用/IO 操作）需特殊说明，不能无脑加事务

## 异常处理规范
- [ ] 业务异常使用项目统一的 `BusinessException` 抛出，禁止直接 `throw new RuntimeException`
- [ ] 禁止吞掉异常（`catch (Exception e) {}`），至少要 `log.error` 记录堆栈
- [ ] Controller 层不处理业务异常，交由全局异常处理器（`@RestControllerAdvice`）统一处理

## 安全规范（对照 `03_security.mdc`）
- [ ] 接口参数使用 `@Valid` + JSR-303 注解校验，禁止在 Service 层手动判空
- [ ] 涉及用户数据的接口，确认权限校验逻辑已覆盖
- [ ] 敏感数据（手机号、身份证、密码）在日志中脱敏，禁止明文打印
