# 技能：交付

## 技能描述

代码审查通过后，执行上线前的最后检查和交付收尾工作。  
确保需求从「代码合并」到「上线验证」的全链路可追踪、可回滚。

## 触发指令

- `/deliver` - 启动交付流程（需提供 need_id）
- `/deliver --checklist` - 仅输出上线前检查清单（不执行操作）
- `/deliver --docs` - 仅整理交付文档（不含上线操作）

## 处理流程

```
输入校验（缺少任一必须文件或验收未通过则终止）：
  - docs/test/REQ-XXXXXXXX-test.md        必须存在（来自 /check）
  - docs/review/REQ-XXXXXXXX-review.md   必须存在（来自 /check）
  - 测试报告中验收结论字段：必须为 ✅ 通过，否则终止，提示先修复 P0/P1 问题
  - 审查报告中审查结论字段：必须无 🔴 阻断性问题，否则终止，提示先修复
       ↓
[Step 1] 上线前检查清单（逐项确认）
         ↓
[Step 2] 输出交付报告（运维快查）
         - 路径：docs/delivery/REQ-XXXXXXXX-delivery.md
         - 内容：功能清单、影响范围、回滚方案、遗留问题
         ↓
[Step 3] 整理需求归档包（永久存档）
         - 路径：docs/requirements/done/REQ-XXXXXXXX/
         - 内容：需求/设计/测试/审查文档 + delivery-note.md
         ↓
[Step 4] 需求状态流转：backlog → done
```

> **两个输出物说明**  
> `docs/delivery/` 是面向运维/发布团队的独立快查报告，无需翻阅需求目录。  
> `docs/requirements/done/` 是完整的需求生命周期归档，面向未来回溯和项目管理。  
> 两个输出物同时生成，目的不同，互不替代。

---

## 上线前检查清单

### 代码层面
- [ ] PR 已通过 `/check` 审查（无 🔴 阻断性问题）
- [ ] 所有 🔴 必须修复问题已关闭
- [ ] 代码已合并到目标分支（`develop` / `release`）
- [ ] 无冲突代码，合并后构建通过

### 后端层面
- [ ] DDL 迁移脚本已在**测试环境**执行并验证
- [ ] 迁移脚本幂等性已确认（重复执行不报错）
- [ ] 回滚脚本已准备并测试可用
- [ ] 如有存量数据填充，已在测试环境验证数据正确性
- [ ] 新增后端配置项已在所有环境（dev / test / prod）同步更新
- [ ] 无硬编码环境配置（IP、密码等）遗留在代码中

### 前端层面（若含前端）
- [ ] `npm run build` 构建成功，无报错
- [ ] `dist/` 产物体积合理，无意外体积膨胀（建议与上一版本对比）
- [ ] 前端环境变量已在各环境配置（`VITE_API_BASE_URL` / `VUE_APP_API_URL` 等）
- [ ] 静态资源已部署到 CDN / Nginx（dist 目录上传并验证可访问）
- [ ] 主流浏览器兼容性验证（Chrome / Edge / Firefox）
- [ ] 生产环境 Nginx 反代配置已更新（若有新路由或接口前缀）
- [ ] 前端回滚方案已确认：重新部署上一版本 dist 即可

### 测试层面
- [ ] 测试报告显示验收结论为 ✅ 通过
- [ ] 所有 P0/P1 问题已关闭（前端+后端）
- [ ] 回归测试通过（已有功能未受影响）
- [ ] 前后端联调验证通过（字段名、分页、错误码）

### 文档层面
- [ ] API 文档已更新（Swagger / 接口文档站）
- [ ] 技术设计文档最终版已归档
- [ ] 如有破坏性变更，已通知相关调用方

### 首次上线专属检查（全新系统）

> 若 `docs/requirements/done/` 下无任何历史归档，或需求文档中标注"全新项目"，则执行以下额外检查：

**环境准备**
- [ ] 服务器已安装正确版本 JDK（版本与 `pom.xml` 中 `<java.version>` 一致）
- [ ] 服务器已安装 Node.js（版本与 `package.json` 中 `engines.node` 一致，若含前端）
- [ ] Nginx 已安装并完成基础配置（若含前端）

**数据库初始化**
- [ ] 数据库实例已创建（`CREATE DATABASE xxx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`）
- [ ] 数据库账号已创建并授权（不使用 root 账号运行服务）
- [ ] 执行全量建表脚本（非增量 migration，所有表首次创建）
- [ ] 基础数据（枚举、配置表初始值）已初始化

