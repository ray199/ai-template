# 基线快照反推模板（老项目专属）

> 由 `/pg:prototype` Step 0.5 触发：从现有前端代码反推 HTML 快照，作为"改动前"参照。

## 输出位置

`docs/prototype/baseline/<page-name>.html`

文件名规则：
- 来自 `src/views/UserList.vue` → `user-list.html`
- 来自 `src/views/User/Detail.vue` → `user-detail.html`
- 复杂路径用 kebab-case 拼接

## 反推流程（AI 执行）

### 1. 找到源文件

按 design.md 的"页面清单"或 acceptance 推断的页面名，扫：
- `src/views/<PageName>.vue` / `src/views/<page-name>.vue`
- `src/pages/<PageName>.vue`（Nuxt / 部分项目）
- `src/pages/<page-name>/index.vue`（嵌套）

找到后记录 commit hash（用于反推注释）：`git log -1 --format=%h <file>`

### 2. 提取信息

#### 2.1 模板结构（`<template>`）

直接转为 HTML 结构，保留 UI 库类名（让视觉一致）：
- `<el-table>` → `<table class="el-table">` + `<thead>`/`<tbody>`
- `<el-form>` → `<form class="el-form">`
- `<el-button>` → `<button class="el-button">`
- `<a-table>` / `<van-list>` 等其他 UI 库同理

#### 2.2 数据结构

从 `<script setup>` / `data()` / `props` 提取：
- 表格列：从 `<el-table-column>` 的 `prop` / `label` 提取
- 表单字段：从 `v-model` + `<el-form-item>` 的 `label` 提取
- 列表 mock 数据：随机生成 3-5 条符合字段语义的占位数据

#### 2.3 API 调用

不真发起，只在 HTML 注释里标注：
```html
<!-- API: GET /api/v1/users/list（来自 src/api/user.js → getUserList） -->
```

#### 2.4 交互（按钮 / 弹窗 / 跳转）

- 按钮 click 事件 → 在 HTML 加 `<a href="#" data-action="...">` 标注
- 弹窗 visible 状态 → 用 `<details>` 折叠展示弹窗内容
- 路由跳转 → 标注目标路由名

### 3. 输出格式

```html
<!--
  基线快照（反推自现有代码，不是新设计）
  
  来源：src/views/UserList.vue
  Commit: abc1234
  反推时间：2026-04-29
  反推人：/pg:prototype（AI）
  
  说明：本文件用于"改动前 vs 改动后"对比；
        若代码已变化，需重新反推（删除本文件后跑 /pg:prototype 即重生成）。
-->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>UserList（基线快照）</title>
  <!-- 导入项目 design token -->
  <link rel="stylesheet" href="../../src/styles/index.scss">
  <style>
    /* 仅基线快照需要的额外样式：标题栏、说明区 */
    .baseline-banner {
      background: #FFF7E6;
      border-left: 4px solid #FAAD14;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 14px;
    }
  </style>
</head>
<body>

<div class="baseline-banner">
  📷 这是 <code>src/views/UserList.vue</code> 的基线快照（反推于 2026-04-29，commit abc1234）。
  实际页面以代码运行结果为准。
</div>

<!-- 复刻自 <template> 部分 -->
<div class="user-list">
  <el-form :inline="true" class="search-bar">
    <!-- 提取 v-model 字段 -->
    <el-form-item label="用户名">
      <el-input placeholder="请输入" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary">查询</el-button>
    </el-form-item>
  </el-form>

  <!-- API: GET /api/v1/users/list -->
  <el-table>
    <el-table-column prop="username" label="用户名" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column label="操作">
      <a href="#" data-action="edit">编辑</a>
      <a href="#" data-action="delete">删除</a>
    </el-table-column>
    <!-- mock 3-5 行数据 -->
    <tbody>
      <tr><td>user1</td><td>x@a.com</td><td>编辑 / 删除</td></tr>
      <tr><td>user2</td><td>y@a.com</td><td>编辑 / 删除</td></tr>
    </tbody>
  </el-table>
</div>

</body>
</html>
```

### 4. 同步更新 baseline/README.md

每次反推后，把记录追加到 `docs/prototype/baseline/README.md`：

```markdown
# 基线原型快照清单

由 /pg:prototype Step 0.5 按需反推的现有页面 HTML 快照。

| 页面文件 | 反推自 | 反推时间 | Commit | 说明 |
|---|---|---|---|---|
| user-list.html | src/views/UserList.vue | 2026-04-29 | abc1234 | 用户列表页 |
| user-detail.html | src/views/UserDetail.vue | 2026-04-29 | abc1234 | 用户详情页 |
```

## 限制 / 提醒

1. **不是设计稿替代品**——基线快照只是"代码截图级"还原，缺业务语境，不能取代和业务方的真实沟通
2. **代码改动后需重新反推**——基线和代码会脱钩；快照里有 commit hash 方便检查是否过时
3. **复杂交互不还原**——动画 / 复杂状态机 / 拖拽等用注释标注，不真实现
4. **mock 数据有偏差**——AI 编的占位数据可能和业务真实形态不同，仅作示意
5. **隐私字段脱敏**——用户名 / 手机 / 邮箱等用 `user1@example.com` 这类显式假数据
