---
kind: constitution
project: <项目名>
version: 1
last_reviewed: <YYYY-MM-DD>
---

# 项目宪法（Constitution）

> 本文件定义项目的**长期不变原则**。每个 /pg:design 和 /pg:code 必须先读本文件，禁止违反。
> 修改本文件需要团队评审。
> 与 `docs/_context/project-map.md` 的"不可变约束"段不同：project-map 偏向"现状已经是这样不要改"，constitution 偏向"这是项目的根本理念，未来也不能改"。

---

## 项目原则

> 至少 1 条。每条以"项目永远..."或"项目永远不..."开头。

- 项目永远使用单一根包名 `com.example.<project>`，禁止跨项目复用包结构
- 项目永远使用软删除，禁止物理删除业务数据
- 项目永远在 Controller 层使用 `@Valid` 校验，禁止在 Service 层手动判空
- 项目永远不在前端代码中保存任何密钥
- 项目永远不修改 `/api/v1/*` 接口签名（旧客户端兼容）

## 技术红线

> 可选。补充语言 / 框架 / 中间件层面的项目级约束。

- 后端禁止引入 ORM 之外的直接 JDBC 调用
- 前端禁止使用除 axios 之外的 HTTP 客户端
- 数据库变更必须走 Flyway，禁止手工执行 DDL

## 业务不变量

> 可选。业务层面"绝不允许打破"的规则。

- 用户密码必须经过 bcrypt 哈希，禁止明文或可逆加密存储
- 所有金额字段必须使用 BigDecimal，禁止 float / double

---

## 修改记录

| 日期 | 修改项 | 评审人 | 备注 |
|---|---|---|---|
