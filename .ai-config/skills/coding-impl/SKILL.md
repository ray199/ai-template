# 技能：编码实现

## 技能描述

根据已确认的技术设计文档，驱动后端开发代理和 DBA 代理有序执行编码任务。  
确保每个编码子任务有输入、有输出、有完成标准，并在提交前完成自检。

## 触发指令

- `/code` - 启动编码实现（需提供 need_id），前后端同时生成
- `/code --backend` - 仅执行后端编码
- `/code --frontend` - 仅执行前端编码（Vue 页面/组件/API层）
- `/code --db` - 仅执行数据库变更（DDL + 迁移脚本）
- `/code --check` - 对已生成代码执行规范自检（不生成新代码）

## 处理流程

```
输入（根据工作量等级不同）：
  S 等级  → docs/requirements/backlog/REQ-XXXXXXXX.md（需求文档，跳过设计阶段）
  M/L/XL → docs/design/REQ-XXXXXXXX-design.md（技术设计文档）
       ↓
[Step 0] 检测项目技术栈（pom.xml / package.json 等），确定前后端版本上下文
         ↓
[Step 1] 读取输入文档，拆解编码任务
         S 等级：直接读取需求文档（backlog/）；无设计文档，从需求直接推断代码结构
         M/L/XL：读取技术设计文档（design/），按设计文档拆解任务
         后端任务：
           - DB 变更任务（优先执行）
           - Entity / DO / Model 层
           - Mapper / Repository / DAO 层
           - Service 层（含接口 + 实现）
           - Controller / Router 层
           - VO / DTO / Schema / 请求响应对象
         前端任务（若含前端）：
           - API 调用层（src/api/）
           - 页面组件（src/views/）
           - 业务组件（src/components/）
           - 路由配置（src/router/）
           - Store 模块（src/stores/ 或 src/store/）
         ↓
[Step 2] 执行 DB 变更（后端）
         - 生成 DDL 脚本（resources/db/migration/）
         - 触发 dba 代理复核（如表结构较复杂）
         ↓
[Step 3] 逐层生成后端代码（自底向上）
         Mapper → Entity → Service → Controller
         ↓
[Step 3.5] 生成前端代码（若含前端，按设计文档中前端UI设计节执行）
         API层 → Store → 页面view → 业务组件
         详见下方"前端代码生成规范"
         ↓
[Step 4] 代码规范自检
         - 后端：对照后端规范清单
         - 前端：对照 vue-code-review-checklist.md
         ↓
[Step 5] 生成测试骨架
         - 后端：Service 层 JUnit 测试骨架
         - 前端（若含前端）：Hook 单元测试骨架（Vitest）
         ↓
[Step 6] 输出编码完成报告（前后端分别列清单），等待开发者确认
```

---

## Step 0：项目版本上下文扫描（Java 项目）

> 每次执行 `/code` 指令时，在生成任何代码之前**必须先完成此步骤**。
> 目的：确保生成的代码语法、包名、API 与项目实际版本一致，避免语法/兼容性问题。

### 自动扫描逻辑

```
1. 优先读取 pom.xml
   ├─ <java.version> 或 <maven.compiler.source>  → JDK 版本
   ├─ <parent> spring-boot-starter-parent version → Spring Boot 版本
   ├─ 搜索 spring-ai 依赖                         → Spring AI 是否引入
   └─ 搜索 spring-cloud 依赖                      → Spring Cloud 是否引入

2. 若无 pom.xml，读取 build.gradle / build.gradle.kts
   ├─ java { sourceCompatibility / targetCompatibility }
   └─ plugins { id 'org.springframework.boot' version '...' }

3. 若仍无法确定，读取
   ├─ .java-version / .sdkmanrc / .tool-versions
   └─ Dockerfile（FROM eclipse-temurin:xx）

4. 若全部无法确定 → 输出询问，人工确认后继续
```

### 输出格式（必须在开始编码前展示）

