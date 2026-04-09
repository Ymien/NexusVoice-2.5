<div align="center">

# 🌌 NexusVoice-2.5 
**下一代全矩阵语音与视频同步智能对话系统 (原 tts-ai2.5)**

[![Frontend](https://img.shields.io/badge/Frontend-React_18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Terminal](https://img.shields.io/badge/Terminal-C%2B%2B17-00599C?style=for-the-badge&logo=c%2B%2B)](https://isocpp.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[English](README.md) · [简体中文](README.md)

</div>

---

## 📖 项目简介 (Overview)

**NexusVoice-2.5** 是一个高度可定制、支持音视频同步的全栈 AI 语音虚拟助手系统。本项目旨在打破传统聊天框的限制，带来“**免提式 (Hands-free)**”与“**多模态交互**”的全新体验。

无论您是在寻找一个网页端的虚拟数字人基座，还是需要一个能够在 Linux 终端里通过 C++ 极速交互的 AI 引擎，**NexusVoice-2.5** 都能满足您的需求。它天然集成了国内顶尖的 LLM（豆包、DeepSeek、小米等），并提供零代码修改的“自定义 API”接入能力。

---

## ✨ 核心特性 (Features)

- 🎙️ **自定义唤醒引擎**: 告别单调，随意设置你的专属“唤醒词”与“首次应答语”。内置 Web Speech API，精准捕获语音并转换为文字（STT）。
- 🧠 **全矩阵 LLM 路由**: 动态切换对话大脑！支持接入 **DeepSeek**、**豆包 (Doubao)**、**小米大模型** 或通过自定义接口连接私有模型。
- 🗣️ **情感化语音合成**: 自动将 AI 的文本回复通过 TTS 转为自然语音进行播报，支持男女声音色的无缝切换。
- 🎬 **音视频流态同步**: 独创的视频驱动模块，在 AI 思考与发声时同步播放视频画面，休眠时自动进入待机状态，完美模拟虚拟数字人。
- 💻 **极客专属 C++ 终端**: 为极客准备了基于现代 C++17 和 `libcurl` 构建的命令行控制台，让你在黑客帝国的界面中与 AI 畅聊。

---

## 🏗️ 架构设计 (Architecture)

本系统采用经典且高效的前后端分离架构，并拓展了终端设备接入能力：

1. **前端引擎 (React + Vite + TailwindCSS + Zustand)**
   负责呈现极具科技感的 UI，处理所有多媒体交互（录音、播放视频、TTS 播报），并管理用户的个性化配置（保存在 LocalStorage 中）。
2. **后端路由中枢 (Python + FastAPI)**
   作为一个高性能的异步 API 网关，负责接收前端和 C++ 终端的指令，包装协议并转发给对应的大模型提供商，解决跨域及 API 密钥泄露的安全隐患。
3. **C++ 极速终端客户端**
   使用 `libcurl` 与 `nlohmann_json` 构建的轻量级聊天客户端，无缝对接 FastAPI 后端。

---

## 🚀 快速开始 (Quick Start)

### 1. 启动 Python 后端中枢
确保您的机器已安装 Python 3.8+。
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn httpx python-dotenv pydantic
uvicorn main:app --host 0.0.0.0 --port 8000
```
*后端服务将运行在 `http://localhost:8000`*

### 2. 启动 React 前端界面
确保您的机器已安装 Node.js 16+。
```bash
# 在项目根目录下
npm install
npm run dev
```
*打开浏览器访问 `http://localhost:5173`，点击右下角齿轮⚙️配置您的 API Key 即可体验！*

### 3. 编译并运行 C++ 极客终端 (可选)
如果需要使用 C++ 终端客户端，请确保安装了 `cmake`, `g++`, `libcurl` 开发库和 `nlohmann-json`。
```bash
cd cpp_terminal
mkdir build && cd build
cmake ..
make
./terminal_client
```
*按提示输入模型和 API Key，即可在终端内开启无缝对话。*

---

## 🛠️ 定制与开发 (Customization)

代码结构极为清晰，并附带了**极致详细的中文注释**：
- 前端组件位于 `src/components/`，状态管理见 `src/store/useStore.ts`。
- 如果您想增加新的大模型（例如通义千问、文心一言），只需在 `backend/main.py` 中的 `chat_endpoint` 函数内增加新的 `elif` 路由即可。

---

## 📜 开源协议 (License)

本项目基于 [MIT License](LICENSE) 协议开源，欢迎各位开发者 Fork、Star、提交 PR 一起共建未来语音交互新生态！

> **NexusVoice-2.5** —— 让 AI 听懂你的声音，用画面回应你的期待。
