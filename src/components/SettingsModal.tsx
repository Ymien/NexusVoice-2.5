import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

/**
 * 设置面板组件
 * 功能：配置系统使用的所有参数，如大模型提供商、API Key、唤醒词、视频URL等
 */
const SettingsModal: React.FC = () => {
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
    theme,
    setSettings
  } = useStore();

  // 如果没有打开，直接不渲染
  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-900 w-[90%] max-w-lg rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* 关闭按钮 */}
        <button
          onClick={() => setSettingsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-zinc-100">系统配置</h2>

        {/* 滚动表单区 */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5">
          {/* 界面及主题配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">界面配置</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700 dark:text-zinc-300">系统主题 (Theme)</label>
              <select
                value={theme}
                onChange={(e) => setSettings({ theme: e.target.value as 'light' | 'dark' | 'dopamine-neon' | 'dopamine-macaron' | 'dopamine-sunset' })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="light">清爽浅色 (Light)</option>
                <option value="dark">沉浸深色 (Dark)</option>
                <option value="dopamine-neon">赛博多巴胺 (Neon Cyber)</option>
                <option value="dopamine-macaron">马卡龙多巴胺 (Pastel Macaron)</option>
                <option value="dopamine-sunset">日落多巴胺 (Sunset Horizon)</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-zinc-800" />

          {/* 大模型配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">大模型配置</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700 dark:text-zinc-300">API 提供商</label>
              <select
                value={modelProvider}
                onChange={(e) => setSettings({ modelProvider: e.target.value as any })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="glm">GLM-4</option>
                <option value="deepseek">DeepSeek</option>
                <option value="doubao">豆包</option>
                <option value="custom">自定义 (其他)</option>
              </select>
            </div>

            {/* 仅在选择自定义模型时显示 API Key 和 URL 配置 */}
            {modelProvider === 'custom' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-700 dark:text-zinc-300">API Key (密钥)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setSettings({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-700 dark:text-zinc-300">自定义接口地址 (API URL)</label>
                  <input
                    type="text"
                    value={customApiUrl}
                    onChange={(e) => setSettings({ customApiUrl: e.target.value })}
                    placeholder="例如: https://api.openai.com/v1/chat/completions"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-700 dark:text-zinc-300">模型名称 (Model Name)</label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setSettings({ customModelName: e.target.value })}
                    placeholder="例如: gpt-3.5-turbo"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                    * 使用自定义模型时，必须填写完整的接口地址和模型标识名称
                  </p>
                </div>
              </>
            )}
          </div>

          <hr className="border-gray-200 dark:border-zinc-800" />

          {/* 语音及视频配置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">语音与视频配置</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700 dark:text-zinc-300">唤醒词</label>
              <input
                type="text"
                value={wakeWord}
                onChange={(e) => setSettings({ wakeWord: e.target.value })}
                placeholder="例如: 小艾"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700 dark:text-zinc-300">首次唤醒回复</label>
              <input
                type="text"
                value={initialReply}
                onChange={(e) => setSettings({ initialReply: e.target.value })}
                placeholder="例如: 我在呢"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700 dark:text-zinc-300">TTS 音色</label>
              <select
                value={ttsVoice}
                onChange={(e) => setSettings({ ttsVoice: e.target.value as 'male' | 'female' })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="female">女声</option>
                <option value="male">男声</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700 dark:text-zinc-300">视频源 URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setSettings({ videoUrl: e.target.value })}
                placeholder="输入MP4等视频地址"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-colors"
          >
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