```
────────────────────────────────────────────
  项目版本上下文（自动检测）
────────────────────────────────────────────
  JDK 版本      : [8 / 11 / 17 / 21 / ❓未检测到]
  Spring Boot   : [2.x / 3.x / ❓未检测到]
  构建工具      : [Maven / Gradle]
  Spring AI     : [✅ 已引入 / ❌ 未引入]
  Spring Cloud  : [✅ 已引入 / ❌ 未引入]
  其他关键依赖  : [MyBatis-Plus / JPA / Security / ...]

  适用规范      : java_spring.mdc §[对应版本章节]
  包名前缀      : [javax.* / jakarta.*（Spring Boot 3.x）]
────────────────────────────────────────────
```

### 版本对代码生成的影响（Java）

| 版本条件 | 代码生成调整 |
|---|---|
| JDK ≥ 17 | 纯数据 DTO/VO 优先生成 `record`，而非 Lombok `@Data` |
| JDK ≥ 21 | 线程池考虑 Virtual Threads；`switch` 可用 pattern matching |
| Spring Boot 3.x | 所有包名使用 `jakarta.*`，Security 用 Lambda DSL |
| Spring AI 已引入 | AI 调用封装在 Service 层，使用 `ChatClient` 标准 API |
| JDK 8 | 严格限制语法，禁止 `var`/`record`/`text blocks` 等 |

---

## Step 0 补充：前端项目版本扫描（Vue 项目）

> 当项目含前端代码时，与 Java 扫描**并行执行**（或单独执行）。

### 自动扫描逻辑

```
1. 读取 package.json
   ├─ dependencies.vue          → Vue 版本（^2.x / ^3.x）
   ├─ devDependencies.vite      → 构建工具 Vite（通常 Vue 3）
   ├─ devDependencies.@vue/cli-service → Vue CLI（通常 Vue 2/3）
   ├─ dependencies.vuex         → 状态管理 Vuex（Vue 2 概率高）
   ├─ dependencies.pinia        → 状态管理 Pinia（Vue 3）
   ├─ dependencies.vue-router   → 路由版本（^3.x / ^4.x）
   └─ engines.node              → Node.js 版本要求

2. 检查配置文件
   ├─ vite.config.js / vite.config.ts  → Vite 项目
   ├─ vue.config.js                    → Vue CLI 项目
   └─ tsconfig.json 存在               → TypeScript 已引入

3. 若无法确定 → 人工确认后继续
```

### 输出格式

```
────────────────────────────────────────────
  前端版本上下文（自动检测）
────────────────────────────────────────────
  Vue 版本       : [2.x / 3.x / ❓未检测到]
  Node.js 版本   : [16 / 18 / 20 / ❓]
  构建工具       : [Vite / Vue CLI / Webpack]
  状态管理       : [Vuex / Pinia / 无]
  路由版本       : [Vue Router 3 / Vue Router 4 / 无]
  UI 框架        : [Element UI / Element Plus / Ant Design Vue / 其他 / 无]
  TypeScript     : [✅ 已引入 / ❌ 未引入]

  适用规范       : node_vue.mdc §[对应版本章节]
  代码风格       : [Options API / Composition API + <script setup>]
────────────────────────────────────────────
```

### 版本对前端代码生成的影响

| 版本条件 | 代码生成调整 |
|---|---|
| Vue 2 | Options API（data/methods/computed/watch），Vuex，Vue Router 3 |
| Vue 3 | `<script setup>` + Composition API，Pinia，Vue Router 4 |
| TypeScript 已引入 | Props/Emits 用泛型定义，API 返回值有类型，禁止 `any` |
| TypeScript 未引入 | JSDoc 注释补充类型说明 |
| Element UI（Vue 2）| 组件前缀 `el-`，使用 `$message` / `$confirm` |
| Element Plus（Vue 3）| 组件前缀 `el-`，使用 `ElMessage` / `ElMessageBox`（按需导入）|
| Vant（移动端） | 组件前缀 `van-`，注意 rem 适配方案 |

