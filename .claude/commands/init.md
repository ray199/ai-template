---
name: init
description: 项目初始化 - 检测技术栈、建立目录结构、（老项目）生成 project-map
argument-hint: [可选: new | existing | java | vue | python | dotnet]
---

按 @.ai-config/workflow.md 第 **2.1 节（/init）** 的契约执行。

可选参数：$ARGUMENTS（不填则自动检测）

**执行规范参考**：@.ai-config/skills/init/SKILL.md

**关键动作**：

1. 检测项目结构（新 / 老）和技术栈（java / vue / python / dotnet / 前后端分离）
2. 建立目录骨架：
   ```
   docs/
     requirements/backlog/   # /intake 产出
     requirements/done/      # /deliver 归档
     design/                 # /design、/code 产出
     test/                   # /check 产出
     review/                 # /check 产出
     delivery/               # /deliver 产出
     prototype/              # /prototype 产出
     _context/               # 项目上下文（老项目必需）
   ```
3. **老项目必须生成** `docs/_context/project-map.md`（模板见下）
4. 新项目生成 `docs/_context/project-map.md` 留空模板，供后续填充

**老项目 project-map 模板**（由 AI 扫描代码自动填充）：

```markdown
---
kind: project-map
generated_at: <ISO date>
---

# 项目上下文地图

> 本文件给 /intake / /design / /code 读取，作为老项目的"已有事实"。

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
> 这些是 /design 阶段的硬约束，AI 不得违反。

- [ ] 禁止修改 `user` 表的主键结构
- [ ] `/api/v1/*` 接口签名不得变更（旧客户端兼容）
- [ ] 根包名沿用现有：`com.example.app`
```

**后置校验**：
- 老项目：`docs/_context/project-map.md` 必须存在且 `invariants` 段非空
- 新老项目：目录结构完整

完成后告知用户：`/intake` 接入第一个需求。
