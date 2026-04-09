import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------- 类型定义 -----------------

// 定义单条聊天消息的结构
export interface Message {
  id: string;        // 消息的唯一标识
  role: 'user' | 'ai'; // 消息的发送者，'user'代表用户，'ai'代表系统
  content: string;   // 消息的具体内容文本
}

// 定义系统的状态和行为接口
interface AppState {
  // 设置相关的状态
  wakeWord: string;          // 唤醒词，例如 "小艾"
  initialReply: string;      // 唤醒后的首次回复，例如 "我在呢"
  ttsVoice: 'male' | 'female'; // TTS发音人性别
  videoUrl: string;          // 同步播放的视频地址
  modelProvider: string;     // 使用的LLM提供商，如 doubao, deepseek, xiaomi, custom
  apiKey: string;            // LLM的API Key
  customApiUrl: string;      // 自定义API地址
  
  // 运行时的应用状态
  messages: Message[];       // 聊天记录数组
  isListening: boolean;      // 当前是否正在录音/倾听中
  isPlayingVideo: boolean;   // 当前是否正在播放视频（即AI正在讲话时）
  isSettingsOpen: boolean;   // 设置弹窗是否打开

  // 状态更新方法
  setSettings: (settings: Partial<AppState>) => void; // 更新设置
  addMessage: (msg: Message) => void;                 // 添加一条聊天消息
  setListening: (listening: boolean) => void;         // 设置录音状态
  setPlayingVideo: (playing: boolean) => void;        // 设置视频播放状态
  setSettingsOpen: (open: boolean) => void;           // 设置弹窗开关状态
  clearMessages: () => void;                          // 清空聊天记录
}

// ----------------- Zustand 状态管理库实例化 -----------------

// 使用 persist 中间件，自动将设置相关的数据持久化保存到浏览器的 localStorage 中
// 以防止刷新页面后丢失用户的配置信息
export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 默认设置值
      wakeWord: '小艾',
      initialReply: '我在呢，请问有什么可以帮您？',
      ttsVoice: 'female',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // 默认占位视频
      modelProvider: 'deepseek',
      apiKey: '',
      customApiUrl: '',

      // 默认运行时状态
      messages: [],
      isListening: false,
      isPlayingVideo: false,
      isSettingsOpen: false,

      // 状态修改实现
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      setListening: (listening) => set({ isListening: listening }),
      setPlayingVideo: (playing) => set({ isPlayingVideo: playing }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'voice-chat-storage', // localStorage 中的键名
      // 仅持久化保存设置相关的字段，运行时状态（如聊天记录和正在播放状态）不保存
      partialize: (state) => ({
        wakeWord: state.wakeWord,
        initialReply: state.initialReply,
        ttsVoice: state.ttsVoice,
        videoUrl: state.videoUrl,
        modelProvider: state.modelProvider,
        apiKey: state.apiKey,
        customApiUrl: state.customApiUrl,
      }),
    }
  )
);
