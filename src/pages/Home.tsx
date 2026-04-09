import React, { useState, useEffect } from 'react';
import ChatPanel from '../components/ChatPanel';
import VoiceControl from '../components/VoiceControl';
import VideoPlayer from '../components/VideoPlayer';
import SettingsModal from '../components/SettingsModal';
import AuthModal from '../components/AuthModal';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Settings, LogOut, User, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const messages = useStore((state) => state.messages);
  const clearMessages = useStore((state) => state.clearMessages);
  const theme = useStore((state) => state.theme);

  const [isAuthOpen, setAuthOpen] = useState(false);

  // Apply theme to document element for global CSS
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-dopamine');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'dopamine') {
      root.classList.add('theme-dopamine');
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden transition-colors duration-300">
      {/* 顶部导航栏 (Glassmorphism) */}
      <header className="h-16 shrink-0 bg-[var(--bg-primary)]/70 backdrop-blur-xl border-b border-[var(--border-color)] z-20 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 border border-white/10">
            <Mic2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2 leading-none">
              NexusVoice
              <span className="hidden sm:flex px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wider font-bold items-center gap-1 border border-blue-500/20">
                <Sparkles className="w-3 h-3" />
                v2.5
              </span>
            </h1>
            <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Multimodal AI Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
                {user.email?.split('@')[0]}
              </span>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-full transition-all shadow-sm active:scale-95"
            >
              <span>登录账户</span>
            </button>
          )}

          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-full transition-all shadow-sm active:scale-95"
            title="系统设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 主要内容区域 (Fluid Grid Layout) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 sm:p-4 lg:p-6 gap-4 lg:gap-6 relative z-10 h-[calc(100vh-4rem)]">
        
        {/* 左侧控制与视频面板 (Sidebar) */}
        <aside className="w-full md:w-[360px] lg:w-[420px] xl:w-[480px] shrink-0 flex flex-col gap-4 lg:gap-6 overflow-y-auto md:overflow-visible">
          {/* 视频监控卡片 / 重新设计为极简 AI 视觉模块 */}
          <div className="w-full aspect-video md:aspect-auto md:flex-1 rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] relative group min-h-[220px] transition-all duration-500">
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[var(--bg-primary)]/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-[var(--text-primary)] tracking-widest uppercase">NEXUS AI</span>
            </div>
            <VideoPlayer />
          </div>

          {/* 语音交互控制台 */}
          <div className="shrink-0 bg-[var(--bg-panel)] rounded-3xl p-1 shadow-xl border border-[var(--border-color)]">
            <VoiceControl />
          </div>
        </aside>

        {/* 右侧聊天主面板 (Main Content) */}
        <section className="flex-1 flex flex-col min-w-0 bg-[var(--bg-panel)] rounded-3xl shadow-xl border border-[var(--border-color)] overflow-hidden relative">
          <div className="h-14 shrink-0 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--bg-primary)]/50 z-20">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <LayoutDashboard className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wide">对话流 (Conversation Stream)</h2>
            </div>
            
            {messages.length > 0 && (
              <button 
                onClick={clearMessages}
                className="text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors"
              >
                清空对话
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {/* 绝对定位的背景装饰 */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30 dark:opacity-10 z-0">
              <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px]"></div>
              <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 blur-[100px]"></div>
            </div>
            
            <ChatPanel />
          </div>
        </section>

      </main>

      <SettingsModal />
      <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
