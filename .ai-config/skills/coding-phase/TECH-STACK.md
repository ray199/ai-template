# 🏗️ 技术栈和决策记录

**最后更新**：2026-04-03  
**维护者**：架构师团队  
**版本**：v1.0

---

## 一、后端技术栈

### 核心框架

| 组件 | 版本 | 选择理由 | 约束条件 | 替换周期 |
|---|---|---|---|---|
| **Java** | 8+ | 企业标准，稳定性最佳 | 必须支持Lambda和Stream | 2年 |
| **Spring Boot** | 2.7.x | LTS版本，企业级应用首选 | 支持Java 8+，Spring Cloud兼容 | 2年 |
| **MyBatis-Plus** | 3.5.x | ORM首选，代码生成友好 | 必须3.x版本，支持Lambda | 1年 |
| **MySQL** | 8.0+ | 社区主流，可靠性高 | 必须支持JSON和生成列 | 2年 |
| **Maven** | 3.8.x+ | 依赖管理标准 | 必须支持国内镜像 | 长期维护 |

### Web and REST API

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Spring Web MVC | 2.7.x | HTTP API | 内置支持 |
| Spring Validation | 2.7.x | 参数校验 | 内置支持，使用@Valid |
| Jackson | 2.13.x | JSON序列化 | 内置支持 |
| Swagger UI / Knife4j | 3.x | API文档 | 可选，建议使用 |

### 数据库和ORM

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| JDBC | 2.7.x | 数据库连接 | 内置支持 |
| Druid | 1.2.x | 连接池 | 建议使用，性能更好 |
| Flyway | 8.x | 数据库迁移 | 强制使用，版本管理 |
| MyBatis Generator | 1.4.x | 代码生成 | 用于Mapper和Entity生成 |

### 日志和监控

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Logback | 1.2.x | 日志框架 | Spring Boot内置 |
| SLF4J | 1.7.x | 日志门面 | Spring Boot内置 |
| Spring Boot Actuator | 2.7.x | 监控端点 | 应用监控 |
| Micrometer | 1.8.x | 指标收集 | 性能监控 |

### 开发工具

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Spring Boot DevTools | 2.7.x | 热重启 | 开发效率 |
| Lombok | 1.18.x | 代码简化 | @Slf4j, @Data等 |
| MapStruct | 1.5.x | 对象转换 | DTO ↔️ Entity |

### 测试框架

| 组件 | 版本 | 用途 | 要求 |
|---|---|---|---|
| JUnit 5 | 5.8.x | 单元测试 | 强制要求，覆盖率≥80% |
| Mockito | 4.x+ | Mock对象 | 用于Service层测试 |
| Spring Test | 2.7.x | 集成测试 | Controller层测试必需 |
| AssertJ | 3.22.x | 断言工具 | 建议使用，更易读 |
| Jacoco | 0.8.x | 覆盖率测量 | CI/CD集成 |

### 安全和授权

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Spring Security | 2.7.x | 认证授权 | 企业标准 |
| JWT | 0.11.x | Token生成 | 推荐使用，无状态 |
| bcrypt | 0.9.x+ | 密码加密 | 强制使用，不允许明文 |

---

## 二、前端技术栈

### 核心框架

| 组件 | 版本 | 选择理由 | 约束条件 | 替换周期 |
|---|---|---|---|---|
| **Vue** | 3.x | 现代化框架，学习曲线平缓 | 必须3.x（Composition API） | 1年 |
| **TypeScript** | 5.x | 类型安全，IDE支持更好 | 必须，不允许any泛滥 | 1年 |
| **Vite** | 4.x+ | 极速构建工具，开发体验最佳 | 必须，代替Webpack | 1年 |
| **Node.js** | 18.x+ | 运行环境 | npm或pnpm | 1年 |

### UI框架和组件库

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Ant Design Vue | 4.x | 企业级UI组件库 | 推荐首选 |
| Element Plus | 2.x | 备选UI框架 | 如需切换 |
| Sass/SCSS | 1.63.x+ | 样式预处理 | 强制使用，定义Design Tokens |

