import React, { useEffect, useState } from 'react';
import { Sparkles, Sun, Moon, Cloud, Stars } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function WelcomeGreeting() {
  const { isPlayingVideo, theme } = useStore();
  const [greeting, setGreeting] = useState('');
  const [Icon, setIcon] = useState(() => Sun);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      let newGreeting = '早上好';
      let CurrentIcon = Sun;

      if (hour >= 5 && hour < 12) {
        newGreeting = '早上好';
        CurrentIcon = Sun;
      } else if (hour >= 12 && hour < 18) {
        newGreeting = '下午好';
        CurrentIcon = Cloud;
      } else if (hour >= 18 && hour < 22) {
        newGreeting = '晚上好';
        CurrentIcon = Moon;
      } else {
        newGreeting = '夜深了';
        CurrentIcon = Stars;
      }

      setGreeting(newGreeting);
      setIcon(() => CurrentIcon);
      
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8 transition-all duration-700 bg-[var(--bg-panel)] border border-[var(--border-color)]">
      
      {/* Decorative Background Gradients based on theme */}
      <div className={`absolute inset-0 opacity-40 transition-opacity duration-1000 ${isPlayingVideo ? 'opacity-100' : ''}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] mix-blend-multiply bg-dopa-pink/30 dark:bg-purple-500/20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] mix-blend-multiply bg-dopa-blue/30 dark:bg-blue-500/20"></div>
        <div className="absolute top-[40%] left-[40%] w-[50%] h-[50%] rounded-full blur-[100px] mix-blend-multiply bg-dopa-yellow/30 dark:bg-emerald-500/20"></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-500 ${isPlayingVideo ? 'scale-110' : 'scale-100'}`}>
        
        <div className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center shadow-xl shadow-[var(--accent-glow)] transition-all duration-700 ${isPlayingVideo ? 'animate-bounce shadow-2xl bg-gradient-to-tr from-dopa-pink to-dopa-yellow dark:from-indigo-500 dark:to-purple-500 text-white' : 'bg-gradient-to-tr from-dopa-blue to-dopa-mint dark:from-blue-600 dark:to-cyan-500 text-white'}`}>
          {isPlayingVideo ? <Sparkles className="w-10 h-10 animate-spin-slow" /> : <Icon className="w-10 h-10" />}
        </div>

        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-4">
          {greeting}
        </h2>
        
        <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium mb-8">
          {timeStr} · 等待你的指令
        </p>

        {isPlayingVideo && (
          <div className="flex items-center gap-2 mt-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-dopa-pink dark:bg-rose-400 animate-ping" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-dopa-yellow dark:bg-amber-400 animate-ping" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-dopa-blue dark:bg-blue-400 animate-ping" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-70">
              AI Speaking...
            </span>
          </div>
        )}
      </div>

      {/* Standby UI (when not playing) */}
      {!isPlayingVideo && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-[var(--border-color)] shadow-sm">
            <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-secondary)] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dopa-mint dark:bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-dopa-mint dark:bg-emerald-500"></span>
              </span>
              System Ready
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
