# NexusVoice

English | [简体中文](./README.md)

![Version](https://img.shields.io/badge/version-v0.7.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Android%20%7C%20Web-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **NexusVoice** is a production-grade, multi-modal intelligent voice interaction system that provides an immersive desktop dashboard experience akin to Iron Man's "J.A.R.V.I.S.".
> It features an incredibly smooth React + Vite frontend, connected to a powerful Serverless backend, perfectly driving and adapting to the most cutting-edge Large Language Models.

---

## 🌟 Core Features

### 🤖 Multi-Model Support & Infinite Extensibility
- **Top-Tier Chinese LLMs**: Built-in support for GLM-4 (Zhipu), DeepSeek, Doubao, and other leading domestic models.
- **Custom Models**: Provides completely free API configuration, supporting any proxy interface compatible with the OpenAI format or local models (like Ollama).

### 🎙️ Lightning-Fast TTS & Visual Linkage
- **Instant Vocalization**: Deeply optimized long-text asynchronous pronunciation mechanism across browsers and systems, thoroughly solving deadlock blockages to produce sound the moment you click.
- **J.A.R.V.I.S. Visual Monitoring**: Features a built-in, highly sci-fi **fluid network particle video background**. When on standby or when the AI speaks, it dynamically triggers vibrant dopamine halos and breathing light effects, maximizing the visual experience.

### 🎨 Colorful Themes & Defense Mechanisms
- **Dopamine Adaptations**: Silky-smooth switching among multiple exquisite themes including `Light`, `Dark`, `Neon Cyber`, `Pastel Macaron`, and `Sunset Horizon`.
- **Forced Instruction Defense**: Built-in powerful system defenses intelligently block the model from generating redundant hallucinations like "randomly broadcasting the current time", ensuring pure and natural conversations.

---

## 📦 Client Downloads (Windows & Android)

**No complex code environment configuration required!**
Please head directly to the [**Releases**](https://github.com/Ymien/NexusVoice-2.5/releases) page of this repository to download the latest installation packages:

| Platform | Architecture | Filename |
|---|---|---|
| 💻 **Windows** | x64 | `NexusVoice Setup x.x.x.exe` |
| 📱 **Android** | arm64/x86 | `app-debug.apk` |

---

## 🛠️ Developer Deployment Guide (Web)

If you wish to conduct secondary development locally or deploy the project as a website, please follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### 2. Environment Variables Configuration
Copy the `.env.example` in the project root directory and rename it to `.env.local`:
```env
VITE_GLM_API_KEY=your-glm-key
VITE_DEEPSEEK_API_KEY=your-deepseek-key
VITE_DOUBAO_API_KEY=your-doubao-key
```

### 3. Start Development Server
```bash
git clone https://github.com/Ymien/NexusVoice-2.5.git
cd NexusVoice-2.5
npm install
npm run dev
```

---

## FAQ

**Windows prompts the software is "unsigned" or "prevented from running"?**
This project uses a completely open-source and free build process and has not purchased expensive Windows developer digital signature certificates. If intercepted by Windows SmartScreen, click "More info" -> "Run anyway".

**Why is there no macOS version?**
Currently, we are focusing on optimizing the experiences for the Windows desktop and Android mobile platforms. In the future, if funding permits the purchase of an Apple Developer account, we will reconsider supporting macOS signed releases.

---

## Changelogs
For detailed update logs of each version, please refer to the release announcements in the [changelogs](./changelogs) folder.

## License
[MIT License](https://opensource.org/licenses/MIT) © 2026-present Ymien
