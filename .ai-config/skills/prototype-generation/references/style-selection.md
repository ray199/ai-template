# 设计风格选择（HTML 原型专属）

> 触发条件：选定为 HTML 原型后，生成前必须执行此步骤。
> 依赖技能：`ui-ux-pro-max`（50+ 风格、161 色板、57 字体配对）。

## 产品类型 → 推荐风格映射

| 产品类型 | 推荐方案 A | 推荐方案 B | 推荐方案 C | 备选 E |
|---|---|---|---|---|
| 企业管理 / 后台系统 | Minimalism（蓝白） | Dark Mode（深色专业） | Material Design（灰蓝） | **Redoe Industrial** |
| 数据大屏 / 仪表盘 | Dark + Glassmorphism | Data Viz（深蓝科技） | Light Dashboard（白底） | **Redoe Industrial** |
| 电商 / 消费品 | Clean Modern（清新） | Bold Typography（活力） | Colorful（多彩） | — |
| SaaS / 工具产品 | Minimalism + Bento | Glassmorphism | Flat Design | **Redoe Industrial** |
| 移动端应用 | iOS-style（圆角卡片） | Material You | Dark Mode | — |
| 内容 / 资讯平台 | Editorial（阅读优先） | Minimal Blog | Magazine | — |
| **制造业 / 工业运营 / MES / ERP** | **Redoe Industrial**（推荐） | Minimalism（蓝白） | Dark Mode（车间暗色） | — |

> **方案 E — Redoe Industrial** 是从 `development-pack-main` 蒸馏出的一套制造业专用设计系统。当产品涉及工单、机台、车间操作员、多工厂实体、KPI 密度展示时，优先推荐此方案。详见 `.ai-config/skills/redoe-prototype-style/SKILL.md`。

## 呈现格式（必须按此格式向使用者展示）

```
───────────────────────────────────────────────────
  设计风格选择 - [需求标题]
  产品类型：[识别到的类型]
───────────────────────────────────────────────────

方案 A — [风格名称]（推荐）
  色板：主色 [hex] · 辅色 [hex] · 背景 [hex]
  字体：[标题字体] + [正文字体]
  适合：[1 句话说明适用场景]

方案 B — [风格名称]
  色板：主色 [hex] · 辅色 [hex] · 背景 [hex]
  字体：[标题字体] + [正文字体]
  适合：[1 句话说明适用场景]

方案 C — [风格名称]
  色板：主色 [hex] · 辅色 [hex] · 背景 [hex]
  字体：[标题字体] + [正文字体]
  适合：[1 句话说明适用场景]

方案 D — 自定义
  输入您的偏好（色系 / 风格 / 参考网站均可）

方案 E — Redoe Industrial（制造业/工业运营专用）
  色板：主色 #1F4E79 Navy · 辅色 #2E75B6 · 背景 #F5F4F2 暖白
  字体：Inter（界面） + JetBrains Mono（工单号 / KPI 数字 / 时间戳）
  适合：制造业 MES/ERP、车间操作界面、多工厂运营看板、需要严肃品牌调性和信息密度的工业产品
  来源：development-pack-main（蒸馏自 Linear + Plane + Stripe 三家视觉语言）
  额外资产：1280×820 画布模板、6 种页面 archetype、3 层用户规则、15 条反 AI-slop 硬规则
  详见：.ai-config/skills/redoe-prototype-style/SKILL.md

请选择方案（A / B / C / D / E）：
───────────────────────────────────────────────────
```

> **何时优先推荐 E**：识别到"制造业 / 工业运营 / MES / ERP"，或用户提到"工单、车间、机台、生产、装配、质检、多工厂"等领域词，将 E 置于"推荐"位置；其他场景下作为备选。

## 设计 Token 注入

用户选定方案后，将该方案的 Token 写入 HTML 的 `:root` 变量块，所有模板统一使用 CSS 变量，确保风格可一键切换。详见 `html-prototype-generator.md` 的"设计 Token 预设"章节。
