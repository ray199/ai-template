# 技能：原型生成

## 目标

在需求接入的 Step 3，根据需求特征**自动判定是否需要生成原型**，若需要则**选择合适的原型形式**（HTML / Figma / 低保真草图），帮助需求方和开发团队进行视觉化沟通，减少理解偏差。

**触发时机**：`/pg:intake` 的 Step 4（输出物推荐）；或单独 `/pg:prototype REQ-xxx`。

**输出**：原型生成决策 + 若需要则输出原型文件。

---

## 自动判定算法

### 4 个维度评分（每维 0-3 分）

| 维度 | 范围 | 判分要素 |
|---|---|---|
| **功能类型** | 0-3 | 纯后端 / 库工具 0；简单表单 1；复杂表单 2；页面流程 / 大屏 / 移动 3 |
| **复杂度** | 0-3 | 页面数 + 功能点 + 交互流程 + 状态管理 |
| **涉众** | 0-2 | 仅开发 0；产品/设计 1；最终用户 2 |
| **验收标准** | 0-2 | 纯功能性 0；含流程 1；含 UI 细节 2 |

### 总分判定

```
总分 ≤ 2     → 不需要原型（纯业务逻辑/后端 API）
3-6 分       → 可选原型（简单 HTML+示意图）
7-9 分       → 推荐原型（可交互的 HTML 或 Figma）
≥ 10 分      → 必需原型（完整交互原型）
```

详细评分细则见 `references/decision-criteria.md`。

---

## 三种原型形式对比

| 原型形式 | 工期 | 交互性 | 可视化 | 迭代成本 | 适用 |
|---|---|---|---|---|---|
| **低保真草图** | 2-5 分钟 | 无 | 中 | 很低 | 快速概念验证 |
| **HTML 可交互** | 5-10 分钟 | 中等 | 高 | 低 | 流程演示，交互验证 |
| **Figma** | 10-20 分钟 | 低 | 很高 | 中 | 设计共享，多方评审 |

### 自动选择逻辑

```
分数 3-4    → 低保真草图       → templates/wireframe.md
分数 5-7    → 复杂流程：HTML    → templates/html-prototype.md
              否则：Figma       → templates/figma-prototype.md
分数 ≥ 8    → 涉众含最终用户：HTML 完整可交互
              否则：Figma + HTML 混合
```

---

## 触发流程

```
【/pg:intake Step 2 完成】工作量评估 S/M/L/XL
   ↓
【自动判定】4 个维度评分 → 总分
   ↓
   ├─ ≤ 2 → 跳过原型，继续后续
   │
   └─ ≥ 3 → 进入 HTML 原型路径

【Step 0 · 视觉基线扫描】（必做，HTML 原型才执行）
   
   优先级 1（首选）：读 docs/_context/project-map.md 的 ## 视觉基线 段
      → /pg:init 老项目分支已自动扫描填充；命中即用，跳过下面的即时扫描
      → 把段内容展示给用户："沿用 project-map 已记录的视觉基线 [Y/调整/N 切换]"
   
   优先级 2（即时扫描）：仅当 ## 视觉基线 段不存在 / 为空时执行
      1. docs/prototype/*.html（其他 REQ 已生成的原型）
         → 提取 CSS 变量、字体声明、UI 库类名
      2. src/ 下现有前端工程（若存在）
         → package.json：识别 UI 库（element-plus / ant-design-vue / vant / antd / mui）
         → tailwind.config.js / variables.scss / src/styles/：design token
         → src/views/ src/components/：组件命名和结构约定
      3. docs/_context/project-map.md 的 ## 不可变约束 / ## 项目原则
         → 若提到 UI 框架 / 设计语言 / 包名，必须遵守
   
   扫描后建议：把结果回写到 docs/_context/project-map.md 的 ## 视觉基线 段，
   下次 /pg:prototype 直接读优先级 1，节省扫描 + 跨需求一致
   ↓
【Step 0.5 · 基线参照检查】（老项目专属；新项目跳过）
   解析当前 REQ 涉及的页面（design.md 的页面清单 / requirement.md 的 acceptance）
   
   for each page:
     检查 docs/prototype/baseline/<page>.html
     ├─ 已存在 → 用作"改动前"参照
     └─ 不存在 → 询问用户是否反推（默认 N）
                 选 Y → 按 templates/baseline-snapshot.md 从 src/views/<Page>.vue 反推 HTML
                       落盘 + 更新 docs/prototype/baseline/README.md
   
   目的：让业务方看到"改动前 vs 改动后"对比，AI 生成新原型有锚点不会突兀
   
   扫描结果分流：
   ├─ 命中现有视觉基线 → 默认沿用为方案 A，5 选 1 风格库降为备选
   ├─ 部分命中（仅 UI 库一致） → 用 UI 库默认主题为方案 A
   └─ 完全无基线（全新项目无原型） → 走原有 5 选 1 流程
   ↓
【设计风格选择】调用 references/style-selection.md
   ├─ 有基线：呈现 沿用 [A] + 5 选 1 备选
   └─ 无基线：直接 5 选 1
   ↓
【生成原型】html-prototype-generator.md
   ├─ 沿用基线：导入项目的 design token / SCSS 变量 / UI 库类名
   └─ 新风格：注入选定方案的 CSS 变量到 :root
   ↓
【输出】
   - 主原型：docs/prototype/REQ-XXXXXXXX.{html|figma|md}
     · 有基线参照 → 双栏对比 HTML（左"改动前"，右"改动后"）+ 顶部改动摘要
     · 无基线参照 → 仅目标态原型
   - 基线快照（按需）：docs/prototype/baseline/<page>.html
   → 详细输出格式见 templates/prototype-output.md
```

