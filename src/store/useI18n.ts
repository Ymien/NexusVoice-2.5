import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NestedRecord = { [key: string]: string | NestedRecord };

const en: NestedRecord = {
  app: {
    title: 'NexusVoice',
    settings: 'Settings',
    stop: 'Stop',
    undo: 'Undo',
    edit: 'Edit',
  },
  voice: {
    placeholder: 'Type or speak a command...',
    send: 'Send',
  },
  chat: {
    emptyHint: 'Say the wake word or tap the mic to start',
  },
  video: {
    noSource: 'No video source',
    waiting: 'Waiting for wake...',
  },
  settings: {
    title: 'Settings',
    uiConfig: 'Appearance',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    modelConfig: 'Model Configuration',
    customModel: 'Custom (Other)',
    deepseekDefault: 'DeepSeek-V3.2 (Default)',
    doubaoDefault: 'Doubao-1.8 (Default)',
    glmDefault: 'GLM-4.7 (Default)',
    defaultKeyNote: 'Using default configuration. No key required.',
    customModelName: 'Custom Model Name',
    systemPrompt: 'System Prompt',
    voiceVideoConfig: 'Voice & Video',
    wakeWord: 'Wake Word',
    initialReply: 'Initial Reply',
    male: 'Male',
    female: 'Female',
    videoUrl: 'Background Video URL',
    close: 'Done',
  },
  error: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try refreshing.',
    reload: 'Reload',
  },
};

const zh: NestedRecord = {
  app: {
    title: 'NexusVoice',
    settings: '设置',
    stop: '停止',
    undo: '撤回',
    edit: '编辑',
  },
  voice: {
    placeholder: '输入指令或语音唤醒...',
    send: '发送',
  },
  chat: {
    emptyHint: '通过唤醒词或点击麦克风开始聊天',
  },
  video: {
    noSource: '暂无视频来源',
    waiting: '等待唤醒...',
  },
  settings: {
    title: '设置',
    uiConfig: '外观',
    themeLight: '浅色',
    themeDark: '深色',
    language: '语言',
    modelConfig: '大模型配置',
    customModel: '自定义 (其他)',
    deepseekDefault: 'DeepSeek-V3.2 (默认)',
    doubaoDefault: '豆包 Doubao-1.8 (默认)',
    glmDefault: '智谱 GLM-4.7 (默认)',
    defaultKeyNote: '已使用默认配置，无需密钥。',
    customModelName: '自定义模型名称',
    systemPrompt: '系统提示词',
    voiceVideoConfig: '语音与视频',
    wakeWord: '唤醒词',
    initialReply: '初始回复',
    male: '男声',
    female: '女声',
    videoUrl: '背景视频 URL',
    close: '完成',
  },
  error: {
    title: '出了点问题',
    message: '发生了意外错误，请尝试刷新页面。',
    reload: '刷新',
  },
};

const translations: Record<string, NestedRecord> = { en, zh };

const resolveKey = (obj: NestedRecord, keyPath: string): string => {
  const keys = keyPath.split('.');
  let current: string | NestedRecord = obj;
  for (const k of keys) {
    if (typeof current === 'string') return keyPath;
    current = (current as NestedRecord)[k];
    if (current === undefined) return keyPath;
  }
  return typeof current === 'string' ? current : keyPath;
};

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
      t: (key: string): string => {
        const dict = translations[get().lang];
        return dict ? resolveKey(dict, key) : key;
      },
    }),
    { name: 'nexusvoice-i18n' }
  )
);
