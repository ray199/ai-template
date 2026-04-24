# HTML原型生成器详细规则

## 目标

定义HTML原型的生成规则、代码结构和可交互元素标准，确保生成的HTML原型高保真、易于修改、可快速验证需求。

---

## 设计 Token 预设（来自 ui-ux-pro-max 风格选择）

生成 HTML 原型前，将用户选定的风格 Token 写入 `:root`，模板中所有颜色、字体、圆角均引用 CSS 变量，**不允许硬编码 hex 值**。

### 内置风格预设

#### 方案 A 默认 — Minimalism 极简专业（企业系统）
```css
:root {
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-danger: #ff4d4f;
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-text: #262626;
  --color-text-secondary: #8c8c8c;
  --color-border: #d9d9d9;
  --color-stripe: #fafafa;
  --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --radius: 4px;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-modal: 0 4px 12px rgba(0,0,0,0.15);
}
```

#### 方案 B — Dark Mode 深色科技
```css
:root {
  --color-primary: #6366f1;
  --color-primary-hover: #818cf8;
  --color-danger: #f87171;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-stripe: #1e293b;
  --font-heading: 'Space Grotesk', 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius: 8px;
  --shadow: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-modal: 0 8px 24px rgba(0,0,0,0.5);
}
```

#### 方案 C — Glassmorphism 玻璃拟态
```css
:root {
  --color-primary: #7c3aed;
  --color-primary-hover: #a78bfa;
  --color-danger: #fb7185;
  --color-bg: #667eea;   /* 配合 body background: linear-gradient */
  --color-surface: rgba(255,255,255,0.15);
  --color-text: #ffffff;
  --color-text-secondary: rgba(255,255,255,0.7);
  --color-border: rgba(255,255,255,0.2);
  --color-stripe: rgba(255,255,255,0.08);
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius: 16px;
  --shadow: 0 8px 32px rgba(31,38,135,0.37);
  --shadow-modal: 0 8px 32px rgba(31,38,135,0.5);
  --backdrop: blur(8px);
}
```

#### 方案 D（示例）— Clean Modern 清新现代（消费品 / B2C）
```css
:root {
  --color-primary: #059669;
  --color-primary-hover: #34d399;
  --color-danger: #ef4444;
  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-stripe: #f3f4f6;
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Noto Sans SC', 'Inter', sans-serif;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-modal: 0 4px 16px rgba(0,0,0,0.12);
}
```

> 用户选择"D 自定义"时，根据其描述从 `ui-ux-pro-max` 中匹配最接近的色板 + 字体配对，生成对应 `:root` 块。

#### 方案 E — Redoe Industrial 制造业运营（工业 MES / ERP / 车间）

> **来源**：蒸馏自 `development-pack-main`（Redoe OS Design Pack），参照系为 Linear 的密度 + Plane 的层次 + Stripe 的 KPI 克制。
> **触发条件**：产品类型识别为"制造业 / 工业运营 / MES / ERP"，或用户显式选择 E。
> **配套资产**：`.ai-config/skills/redoe-prototype-style/mockup-template.html` 提供 1280×820 画布 + 真实侧栏 + Lucide 图标，可直接作为原型起点。

