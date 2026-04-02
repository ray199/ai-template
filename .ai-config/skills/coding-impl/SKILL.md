# 技能：编码实现

## 技能描述

根据已确认的技术设计文档，驱动后端开发代理和 DBA 代理有序执行编码任务。  
确保每个编码子任务有输入、有输出、有完成标准，并在提交前完成自检。

## 触发指令

- `/code` - 启动编码实现（需提供 need_id）
- `/code --backend` - 仅执行后端编码
- `/code --db` - 仅执行数据库变更（DDL + 迁移脚本）
- `/code --check` - 对已生成代码执行规范自检（不生成新代码）

## 处理流程

```
输入：已确认的技术设计文档（docs/design/REQ-XXXXXXXX-design.md）
       ↓
[Step 1] 读取设计文档，拆解编码任务
         - DB 变更任务（优先执行）
         - Entity / DO 层
         - Mapper / Repository 层
         - Service 层（含接口 + 实现）
         - Controller 层
         - VO / DTO / 请求响应对象
         ↓
[Step 2] 执行 DB 变更
         - 生成 DDL 脚本（resources/db/migration/）
         - 触发 dba 代理复核（如表结构较复杂）
         ↓
[Step 3] 逐层生成代码（自底向上）
         Mapper → Entity → Service → Controller
         ↓
[Step 4] 代码规范自检（对照 code_checklist.md）
         ↓
[Step 5] 生成单元测试骨架（Service 层）
         ↓
[Step 6] 输出编码完成报告，等待开发者确认
```

---

## 编码任务拆解规则

每项编码任务使用以下格式记录，确保可追踪：

```markdown
### 任务：[任务名称]
- **负责代理**：backend_dev / dba
- **输入**：[依赖的设计文档章节 / 前置任务]
- **输出文件**：
  - `src/main/java/.../entity/XxxDO.java`
  - `src/main/java/.../mapper/XxxMapper.java`
  - `src/main/resources/mapper/XxxMapper.xml`
- **完成标准**：
  - [ ] 文件已生成
  - [ ] 规范自检通过
  - [ ] 单元测试骨架已生成（Service 层）
```

---

## 代码规范自检清单

> 编码完成后，对照以下清单逐项检查，不通过的项必须修复后才能提交。

### 通用规范
- [ ] 包名全小写，符合 `com.example.project.modules.{模块名}.{层名}` 结构
- [ ] 类名、方法名、变量名符合命名规范（参考 `02_code_style.mdc`）
- [ ] 无 `System.out.println`，日志使用 `@Slf4j` + `log.info/warn/error`
- [ ] 无魔法值，常量统一定义在 `Constants` 或枚举类中
- [ ] 方法长度不超过 80 行，超过须重构提取子方法

### Java 8 规范
- [ ] 集合操作优先使用 Stream API，避免繁琐的 for 循环
- [ ] 可能为 null 的返回值使用 `Optional` 包装，或在 Javadoc 中标注可空
- [ ] 日期处理使用 `java.time`（LocalDate / LocalDateTime），禁止使用 `Date` 或 `Calendar`
- [ ] 初始化 `ArrayList` / `HashMap` 时指定初始容量

### MyBatis 规范
- [ ] Mapper 接口方法名语义清晰（`selectByUserId` 不写 `query1`）
- [ ] 禁止在 Mapper XML 中写业务逻辑，业务判断放 Service 层
- [ ] 批量操作使用 `<foreach>`，禁止在循环中调用 Mapper（N+1 问题）
- [ ] 查询必须指定需要的字段，禁止 `SELECT *`

### 事务规范
- [ ] Service 层写操作加 `@Transactional`，明确指定 `rollbackFor = Exception.class`
- [ ] 禁止在 `@Transactional` 方法内调用同类的非事务方法（事务失效）
- [ ] 长事务场景（含远程调用/IO 操作）需特殊说明，不能无脑加事务

