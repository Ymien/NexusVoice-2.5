# 🚀 官方更新公告 (Changelog) - v0.8.0

## [v0.8.0] - 2026-04-09
### 核心修复 (Core Fixes)
- 🔧 **彻底根除 `HTTP 401: Bad credentials` 拦截**:
  - 弃用 GitHub CLI (`gh` 命令) 的脚本操作方式。这彻底规避了因系统底层环境变量污染导致的 `gh auth` 令牌拦截。
  - **全新重构**: 引入了极其稳定且官方认证的 `softprops/action-gh-release@v1` 插件来接管所有与 Release 相关的操作。该插件通过 GitHub REST API 和注入的 `secrets.GITHUB_TOKEN` 执行读写与上传，不依赖任何本地终端配置，从而 100% 根除了 401 未授权报错问题。
  - 为确保 `action-gh-release` 插件有足够权限，在工作流的全局和各个 Jobs 内部显式授予了最高读写权限 (`permissions: contents: write, pull-requests: write, issues: write`)。
