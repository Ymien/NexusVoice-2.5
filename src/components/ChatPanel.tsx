import { useI18n } from '../store/useI18n';
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * 聊天面板组件
 * 功能：展示用户和 AI 的历史对话内容，支持自动滚动到最新消息
 */
const ChatPanel: React.FC = () => {
  const { t } = useI18n();
  // 获取全局聊天消息
  const { messages } = useStore();
  // 引用聊天容器底部的元素，用于实现自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 每次消息更新后，自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-base rounded-panel shadow-inner p-4 overflow-hidden border border-border">
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
        {messages.length === 0 ? (
          // 当没有聊天记录时显示的占位提示
          <div className="h-full flex items-center justify-center text-muted">
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
                    ? 'bg-primary text-on-primary rounded-br-sm'  // 用户的消息气泡样式
                    : 'bg-panel text-main rounded-bl-sm border border-border' // AI消息的气泡样式
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
