import { useI18n } from '../store/useI18n';
import React from 'react';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import VoiceControl from '../components/VoiceControl';
import SettingsModal from '../components/SettingsModal';
import { Sparkles, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

const Home: React.FC = () => {
  const { t } = useI18n();
  const { setSettingsOpen } = useStore();
  return (
    <div className="h-screen w-full bg-base flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">
      
      {/* 桌面端：卡片式应用程序布局 */}
      <div className="w-full max-w-[1400px] h-full max-h-[900px] bg-panel border border-border shadow-panel rounded-panel flex flex-col overflow-hidden relative">
        
        {/* 极简顶栏 */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-base/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Sparkles size={16} className="text-on-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-main">{t('app.title')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs font-medium text-muted bg-base px-3 py-1 rounded-full border border-border">
              v2.5.0
            </div>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted hover:text-main transition-colors"
              title={t('app.settings')}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* 核心内容区 */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* 左侧：视频/视觉中心 */}
          <section className="flex-1 lg:flex-[1.3] relative bg-black/5 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-border min-h-[30vh]">
            <div className="absolute inset-0 w-full h-full p-4 lg:p-6">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-black relative group">
                <VideoPlayer />
                {/* 装饰性光效 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none opacity-50 mix-blend-overlay"></div>
              </div>
            </div>
          </section>

          {/* 右侧：交互区 */}
          <section className="flex-1 lg:flex-[0.9] xl:flex-[0.8] flex flex-col h-full bg-panel relative z-10">
            {/* 聊天记录区 */}
            <div className="flex-1 overflow-hidden p-4 lg:p-6 pb-0">
              <div className="h-full rounded-2xl overflow-hidden border border-border shadow-inner bg-base/30">
                <ChatPanel />
              </div>
            </div>
            
            {/* 底部控制区 */}
            <div className="p-4 lg:p-6 pt-4 shrink-0">
              <VoiceControl />
            </div>
          </section>
          
        </main>
      </div>

      <SettingsModal />
    </div>
  );
};

export default Home;