**外部服务配置**
- [ ] `application.yml` 中所有配置占位符已替换为实际值（DB URL / 密码 / 端口）
- [ ] 若含 AI 框架（Spring AI 等）：API Key 和 Endpoint 已配置，已验证与外部 AI 服务连通性
- [ ] 前端环境变量文件 `.env.production` 已配置实际后端地址

**首次启动验证**
- [ ] 后端服务启动成功（日志无 ERROR，Flyway migration 执行完毕）
- [ ] 所有数据库表已创建（对比迁移脚本数量与实际表数量）
- [ ] 健康检查接口返回 200（`/actuator/health` 或自定义健康接口）
- [ ] 前端页面可正常访问（浏览器打开首页，无 404 / 500）
- [ ] 核心业务流程端到端走通（登录 + 主要功能）

> ⚠️ 全新系统首次上线**不存在"回滚到上一版本"**，回滚方案为：停止服务 + 评估数据风险后决定是否清库重置。上线前务必确认所有检查项。

---

## 交付文档包规范

### 文档归档路径
```
docs/requirements/done/
  REQ-XXXXXXXX/
    ├── REQ-XXXXXXXX.md                # 需求文档（从 backlog/ 移入）
    ├── REQ-XXXXXXXX-design.md         # 技术设计文档（从 docs/design/ 复制）
    ├── REQ-XXXXXXXX-code-report.md    # 编码完成报告（从 docs/design/ 复制）
    ├── REQ-XXXXXXXX-test.md           # 测试报告（从 docs/test/ 复制）
    ├── REQ-XXXXXXXX-review.md         # 代码审查报告（从 docs/review/ 复制）
    └── REQ-XXXXXXXX-delivery.md       # 交付说明（从 docs/delivery/ 复制）
```

### 交付说明（delivery-note.md）格式

```markdown
# 交付说明

- **need_id**：REQ-XXXXXXXX
- **需求标题**：[需求标题]
- **交付时间**：YYYY-MM-DD
- **上线分支**：[分支名 / tag]
- **数据库变更**：有 / 无（脚本：`V20240315_01__xxx.sql`）

## 本次交付内容

[简要描述实现了什么功能，1-3句话]

## 影响范围

| 模块 | 变更类型 | 说明 |
|---|---|---|
| user 模块 | 新增接口 | POST /api/v1/user/xxx |
| 数据库 | 新增表 | xxx_table |

## 遗留问题

| 问题编号 | 描述 | 计划处理版本 |
|---|---|---|
| BUG-XXXXXXXX-003 | [P2 问题描述] | v1.2 |

## 上线回滚方案

1. 代码回滚：`git revert {commit hash}` 或回滚到上一个 tag
2. 数据库回滚：执行 `docs/requirements/done/REQ-XXXXXXXX/rollback.sql`
3. 配置回滚：[如有，说明步骤]
```

---

## 需求状态流转

交付完成后，需求分析师执行状态更新：

1. 将需求文档从 `docs/requirements/backlog/` 移动到 `docs/requirements/done/REQ-XXXXXXXX/`
2. 更新需求文档状态字段：`status: done`
3. 填写 `done_at` 字段（实际上线时间）

---

## 交付报告格式

```markdown
# 交付报告

- **need_id**：REQ-XXXXXXXX
- **需求标题**：[需求标题]
- **交付时间**：YYYY-MM-DD HH:mm
- **需求状态**：✅ done

---

## 上线前检查结论

- ✅ 代码层面：全部通过
- ✅ 后端层面：迁移脚本已验证，配置已同步
- ✅ 前端层面：构建成功，dist已部署（若含前端）
- ✅ 测试层面：测试通过（P0/P1 问题清零）
- ⚠️ 文档层面：API 文档已更新，用户手册下一版本补充

---

## 交付物清单

| 交付物 | 状态 | 位置 |
|---|---|---|
| 需求文档 | ✅ 已归档 | docs/requirements/done/REQ-XXXXXXXX/ |
| 技术设计文档 | ✅ 已归档 | 同上 |
| 测试报告 | ✅ 已归档 | 同上 |
| 代码审查报告 | ✅ 已归档 | 同上 |
| DDL 迁移脚本 | ✅ 已执行 | resources/db/migration/ |
| 前端产物 | ✅ 已部署 | CDN / Nginx（若含前端） |
| API 文档 | ✅ 已更新 | [文档站链接] |

---

## 遗留事项（下一版本跟进）

[如无，填写"无"]

---

**本次需求已完成交付。**
```
