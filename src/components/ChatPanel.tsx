import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Volume2, Square } from 'lucide-react';

/**
 * 聊天面板组件
 * 功能：展示用户和 AI 的历史对话内容，支持自动滚动到最新消息，并支持手动点击朗读
 */
const ChatPanel: React.FC = () => {
  // 获取全局聊天消息和设置
  const { messages, setVideoPlaying, voiceType } = useStore();
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
        setVideoPlaying(false);
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
      setVideoPlaying(false);
      return;
    }

    // 取消正在播放的其他语音
    window.speechSynthesis.cancel();

    setVideoPlaying(true);
    setSpeakingId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';

    // 尝试根据设置选择男声或女声
    const voices = window.speechSynthesis.getVoices();
    const isMale = voiceType === 'male';
    const preferredVoice = voices.find(v =>
      v.lang.includes('zh') &&
      (isMale ? v.name.toLowerCase().includes('male') || v.name.includes('男') : v.name.toLowerCase().includes('female') || v.name.includes('女'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setSpeakingId(null);
      setVideoPlaying(false);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
      setVideoPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl shadow-inner p-4 overflow-hidden border border-gray-200 dark:border-zinc-800">
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
        {messages.length === 0 ? (
          // 当没有聊天记录时显示的占位提示
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-zinc-500">
            <p>通过唤醒词或者点击麦克风开始聊天吧</p>
          </div>
        ) : (
          // 遍历并渲染聊天消息
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-[85%] sm:max-w-[80%] group">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'  // 用户的消息气泡样式
                      : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-sm border border-gray-100 dark:border-zinc-700' // AI消息的气泡样式
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                
                {/* 针对 AI 消息提供操作按钮：语音播报 */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                        speakingId === msg.id 
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      title={speakingId === msg.id ? "停止播报" : "朗读消息"}
                    >
                      {speakingId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>停止</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>朗读</span>
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
