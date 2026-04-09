import React, { useState, useEffect } from 'react';
import ChatPanel from '../components/ChatPanel';
import VoiceControl from '../components/VoiceControl';
import VideoPlayer from '../components/VideoPlayer';
import SettingsModal from '../components/SettingsModal';
import AuthModal from '../components/AuthModal';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Settings, LogOut, User, Mic2, Sparkles } from 'lucide-react';

export default function Home() {
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  
  const [isAuthOpen, setAuthOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Mic2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                NexusVoice
                <span className="hidden sm:flex px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  v2.5
                </span>
              </h1>
              <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium">多模态智能语音交互系统</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                <span className="hidden sm:flex text-sm text-gray-600 dark:text-gray-300 items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">登录 / 注册</span>
                <span className="sm:hidden">登录</span>
              </button>
            )}
            
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              title="系统设置"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col h-auto md:h-[calc(100vh-5rem)]">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 flex-1 min-h-0 md:h-full">
          {/* 左侧：视频播放区域 */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 sm:gap-6 min-h-0 md:h-full">
            <div className="w-full aspect-video md:aspect-auto md:flex-1 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-black min-h-[250px]">
              <VideoPlayer />
            </div>
            <div className="shrink-0">
              <VoiceControl />
            </div>
          </div>

          {/* 右侧：聊天记录区域 */}
          <div className="w-full md:w-1/2 h-[500px] md:h-full min-h-[400px] md:min-h-0">
            <ChatPanel />
          </div>
        </div>
      </main>

      {/* 设置弹窗 */}
      <SettingsModal />
      
      {/* 登录弹窗 */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
