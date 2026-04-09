# 更新日志 (Changelog)

## [v0.3.25] - 2026-04-09
### 新增特性 (Features)
- 🚀 **Desktop App 支持**: 添加了 Electron 构建环境配置。
- 📦 **自动跨平台打包**: 集成 GitHub Actions，当你推送到仓库时，会自动打包出 Windows 的 `.exe` 和 macOS 的 `.dmg`。
- 📝 **文档完善**: 添加了 `README.md` (软件描述) 和 `CHANGELOG.md` (更新描述文件)。

### 修复与优化 (Fixes)
- 🐛 **API URL 支持**: 重构前端 `VoiceControl.tsx` 的网络请求，支持判断桌面客户端 (`file://`) 协议，当打包为 `.exe` 或 `.app` 桌面软件时，请求将自动指向你的云端 Vercel 服务 (`https://nexusvoice-2-5.vercel.app/api/chat`)，彻底解决跨域报错。
- 🔧 **构建配置**: 修改 `vite.config.ts` 中的资源路径为相对路径 (`base: './'`)，以确保在桌面客户端中完美加载 CSS 和 JS。

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
