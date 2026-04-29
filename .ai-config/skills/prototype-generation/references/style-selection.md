# 设计风格选择（HTML 原型专属）

> 触发条件：选定为 HTML 原型后、生成 HTML 前必须执行此步骤。
> 优先级：**已有视觉基线 > 5 选 1 风格库**。

## 流程总览

```
1. 先扫现有基线（docs/prototype/*.html + src/ + project-map）→ 见 SKILL.md 的 Step 0
   ↓
2. 按扫描结果分流：
   ├─ 命中基线 → 走【模式 A · 沿用基线】
   ├─ 部分命中 → 走【模式 B · UI 库默认主题】
   └─ 无基线 → 走【模式 C · 5 选 1 风格库】
   ↓
3. 用户确认风格选择
   ↓
4. 注入 CSS 变量 / 导入项目 token，生成 HTML
```

---

## 模式 A · 沿用基线（命中现有视觉风格）

**呈现格式**：

```
───────────────────────────────────────────────────
  设计风格选择 - [需求标题]
  
🔍 已检测到项目现有视觉基线：
  - UI 库：Element Plus 2.5.x（package.json: element-plus@^2.5.0）
  - 主色：#409EFF（src/styles/index.scss: $color-primary）
  - 辅色：#67C23A（success）/ #E6A23C（warning）/ #F56C6C（danger）
  - 字体：PingFang SC + JetBrains Mono（src/styles/font.css）
  - 间距 token：8px / 16px / 24px / 32px（4 倍数）
  - 已有原型：docs/prototype/REQ-20260420-001.html 等 N 份遵循同一风格

【建议】
  ✅ [A] 沿用现有视觉（推荐）
        与已有 N 份原型 + src/views/ 视觉完全一致，开发对接零摩擦
        将导入项目 design token，生成的 HTML 直接复用项目 CSS 变量
  
【备选】（仅当现有视觉确实不合适时选）
  □ [B] Element Plus 默认主题但调整色板
  □ [C] 切换到全新风格（5 选 1 风格库）
  □ [D] 自定义（输入色系 / 风格 / 参考网站）

请回复 A / B / C / D，默认 A：
───────────────────────────────────────────────────
```

**用户选 A 时的生成行为**：
- HTML 模板的 `:root` **导入项目 token**（不写死 hex）：
  ```html
  <link rel="stylesheet" href="../src/styles/variables.scss">
  <!-- 或 -->
  <style>
    :root {
      --color-primary: #409EFF;  /* 同步自 src/styles/index.scss */
      --color-success: #67C23A;
      --font-body: 'PingFang SC', -apple-system, sans-serif;
    }
  </style>
  ```
- 组件类名复用项目约定（`el-button` / `el-table` / `xxx-list`）
- 间距 / 圆角 / 阴影沿用既有 token

---

## 模式 B · UI 库默认主题（仅命中 UI 库，无 design token）

**呈现格式**：

```
🔍 已检测到 UI 库：Element Plus（src/main.js 引入），但未发现自定义 token
  → 推荐使用 Element Plus 默认主题为基线，避免视觉漂移

【建议】
  ✅ [A] Element Plus 默认主题（推荐）
        主色 #409EFF，符合大多数后台管理系统约定
  
【备选】
  □ [B-D] 切换到 5 选 1 风格库
```

---

## 模式 C · 5 选 1 风格库（完全无基线 / 新项目）

**触发条件**：
- 没有 docs/prototype/ 下任何 HTML
- 没有 src/ 或 src/ 下无 UI 库依赖
- 通常是新项目第一次生成原型

**产品类型 → 推荐风格映射**：

| 产品类型 | 推荐方案 A | 推荐方案 B | 推荐方案 C | 备选 E |
|---|---|---|---|---|
| 企业管理 / 后台系统 | Minimalism（蓝白） | Dark Mode（深色专业） | Material Design（灰蓝） | **Redoe Industrial** |
| 数据大屏 / 仪表盘 | Dark + Glassmorphism | Data Viz（深蓝科技） | Light Dashboard（白底） | **Redoe Industrial** |
| 电商 / 消费品 | Clean Modern（清新） | Bold Typography（活力） | Colorful（多彩） | — |
| SaaS / 工具产品 | Minimalism + Bento | Glassmorphism | Flat Design | **Redoe Industrial** |
| 移动端应用 | iOS-style（圆角卡片） | Material You | Dark Mode | — |
| 内容 / 资讯平台 | Editorial（阅读优先） | Minimal Blog | Magazine | — |
| 制造业 / 工业运营 / MES / ERP | **Redoe Industrial**（推荐） | Minimalism（蓝白） | Dark Mode（车间暗色） | — |

> 方案 E — Redoe Industrial 是从 `development-pack-main` 蒸馏出的制造业专用设计系统。详见 `.ai-config/skills/redoe-prototype-style/SKILL.md`。

**呈现格式**：

```
───────────────────────────────────────────────────
  设计风格选择 - [需求标题]
  产品类型：[识别到的类型]

⚠️ 未检测到现有视觉基线（新项目首次生成原型）
   → 后续 REQ 的原型将沿用本次选择，请慎重

方案 A — [风格名称]（推荐）
  色板：主色 [hex] · 辅色 [hex] · 背景 [hex]
  字体：[标题字体] + [正文字体]
  适合：[1 句话说明]

方案 B — [风格名称]
方案 C — [风格名称]
方案 D — 自定义
方案 E — Redoe Industrial（制造业专用）

请选择（A / B / C / D / E）：
───────────────────────────────────────────────────
```

---

## 设计 Token 注入规则

| 模式 | 注入方式 |
|---|---|
| A · 沿用基线 | 导入项目实际 SCSS / CSS 变量文件；HTML 内 `:root` 同步现有 token 值 |
| B · UI 库默认 | 引用 UI 库官方主题包（如 Element Plus 的 element-plus/theme-chalk/index.css）|
| C · 5 选 1 | 把选定方案的色板 / 字体写入 HTML `:root` 的 CSS 变量 |

详见 `html-prototype-generator.md` 的"设计 Token 预设"章节。

## 何时该跳出基线（选 C）

只有在以下情况才建议放弃沿用：

- 现有原型 / 项目视觉**已确认要重做**（产品方明确给出指令）
- 当前 REQ 是"全新独立子产品"，不和老页面共享视觉
- 现有视觉是临时占位（demo / hardcoded），还没正式定下来

**默认应该沿用基线**——视觉一致性比"AI 生成的好看"更重要，因为开发拿到原型后还要对齐到项目实际，不一致就等于白做。
