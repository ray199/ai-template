---
name: code
description: 编码实现 - 版本上下文扫描，生成 Entity/Mapper/Service/Controller/VO 及 DB 迁移脚本和测试骨架
argument-hint: [REQ-XXXXXXXX]
---

# 技能：编码实现

根据已确认的技术设计文档，驱动后端开发代理和 DBA 代理有序执行编码任务，在提交前完成规范自检。

需求ID：$ARGUMENTS

## 处理流程

```
[Step 0] 版本上下文扫描（必须在编码前完成）
         ↓
[Step 1] 读取设计文档，拆解编码任务
         ↓
[Step 2] 执行 DB 变更（优先）
         - 生成 DDL 脚本至 resources/db/migration/
         ↓
[Step 3] 逐层生成代码（自底向上）
         Mapper → Entity → Service → Controller → VO/DTO
         ↓
[Step 4] 规范自检（对照下方清单）
         ↓
[Step 5] 生成单元测试骨架（Service 层）
         ↓
[Step 6] 输出编码完成报告
```

## Step 0：版本上下文扫描

**扫描逻辑（Java）：** 读取 `pom.xml` → `<java.version>`、Spring Boot 版本、Spring AI/Cloud 依赖
**扫描逻辑（前端）：** 读取 `package.json` → Vue 版本、构建工具、UI 框架、TypeScript

**输出示例：**
```
────────────────────────────────────────────
  项目版本上下文（自动检测）
────────────────────────────────────────────
  JDK 版本    : 8 / 11 / 17 / 21
  Spring Boot : 2.x / 3.x
  构建工具    : Maven / Gradle
  Spring AI   : ✅已引入 / ❌未引入
  Vue 版本    : 2.x / 3.x
  UI 框架     : Element UI / Element Plus
────────────────────────────────────────────
```

**版本对代码生成的影响：**
| 条件 | 调整 |
|---|---|
| JDK ≥ 17 | DTO/VO 优先使用 `record`，而非 `@Data` |
| Spring Boot 3.x | 包名全部改为 `jakarta.*`，Security 用 Lambda DSL |
| JDK 8 | 严格限制语法，禁止 `var`/`record`/`text blocks` |
| Vue 2 | Options API，Vuex，Vue Router 3 |
| Vue 3 | `<script setup>` + Composition API，Pinia |

## 代码规范自检清单

### 通用规范
- [ ] 包名全小写，符合 `com.example.{模块}.{层名}` 结构
- [ ] 无 `System.out.println`，日志使用 `@Slf4j` + `log.info/warn/error`
- [ ] 无魔法值，常量统一定义在 `Constants` 或枚举类中
- [ ] 方法长度不超过 80 行

### MyBatis 规范
- [ ] Mapper 方法名语义清晰（`selectByUserId` 不写 `query1`）
- [ ] 禁止在 Mapper XML 中写业务逻辑
- [ ] 批量操作使用 `<foreach>`，禁止循环调用 Mapper（N+1）
- [ ] 禁止 `SELECT *`

### 事务规范
- [ ] Service 写操作加 `@Transactional(rollbackFor = Exception.class)`
- [ ] 禁止在 `@Transactional` 方法内调用同类非事务方法（事务失效）

### 异常处理规范
- [ ] 业务异常使用项目统一的 `BusinessException`
- [ ] 禁止吞异常（`catch (Exception e) {}`），至少 `log.error` 记录堆栈
- [ ] Controller 层不处理业务异常，由 `@RestControllerAdvice` 统一处理

### 安全规范
- [ ] 接口参数使用 `@Valid` + JSR-303 注解校验
- [ ] 敏感数据（手机号、密码）在日志中脱敏

## 单元测试骨架规范

```java
@ExtendWith(MockitoExtension.class)
class XxxServiceImplTest {

    @InjectMocks
    private XxxServiceImpl xxxService;

    @Mock
    private XxxMapper xxxMapper;

    @Test
    void testXxx_success() {
        // given - 准备测试数据和 Mock 行为
        // when  - 调用被测方法
        // then  - 验证结果
    }

    @Test
    void testXxx_throwsWhen_xxx() {
        // given - 准备触发异常的条件
        // when & then
        assertThrows(BusinessException.class, () -> xxxService.xxx(param));
    }
}
```

## DB 迁移脚本规范

- 路径：`src/main/resources/db/migration/V{yyyyMMdd_序号}__{描述}.sql`
- 脚本必须幂等：`CREATE TABLE IF NOT EXISTS`，`ADD COLUMN IF NOT EXISTS`
- 包含回滚语句（注释块）

## 输出格式

保存编码完成报告至 `docs/design/REQ-XXXXXXXX-code-report.md`：

```markdown
# 编码完成报告

- **need_id**：REQ-XXXXXXXX
- **完成时间**：YYYY-MM-DD

## 生成文件清单
| 文件路径 | 类型 | 说明 |
|---|---|---|

## 规范自检结果
- ✅ 通用规范：全部通过
- ✅ 事务规范：全部通过
- ⚠️ [如有问题，说明处理方式]

## 待开发者确认
- [ ] 业务逻辑实现符合设计文档预期
- [ ] DB 迁移脚本已在开发环境验证执行

确认后请回复：`/ai:test REQ-XXXXXXXX`
```

完成后告知用户下一步：`/ai:test REQ-XXXXXXXX`
