# NexusVoice (v0.5.50)

NexusVoice 是一款生产级多模态智能语音交互系统，提供类似钢铁侠“贾维斯”的沉浸式桌面仪表盘体验。
基于 React + Vite 构建的丝滑前端，与基于 FastAPI 和 Serverless 架构的强大后端连接，完美适配多种大语言模型。

## 🌟 核心特性
- **🤖 多模型支持**：内置支持 GLM-4、DeepSeek、豆包 (Doubao) 等国产大模型，并提供完全自由的 `Custom (自定义)` 模型接入配置。
- **🎙️ 极速语音合成 (TTS)**：优化了长文本异步发音机制与死锁阻塞，点击秒出声。
- **📺 视频联动监控**：内置桌面级仪表盘 UI，支持极具“贾维斯”科幻感的流体网络粒子视频背景，并在待机和说话时触发炫彩的多巴胺光环与呼吸灯效。
- **🎨 多主题适配**：自由在 清爽浅色 (Light)、沉浸深色 (Dark) 和 活力多巴胺 (Dopamine) 主题之间切换。
- **🧠 强制指令防御**：内置最强力的前置指令防线，阻断模型产生随意播报时间等冗余幻觉。
- **💻 跨平台客户端**：支持 Web 部署，同时全自动打包为 Windows (`.exe`) 桌面端应用 和 Android (`.apk`) 移动端应用！

## 🛠️ 安装与部署 (Web端)

### 1. 环境变量配置
复制 `.env.example` 并重命名为 `.env.local`：
```env
VITE_GLM_API_KEY=your-glm-key
VITE_DEEPSEEK_API_KEY=your-deepseek-key
VITE_DOUBAO_API_KEY=your-doubao-key
```

### 2. 启动开发服务器
```bash
npm install
npm run dev
```

## 📦 打包为桌面应用与移动端应用
由于集成了 Electron、Capacitor 与 GitHub Actions，**你完全不需要在本地配置复杂的打包环境**！
每当代码推送到 GitHub 并打上以 `v` 开头的标签（例如 `v0.5.50`）时，GitHub 会**自动**在云端为你打包出 Windows 的 `.exe` 和 Android 的 `.apk` 安装包，并发布在仓库的 **Releases** 页面！