---

## 原型与工作量的关系

**原型不增加工作量评估**，但会影响后续工期：

- 评估原型生成的工作量：极小（5-20 分钟），算在"需求澄清"中，不算在代码工期
- 原型可以提前发现需求问题，**减少返工**
- 实际效果对比：
  - 无原型：20 个工作日 + 5 个返工日 = 25 天
  - 有原型：20 个工作日 + 1 个修改日 = 21 天（原型成本 10 分钟 vs 节省 5 个返工天）

---

## 子文件索引（lazy-load）

| 子文件 | 用于 | 何时加载 |
|---|---|---|
| `references/decision-criteria.md` | 4 个维度详细评分（功能类型/复杂度/涉众/验收） | 判分时读 |
| `references/style-selection.md` | HTML 设计风格选择（产品类型 → 风格映射、Token 注入、E 方案） | HTML 路径必读 |
| `templates/wireframe.md` | 低保真草图模板 + ASCII 示例 | 分数 3-4 时读 |
| `templates/html-prototype.md` | HTML 可交互原型基础结构 + UI 框架推荐 | HTML 路径必读 |
| `templates/figma-prototype.md` | Figma 设计稿规范 + 集成方案 | Figma 路径必读 |
| `templates/prototype-output.md` | 文件组织 + 需求文档引入 + 各分数等级示例 | 输出时读 |
| `html-prototype-generator.md` | HTML 原型详细生成规则（设计 Token 预设等） | HTML 路径深度生成时读 |

制造业 / 工业场景：另读 `.ai-config/skills/redoe-prototype-style/SKILL.md`（Redoe Industrial 设计系统）。

---

## 关键约束

1. **判定结果必须公开** —— 将判分细节展示给用户，便于复核（不只输出"需要原型"这一结论）
2. **HTML 原型必须先选风格** —— 不允许跳过 `references/style-selection.md` 直接生成
3. **设计 Token 走 CSS 变量** —— 写入 HTML 的 `:root`，确保风格可一键切换
4. **原型不进 git 阻断流程** —— 即使没生成原型，需求也可以进入 /pg:design（除非分数 ≥ 10 必需）
5. **文件命名严格** —— `docs/prototype/REQ-XXXXXXXX.html` / `.figma` / `-wireframe.md`

---

## 与其他阶段的衔接

```
/pg:intake Step 2 ─▶ 工作量评估
                       ↓
                    本技能（自动判定 + 生成）
                       ↓
                    docs/prototype/REQ-xxx.{html|figma|wireframe.md}
                       ↓
                    /pg:design 时引用 → 设计文档"原型/截图参考"节
```

需要重新生成或变更风格时，单独跑 `/pg:prototype REQ-xxx`。
