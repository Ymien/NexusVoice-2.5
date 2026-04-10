import { useI18n } from '../store/useI18n';
import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

/**
 * 设置面板组件
 * 功能：配置系统使用的所有参数，如大模型提供商、API Key、唤醒词、视频URL等
 */
const SettingsModal: React.FC = () => {
  const { t, lang, setLang } = useI18n();
  // 从全局状态中读取设置相关的变量及方法
  const {
    isSettingsOpen,
    setSettingsOpen,
    wakeWord,
    initialReply,
    ttsVoice,
    videoUrl,
    modelProvider,
    apiKey,
    customApiUrl,
    customModelName,
    systemPrompt,
    setSettings,
    theme,
    setTheme
  } = useStore();

  // 如果没有打开，直接不渲染
  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-panel border-panel border border-border shadow-panel w-[90%] max-w-2xl rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* 关闭按钮 */}
        <button
          onClick={() => setSettingsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-base hover:bg-base text-muted transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-main">{t("settings.title")}</h2>

        {/* 滚动表单区 */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5">
          
          {/* 界面与语言配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{t('settings.uiConfig')}</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">{t('settings.language')}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as 'en' | 'zh')}
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="zh">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">UI 主题 / Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="light">{t('settings.themeLight')}</option>
                <option value="dark">{t('settings.themeDark')}</option>
                <option value="neon">{t('settings.themeNeon')}</option>
                <option value="macaron">{t('settings.themeMacaron')}</option>
                <option value="brutalist">{t('settings.themeBrutalist')}</option>
                <option value="glass">{t('settings.themeGlass')}</option>
              </select>
            </div>
          </div>

          {/* 大模型配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{t('settings.modelConfig')}</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">API Provider</label>
              <select
                value={modelProvider}
                onChange={(e) => setSettings({ modelProvider: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="doubao">豆包 (Doubao)</option>
                <option value="glm">智谱 GLM</option>
                <option value="custom">{t('settings.customModel')}</option>
              </select>
            </div>

            {modelProvider !== 'custom' ? (
              <div className="p-3 bg-base border border-border rounded-lg text-sm text-muted">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                  {t('settings.defaultKeyNote')}
                </span>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-main">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setSettings({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-main">API URL</label>
                  <input
                    type="text"
                    value={customApiUrl}
                    onChange={(e) => setSettings({ customApiUrl: e.target.value })}
                    placeholder="https://api.example.com/v1/chat/completions"
                    className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-main">{t('settings.customModelName')}</label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setSettings({ customModelName: e.target.value })}
                    placeholder="gpt-4o"
                    className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">{t('settings.systemPrompt')}</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSettings({ systemPrompt: e.target.value })}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* 语音及视频配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{t("settings.voiceVideoConfig")}</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">{t('settings.wakeWord')}</label>
              <input
                type="text"
                value={wakeWord}
                onChange={(e) => setSettings({ wakeWord: e.target.value })}
                placeholder="例如: 小艾"
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">首次唤醒回复</label>
              <input
                type="text"
                value={initialReply}
                onChange={(e) => setSettings({ initialReply: e.target.value })}
                placeholder="例如: 我在呢"
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">TTS 音色</label>
              <select
                value={ttsVoice}
                onChange={(e) => setSettings({ ttsVoice: e.target.value as 'male' | 'female' })}
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="female">{t('settings.female')}</option>
                <option value="male">{t('settings.male')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">{t('settings.videoUrl')}</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setSettings({ videoUrl: e.target.value })}
                placeholder="输入MP4等视频地址"
                className="w-full p-2.5 rounded-lg border border-border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-btn font-medium rounded-xl shadow-md transition-colors"
          >
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
