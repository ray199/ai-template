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
            <div class="form-group">
                <label>描述:</label>
                <textarea placeholder="项目描述" rows="4"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" onclick="closeModal('edit-modal')">取消</button>
            <button onclick="alert('编辑成功'); closeModal('edit-modal')">保存</button>
        </div>
    </div>
</div>

<!-- 搜索对话框 -->
<div id="search-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>高级搜索</h2>
            <button class="close-btn" onclick="closeModal('search-modal')">✕</button>
        </div>
        <div>
            <div class="form-group">
                <label>名称:</label>
                <input type="text" placeholder="搜索名称">
            </div>
            <div class="form-group">
                <label>状态:</label>
                <select>
                    <option>全部</option>
                    <option>已完成</option>
                    <option>进行中</option>
                    <option>待启动</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" onclick="closeModal('search-modal')">取消</button>
            <button onclick="alert('搜索结果...'); closeModal('search-modal')">搜索</button>
        </div>
    </div>
</div>

<script>
function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

// 点击模态框外部关闭
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});
</script>

</body>
</html>
```

---

## L2 - 标准原型（Ant Design）

### 适用条件

- 判定分数: 5-7分
- 需求特征: 中等复杂度、多个页面或状态
- 生成时间: 10分钟

### 特点

```
1. 使用 Ant Design Pro 组件库（更专业的UI）
2. 包含多种交互：
   - 标签页切换
   - 级联选择
   - 日期选择
   - 树形菜单
   - 拖拽排序
3. 伪数据支持（数组渲染表格）
4. 更复杂的表单和验证
```

### 生成规则

```html
<!-- 使用CDN引入Ant Design -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@4/dist/antd.css">
<script src="https://cdn.jsdelivr.net/npm/antd@4/dist/antd.js"></script>

<!-- 组件库 -->
- Button、Input、Select、DatePicker
- Table、Form、Modal
- Tabs、Menu、Layout
- Badge、Tag、Pagination
- Notification、Message、Popover
```

### 示例结构

```
文件: docs/prototype/REQ-XXXXXXXX-l2.html

包含内容:
1. 完整的顶部导航（公司logo、用户菜单）
2. 左侧菜单（可折叠）
3. 主内容区（标签页或多页面切换）
4. 表格、表单、图表
5. 分页、排序、搜索
6. 弹窗、通知提示
```

---

## L3 - 高保真原型（完整设计规范）

### 适用条件

- 判定分数: ≥8分
- 需求特征: 复杂应用、数据大屏、用户交互密集
- 生成时间: 20分钟

### 特点

```
1. 完整的设计系统
   - 颜色规范（品牌色、功能色）
   - 字体规范（大小、行高、字重）
   - 间距规范（padding、margin）
   - 圆角、阴影规范

2. 高级交互
   - 图表实时更新（ECharts）
   - 拖拽支持（拖拽排序、拖拽调整布局）
   - 动画过渡（平滑的页面切换）
   - 响应式设计（自适应不同屏幕）

3. 模拟数据API
   - 假数据生成（实现搜索、排序、分页）
   - 表单提交模拟
   - 延迟模拟（网络请求延迟）

4. 完整的业务流程
   - 多步骤流程（步骤条）
   - 审批流程（流程图）
   - 权限控制（不同角色不同界面）
```

### 包含的库

```html
- Ant Design Pro: 企业级UI
- ECharts: 图表库
- Sortable: 拖拽库
- Moment: 日期处理
```

---

## 自动代码生成规则

### 解析需求文档提取信息

```javascript
function parseRequirement(requirement) {
    return {
        // 页面清单
        pages: extractPages(requirement),
        
        // 表单字段
        formFields: extractFormFields(requirement),
        
        // 表格列
        tableColumns: extractTableColumns(requirement),
        
        // 流程和交互
        flows: extractFlows(requirement),
        
        // 状态值
        statusOptions: extractStatusValues(requirement),
        
        // 图表需求
        charts: extractCharts(requirement)
    };
}
```

### HTML生成算法

```javascript
function generateHTML(parsed, level) {
    let html = getHTMLTemplate();
    
    // 1. 生成导航菜单
    html.navigation = generateMenu(parsed.pages);
    
    // 2. 生成表格
    html.table = generateTable(parsed.tableColumns, parsed.flows);
    
    // 3. 生成表单
    html.forms = generateForms(parsed.formFields);
    
    // 4. 生成对话框
    html.modals = generateModals(parsed.pages, parsed.forms);
    
    // 5. 添加交互脚本
    if (level >= 2) {
        html.scripts = generateInteractionScripts(parsed.flows);
    }
    
    // 6. 应用样式
    if (level === 3) {
        html.styles = applyDesignSystem(parsed.designSpec);
        html.charts = generateCharts(parsed.charts);
    }
    
    return html;
}
```

---

## 原型验收标准

### 功能性检查

- [ ] 所有需求文档中提到的页面都已实现
- [ ] 所有主要操作（增删改查）都可交互验证
- [ ] 流程跳转正确（点击按钮跳转到对应页面）
- [ ] 表单数据能正确显示和提交

### 交互性检查

- [ ] 按钮点击有反馈（颜色变化或提示）
- [ ] 对话框能正确打开和关闭
- [ ] 表单输入有基本校验（非空检查）
- [ ] 分页、搜索、排序功能可用

### 视觉设计检查

- [ ] 布局清晰，层级合理
- [ ] 颜色使用一致（品牌色、功能色）
- [ ] 文字大小和行距舒适（可读性）
- [ ] 间距均匀（上下左右对齐）

### 信息完整性检查

- [ ] 所有验收标准都在原型中有体现
- [ ] 关键字段和说明清晰可见
- [ ] 异常和错误提示能展示
- [ ] 权限限制能展示（如按钮禁用）

---

## 完成标准

HTML原型生成器完成标准：

- [ ] L1快速原型模板完整（5分钟生成）
- [ ] L2标准原型模板完整（10分钟生成）
- [ ] L3高保真原型设计规范清晰（20分钟生成）
- [ ] 自动代码生成算法可行（能从需求文档提取关键信息）
- [ ] 原型验收标准明确
- [ ] 原型文件可独立打开（无依赖）
- [ ] 原型具有基本的交互能力