---

## Step 0 补充：Python 项目版本扫描

> 检测到 Python 项目时执行（`requirements.txt` / `pyproject.toml` 存在）。

### 自动扫描逻辑

```
1. 读取 pyproject.toml → [tool.poetry] python / [project] requires-python
2. 读取 .python-version → pyenv 声明版本
3. 读取 setup.cfg / setup.py → python_requires
4. 读取 Pipfile → [requires] python_version
5. 读取 Dockerfile → FROM python:x.x
6. 若全部无法确定 → 询问用户确认

同时检测 Web 框架依赖：
  requirements.txt / pyproject.toml 中检索：
  - django / djangorestframework → Django + DRF
  - fastapi → FastAPI
  - flask → Flask
  - sqlalchemy → SQLAlchemy ORM
  - alembic → Alembic 迁移
```

### 输出格式

```
────────────────────────────────────────────
  Python 版本上下文（自动检测）
────────────────────────────────────────────
  Python 版本    : [3.8 / 3.10 / 3.11 / 3.12 / ❓未检测到]
  包管理工具     : [pip / Poetry / Pipenv / PDM]
  Web 框架       : [Django / FastAPI / Flask / 无]
  ORM            : [Django ORM / SQLAlchemy / 无]
  数据库迁移     : [Alembic / Django Migrations / 无]
  类型检查       : [mypy / pyright / 无]

  适用规范       : python.mdc §[对应版本章节]
────────────────────────────────────────────
```

### 版本对代码生成的影响（Python）

| 版本条件 | 代码生成调整 |
|---|---|
| Python ≤ 3.8 | 类型提示用 `from typing import Optional, List, Dict`，禁止 `X \| Y` 语法 |
| Python ≥ 3.10 | 可用 `match/case`，类型提示可用内置 `list[int]`、`X \| Y` |
| Python ≥ 3.11 | 可用 `TaskGroup`、`Self`，推荐用于新的异步并发场景 |
| FastAPI 项目 | 路由使用 `@app.get/post`，参数校验使用 Pydantic Model |
| Django 项目 | 视图用 ViewSet，序列化器显式声明 `fields`，禁止 `__all__` |
| SQLAlchemy 2.x | 使用 `Mapped[T]` + `mapped_column` 声明式风格 |

---

## Step 0 补充：C#/.NET 项目版本扫描

> 检测到 .NET 项目时执行（`*.csproj` / `*.sln` 存在）。

### 自动扫描逻辑

```
1. 读取 *.csproj → <TargetFramework>（net6.0 / net7.0 / net8.0）
                 → <LangVersion>（10 / 11 / 12）
                 → <Nullable>（enable / disable）
2. 读取 global.json → "sdk": { "version": "..." }
3. 读取 Directory.Build.props → <TargetFramework>
4. 读取 Dockerfile → FROM mcr.microsoft.com/dotnet/aspnet:x.x
5. 若全部无法确定 → 询问用户确认

同时检测框架类型：
  .csproj / NuGet 依赖中检索：
  - Microsoft.AspNetCore.Mvc → Controller-based Web API
  - app.MapGet（Program.cs 中） → Minimal API
  - Microsoft.EntityFrameworkCore → EF Core
  - Dapper → Dapper ORM
```

### 输出格式

```
────────────────────────────────────────────
  .NET 版本上下文（自动检测）
────────────────────────────────────────────
  .NET 版本       : [6 / 7 / 8 / ❓未检测到]
  C# 版本         : [10 / 11 / 12 / ❓]
  API 风格        : [Controller-based / Minimal API / 混合]
  ORM             : [EF Core / Dapper / ADO.NET / 无]
  NRT（空引用）   : [✅ 已启用 / ❌ 未启用]

  适用规范        : dotnet_csharp.mdc §[对应版本章节]
────────────────────────────────────────────
```

### 版本对代码生成的影响（C#/.NET）

