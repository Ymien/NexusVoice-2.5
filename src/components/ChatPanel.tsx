import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Volume2, Square } from 'lucide-react';

/**
 * 聊天面板组件
 * 功能：展示用户和 AI 的历史对话内容，支持自动滚动到最新消息，并支持手动点击朗读
 */
const ChatPanel: React.FC = () => {
  // 获取全局聊天消息和设置
  const { messages, setPlayingVideo, ttsVoice } = useStore();
  // 引用聊天容器底部的元素，用于实现自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 记录当前正在朗读的消息 ID
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // 每次消息更新后，自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 组件卸载时停止语音播报
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setPlayingVideo(false);
      }
    };
  }, []);

  /**
   * 手动触发文字转语音播报
   */
  const handleSpeak = (id: string, text: string) => {
    if (!window.speechSynthesis) {
      alert('您的浏览器不支持语音播报功能');
      return;
    }

    // 如果正在播放当前点击的消息，则停止播放
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setPlayingVideo(false);
      return;
    }

    // 取消正在播放的其他语音
    window.speechSynthesis.cancel();

    setPlayingVideo(true);
    setSpeakingId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';

    // 尝试根据设置选择男声或女声
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const isMale = ttsVoice === 'male';
      
      let preferredVoice = voices.find(v =>
        v.lang.includes('zh') &&
        (isMale ? (v.name.toLowerCase().includes('male') || v.name.includes('男')) : (v.name.toLowerCase().includes('female') || v.name.includes('女')))
      );

      if (!preferredVoice) {
        preferredVoice = voices.find(v => v.lang.includes('zh'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => {
      setSpeakingId(null);
      setPlayingVideo(false);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setSpeakingId(null);
      setPlayingVideo(false);
    };

    // Chrome/Safari 长文本不发声的黑科技补丁
    (window as any)._currentUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent p-4 lg:p-6 overflow-hidden z-10 relative">
      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 pr-2">
        {messages.length === 0 ? (
          // 当没有聊天记录时显示的占位提示
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium tracking-wide">等待接收语音指令...</p>
          </div>
        ) : (
          // 遍历并渲染聊天消息
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-5 py-3.5 text-[15px] shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20'  // 用户的消息气泡样式
                      : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700/50 shadow-slate-200/50 dark:shadow-none' // AI消息的气泡样式
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {/* 针对 AI 消息提供操作按钮：语音播报 */}
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                        speakingId === msg.id
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10'
                      }`}
                      title={speakingId === msg.id ? "停止播报" : "朗读消息"}
                    >
                      {speakingId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>停止播报</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>朗读消息</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {/* 这个空 div 作为滚动的锚点 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatPanel;
