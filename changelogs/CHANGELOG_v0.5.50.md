# 🚀 官方更新公告 (Changelog) - v0.5.50

## [v0.5.50] - 2026-04-09
### 核心调整 (Core Changes)
- 🎯 **极致化打包策略**: 彻底优化了构建流水线。通过在 `.github/workflows/release.yml` 的 Electron 任务中注入严格的 `args: --win` 指令，并清理了 `package.json` 中的残留配置，现在 GitHub Actions **绝对只为你打包 `.exe` 和 `.apk` 文件**，不会再有任何多余的跨平台文件污染你的 Release 页面！
- 📝 **更新公告格式规范化**: 确立了更新日志的发布规范。当前及以后的所有更新公告，其标题将明确标注为 `官方更新公告 (Changelog)`，以确保内容的清晰与专业度。