### 状态管理和数据

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Pinia | 2.x+ | 状态管理 | Vue 3官方推荐，代替Vuex |
| axios | 1.4.x+ | HTTP客户端 | API请求库 |
| TanStack Query | 4.x+ | 数据同步 | 缓存和刷新策略（可选） |

### 路由和导航

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Vue Router | 4.x | 前端路由 | SPA必需 |

### 开发工具

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| Vue DevTools | 6.x | 调试工具 | Chrome扩展 |
| Volar | 最新 | VSCode插件 | IDE支持 |
| ESLint | 8.x+ | 代码检查 | 代码质量 |
| Prettier | 3.x+ | 代码格式化 | 代码风格统一 |

### 测试框架

| 组件 | 版本 | 用途 | 要求 |
|---|---|---|---|
| Vitest | 0.34.x+ | 单元测试 | 推荐首选 |
| Jest | 29.x+ | 备选单元测试 | 如需兼容性 |
| Vue Test Utils | 2.x+ | 组件测试 | 集成测试必需 |
| happy-dom | 最新 | DOM模拟 | 轻量级快速 |
| Playwright / Cypress | 最新 | E2E测试 | 可选，关键路径 |

### 性能和优化

| 组件 | 版本 | 用途 | 说明 |
|---|---|---|---|
| unplugin-auto-import | 最新 | 自动导入 | 减少重复import |
| unplugin-vue-components | 最新 | 组件自动导入 | 减少手动注册 |
| vite-plugin-compression | 最新 | 资源压缩 | gzip/brotli |
| rollup-plugin-visualizer | 最新 | Bundle分析 | 构建优化 |

---

## 三、技术决策和约束

### 硬约束（必须遵守）

#### 后端
```
1. 不允许在代码中硬编码密钥或敏感数据
   → 使用环境变量或配置中心（Apollo/Nacos）

2. 所有数据库操作必须通过MyBatis-Plus的Wrapper或POJO方式
   → 禁止直接拼接SQL（防止SQL注入）

3. 所有API接口必须有认证和授权检查
   → 如果无@Authorize，必须在Service层检查权限

4. 所有写操作（增删改）必须有@Transactional注解
   → 且必须指定 rollbackFor = Exception.class

5. 所有日志必须使用@Slf4j + log.xxx()
   → 禁止System.out.println或System.err.println

6. 敏感数据（密码、身份证等）必须加密存储
   → 密码使用bcrypt，其他数据使用AES

7. 所有异常必须被捕获和记录
   → 禁止异常吞掉（catch后不处理）

8. 单元测试覆盖率必须≥80%
   → Controller必须≥90%

9. 所有外部接口调用必须设置超时和重试机制
   → 避免级联故障
```

#### 前端
```
1. 所有组件必须使用Composition API（不允许Options API）
   → Vue 3官方推荐模式

2. 所有数据必须通过ref或computed进行响应式管理
   → 禁止直接赋值导致响应式丢失

3. 所有异步操作必须有loading和error状态
   → 避免UI冻结或错误信息丢失

4. 所有样式必须使用scoped或CSS Modules隔离
   → 禁止全局污染

5. 所有颜色、间距等Design Tokens必须定义在variables.scss
   → 禁止硬编码颜色值

6. 所有事件监听和定时器必须在onUnmounted中清理
   → 防止内存泄漏

7. 所有Props必须有类型定义和默认值
   → 使用withDefaults(defineProps<Props>(), {...})

8. 所有HTTP请求必须使用axios或TanStack Query
   → 禁止原生fetch

9. 单元测试覆盖率必须≥70%
   → Hook和关键组件≥85%

10. Bundle Size必须<200KB（gzip）
    → 超过后必须分析和优化
```

### 软约束（建议遵守）