| 版本条件 | 代码生成调整 |
|---|---|
| .NET 6 / C# 10 | 文件级命名空间、`record struct`，禁止 `required` 修饰符 |
| .NET 7 / C# 11 | 可用 `required` 修饰符、原始字符串（`"""`）、List patterns |
| .NET 8 / C# 12 | 可用主构造函数、Collection expressions、`IExceptionHandler` |
| NRT 已启用 | 引用类型必须标注 `?`，禁止用 `!` 消除警告 |
| EF Core 项目 | 继承 BaseEntity，使用全局查询过滤器过滤软删除 |
| Minimal API | 路由在独立 `MapXxxEndpoints` 扩展方法中注册，禁止全写在 Program.cs |

---

## 前端代码生成规范（Vue 项目）

> 当项目含前端时，Step 3.5 按以下规范生成。版本（Vue 2 / Vue 3）由 Step 0 决定。

### 生成文件清单（前后端分离项目）

| 文件 | 说明 |
|---|---|
| `src/api/xxx.js` | API 调用层，封装所有后端接口调用（axios） |
| `src/views/xxx/XxxList.vue` | 列表页（页面级组件，含搜索/表格/分页） |
| `src/views/xxx/XxxDetail.vue` | 详情页（若需求包含详情查看） |
| `src/components/xxx/XxxEditDialog.vue` | 新增/编辑弹窗（可复用业务组件） |
| `src/stores/xxxStore.js` | Pinia Store（Vue 3，仅需要全局状态时生成） |
| `src/store/modules/xxx.js` | Vuex 模块（Vue 2，仅需要全局状态时生成） |
| `src/router/modules/xxx.js` | 路由配置（新增路由时生成） |

### API 层生成规范

```javascript
// src/api/xxx.js
import request from '@/utils/request'

/**
 * 获取XXX列表
 * @param {Object} params - 查询参数
 */
export function getXxxList(params) {
  return request({
    url: '/api/v1/xxx/list',
    method: 'get',
    params
  })
}

/**
 * 创建XXX
 * @param {Object} data - 创建数据
 */
export function createXxx(data) {
  return request({
    url: '/api/v1/xxx',
    method: 'post',
    data
  })
}

export function updateXxx(id, data) {
  return request({ url: `/api/v1/xxx/${id}`, method: 'put', data })
}

export function deleteXxx(id) {
  return request({ url: `/api/v1/xxx/${id}`, method: 'delete' })
}
```

### 页面组件生成规范

**Vue 3（Composition API + `<script setup>`）：**

```vue
<template>
  <div class="xxx-list">
    <!-- 搜索栏 -->
    <el-form :model="searchForm" inline>
      <el-form-item label="名称">
        <el-input v-model="searchForm.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">新增</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @change="fetchList"
    />

    <!-- 编辑弹窗 -->
    <XxxEditDialog v-model="dialogVisible" :row="currentRow" @success="fetchList" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getXxxList, deleteXxx } from '@/api/xxx'
import XxxEditDialog from '@/components/xxx/XxxEditDialog.vue'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const currentRow = ref(null)
const searchForm = ref({ name: '' })
const pagination = ref({ page: 1, size: 20, total: 0 })

const fetchList = async () => {
  loading.value = true
  try {
    const { data } = await getXxxList({ ...searchForm.value, ...pagination.value })
    tableData.value = data.records
    pagination.value.total = data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.value.page = 1; fetchList() }
const handleReset = () => { searchForm.value = { name: '' }; handleSearch() }

const handleCreate = () => { currentRow.value = null; dialogVisible.value = true }
const handleEdit = (row) => { currentRow.value = row; dialogVisible.value = true }

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', { type: 'warning' })
  await deleteXxx(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>
```

**Vue 2（Options API）生成规则：**
- `data()` 函数返回响应式数据
- `methods` 中定义所有方法
- `created()` 生命周期初始化数据
- 使用 `this.$message` / `this.$confirm`（Element UI）
- 使用 `this.$store.dispatch` 操作 Vuex

