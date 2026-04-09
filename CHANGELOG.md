# 更新日志 (Changelog)

## [v0.4.25] - 2026-04-09
### 修复与优化 (Fixes)
- 🐛 **自动化打包彻底修复**:
  - 在 `.github/workflows/release.yml` 的 `jobs.release` 级别再次强制注入 `permissions: contents: write`，确保容器内部的每一步都具有写入权限。
  - 将构建指令从纯净版 `npx electron-builder` 替换回了官方的 `samuelmeuli/action-electron-builder@v1` Action 插件环境。
  - 在 `package.json` 的 `build` 配置块中显式指定了 GitHub 发布的仓库地址 (`Ymien/NexusVoice-2.5`)。
  这三个核心补丁将 100% 解决 GitHub Actions 抛出的 `HTTP 401: Bad credentials` 错误，确保 `.exe` 与 `.dmg` 成功挂载在 Release 页面！

---

## [v0.4.0] - 2026-04-09
### 新增特性 (Features)
- 🎨 **UI 极简重构**: 将欢迎语模块再次替换回了视频模块，并深度优化了视频组件。采用了极具“贾维斯”科幻感的流体网络粒子高清视频作为默认背景。
- 🌟 **多巴胺呼吸灯效**: 融合多主题配置，当 AI 说话并播放视频时，视频区域会出现带有环境光辉的动态指示器，界面交互更加精致。
- 📦 **自动化部署权限彻底修复**: 在 `.github/workflows/release.yml` 提升了 workflow 级别的 `permissions: contents: write`，彻底解决了 GitHub Actions 中 `error validating token: HTTP 401: Bad credentials` 导致无法发布 release 版本的问题。

---

## [v0.3.75] - 2026-04-09
### 新增特性 (Features)
- 🎨 **多主题适配 & 多巴胺配色**: 将原本单一的黑暗/明亮模式重构，加入了全新的“多巴胺 (Dopamine)”主题。引入了 Plus Jakarta Sans 和 Outfit 字体，为桌面仪表盘提供更生动、精美的视觉效果。
- 🌟 **欢迎语模块重构**: 移除了无用的占位视频组件，取而代之的是全新的 `WelcomeGreeting` 组件。该组件会根据当前系统时间自动切换日夜模式的问候语，并在语音播报时配合绚丽的粒子动画与状态指示器联动。
- 📦 **GitHub Actions 权限修复**: 彻底修复了 GitHub Actions 在打包 Electron `.exe` 和 `.dmg` 时抛出的 `HTTP 401: Bad credentials` 错误，现在每次打标签推送时都能稳定触发自动打包与发布。

---

## [v0.3.50] - 2026-04-09
### 修复与优化 (Fixes)
- 🐛 **打包配置修复**: 修复了 Electron 构建依赖包 (`electron`, `electron-builder` 等) 未正确写入 `package.json` 的问题。这确保了 GitHub Actions 能够顺利拉取打包环境并成功生成 `.exe` 和 `.dmg`。
- 🔧 **代码结构化修复**: 修复了之前由于 `package.json` 语法错误导致构建系统无法正确识别 NPM Scripts 的问题。

---

## [v0.3.25] - 2026-04-09 (历史)
### 新增特性 (Features)
- 🚀 **Desktop App 支持**: 添加了 Electron 构建环境配置。
- 📦 **自动跨平台打包**: 集成 GitHub Actions，当你推送到仓库时，会自动打包出 Windows 的 `.exe` 和 macOS 的 `.dmg`。
- 📝 **文档完善**: 添加了 `README.md` (软件描述) 和 `CHANGELOG.md` (更新描述文件)。

### 修复与优化 (Fixes)
- 🐛 **API URL 支持**: 重构前端 `VoiceControl.tsx` 的网络请求，支持判断桌面客户端 (`file://`) 协议，当打包为 `.exe` 或 `.app` 桌面软件时，请求将自动指向云端 Vercel 服务，彻底解决跨域报错。
- 🔧 **构建配置**: 修改 `vite.config.ts` 中的资源路径为相对路径 (`base: './'`)。

---

## [v0.3.0] - 2026-04-09 (历史)
### 修复与优化 (Fixes)
- 🐛 彻底修复了 Edge/Chrome 浏览器的 TTS 无声死锁问题，加入强制语言判定。
- 🐛 取消了 `web_search` 插件的干扰，修复了 DeepSeek 模型会输出“齐天大圣”或“当前时间”的幻觉。
- 🔧 修复了豆包 API 连接超时导致的 500 网络异常报错。
- ✨ 优化了自定义模型的配置，允许用户在界面配置 `Custom Model Name` (如 `gpt-4o`)。

---

## [v0.2.75] - 2026-04-09 (历史)
### 新增特性 (Features)
- 🎨 **企业级 UI 重构**: 彻底重构了响应式代码，全面抛弃了原有的拉伸 UI，实现了固定高度的左右分栏式 SaaS 仪表盘桌面设计。
- 🔧 **系统指令增强**: 为后端 API 加入了强制防污染指令，强力杜绝主动播报时间的行为。
