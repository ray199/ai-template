# 编码完成报告模板

> Step 6 输出本报告，等待开发者确认。schema 校验项：`self_check_passed: true`。

```markdown
---
need_id: REQ-XXXXXXXX
stage: code
self_check_passed: true
generated_at: YYYY-MM-DD
---

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

确认后，执行：`/pg:check REQ-XXXXXXXX`
```
