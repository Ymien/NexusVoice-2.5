import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * 聊天面板组件
 * 功能：展示用户和 AI 的历史对话内容，支持自动滚动到最新消息
 */
const ChatPanel: React.FC = () => {
  // 获取全局聊天消息
  const { messages } = useStore();
  // 引用聊天容器底部的元素，用于实现自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 每次消息更新后，自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'  // 用户的消息气泡样式
                    : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-sm border border-gray-100 dark:border-zinc-700' // AI消息的气泡样式
                }`}
              >
                {msg.content}
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
