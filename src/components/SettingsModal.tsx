import { useI18n } from '../store/useI18n';
import type { FC } from 'react';
import { useStore } from '../store/useStore';
import { X, Palette, Cpu, Mic, Video } from 'lucide-react';
import type { ThemeType } from '../constants';
import { cn } from '../lib/utils';

const SettingsModal: FC = () => {
  const { t, lang, setLang } = useI18n();
  const isSettingsOpen = useStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const wakeWord = useStore((s) => s.wakeWord);
  const ttsVoice = useStore((s) => s.ttsVoice);
  const videoUrl = useStore((s) => s.videoUrl);
  const modelProvider = useStore((s) => s.modelProvider);
  const apiKey = useStore((s) => s.apiKey);
  const customApiUrl = useStore((s) => s.customApiUrl);
  const customModelName = useStore((s) => s.customModelName);
  const systemPrompt = useStore((s) => s.systemPrompt);
  const setSettings = useStore((s) => s.setSettings);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  if (!isSettingsOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSettingsOpen(false);
    }
  };

  const inputClasses =
    'w-full px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all';
  const labelClasses = 'text-xs font-medium text-muted-foreground uppercase tracking-wider';
  const sectionClasses = 'space-y-3';
  const sectionHeaderClasses = 'flex items-center gap-2 text-sm font-semibold text-foreground';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-card border border-border shadow-2xl w-[92%] max-w-xl rounded-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 id="settings-title" className="text-lg font-bold text-foreground">
            {t('settings.title')}
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label={t('settings.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Appearance */}
          <div className={sectionClasses}>
            <div className={sectionHeaderClasses}>
              <Palette size={16} className="text-primary" />
              {t('settings.uiConfig')}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="language-select" className={labelClasses}>
                  {t('settings.language')}
                </label>
                <select
                  id="language-select"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'en' | 'zh')}
                  className={inputClasses}
                >
                  <option value="zh">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="theme-select" className={labelClasses}>
                  Theme
                </label>
                <select
                  id="theme-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ThemeType)}
                  className={inputClasses}
                >
                  <option value="dark">{t('settings.themeDark')}</option>
                  <option value="light">{t('settings.themeLight')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Model Config */}
          <div className={sectionClasses}>
            <div className={sectionHeaderClasses}>
              <Cpu size={16} className="text-primary" />
              {t('settings.modelConfig')}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="provider-select" className={labelClasses}>
                  API Provider
                </label>
                <select
                  id="provider-select"
                  value={modelProvider}
                  onChange={(e) => setSettings({ modelProvider: e.target.value })}
                  className={inputClasses}
                >
                  <option value="deepseek">{t('settings.deepseekDefault')}</option>
                  <option value="doubao">{t('settings.doubaoDefault')}</option>
                  <option value="glm">{t('settings.glmDefault')}</option>
                  <option value="custom">{t('settings.customModel')}</option>
                </select>
              </div>

              {modelProvider !== 'custom' ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-xs text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary shrink-0"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  {t('settings.defaultKeyNote')}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="api-key-input" className={labelClasses}>
                      API Key
                    </label>
                    <input
                      id="api-key-input"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setSettings({ apiKey: e.target.value })}
                      placeholder="sk-..."
                      className={inputClasses}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="api-url-input" className={labelClasses}>
                      API URL
                    </label>
                    <input
                      id="api-url-input"
                      type="url"
                      value={customApiUrl}
                      onChange={(e) => setSettings({ customApiUrl: e.target.value })}
                      placeholder="https://api.example.com/v1/chat/completions"
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="model-name-input" className={labelClasses}>
                      {t('settings.customModelName')}
                    </label>
                    <input
                      id="model-name-input"
                      type="text"
                      value={customModelName}
                      onChange={(e) => setSettings({ customModelName: e.target.value })}
                      placeholder="gpt-4o"
                      className={inputClasses}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="system-prompt-textarea" className={labelClasses}>
                  {t('settings.systemPrompt')}
                </label>
                <textarea
                  id="system-prompt-textarea"
                  value={systemPrompt}
                  onChange={(e) => setSettings({ systemPrompt: e.target.value })}
                  rows={3}
                  className={cn(inputClasses, 'resize-none')}
                />
              </div>
            </div>
          </div>

          {/* Voice & Video */}
          <div className={sectionClasses}>
            <div className={sectionHeaderClasses}>
              <Mic size={16} className="text-primary" />
              {t('settings.voiceVideoConfig')}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="wake-word-input" className={labelClasses}>
                    {t('settings.wakeWord')}
                  </label>
                  <input
                    id="wake-word-input"
                    type="text"
                    value={wakeWord}
                    onChange={(e) => setSettings({ wakeWord: e.target.value })}
                    placeholder="e.g. Hey"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tts-voice-select" className={labelClasses}>
                    TTS Voice
                  </label>
                  <select
                    id="tts-voice-select"
                    value={ttsVoice}
                    onChange={(e) => setSettings({ ttsVoice: e.target.value as 'male' | 'female' })}
                    className={inputClasses}
                  >
                    <option value="female">{t('settings.female')}</option>
                    <option value="male">{t('settings.male')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="video-url-input" className={labelClasses}>
                  <div className="flex items-center gap-1.5">
                    <Video size={12} />
                    {t('settings.videoUrl')}
                  </div>
                </label>
                <input
                  id="video-url-input"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setSettings({ videoUrl: e.target.value })}
                  placeholder="MP4 video URL"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors"
            aria-label={t('settings.close')}
          >
            {t('settings.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
