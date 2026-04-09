# NexusVoice (智能多模态语音系统)

![Version](https://img.shields.io/badge/version-v0.6.50-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Android%20%7C%20Web-success.svg)

> **NexusVoice** 是一款生产级多模态智能语音交互系统，为您提供类似钢铁侠“贾维斯”的沉浸式桌面仪表盘体验。
> 它拥有极其丝滑的 React + Vite 前端，连接强大的 Serverless 后端，完美驱动并适配最前沿的大语言模型。

---

## 🌟 核心特性与功能

### 🤖 多模型支持与自由拓展
- **全系国产大模型**：内置支持 GLM-4 (智谱)、DeepSeek、豆包 (Doubao) 等最强国产大模型。
- **自定义模型 (Custom)**：提供完全自由的 API 接入配置，支持任何兼容 OpenAI 格式的中转接口或本地模型（如 Ollama）。

### 🎙️ 极速语音合成 (TTS) 与视觉联动
- **秒级发声**：深度优化了浏览器与系统的长文本异步发音机制，彻底解决死锁阻塞，点击即刻出声。
- **贾维斯视觉监控**：内置极具科幻感的**流体网络粒子视频背景**。在待机与 AI 说话时，动态触发炫彩的多巴胺光环与呼吸灯效，视觉体验拉满。

### 🎨 多彩主题与防御机制
- **多巴胺适配**：自由在 `清爽浅色 (Light)`、`沉浸深色 (Dark)`、`赛博多巴胺 (Neon Cyber)`、`马卡龙多巴胺 (Pastel Macaron)` 和 `日落多巴胺 (Sunset Horizon)` 等多个精美主题之间丝滑切换。
- **强制指令防御**：内置强力系统防线，智能阻断模型产生“随意播报当前时间”等冗余幻觉，保障对话的纯粹与自然。

---

## 📦 客户端下载 (Windows & Android)

**不需要配置任何复杂的代码环境！**
请直接前往本仓库的 [**Releases (发行版)**](https://github.com/Ymien/NexusVoice-2.5/releases) 页面，下载最新的安装包：
- 💻 **Windows 用户**: 下载 `.exe` 安装程序，一键安装至桌面。
- 📱 **Android 用户**: 下载 `.apk` 应用程序，安装至手机直接使用。

---

## 🛠️ 开发者部署指南 (Web端)

如果您希望在本地进行二次开发或将项目部署为网站，请按照以下步骤操作：

### 1. 环境变量配置
复制项目根目录下的 `.env.example` 并重命名为 `.env.local`：
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

---
*注：有关每个版本的详细更新日志，请查阅 [changelogs](./changelogs) 文件夹内的更新公告。*
