# 🚀 官方更新公告 (Changelog) - v0.7.25

## [v0.7.25] - 2026-04-09
### 核心调整与修复 (Core Fixes)
- 🔧 **终极修复 GitHub CLI 认证覆盖问题**: 
  - 根据 GitHub CLI 的官方底层机制，如果系统中之前残留有无效的本地凭据，仅设置 `GH_TOKEN` 环境变量可能被忽略而导致降级使用无效凭证，最终触发 `HTTP 401: Bad credentials` 错误。
  - 在 `.github/workflows/release.yml` 脚本中，已将所有的环境变量注入口严格由 `GH_TOKEN` 替换为 **`GITHUB_TOKEN`** 这一具有更高优先级和覆盖权的环境变量。这能强制 `gh` 命令行工具在云端打包时忽略任何无效的本地缓存，使用当前流水的最高读写权限，彻底根治 401 拦截。
