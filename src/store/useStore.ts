import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_VIDEO_URL } from '../constants';
import type { ThemeType } from '../constants';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface AppState {
  // Persistent settings
  wakeWord: string;
  initialReply: string;
  ttsVoice: 'male' | 'female';
  videoUrl: string;
  modelProvider: string;
  apiKey: string;
  customApiUrl: string;
  customModelName: string;
  systemPrompt: string;
  theme: ThemeType;

  // Transient state
  messages: Message[];
  isListening: boolean;
  isPlayingVideo: boolean;
  isSettingsOpen: boolean;
  isGenerating: boolean;
  abortController: AbortController | null;

  // Actions
  setTheme: (theme: ThemeType) => void;
  setSettings: (settings: Partial<AppState>) => void;
  addMessage: (msg: Message) => void;
  setListening: (listening: boolean) => void;
  setPlayingVideo: (playing: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  clearMessages: () => void;
  setGenerating: (val: boolean) => void;
  setAbortController: (ctrl: AbortController | null) => void;
  undoLastInteraction: () => string | null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      wakeWord: '小艾',
      initialReply: '我在呢，请问有什么可以帮您？',
      ttsVoice: 'female' as const,
      videoUrl: DEFAULT_VIDEO_URL,
      modelProvider: 'deepseek',
      apiKey: '',
      customApiUrl: '',
      customModelName: 'gpt-4o',
      systemPrompt: '你是一个贴心的助手，请用简短、自然的中文口语回答。',
      theme: 'dark' as const,
      setTheme: (theme) => set({ theme }),

      messages: [],
      isListening: false,
      isPlayingVideo: false,
      isSettingsOpen: false,
      isGenerating: false,
      abortController: null,

      setSettings: (settings) => set(settings),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      setListening: (listening) => set({ isListening: listening }),
      setPlayingVideo: (playing) => set({ isPlayingVideo: playing }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      clearMessages: () => set({ messages: [] }),
      setGenerating: (val) => set({ isGenerating: val }),
      setAbortController: (ctrl) => set({ abortController: ctrl }),
      undoLastInteraction: () => {
        const msgs = get().messages;
        if (msgs.length === 0) return null;

        let lastUserIdx = -1;
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === 'user') {
            lastUserIdx = i;
            break;
          }
        }

        if (lastUserIdx === -1) return null;

        const userMsg = msgs[lastUserIdx];
        set({ messages: msgs.slice(0, lastUserIdx) });
        return userMsg.content;
      },
    }),
    {
      name: 'nexusvoice-storage',
      partialize: (state) => ({
        theme: state.theme,
        wakeWord: state.wakeWord,
        initialReply: state.initialReply,
        ttsVoice: state.ttsVoice,
        videoUrl: state.videoUrl,
        modelProvider: state.modelProvider,
        customApiUrl: state.customApiUrl,
        customModelName: state.customModelName,
        systemPrompt: state.systemPrompt,
      }),
    }
  )
);
