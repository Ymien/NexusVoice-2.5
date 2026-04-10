import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const en = {
  app: {
    title: "NexusVoice Core",
    login: "Login",
    settings: "Settings",
    startRecord: "Start Recording",
    stopRecord: "Stop Recording",
    conversationStream: "Conversation Stream",
    clearChat: "Clear Chat",
    readMessage: "Read Message",
    thinking: "Thinking...",
    stop: "Stop",
    undo: "Undo",
    edit: "Edit Input"
  },
  voice: {
    placeholder: "Type or speak a command...",
    send: "Send",
    noApiKey: "Please configure API Key in settings first",
    error: "Sorry, an error occurred: "
  },
  settings: {
    title: "System Settings",
    uiConfig: "UI Configuration",
    themeLight: "Light",
    themeDark: "Dark",
    themeNeon: "Neon Cyber",
    themeMacaron: "Pastel Macaron",
    themeBrutalist: "Neo Brutalism",
    themeGlass: "Glassmorphism",
    language: "Language",
    modelConfig: "Model Configuration",
    customModel: "Custom (Other)",
    deepseekDefault: "DeepSeek-V3 (Default)",
    doubaoDefault: "Doubao-pro (Default)",
    glmDefault: "GLM-4-Flash (Default)",
    apiKey: "API Key",
    defaultKeyNote: "Using default configuration. No key required.",
    customModelName: "Custom Model Name",
    systemPrompt: "System Prompt",
    voiceVideoConfig: "Voice & Video Configuration",
    wakeWord: "Wake Word",
    initialReply: "Initial Reply",
    voiceType: "Voice Type",
    male: "Male",
    female: "Female",
    videoUrl: "Background Video URL",
    saveClose: "Save & Close"
  }
};

const zh = {
  app: {
    title: "NexusVoice Core",
    login: "登录账户",
    settings: "系统设置",
    startRecord: "开始录音",
    stopRecord: "停止录音",
    conversationStream: "对话流 (Conversation Stream)",
    clearChat: "清空对话",
    readMessage: "朗读消息",
    thinking: "正在思考...",
    stop: "停止生成",
    undo: "撤回",
    edit: "更改输入"
  },
  voice: {
    placeholder: "输入指令或语音唤醒...",
    send: "发送",
    noApiKey: "请先在设置中配置 API Key",
    error: "抱歉，发生了错误："
  },
  settings: {
    title: "系统配置",
    uiConfig: "界面配置",
    themeLight: "清爽浅色 (Light)",
    themeDark: "沉浸深色 (Dark)",
    themeNeon: "赛博霓虹 (Neon Cyber)",
    themeMacaron: "马卡龙色 (Pastel Macaron)",
    themeBrutalist: "新粗野主义 (Neo Brutalism)",
    themeGlass: "拟态玻璃 (Glassmorphism)",
    language: "语言 / Language",
    modelConfig: "大模型配置",
    customModel: "自定义 (其他)",
    deepseekDefault: "DeepSeek-V3 (默认配置)",
    doubaoDefault: "豆包 Doubao-pro (默认配置)",
    glmDefault: "智谱 GLM-4-Flash (默认配置)",
    apiKey: "API Key",
    defaultKeyNote: "已使用默认配置，无需输入密钥。",
    customModelName: "自定义模型名称",
    systemPrompt: "系统提示词 (System Prompt)",
    voiceVideoConfig: "语音与视频配置",
    wakeWord: "唤醒词",
    initialReply: "初始回复",
    voiceType: "语音类型",
    male: "男声",
    female: "女声",
    videoUrl: "背景视频 URL",
    saveClose: "保存并关闭"
  }
};

const translations = { en, zh };

interface I18nStore {
  lang: 'zh' | 'en';
  setLang: (lang: 'zh' | 'en') => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      lang: 'zh',
      setLang: (lang) => set({ lang }),
      t: (key: string) => {
        const keys = key.split('.');
        let value: any = translations[get().lang];
        for (const k of keys) {
          if (value === undefined) break;
          value = value[k];
        }
        return value || key;
      }
    }),
    { name: 'i18n-store' }
  )
);
