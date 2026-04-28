# HTML 可交互原型模板

> 适用于判定分数 5-9 分。输出可独立打开的 HTML 文件，工期 5-10 分钟。

## 输出位置

`docs/prototype/REQ-XXXXXXXX.html`

## 基础结构

```html
<!DOCTYPE html>
<html>
<head>
    <title>[需求标题] - 原型</title>
    <style>
        :root {
          /* 设计 Token 注入区域，由 references/style-selection.md 决定 */
          --color-primary: #1F4E79;
          --color-bg: #F5F4F2;
          --font-body: Inter, sans-serif;
        }
        body { font-family: var(--font-body); margin: 0; background: var(--color-bg); }
        .header { background: var(--color-primary); color: white; padding: 20px; }
        .sidebar { float: left; width: 200px; background: #f5f5f5; }
        .content { margin-left: 200px; padding: 20px; }
        .modal { display: none; border: 1px solid #ccc; padding: 20px; }
    </style>
</head>
<body>
    <div class="header"><h1>[需求标题]</h1></div>
    <div class="sidebar"><!-- 菜单 --></div>
    <div class="content">
        <!-- 主要内容 -->
        <button onclick="showModal('search')">高级筛选</button>
        <table><!-- 数据列表 --></table>
    </div>
    <div id="search-modal" class="modal"><!-- 筛选表单 --></div>
    <script>
        function showModal(id) {
            document.getElementById(id + '-modal').style.display = 'block';
        }
    </script>
</body>
</html>
```

## 必备元素

- ✅ 顶部导航 / 头部
- ✅ 侧边栏（若有菜单）
- ✅ 主内容区（列表 / 表单 / 详情）
- ✅ 至少 1 处可交互（按钮 / 模态框 / 标签切换）
- ✅ CSS 变量管理设计 Token（与 style-selection 选定的方案一致）
- ✅ 简单 JS（无外部依赖或仅 CDN）

## 推荐 UI 框架（按场景选）

| 场景 | 推荐 |
|---|---|
| 企业管理后台 | Element Plus / Ant Design Vue |
| 数据大屏 | ECharts / Chart.js |
| 移动端 | Vant / Tailwind |
| 制造业 / 工业 | 见 `.ai-config/skills/redoe-prototype-style/` |

## 详细生成规则

详见 `html-prototype-generator.md`。
