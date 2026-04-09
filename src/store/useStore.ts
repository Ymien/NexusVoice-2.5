import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// ----------------- 类型定义 -----------------

// 定义单条聊天消息的结构
export interface Message {
  id: string;        // 消息的唯一标识
  role: 'user' | 'ai'; // 消息的发送者，'user'代表用户，'ai'代表系统
  content: string;   // 消息的具体内容文本
  timestamp?: number; // 兼容旧版或新版加的时间戳
}

// 定义系统的状态和行为接口
interface AppState {
  // 用户认证
  user: any | null;
  setUser: (user: any | null) => void;

  // 设置相关的状态
  theme: 'light' | 'dark' | 'dopamine'; // UI 主题
  setTheme: (theme: 'light' | 'dark' | 'dopamine') => void;
  wakeWord: string;          // 唤醒词，例如 "小艾"
  initialReply: string;      // 唤醒后的首次回复，例如 "我在呢"
  ttsVoice: 'male' | 'female'; // TTS发音人性别
  videoUrl: string;          // 同步播放的视频地址
  modelProvider: 'glm' | 'deepseek' | 'doubao' | 'custom';
  setModelProvider: (provider: 'glm' | 'deepseek' | 'doubao' | 'custom') => void;
  apiKey: string;            // LLM的API Key
  customApiUrl: string;      // 自定义API地址
  customModelName: string;   // 自定义模型的名称（例如 gpt-3.5-turbo）
  
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
  syncMessagesToCloud: () => Promise<void>;
  fetchMessagesFromCloud: () => Promise<void>;
}

// ----------------- Zustand 状态管理库实例化 -----------------

// 使用 persist 中间件，自动将设置相关的数据持久化保存到浏览器的 localStorage 中
// 以防止刷新页面后丢失用户的配置信息
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户认证
      user: null,
      setUser: (user) => {
        set({ user });
        if (user) {
          get().fetchMessagesFromCloud();
        }
      },

      // 默认设置值
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      wakeWord: '小艾',
      initialReply: '我在呢，请问有什么可以帮您？',
      ttsVoice: 'female',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // 默认占位视频
      modelProvider: 'glm',
      setModelProvider: (provider) => set({ modelProvider: provider }),
      apiKey: '', // 前端不再存储默认的 API Key，后端直接使用字典映射
      customApiUrl: '',
      customModelName: '',

      // 默认运行时状态
      messages: [],
      isListening: false,
      isPlayingVideo: false,
      isSettingsOpen: false,

      // 状态修改实现
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
      addMessage: async (msg) => {
        set((state) => ({ messages: [...state.messages, msg] }));
        const { user } = get();
        if (user) {
          // 异步保存到 Supabase
          await supabase.from('chat_history').insert({
            user_id: user.id,
            message_id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date().toISOString()
          }).then(res => { if (res.error) console.error(res.error); });
        }
      },
      setListening: (listening) => set({ isListening: listening }),
      setPlayingVideo: (playing) => set({ isPlayingVideo: playing }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      clearMessages: async () => {
        set({ messages: [] });
        const { user } = get();
        if (user) {
          await supabase.from('chat_history').delete().eq('user_id', user.id).then(res => { if(res.error) console.error(res.error); });
        }
      },

      syncMessagesToCloud: async () => {
        const { user, messages } = get();
        if (!user || messages.length === 0) return;
        // 简单实现：这里可以添加批量同步逻辑
      },

      fetchMessagesFromCloud: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: true });
          
          if (error) throw error;
          if (data && data.length > 0) {
            const cloudMessages: Message[] = data.map(d => ({
            id: d.message_id,
            role: d.role as 'user' | 'ai',
            content: d.content,
            timestamp: new Date(d.timestamp).getTime()
          }));
            set({ messages: cloudMessages });
          }
        } catch (err) {
          console.error("同步云端记录失败", err);
        }
      },
    }),
    {
      name: 'voice-chat-storage', // localStorage 中的键名
      partialize: (state) => ({
        theme: state.theme,
        wakeWord: state.wakeWord,
        initialReply: state.initialReply,
        ttsVoice: state.ttsVoice,
        videoUrl: state.videoUrl,
        modelProvider: state.modelProvider,
        apiKey: state.apiKey,
        customApiUrl: state.customApiUrl,
        customModelName: state.customModelName,
        messages: state.user ? [] : state.messages // 如果已登录，不持久化到本地，从云端拉取
      }),
    }
  )
);
