import React, { useState, useEffect } from 'react';
import ChatPanel from '../components/ChatPanel';
import VoiceControl from '../components/VoiceControl';
import VideoPlayer from '../components/VideoPlayer';
import SettingsModal from '../components/SettingsModal';
import AuthModal from '../components/AuthModal';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Settings, LogOut, User } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">NV</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              NexusVoice 2.5
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                登录 / 注册
              </button>
            )}
            
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              title="系统设置"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：视频播放区域 */}
          <div className="space-y-6">
            <VideoPlayer />
            <VoiceControl />
          </div>

          {/* 右侧：聊天记录区域 */}
          <div className="h-[calc(100vh-12rem)] min-h-[500px]">
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
