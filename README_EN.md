[English](./README_EN.md) | [简体中文](./README.md)

# NexusVoice - Intelligent Multimodal Voice Assistant

NexusVoice is a smart terminal system integrating state-of-the-art Large Language Models with real-time voice interactions. It offers a clean, modern graphical interface, supports multimodal inputs (text, voice), and provides real-time streaming output, dedicated to delivering the most natural and fluent AI interaction experience.

## 🌟 Core Features

- **Multi-Language Support (i18n)**: Seamless one-click switching between English and Chinese to meet internationalization needs.
- **Intelligent Voice Chat**: Features high-precision speech recognition and natural human-like Text-to-Speech (TTS), supporting real-time wake words and interruption for a smooth conversation.
- **Multi-Model Support**: Easily configure and seamlessly switch between various mainstream LLMs (e.g., DeepSeek, GLM-4, Doubao) to meet performance and logical needs across different scenarios.
- **Dynamic UI Engine**: Built-in with six deeply customized, exquisite themes (Light, Dark, Neon Cyber, Pastel Macaron, Neo Brutalism, Glassmorphism) supporting structural UI changes.
- **Multimodal Visual Sync**: Supports linking an external video background with the AI's speaking status. Videos automatically sync during voice playback, providing intuitive visual feedback.
- **Data Privacy & Security**: Sensitive data like API keys are processed locally in the browser and private backend, ensuring comprehensive privacy protection.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18, TypeScript, Vite
- **UI Styling**: TailwindCSS, Lucide React
- **State Management**: Zustand (with persist)
- **Internationalization (i18n)**: Zustand custom translation engine
- **Voice Tech**: Web Speech API (Recognition & Synthesis)

## 🚀 Quick Start

### 1. Prerequisites
- Ensure Node.js (v18+) is installed.
- npm or yarn package manager is recommended.

### 2. Installation & Running
```bash
# Clone the repository
git clone https://github.com/Ymien/NexusVoice-2.5.git
cd NexusVoice-2.5

# Install dependencies
npm install

# Start local development server
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## 🎨 Theme Guide

The system includes multiple design-language level UI themes:
1. **Light**: Minimalist white cards with large rounded corners and soft shadows, perfect for daily office use.
2. **Dark**: Dark background with high-contrast text to protect your eyes.
3. **Neon Cyber**: Sharp edges, neon glowing shadows, and cyberpunk color schemes.
4. **Pastel Macaron**: Extra-large rounded corners, soft pastel colors, and flat design.
5. **Neo Brutalism**: Strong contrast, thick borders, and hard shadows for a striking visual impact.
6. **Glassmorphism**: Global frosted glass effects for a premium, semi-transparent texture.

## ⚙️ Configuration Guide
All settings related to the LLM API Key, system themes, background video URLs, and wake words can be visually configured directly in the **"Settings"** panel located in the top right corner of the web page. Configuration data is automatically saved in your browser's local storage.

## 🛡️ Security Commitment
This project is completely open-source and commits to not collecting or uploading any user API Keys or conversation data.

## 📄 License
This project is open-source under the [MIT License](./LICENSE).
