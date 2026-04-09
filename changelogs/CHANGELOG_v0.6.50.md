# 🚀 官方更新公告 (Changelog) - v0.6.50

## [v0.6.50] - 2026-04-09
### 核心调整与修复 (Core Fixes)
- 🎨 **多巴胺主题矩阵扩展**: 废弃了单一的 `多巴胺` 配色，参考专业设计规范，正式拆分并引入了三套极其惊艳的全新主题：
  - `赛博多巴胺 (Neon Cyber)`: 融合青色、热粉与电光紫的高对比度科幻风。
  - `马卡龙多巴胺 (Pastel Macaron)`: 采用柔和的马卡龙粉、薄荷绿等低饱和度高级配色。
  - `日落多巴胺 (Sunset Horizon)`: 温暖的日落橘、珊瑚红与金黄色交织的活力主题。
- 🔧 **终极权限修复 (GitHub Actions 401)**: 彻底解决了 GitHub Actions 流水线中调用 `gh` CLI 时由于环境变量冲突导致的 `Bad credentials` 错误。直接废弃了外部 Personal Access Token (PAT)，全面转为使用 Actions 原生且安全的 `secrets.GITHUB_TOKEN`，并通过 `GH_TOKEN` 环境变量进行标准授权。现在打包流水线绝对不会再报权限错误，并且保证你的私人令牌零暴露风险。
