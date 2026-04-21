# NexusVoice - 项目上下文

## 技术栈

- **核心**: Vite 5, React 19, TypeScript, Express
- **UI**: Tailwind CSS 3, Lucide Icons
- **状态管理**: Zustand
- **国际化**: 自定义 i18n (useI18n store)

## 目录结构

```
├── scripts/            # 构建与启动脚本
├── server/             # 服务端逻辑
│   ├── routes/index.ts # API 路由 (/api/chat, /api/session/key, /api/health)
│   ├── server.ts       # Express 服务入口 (dev: port 3001, prod: port 5000)
│   └── vite.ts         # Vite 中间件集成 (生产环境静态文件服务)
├── src/                # 前端源码
│   ├── components/     # React 组件
│   │   ├── ChatPanel.tsx    # 聊天面板
│   │   ├── VideoPlayer.tsx  # 视频播放器
│   │   ├── VoiceControl.tsx # 语音控制栏
│   │   └── SettingsModal.tsx # 设置弹窗
│   ├── hooks/          # 自定义 Hooks
│   │   ├── useChatApi.ts          # 聊天 API 交互
│   │   ├── useTTS.ts              # 语音合成
│   │   └── useSpeechRecognition.ts # 语音识别
│   ├── store/          # Zustand 状态管理
│   │   ├── useStore.ts  # 应用状态
│   │   └── useI18n.ts   # 国际化
│   ├── pages/
│   │   └── Home.tsx     # 主页面布局
│   ├── lib/
│   │   └── utils.ts     # 工具函数 (cn)
│   ├── App.tsx          # 应用根组件
│   ├── constants.ts     # 常量定义
│   ├── index.css        # 全局样式与主题变量
│   └── index.tsx        # 入口文件
├── index.html          # 入口 HTML
├── package.json        # 项目依赖管理
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## 开发模式

- **前端**: Vite dev server (port 5000) + React HMR
- **API**: Express server (port 3001)，Vite 自动代理 `/api` 请求
- 启动命令: `pnpm dev` 或 `coze dev`

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 编码规范

- TypeScript `strict` 模式，禁止隐式 `any` 和 `as any`
- React 19: `useRef` 必须传初始值参数
- 使用语义化 Tailwind CSS 变量（`bg-background`, `text-foreground`, `bg-primary` 等）
- 禁止硬编码颜色值（Hex/RGB），使用 CSS 主题变量
- 组件使用 `memo` 优化渲染性能