#### 后端（建议）
- 使用MapStruct进行DTO ↔️ Entity转换，避免手动赋值
- 使用Lambda和Stream进行集合操作，提高代码简洁性
- 使用Spring Data JPA替代MyBatis（如果新项目且无历史包袱）
- 对高频查询考虑添加Redis缓存
- 使用消息队列（MQ）处理异步业务（邮件、通知等）
- 使用链路追踪（SkyWalking/Jaeger）监控分布式调用

#### 前端（建议）
- 使用虚拟滚动处理大列表（>100条）
- 使用路由懒加载优化首屏加载时间
- 对大型状态管理使用Pinia的模块化和持久化插件
- 实现PWA支持离线访问
- 添加国际化支持（i18n）
- 使用Storybook管理和测试组件库

### 技术债和已知问题

| 问题 | 优先级 | 计划处理时间 | 说明 |
|---|---|---|---|
| 缺少应用监控看板 | P2 | Q3 2026 | 建议添加Grafana或DataDog |
| Redis缓存策略不完善 | P1 | Q2 2026 | 需要建立缓存失效和预热机制 |
| 前端包体积接近上限 | P2 | Q3 2026 | 考虑拆分或动态导入优化 |
| 数据库连接池配置需评审 | P1 | Q2 2026 | Druid连接数可能过小 |

---

## 四、版本管理和升级策略

### 依赖更新频率

| 级别 | 频率 | 范围 | 升级流程 |
|---|---|---|---|
| **Critical (安全漏洞)** | 立即 | 所有依赖 | 1. 本地验证 2. 测试通过 3. 立即发布 |
| **Major** | 季度 | 不含breaking change | 1. 测试环境验证 2. Code Review 3. 发版时更新 |
| **Minor** | 半年度 | 功能增强 | 1. 长期测试 2. 确认稳定性后升级 |
| **Patch** | 持续 | Bug修复 | 1. 自动或手动应用 2. CI/CD验证 |

### Java依赖升级规则
```
- 保持Spring Boot在当前LTS版本（2.7.x）
- JUnit升级至最新5.x（不涉及breaking change）
- MyBatis-Plus升级需经过完整集成测试
- 不允许跨越Major版本升级（除非有重大理由）
```

### Node依赖升级规则
```
- Vue必须保持在3.x（不升级到4.x直到官方推荐）
- Vite可升级至最新（通常兼容性良好）
- Ant Design Vue升级需验证组件API兼容性
- TypeScript可升级至最新稳定版
```

---

## 五、开发环境要求

### 最低要求

| 工具 | 最低版本 | 推荐版本 | 用途 |
|---|---|---|---|
| **Java** | 8 | 11+ | 编译和运行 |
| **Maven** | 3.6.0 | 3.8.x+ | 依赖管理 |
| **MySQL** | 5.7 | 8.0+ | 数据存储 |
| **Node.js** | 14.0 | 18.x+ | 前端编译 |
| **npm** | 6.0 | 9.x+ | 前端依赖 |

### IDE和插件

#### IntelliJ IDEA / WebStorm
```
【必装插件】
- Lombok Plugin (代码简化)
- MyBatis Plus (ORM支持)
- SonarLint (代码质量)
- Git Commit Template (提交规范)

【推荐插件】
- Database Navigator (数据库查询)
- Rainbow Brackets (括号配对)
- Translation (代码翻译)
```

#### VS Code
```
【必装插件】
- ESLint (代码检查)
- Prettier (代码格式化)
- Volar (Vue 3支持)
- TypeScript Vue Plugin

【推荐插件】
- Git Graph (可视化提交)
- Peacock (工作区颜色区分)
- REST Client (API测试)
```

---

## 六、性能基准和优化目标

### 后端性能基准

| 指标 | 目标 | 说明 |
|---|---|---|
| **API响应时间** | <100ms | P99，包括DB操作 |
| **数据库查询** | <50ms | 平均响应时间 |
| **吞吐量** | ≥500 QPS | 单个应用实例 |
| **内存占用** | <512MB | 启动后稳定状态 |
| **GC停顿** | <100ms | 避免长停顿 |
| **CPU使用率** | <60% | 平均负载 |

### 前端性能基准