```css
:root {
  /* 品牌 */
  --color-primary: #1F4E79;        /* Redoe Navy */
  --color-primary-hover: #2E75B6;  /* Redoe Blue */
  --color-primary-light: #D6E4F0;  /* Redoe Light */
  --color-danger: #EF4444;
  /* 表面（Canvas > Surface > Stripe 三层深度） */
  --color-bg: #F5F4F2;             /* 暖白 canvas，非纯白 */
  --color-surface: #FFFFFF;        /* 卡片 / 侧栏 */
  --color-stripe: #F9FAFB;         /* 表头 / 次级面板 */
  --color-text: #0F172A;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #94A3B8;
  --color-border: #E5E7EB;
  --color-border-soft: #EEF0F3;    /* near-invisible 分隔线 */
  /* 状态（永远：色 + 图标 + 文字，绝不能只有色） */
  --status-healthy:  #22C55E;      /* 在跑 / on-track */
  --status-warning:  #F59E0B;      /* pending / 待处理 ← 永远琥珀色，不是蓝色 */
  --status-critical: #EF4444;      /* 阻塞 / 超预算 */
  --status-complete: #10B981;      /* 已发货 / 完成 */
  --status-neutral:  #94A3B8;      /* 暂停 / 不活跃 */
  --status-info:     #38BDF8;
  /* 多工厂实体色（若无多工厂场景可忽略） */
  --ent-windsor: #2563EB; --ent-hunan: #7C3AED; --ent-pes: #EA580C;
  --ent-pangeo: #6B7280; --ent-gta: #0891B2; --ent-ipo: #DB2777;
  /* 字体：固定双栈，不允许替换 */
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-data:    'JetBrains Mono', ui-monospace, monospace;  /* 工单号 / KPI / 时间戳 */
  /* 圆角：按钮 6px，卡片 8-12px，徽章 9999px（胶囊）；硬上限 12px */
  --radius:       8px;
  --radius-sm:    6px;
  --radius-pill:  9999px;
  /* 阴影：深度靠 bg 色分层，阴影仅用于 elevated layer */
  --shadow:       0 1px 3px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06);
  --shadow-md:    0 4px 6px -1px rgba(0,0,0,.07);
  --shadow-modal: 0 16px 70px rgba(0,0,0,.12);
  /* 动效：只允许 transform/opacity 过渡 */
  --dur-fast:   150ms;
  --dur-normal: 200ms;
  --ease-out:   cubic-bezier(.25, 1, .5, 1);
}
```

**Redoe Industrial 与其他方案的差异化硬规则**（选定 E 方案后必须遵守）：

| 规则 | 说明 |
|---|---|
| Pending = 琥珀 | "待处理 / 需审批"一律 `--status-warning`，禁止蓝色（蓝色保留给"信息 / 已选"） |
| 字体上限 | 一屏最多 4 种字号 + 3 种字重；层级靠字重而非字号 |
| 数字必须等宽 | 工单号（G-1234）、KPI 数值、金额、时间戳须挂 `font-family: var(--font-data)` + `tabular-nums` |
| 状态 = 色 + 图标 + 文字 | 禁止单凭颜色表达状态；status badge 必须带 Lucide 图标 |
| 圆角 ≤ 12px | 容器最大 12px 圆角，按钮 6px；禁用 `rounded-3xl` 或更大卡片圆角 |
| sidebar 图标黑白 | 左导航图标不上色，保持同一视觉权重 |
| 表格行 44px | 数据表格最小行高 44px，数字右对齐；车间场景（tier 1）56px |
| 空态必备四要素 | 图标（48px 轮廓）+ 标题（3-6 字）+ 描述（10-20 字）+ CTA 按钮，禁"暂无数据"单行 |
| 禁用项 | 紫色渐变、玻璃拟态（E 与 C 不兼容）、硬编码 hex、spinner（改 skeleton 闪烁）、`<select>` 原生下拉 |
| 触控目标 | 桌面 44px，车间 tier 1 场景 56px（WCAG AAA 对比度 7:1） |

**Redoe 专属组件块**（可直接复用的 HTML 片段）：

