---
name: init
description: 项目初始化 - 检测技术栈、建立目录结构、（老项目）生成 project-map
argument-hint: [可选: new | existing | java | vue | python | dotnet]
---

按 @.ai-config/workflow.md 第 **2.1 节（/pg:init）** 的契约执行。

可选参数：$ARGUMENTS（不填则自动检测）

**执行规范参考**：@.ai-config/skills/init/SKILL.md

**关键动作**：

1. 检测项目结构（新 / 老）和技术栈（java / vue / python / dotnet / 前后端分离）
2. 建立目录骨架：
   ```
   docs/
     requirements/backlog/   # /pg:intake 产出
     requirements/done/      # /pg:deliver 归档
     design/                 # /pg:design、/pg:code 产出
     test/                   # /pg:check 产出
     review/                 # /pg:check 产出
     delivery/               # /pg:deliver 产出
     prototype/              # /pg:prototype 产出
     _context/               # 项目上下文（老项目必需）
   ```
3. **老项目必须生成** `docs/_context/project-map.md`（模板见下）
4. 新项目生成 `docs/_context/project-map.md` 留空模板，供后续填充
5. **视觉基线提取（老项目专属，可选）**：若检测到前端工程，扫描 `src/` 和 `package.json`，把视觉风格信息写到 `## 视觉基线` 段（详见模板）。后续 `/pg:prototype` 优先读这段，避免每次重新扫

**老项目 project-map 模板**（由 AI 扫描代码自动填充）：

```markdown
---
kind: project-map
generated_at: <ISO date>
---

# 项目上下文地图

> 本文件给 /pg:intake / /pg:design / /pg:code / /pg:prototype 读取，作为老项目的"已有事实"。

## 技术栈
- 后端：<语言/框架/版本>
- 前端：<框架/版本>
- DB：<类型/版本>

## 模块清单
| 模块 | 位置 | 职责 |
|---|---|---|
| user | src/main/java/.../user | 用户管理 |

## 表清单
| 表 | 用途 | 关键字段 |
|---|---|---|
| user | 用户主表 | id, username, password_hash |

## 对外接口清单
| URL | Method | 模块 | 备注 |
|---|---|---|---|

## 不可变约束（invariants）
> 这些是 /pg:design 阶段的硬约束，AI 不得违反。

- [ ] 禁止修改 `user` 表的主键结构
- [ ] `/api/v1/*` 接口签名不得变更（旧客户端兼容）
- [ ] 根包名沿用现有：`com.example.app`

## 视觉基线（可选；前端项目自动填充；/pg:prototype Step 0 优先读取）
> 由 /pg:init 扫描 src/ 和 package.json 提取；若有遗漏可手动补齐。
> 后续 /pg:prototype 默认沿用本段定义的视觉，避免视觉漂移。

- **UI 库**：<element-plus 2.5.x / ant-design-vue 4.x / vant 4.x / 无>
- **主色**：<#409EFF（来源：src/styles/index.scss → $color-primary）>
- **辅色**：<#67C23A 成功 / #E6A23C 警告 / #F56C6C 危险（来源：xxx）>
- **背景**：<#FFFFFF / #F5F7FA>
- **字体**：
  - 标题：<PingFang SC / -apple-system, sans-serif>
  - 正文：<PingFang SC>
  - 等宽：<JetBrains Mono / Consolas>
- **间距 token**：<8px / 16px / 24px / 32px（4 倍数）>
- **圆角**：<4px / 8px>
- **组件命名约定**：<el-* + xxx-list / xxx-detail（参考 src/views/ 现有风格）>
- **设计 token 文件位置**：
  - SCSS 变量：`src/styles/variables.scss`
  - 主题配置：`src/styles/index.scss`

> 若无前端 / 全新项目 / 无现有视觉风格 → 删除本段或保留占位，待首次 `/pg:prototype` 时由 Step 0 扫描结果回填。
```

**Step 5.5 · 生成或追加 CLAUDE.md**（必做）：

CLAUDE.md 是 Claude Code 启动时自动加载的项目级指令。模板见 `.ai-config/skills/init/templates/claude-md-template.md`。

1. **检测项目根目录是否有 CLAUDE.md**：
   - **无** → 直接从模板复制（替换 `<项目名>` 等占位符），落盘到根目录 `CLAUDE.md`
   - **有**：
     - 检查是否引用了 `.ai-config/workflow.md`：
       - 已引用 → 不动
       - 未引用 → 询问用户："已有 CLAUDE.md 但未引用本规范，是否在末尾追加规范引用块？(Y/N)"
       - 选 Y → 在末尾追加：
         ```
         ## AI 编程规范
         本项目使用 pg: 系列命令，详见 [.ai-config/workflow.md](./.ai-config/workflow.md)
         详细教程见 [docs/USAGE.md](./docs/USAGE.md)
         ```
2. ⚠️ **不要覆盖已有 CLAUDE.md 的现有内容**——避免破坏用户原有项目级指令
3. ⚠️ **文件名严格用大写 `CLAUDE.md`**——Claude Code 官方约定，小写 claude.md 不识别

**Step 5.6 · 建立 Skill Registry**（必做）：

扫描所有可用 skill 路径，按类型分类生成 `docs/_context/skill-registry.md`：

1. **扫描来源**（3 个位置必须都扫）：
   - 本规范约定（项目级）：`.ai-config/skills/*/SKILL.md`（入 git，团队共享）
   - Claude Code 项目级：`.claude/skills/*/SKILL.md`（入 git，第三方插件 / marketplace 安装的项目 skill）
   - Claude Code 用户级：`~/.claude/skills/*/SKILL.md` 或 `%APPDATA%/Claude/skills/*/SKILL.md`（不入 git，个人偏好）
2. **分类**（按 SKILL description 关键词）：
   - 脚手架 / 框架（scaffold/starter/framework/template/脚手架/骨架）→ 写代码时必读
   - 领域 / 业务（payment/auth/notification/领域/业务）→ 按 REQ 场景读
   - 工具 / 通用 → AI 按 description 自动判断
   - 流程内置（本规范自带的 8 个）→ 不进 registry
3. **输出**：`docs/_context/skill-registry.md`（不走 schema 校验，叙事性清单）
4. **用户级 skill 标注**：在 registry 里单独分组，路径用 ~/绝对路径，提醒"团队其他成员可能没装"
5. **不阻断**：扫不到任何额外 skill（仅有内置）也算成功

具体格式见 `.ai-config/skills/init/SKILL.md` Step 5.6。

**后置校验**：
- 老项目：`docs/_context/project-map.md` 必须存在且 `invariants` 段非空（schema 强制）
- 视觉基线段不强制（schema 不校验）
- 新老项目：目录结构完整

完成后告知用户：`/pg:intake` 接入第一个需求。
