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
    setSettings
  } = useStore();

  // 如果没有打开，直接不渲染
  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-panel border-panel border border-border shadow-panel w-[90%] max-w-lg rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* 关闭按钮 */}
        <button
          onClick={() => setSettingsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-base hover:bg-base text-muted transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-main">系统配置</h2>

        {/* 滚动表单区 */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5">
          {/* 大模型配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">大模型配置</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">API 提供商</label>
              <select
                value={modelProvider}
                onChange={(e) => setSettings({ modelProvider: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="doubao">豆包 (Doubao)</option>
                <option value="xiaomi">小米</option>
                <option value="custom">自定义 API</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setSettings({ apiKey: e.target.value })}
                placeholder="请输入 API 密钥"
                className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {modelProvider === 'custom' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-main">自定义 API URL</label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setSettings({ customApiUrl: e.target.value })}
                  placeholder="例如: https://your-custom-api.com/v1/chat/completions"
                  className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* 语音及视频配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">语音与视频配置</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">{t('settings.wakeWord')}</label>
              <input
                type="text"
                value={wakeWord}
                onChange={(e) => setSettings({ wakeWord: e.target.value })}
                placeholder="例如: 小艾"
                className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">首次唤醒回复</label>
              <input
                type="text"
                value={initialReply}
                onChange={(e) => setSettings({ initialReply: e.target.value })}
                placeholder="例如: 我在呢"
                className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-main">TTS 音色</label>
              <select
                value={ttsVoice}
                onChange={(e) => setSettings({ ttsVoice: e.target.value as 'male' | 'female' })}
                className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
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
                className="w-full p-2.5 rounded-lg border border-border border bg-base text-main focus:ring-2 focus:ring-primary outline-none"
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