```html
<!-- KPI 卡片（Stripe pattern） -->
<div style="padding:14px 16px;border:1px solid var(--color-border);border-radius:8px">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-secondary);margin-bottom:4px">工单总数</div>
  <div style="font-family:var(--font-data);font-size:28px;font-weight:500;line-height:1">47</div>
  <div style="font-size:11px;color:var(--color-text-secondary);margin-top:4px">
    <span style="color:#16A34A">↑ 4</span> 相较昨日
  </div>
</div>

<!-- 状态 badge（color + 图标 + 文字） -->
<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600;background:#FEF3C7;color:#B45309">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  待审批
</span>

<!-- 数据表格行（44px, mono + 右对齐数字） -->
<tr style="height:44px;border-bottom:1px solid var(--color-border-soft)">
  <td style="padding:9px 12px;font-family:var(--font-data);color:var(--color-text-secondary)">G-8232</td>
  <td style="padding:9px 12px">CNC 外壳加工</td>
  <td style="padding:9px 12px;text-align:right;font-family:var(--font-data);font-variant-numeric:tabular-nums">¥45,200</td>
</tr>

<!-- 空态（4 要素齐全） -->
<div style="display:flex;flex-direction:column;align-items:center;padding:64px 16px;text-align:center;gap:8px">
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:rgba(107,114,128,.4)"><path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M3 7h18"/><path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"/></svg>
  <h3 style="font-size:15px;font-weight:500">还没有工单</h3>
  <p style="font-size:13px;color:var(--color-text-secondary);max-width:320px">新建工单后，它会出现在这里，等待分派到下一工序。</p>
  <button style="padding:7px 14px;background:var(--color-primary);color:#fff;border:none;border-radius:6px;font-weight:500">+ 新建工单</button>
</div>
```

**快速起步**：选定 E 方案后，不从头写 HTML。直接拷贝 `.ai-config/skills/redoe-prototype-style/mockup-template.html` 作为起点。模板已内置 1280×820 画布、深蓝 presentation bar、240px 侧栏（6 个 nav 分组 + Lucide SVG 图标）、所有上述组件样式。只需：
1. 替换 `.pbar-brand` 与 `.pbar-ctx` 为本需求的名称；
2. 增减 `<button class="stab">` 标签和对应 `<div class="scr">` 屏幕；
3. 在 `<div class="sb" data-sb="xxx">` 上设置高亮菜单项 key（可选：`dashboard`, `pipeline`, `schedule`, `employees`, `machines`, `quality`, `jobcosting`, `reports`, `settings` 等）；
4. 在 `.cb` 内填充业务内容，遵守上方硬规则。

---

## HTML原型的质量等级

### 三个等级

| 等级 | 名称 | 样式 | 交互 | 数据 | 工期 | 适用场景 |
|---|---|---|---|---|---|---|
| **L1** | 快速原型 | 基础HTML | 简单点击 | 静态 | 5分钟 | 流程演示、概念验证 |
| **L2** | 标准原型 | Ant Design | 模态框、标签页 | 伪数据 | 10分钟 | 常规业务流程 |
| **L3** | 高保真原型 | 完整设计规范 | 复杂交互、动画 | 模拟API | 20分钟 | 数据大屏、复杂应用 |

---

## L1 - 快速原型（基础HTML）

### 适用条件

- 判定分数: 3-4分
- 需求特征: 简单流程、快速概念验证
- 生成时间: 5分钟

