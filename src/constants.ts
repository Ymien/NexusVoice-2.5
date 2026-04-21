export const LANGUAGE_MAP = {
  en: 'en-US',
  zh: 'zh-CN',
} as const;

export const TTS_CONFIG = {
  RATE: 1.0,
  PITCH: 1.0,
  VOLUME: 1.0,
  POLLING_INTERVAL_MS: 5000,
  SPEAK_DELAY_MS: 50,
} as const;

export const SCROLL_CONFIG = {
  THRESHOLD_PX: 100,
  TIMEOUT_MS: 700,
} as const;

export const SPEECH_RECOGNITION_CONFIG = {
  CONTINUOUS: false,
  INTERIM_RESULTS: false,
} as const;

export const CHAT_CONFIG = {
  MAX_HISTORY: 20,
  RESTART_LISTENING_DELAY_MS: 2000,
} as const;

export const DEFAULT_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

export type ThemeType = 'light' | 'dark';
