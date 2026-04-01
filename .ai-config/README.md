# AI编程规范模板

## 项目介绍
这是一个专为AI编程设计的规范驱动开发工具模板，结合OpenSpec和Superpowers方法论，通过轻量级的CLI命令和标准化目录结构，让规范驱动流程可快速落地。

## 核心优势
- **支持主流AI工具**：兼容Claude Code、Cursor等主流AI工具
- **无需复杂配置**：新手开发者也能快速上手
- **完整开发闭环**：涵盖"环境准备-流程执行-归档沉淀"三大阶段
- **可复用技能**：支持动态加载和组合技能

## 目录结构
```
.ai-config/
 ├── rules/                  # 【宪法层】不可逾越的开发规范
 │   ├── 00_system_role.mdc  # 全局人设：定义 AI 是资深架构师
 │   ├── 01_tech_stack.mdc   # 技术边界：指定框架版本、禁止使用的库
 │   ├── 02_code_style.mdc   # 代码美学：命名规范、目录结构、注释标准
 │   ├── 03_security.mdc     # 安全红线：SQL注入防护、鉴权逻辑
 │   ├── 04_git_workflow.mdc # 提交规范：Commit Message 格式
 │   └── 05_workflow.mdc     # 工作流程：开发流程规范与确认机制
 │
 ├── skills/                 # 【能力层】可调用的具体技能库
 │   ├── write-plan/         # 技能：生成计划
 │   ├── generate-prototype/ # 技能：生成原型
 │   ├── code-review/        # 技能：代码审查
 │   └── scripts/            # 通用脚本库
 │
 ├── agents/                 # 【执行层】特定场景的子代理配置
 │   ├── architect.md        # 架构师代理
 │   ├── frontend_dev.md     # 前端代理
 │   ├── backend_dev.md      # 后端代理
 │   ├── qa_engineer.md      # 测试代理
 │   └── prototype_designer.md # 原型设计师代理：基于HTML+CSS设计静态页面
 │
 ├── mcp/                    # 【连接层】外部工具与协议配置
 │   ├── settings.json       # MCP 全局配置
 │   └── tools/              # 自定义 MCP 工具定义
 │
 ├── hooks.json              # 【自动化层】生命周期钩子
 └── README.md               # 【索引层】配置说明与上下文入口
```

## 使用方法

### 1. 环境准备
- 安装Node.js 18+
- 克隆此模板到项目根目录
- 配置环境变量（参考 .env.example）

### 2. 流程执行
- **生成计划**：使用 write-plan 技能生成开发计划
- **生成原型**：使用 generate-prototype 技能生成前端原型
- **代码审查**：使用 code-review 技能审查代码质量
- **运行测试**：使用相关测试命令执行测试

### 3. 归档沉淀
- 提交代码时自动触发代码审查
- 定期执行安全扫描和性能测试
- 生成代码质量报告和技术文档

## 扩展技能
1. 在 `skills/` 目录下创建新的技能文件夹
2. 编写 `SKILL.md` 文件定义技能描述和触发指令
3. 可选：编写 `implementation.js` 文件实现具体逻辑
4. 在 `hooks.json` 中配置触发时机

## 配置说明
- **rules/**：定义开发规范和约束
- **skills/**：存放可复用的技能
- **agents/**：配置不同场景的代理角色
- **mcp/**：配置外部工具连接
- **hooks.json**：定义自动化触发行为

## 最佳实践
- 定期更新技能库，保持技能的有效性
- 遵循规范文件中的开发标准
- 利用自动化钩子提高开发效率
- 结合Superpowers方法论，实现全流程AI辅助开发