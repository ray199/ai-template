# Git Hooks · 强制质量门

这一层是**跨平台的**。无论使用 Claude Code / Cursor / Codex / Trae 编辑代码，提交时都会被这里的脚本守门。

## 安装

在项目根目录执行一次：

```bash
git config core.hooksPath .ai-config/scripts/git-hooks
chmod +x .ai-config/scripts/git-hooks/*
```

或在 CI 里直接调用脚本（不装 hook 也能跑）：

```bash
node .ai-config/scripts/validate-doc.js all
```

## 包含的 hook

| Hook | 作用 | 失败时 |
|---|---|---|
| `pre-commit` | 对本次 commit 涉及的 `docs/**/REQ-*.md` 跑 `validate-doc.js` | 阻止 commit |
| `commit-msg` | 校验 commit message 格式（conventional 或 `XS:` 快车道） | 阻止 commit |

## 不在这里做的事

- PR 触发的完整测试 → 放 CI (`.github/workflows/validate.yml`)
- 部署前安全扫描 → 放 CI
- 定时依赖检查 → 放 CI 或 renovate

原因：Git hooks 只跑本地，跨机器不可靠；真正的强制门必须在 CI 里。

## 绕过

紧急情况可用 `git commit --no-verify` 跳过。但 CI 仍会再次校验，绕不过。
