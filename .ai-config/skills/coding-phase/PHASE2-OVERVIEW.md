# 第二阶段完整执行指南 - 代码编写

## 阶段目标

根据第一阶段的结构化需求文档，执行标准化的**编码准备和代码生成**，产出高质量的源代码、测试和部署脚本。

---

## 整体流程（分新项目/旧项目两条路）

```
第一阶段完成
   └─ 结构化需求文档 + 原型（若有）
   
   ↓ 工作量评估判定
   
【新项目路】                          【旧项目路】
   ↓                                    ↓
【Step 1】技术选型                   【Step 1】快速读取现有规范
   ├─ 确定前端框架                    ├─ 读取 claude.md 的技术栈部分
   ├─ 确定后端框架                    ├─ 读取 .ai-config/rules/
   ├─ 确定数据库                      ├─ 读取代码库的编码规范
   └─ 确定版本和依赖                  └─ 列出可复用的现有模块
   
   ↓                                    ↓
【Step 2】编码规范确立               【Step 2A】敲定当前需求的技术栈
   ├─ 目录结构                        └─ 确认是否需要引入新技术
   ├─ 命名规范                        
   ├─ 代码风格                        ↓
   ├─ 错误处理                        【Step 2B】编码规范快速对齐
   └─ 日志规范                        ├─ 遵循已有规范（确认可用）
                                      ├─ 或补充新规范（若有新技术）
   ↓                                    └─ 文档化特殊规则
                                      
【Step 3】前端样式规范                ↓
   ├─ 若有原型：高保真实现            【Step 3】前端样式规范
   ├─ 若无原型：选择UI框架            ├─ 复用项目主题（颜色、字体、组件）
   └─ 定义设计tokens                  ├─ 确保新功能风格一致
                                      └─ 若有原型则高保真实现
   ↓                                    ↓
【Step 4】数据库设计                 【Step 4】数据库设计
   ├─ ER图设计                        ├─ 新增表遵循已有规范
   ├─ 迁移脚本（Flyway）             ├─ 字段命名与已有表一致
   ├─ 索引优化                        ├─ 考虑与现有表的关联
   └─ 回滚方案                        └─ 数据初始化脚本（若需）
   
   ↓                                    ↓
【Step 5】接口设计（前后端分离）     【Step 5】接口设计
   ├─ RESTful规范                     ├─ 遵循项目现有API版本
   ├─ 请求/响应格式                  ├─ 复用已有的错误码体系
   ├─ 错误码定义                      └─ 检查是否需要修改现有接口
   └─ 业务规则说明                    
                                      ↓
   ↓                                    【Step 6】技术设计文档
                                      ├─ 架构影响分析
【Step 6】技术设计文档               ├─ 与现有模块的关系
   ├─ 架构图                         └─ 集成点说明
   ├─ 模块职责                        
   ├─ 关键实现路径                    ↓
   └─ 风险识别                        【Step 7】代码生成与实现
                                      
   ↓                                    
【Step 7】代码生成与实现             
   ├─ 后端代码生成                    
   │  ├─ Entity / VO / DTO            
   │  ├─ Mapper / Repository          
   │  ├─ Service 业务逻辑            
   │  ├─ Controller API接口          
   │  └─ 单元测试骨架                
   │                                  
   ├─ 前端代码生成                    
   │  ├─ 页面组件                     
   │  ├─ 状态管理（Vuex/Pinia）     
   │  ├─ 接口调用层（axios）         
   │  ├─ 样式文件                     
   │  └─ 单元/集成测试骨架           
   │                                  
   └─ 数据库脚本                      
      └─ Flyway迁移脚本              
      
   ↓                                   
【Step 8】Code Review规范             
   ├─ 后端Review清单（Java/.NET）    
   ├─ 前端Review清单（Vue）          
   ├─ 数据库Review清单               
   └─ 安全性扫描                     
   
   ↓                                   
【Step 9】测试用例生成               
   ├─ Controller层测试（必需）       
   ├─ Service层单元测试              
   ├─ 集成测试骨架                    
   └─ 测试数据初始化                 
   
   ↓                                   
【Step 10】编码完成                   
   ├─ 代码生成报告                    
   ├─ 测试覆盖率报告                  
   └─ 进入阶段3（测试验证）         
```