### 异常处理规范
- [ ] 业务异常使用项目统一的 `BusinessException` 抛出，禁止直接 `throw new RuntimeException`
- [ ] 禁止吞掉异常（`catch (Exception e) {}`），至少要 `log.error` 记录堆栈
- [ ] Controller 层不处理业务异常，交由全局异常处理器（`@RestControllerAdvice`）统一处理

### 安全规范（对照 `03_security.mdc`）
- [ ] 接口参数使用 `@Valid` + JSR-303 注解校验，禁止在 Service 层手动判空
- [ ] 涉及用户数据的接口，确认权限校验逻辑已覆盖
- [ ] 敏感数据（手机号、身份证、密码）在日志中脱敏，禁止明文打印

---

## 单元测试骨架生成规范

对 Service 层每个公共方法，生成以下测试骨架：

```java
@ExtendWith(MockitoExtension.class)
class XxxServiceImplTest {

    @InjectMocks
    private XxxServiceImpl xxxService;

    @Mock
    private XxxMapper xxxMapper;

    /**
     * 正常场景：[方法名] - [预期行为描述]
     */
    @Test
    void testXxx_success() {
        // given
        // TODO: 准备测试数据和 Mock 行为

        // when
        // TODO: 调用被测方法

        // then
        // TODO: 验证结果
    }

    /**
     * 异常场景：[方法名] - [异常触发条件]
     */
    @Test
    void testXxx_throwsWhen_xxx() {
        // given
        // TODO: 准备触发异常的条件

        // when & then
        assertThrows(BusinessException.class, () -> xxxService.xxx(param));
    }
}
```

---

## DB 迁移脚本规范

- 文件路径：`src/main/resources/db/migration/V{版本号}__{描述}.sql`
  - 示例：`V20240315_01__add_user_extend_table.sql`
- 版本号格式：`yyyyMMdd_序号`（当天第几个脚本）
- 脚本要求：
  - 必须幂等（`CREATE TABLE IF NOT EXISTS`，`ADD COLUMN IF NOT EXISTS`）
  - 包含注释，说明本次变更目的
  - 附上回滚语句（放在注释块中）

```sql
-- ============================================================
-- 变更说明：新增 xxx_table 表，用于存储 [说明]
-- 需求编号：REQ-XXXXXXXX
-- 创建时间：YYYY-MM-DD
-- 回滚语句：DROP TABLE IF EXISTS `xxx_table`;
-- ============================================================

CREATE TABLE IF NOT EXISTS `xxx_table` (
  -- 字段定义
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[表说明]';
```

---

## 编码完成报告格式

```markdown
# 编码完成报告

- **need_id**：REQ-XXXXXXXX
- **完成时间**：YYYY-MM-DD
- **执行代理**：backend_dev

---

## 生成文件清单

| 文件路径 | 类型 | 说明 |
|---|---|---|
| src/main/.../entity/XxxDO.java | Entity | 数据库实体 |
| src/main/.../mapper/XxxMapper.java | Mapper | 数据访问接口 |
| src/main/.../service/XxxService.java | Service接口 | 业务接口定义 |
| src/main/.../service/impl/XxxServiceImpl.java | Service实现 | 业务逻辑实现 |
| src/main/.../controller/XxxController.java | Controller | 接口入口 |
| src/main/resources/db/migration/Vxxx__.sql | DDL | 数据库迁移脚本 |
| src/test/.../XxxServiceImplTest.java | 测试 | Service 单元测试骨架 |

---

## 规范自检结果

- ✅ 通用规范：全部通过
- ✅ Java 8 规范：全部通过
- ⚠️ 事务规范：[如有问题，说明问题和处理方式]

---

## 待开发者确认

- [ ] 业务逻辑实现符合设计文档预期
- [ ] 单元测试骨架已填充测试数据（或标注 TODO）
- [ ] DB 迁移脚本已在开发环境验证执行

确认后请回复：`/code-confirm REQ-XXXXXXXX`
```