| 指标 | 目标 | 说明 |
|---|---|---|
| **FCP** | <1.5s | 首次内容绘制 |
| **LCP** | <2.5s | 最大内容绘制 |
| **CLS** | <0.1 | 累积布局偏移 |
| **Bundle Size** | <200KB | gzip后 |
| **TTI** | <3s | 可交互时间 |
| **首屏加载** | <2s | 完整可用 |

### 优化策略

**后端**
- 使用连接池（Druid）减少连接开销
- 添加查询缓存（Redis）减少DB压力
- 使用异步处理（异步/MQ）提高吞吐量
- 定期分析慢查询，添加适当索引

**前端**
- 路由懒加载，减少初始包体积
- 组件按需导入，避免全量加载
- 图片压缩和webp格式，减少传输体积
- 开启gzip/brotli压缩

---

## 七、安全性检查清单

### 部署前必检

- [ ] 所有敏感配置已通过环境变量注入（不在代码中）
- [ ] 数据库密码已加密存储（不使用默认密码）
- [ ] SSL/TLS已配置（HTTPS强制使用）
- [ ] CORS配置已限制（不允许通配符*）
- [ ] 认证和授权检查已覆盖所有接口
- [ ] 日志中不包含敏感信息（密码、Token等）
- [ ] 依赖库已检查安全漏洞（mvn dependency-check）
- [ ] SQL查询都使用参数化（无拼接SQL）
- [ ] 前端代码已验证（无XSS风险）
- [ ] API限流和防DoS措施已配置

---

## 八、常见技术选择问题

### Q: 为什么选择MyBatis-Plus而不是Spring Data JPA？
**A**: 
- MyBatis-Plus代码生成友好，快速开发
- 灵活性更高，便于复杂查询优化
- 学习曲线较平缓，团队熟悉度高
- 对于旧项目迁移友好

新项目可考虑Spring Data JPA以获得更好的OOP体验。

### Q: Vue 3为什么强制Composition API？
**A**:
- 官方推荐方向（Options API已是遗留）
- 更好的代码复用和逻辑组织
- TypeScript支持更友好
- 更小的构建体积

### Q: 缓存层为什么推荐Redis而不是其他？
**A**:
- 性能最优（内存操作，延迟<1ms）
- 功能完整（支持多种数据结构）
- 生态成熟（集群、持久化方案完善）
- 运维友好（开源，监控工具多）

### Q: 如何处理跨域请求？
**A**:
```java
// 在Spring Boot中配置CORS
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("https://example.com")  // 具体指定
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

---

## 九、后续规划和演进方向

### 短期（0-6个月）
- [ ] 搭建应用监控看板（Prometheus + Grafana）
- [ ] 实现分布式链路追踪（SkyWalking）
- [ ] 完善缓存策略和失效机制

### 中期（6-12个月）
- [ ] 考虑迁移到Spring Cloud Alibaba（微服务化）
- [ ] 前端组件库标准化和文档化（Storybook）
- [ ] 实现CI/CD全流程自动化

### 长期（12个月+）
- [ ] 评估升级Spring Boot到3.x（如官方支持）
- [ ] 考虑引入Kubernetes容器化部署
- [ ] 搭建低代码/无代码开发平台

---

## 十、联系方式和进一步信息

### 技术咨询
| 领域 | 负责人 | 联系方式 |
|---|---|---|
| 后端架构 | 架构师 | architect@company.com |
| 前端工程 | 前端lead | frontend@company.com |
| 数据库优化 | DBA | dba@company.com |
| DevOps/CI-CD | 运维 | devops@company.com |

### 相关文档
- **CLAUDE.md** - 整体工作流程
- **PHASE3-PROJECT-SCANNING.md** - 项目快照和快速导航
- **.ai-config/rules/0X_*.mdc** - 具体编码规范
- **.ai-config/skills/coding-phase/** - 各语言Code Review检查表

---

**版本历史**：
- v1.0 (2026-04-03) - 初始版本，基于模板项目

**最后修改**：2026-04-03