---

## 关键设计决策

### 1. 新项目 vs 旧项目的差异处理

**新项目路（7步 → Step 1-7）**
```
特点：
- 从零开始选择技术栈
- 建立项目规范（目录结构、命名、风格等）
- 完整的技术设计文档
- 较长的准备周期（1-2天选型+规范）

输出物：
- 技术选型文档（为什么选这个框架）
- 编码规范文档（详细的Code Style Guide）
- 项目初始化脚本（快速建立项目结构）
```

**旧项目路（加速版，Step 1-2改为1-2B）**
```
特点：
- 快速读取现有规范（<30分钟）
- 复用已有的技术栈和代码风格
- 可以跳过一些编码规范定义（已存在）
- 重点是"保持一致性"

输出物：
- 当前项目规范快速参考（1页纸）
- 本需求可复用的模块清单
- 新增规范（若有新技术）
```

### 2. 前后端分离的编码流程

```
【步骤】同步进行

后端（Java/.NET）：
Step 4: 数据库设计
Step 5: 接口设计（定义API规范）
Step 7: 代码生成（Entity → Mapper → Service → Controller）
Step 9: Controller层测试生成（必需）

前端（Vue）：
Step 5: 接口调用规范
Step 6: 前端样式确认（与原型或项目风格对齐）
Step 7: 页面组件生成
Step 9: 集成测试生成

【数据库】
Step 4: 统一的DB设计（后端编写迁移脚本）
Step 7: 执行迁移脚本

【汇聚点】
Step 8: Code Review（后端+前端+DBA）
Step 9: 测试执行（单元+集成）
```

### 3. 前端样式与原型的对齐

```
【有原型的情况】
原型（HTML） → 设计规范提取
   ├─ 颜色规范（brand color, function colors）
   ├─ 字体规范（family, size, line-height）
   ├─ 间距规范（padding, margin, gap）
   ├─ 圆角、阴影规范
   └─ 组件样式（按钮、表单、表格）

Vue实现 → 像素级对齐
   ├─ 使用CSS变量存储design tokens
   ├─ 复用Ant Design或Element的主题系统
   ├─ 对原型进行视觉对比测试
   └─ 通过自动化对齐验证（像素完美）

【无原型的情况】
旧项目的风格系统 → 直接继承
   ├─ 读取已有的 theme.scss / theme.json
   ├─ 确保新功能组件与现有风格一致
   ├─ 新UI框架选择时保持品牌一致性
   └─ 有变更时更新主题系统

新项目 → 选择UI框架
   ├─ Ant Design：企业级应用
   ├─ Element Plus：中文社区丰富
   ├─ Vuetify：Material Design
   └─ 自定义设计系统：完全定制
```

### 4. Controller层测试的强制要求

```
【为什么Controller测试必需】
- Controller是HTTP请求的入口点
- 验证请求解析、参数校验、权限检查
- 验证响应格式和错误处理
- API集成测试的第一层

【测试覆盖范围】
对于每个 Controller方法：
✅ 正常场景（200 OK）
✅ 参数校验失败（400 Bad Request）
✅ 认证失败（401 Unauthorized）
✅ 权限不足（403 Forbidden）
✅ 资源不存在（404 Not Found）
✅ 业务异常（业务特定错误码）
✅ 服务异常（500 Internal Server Error）

【测试工具】
后端：JUnit 5 + Mockito + MockMvc
前端：Vitest + Vue Test Utils

【完成标准】
- Controller层代码覆盖率 ≥ 90%
- 所有HTTP状态码都有对应测试
- 异常场景都能被覆盖
```

### 5. Code Review规范的分语言定义

