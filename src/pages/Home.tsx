import React from 'react';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import VoiceControl from '../components/VoiceControl';
import SettingsModal from '../components/SettingsModal';
import { Bot } from 'lucide-react';

/**
 * 主页组件
 * 功能：系统的主界面，整合了视频播放区、聊天面板和语音控制面板
 */
const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 p-4 md:p-8 flex flex-col items-center">
      {/* 顶部标题栏 */}
      <header className="w-full max-w-6xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">AI 虚拟助手</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">支持语音唤醒与音视频同步</p>
          </div>
        </div>
      </header>

      {/* 主体内容区：响应式布局，桌面端左右分栏，移动端上下堆叠 */}
      <main className="w-full max-w-6xl flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* 左侧：视频播放展示区 */}
        <section className="flex-1 lg:flex-[1.2] h-64 lg:h-full min-h-[300px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-zinc-800 relative">
          <VideoPlayer />
        </section>

        {/* 右侧：聊天记录与控制面板区 */}
        <section className="flex-1 lg:flex-[0.8] flex flex-col h-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800">
          <div className="flex-1 p-4 overflow-hidden">
            <ChatPanel />
          </div>
          <VoiceControl />
        </section>

      </main>

      {/* 浮动设置弹窗 */}
      <SettingsModal />
    </div>
  );
};

export default Home;