### 代码模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[需求标题] - 原型</title>
    <!-- [将用户选定的风格 :root Token 块粘贴到此处，替换默认值] -->
    <style>
        /* ===== 设计 Token（由 ui-ux-pro-max 风格选择注入） ===== */
        :root {
          --color-primary: #1890ff;
          --color-primary-hover: #40a9ff;
          --color-danger: #ff4d4f;
          --color-bg: #f5f5f5;
          --color-surface: #ffffff;
          --color-text: #262626;
          --color-text-secondary: #8c8c8c;
          --color-border: #d9d9d9;
          --color-stripe: #fafafa;
          --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --radius: 4px;
          --shadow: 0 2px 8px rgba(0,0,0,0.1);
          --shadow-modal: 0 4px 12px rgba(0,0,0,0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: var(--font-body);
            background: var(--color-bg);
            color: var(--color-text);
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--color-surface);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        
        .header {
            background: var(--color-primary);
            color: #fff;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 { font-size: 20px; font-family: var(--font-heading); }
        
        .breadcrumb {
            padding: 12px 20px;
            background: var(--color-stripe);
            border-bottom: 1px solid var(--color-border);
            font-size: 12px;
            color: var(--color-text-secondary);
        }
        
        .content {
            padding: 20px;
        }
        
        .button-group {
            margin-bottom: 20px;
        }
        
        button {
            padding: 8px 16px;
            margin-right: 8px;
            background: var(--color-primary);
            color: #fff;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 14px;
            min-height: 44px;
        }
        
        button:hover { background: var(--color-primary-hover); }
        button.secondary {
            background: var(--color-surface);
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
        }
        button.danger { background: var(--color-danger); }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        table th {
            background: var(--color-stripe);
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid var(--color-border);
            font-weight: 600;
        }
        
        table td {
            padding: 12px;
            border-bottom: 1px solid var(--color-border);
        }
        
        table tr:hover { background: var(--color-stripe); }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
        }
        
        input, select, textarea {
            width: 100%;
            max-width: 300px;
            padding: 8px 12px;
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            font-size: 14px;
            background: var(--color-surface);
            color: var(--color-text);
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.45);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .modal.show { display: flex; }
        
        .modal-content {
            background: var(--color-surface);
            border-radius: var(--radius);
            padding: 20px;
            max-width: 600px;
            width: 90%;
            box-shadow: var(--shadow-modal);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 10px;
        }
        
        .modal-header h2 { font-size: 18px; font-family: var(--font-heading); }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: 0;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--color-border);
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: var(--radius);
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-success { background: #f6ffed; color: #52c41a; }
        .status-pending { background: #fffbe6; color: #faad14; }
        .status-error { background: #fff1f0; color: var(--color-danger); }
    </style>
</head>
<body>

<div class="container">
    <!-- 页面标题 -->
    <div class="header">
        <h1>[页面标题]</h1>
        <span>原型版本</span>
    </div>
    
    <!-- 导航 -->
    <div class="breadcrumb">
        首页 > [当前位置]
    </div>
    
    <!-- 主要内容 -->
    <div class="content">
        <!-- 按钮组 -->
        <div class="button-group">
            <button onclick="openModal('add-modal')">新增</button>
            <button class="secondary" onclick="openModal('search-modal')">高级搜索</button>
            <button class="secondary">导出</button>
        </div>
        
        <!-- 表格 -->
        <table>
            <thead>
                <tr>
                    <th>序号</th>
                    <th>名称</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>示例项目1</td>
                    <td><span class="status-badge status-success">已完成</span></td>
                    <td>
                        <button onclick="openModal('edit-modal')" style="padding: 4px 8px; font-size: 12px;">编辑</button>
                        <button onclick="alert('删除成功')" style="padding: 4px 8px; font-size: 12px; background: #ff4d4f;">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>示例项目2</td>
                    <td><span class="status-badge status-pending">进行中</span></td>
                    <td>
                        <button onclick="openModal('edit-modal')" style="padding: 4px 8px; font-size: 12px;">编辑</button>
                        <button onclick="alert('删除成功')" style="padding: 4px 8px; font-size: 12px; background: #ff4d4f;">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <!-- 分页 -->
        <div style="text-align: right; margin-top: 20px;">
            <button style="background: #f0f0f0; color: #000;">上一页</button>
            <span style="margin: 0 8px;">第 1 页 / 共 10 页</span>
            <button>下一页</button>
        </div>
    </div>
</div>

<!-- 新增对话框 -->
<div id="add-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>新增记录</h2>
            <button class="close-btn" onclick="closeModal('add-modal')">✕</button>
        </div>
        <div>
            <div class="form-group">
                <label>名称:</label>
                <input type="text" placeholder="请输入名称">
            </div>
            <div class="form-group">
                <label>描述:</label>
                <textarea placeholder="请输入描述" rows="4"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" onclick="closeModal('add-modal')">取消</button>
            <button onclick="alert('新增成功'); closeModal('add-modal')">确认</button>
        </div>
    </div>
</div>

<!-- 编辑对话框 -->
<div id="edit-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>编辑记录</h2>
            <button class="close-btn" onclick="closeModal('edit-modal')">✕</button>
        </div>
        <div>
            <div class="form-group">
                <label>名称:</label>
                <input type="text" placeholder="示例项目1">
            </div>
           