```
【分语言定义】
├─ Java：遵循 02_code_style.mdc + Spring Framework规范
├─ .NET：遵循 .NET编码规范 + C#风格指南
├─ Vue：遵循 Vue 3最佳实践 + Composition API规范
└─ Database：SQL规范 + 数据库风格

【Review维度】（共同）
✅ 代码质量（命名、复杂度、可维护性）
✅ 架构合理性（模块划分、依赖关系）
✅ 安全性（SQL注入、XSS、权限检查）
✅ 性能（N+1查询、算法复杂度、缓存）
✅ 测试（覆盖率、异常场景）
✅ 规范（遵循编码规范、注释完整）

【语言特定Review清单】
后端Java：
  - Spring Bean的scope和生命周期
  - @Transactional的使用
  - 异常处理（Exception Handling）
  - SQL性能（避免N+1）
  - 并发控制（synchronized/Lock）

后端.NET：
  - async/await使用
  - LINQ查询优化
  - 依赖注入配置
  - 异常处理策略
  - Entity Framework的lazy loading风险

前端Vue：
  - 组件复用性
  - 响应式数据的正确使用
  - 生命周期钩子的合理运用
  - 事件处理的清理
  - 性能优化（computed vs method, v-if vs v-show）
  - 无障碍（a11y）考虑
```

---

## 核心输出物

### 新项目输出物清单

| 步骤 | 输出物 | 位置 | 检查点 |
|---|---|---|---|
| Step 1 | 技术选型文档 | docs/design/TECH-SELECTION.md | 为什么选这些技术 |
| Step 2 | 编码规范文档 | .ai-config/rules/ | 目录结构、命名、风格 |
| Step 4 | 数据库设计 + ER图 | docs/design/DB-DESIGN.md | 表结构、索引、关联 |
| Step 5 | API设计文档 | docs/design/API-DESIGN.md | 请求/响应/错误码 |
| Step 6 | 技术设计文档 | docs/design/REQ-XXX-design.md | 架构、模块、实现路径 |
| Step 7 | 源代码 | src/ | 遵循规范、覆盖需求 |
| Step 8 | Code Review清单 | (嵌入PR) | 逐项检查 |
| Step 9 | 测试代码 | src/test/ | 覆盖率≥80% |
| Step 9 | 编码完成报告 | docs/design/REQ-XXX-code-report.md | 生成文件清单、自检 |

### 旧项目输出物清单

| 步骤 | 输出物 | 位置 | 检查点 |
|---|---|---|---|
| Step 1-2 | 项目规范快速参考 | (内存或简短文档) | 确认复用的规范 |
| Step 2B | 新技术规范（若需） | .ai-config/rules/ | 补充的规范 |
| Step 3 | 样式集成方案 | docs/design/STYLE-INTEGRATION.md | 与现有风格一致 |
| Step 4 | 数据库变更设计 | docs/design/DB-MIGRATION.md | 新表/修改的表 |
| Step 5-7 | 代码生成 | src/ | 遵循项目规范 |
| Step 8 | Code Review清单 | (嵌入PR) | 项目规范+新规范 |
| Step 9 | 编码完成报告 | docs/design/REQ-XXX-code-report.md | 生成文件清单 |

---

## 分语言的具体规范和工具

接下来需要为每个主要技术栈创建详细规范：

```
需要创建：

【后端】
├─ Java编码规范和Code Review检查表
├─ .NET编码规范和Code Review检查表
├─ 数据库设计规范
├─ API接口规范（OpenAPI/Swagger）
└─ 通用的安全性扫描清单

【前端】
├─ Vue 3编码规范和Code Review检查表
├─ 样式规范和Design Tokens系统
├─ 组件复用性规范
├─ 测试规范（单元+集成）
└─ 无障碍(a11y)规范

【通用】
├─ 测试覆盖率标准（Controller必须≥90%）
├─ Git提交规范（commit message）
├─ Pull Request模板
└─ 编码完成清单（自检）
```

---

## 完成标准

第二阶段编码流程规范完成标准：

- [ ] 新项目和旧项目的编码入口清晰分离
- [ ] 每个步骤有明确的输入、输出和检查点
- [ ] 前后端的并行开发流程定义清晰
- [ ] 前端样式与原型的对齐机制完整
- [ ] Controller层测试的强制要求清晰
- [ ] 各语言的Code Review规范完整
- [ ] 输出物清单和位置规范统一
- [ ] 编码完成的质量检查清单完善