### 前端测试骨架生成规范（Step 5）

```javascript
// src/hooks/__tests__/useXxx.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useXxx } from '@/hooks/useXxx'
import * as xxxApi from '@/api/xxx'

describe('useXxx Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch list on init', async () => {
    vi.spyOn(xxxApi, 'getXxxList').mockResolvedValue({
      data: { records: [{ id: 1, name: 'test' }], total: 1 }
    })

    const { list, fetchList } = useXxx()
    await fetchList()

    expect(list.value).toHaveLength(1)
    expect(list.value[0].name).toBe('test')
  })

  it('should handle api error gracefully', async () => {
    vi.spyOn(xxxApi, 'getXxxList').mockRejectedValue(new Error('Network Error'))

    const { fetchList, error } = useXxx()
    await fetchList()

    expect(error.value).toBeTruthy()
  })
})
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

### Java 版本特性规范（基于 Step 0 检测结果）
- [ ] **JDK 8**：禁止使用 `var` / `record` / `text blocks` / `switch expressions`
- [ ] **JDK 8+**：日期处理使用 `java.time`，禁止 `Date` / `Calendar` / `SimpleDateFormat`
- [ ] **JDK 8+**：集合操作优先使用 Stream API；可能为 null 的值使用 `Optional`
- [ ] **JDK 8+**：初始化 `ArrayList` / `HashMap` 时指定初始容量
- [ ] **JDK 17+**：纯数据 DTO/VO 优先使用 `record`，而非 Lombok `@Data`
- [ ] **JDK 21+**：I/O 密集型线程池评估是否启用 Virtual Threads
- [ ] **Spring Boot 3.x**：包名全部为 `jakarta.*`，Security 使用 Lambda DSL

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
- **执行代理**：backend_dev + frontend_dev

---

## 后端生成文件清单

| 文件路径 | 类型 | 说明 |
|---|---|---|
| src/main/.../entity/XxxDO.java | Entity | 数据库实体 |
| src/main/.../mapper/XxxMapper.java | Mapper | 数据访问接口 |
| src/main/.../service/XxxService.java | Service接口 | 业务接口定义 |
| src/main/.../service/impl/XxxServiceImpl.java | Service实现 | 业务逻辑实现 |
| src/main/.../controller/XxxController.java | Controller | 接口入口 |
| src/main/resources/db/migration/Vxxx__.sql | DDL | 数据库迁移脚本 |
| src/test/.../XxxServiceImplTest.java | 测试 | Service 单元测试骨架 |

## 前端生成文件清单（若含前端）

| 文件路径 | 类型 | 说明 |
|---|---|---|
| src/api/xxx.js | API层 | 后端接口调用封装 |
| src/views/xxx/XxxList.vue | 页面 | 列表页（含搜索/表格/分页） |
| src/components/xxx/XxxEditDialog.vue | 组件 | 新增/编辑弹窗 |
| src/router/modules/xxx.js | 路由 | 路由配置 |
| src/hooks/__tests__/useXxx.test.js | 测试 | Hook 单元测试骨架 |

---

## 规范自检结果

### 后端
- ✅ 通用规范：全部通过
- ✅ Java 版本规范：全部通过
- ⚠️ 事务规范：[如有问题，说明问题和处理方式]

### 前端（若含前端）
- ✅ Vue 版本规范：全部通过
- ✅ API 层封装：全部通过
- ⚠️ [如有问题，说明]

---

## 待开发者确认

- [ ] 后端业务逻辑实现符合设计文档预期
- [ ] 前端页面功能符合原型/设计文档预期（若含前端）
- [ ] 前后端接口联调已验证（字段名、类型、分页格式）
- [ ] 单元测试骨架已填充测试数据（或标注 TODO）
- [ ] DB 迁移脚本已在开发环境验证执行

确认后，执行：`/check REQ-XXXXXXXX`
```
