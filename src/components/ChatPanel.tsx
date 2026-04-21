import { useI18n } from '../store/useI18n';
import { useEffect, useRef, useCallback, memo } from 'react';
import type { FC } from 'react';
import { useStore } from '../store/useStore';
import { Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';

const SCROLL_THRESHOLD = 100;

interface ChatMessageProps {
  msg: {
    id: string;
    role: 'user' | 'ai';
    content: string;
  };
}

const ChatMessage: FC<ChatMessageProps> = memo(({ msg }) => (
  <div
    className={cn(
      'flex gap-2.5 animate-fade-in-up',
      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
    )}
  >
    {/* Avatar */}
    <div
      className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
        msg.role === 'ai'
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
    </div>

    {/* Bubble */}
    <div
      className={cn(
        'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
        msg.role === 'user'
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-muted text-foreground rounded-bl-md'
      )}
    >
      {msg.content}
    </div>
  </div>
));

ChatMessage.displayName = 'ChatMessage';

const ChatPanel: FC = () => {
  const { t } = useI18n();
  const messages = useStore((s) => s.messages);
  const isGenerating = useStore((s) => s.isGenerating);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserNearBottomRef = useRef(true);

  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserNearBottomRef.current = checkIfNearBottom();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIfNearBottom]);

  useEffect(() => {
    if (isUserNearBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Bot size={28} className="text-primary/60" />
            </div>
            <p className="text-sm text-center max-w-[240px]">{t('chat.emptyHint')}</p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)
        )}

        {isGenerating && (
          <div className="flex gap-2.5 animate-fade-in-up">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={14} />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full waveform-bar"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full waveform-bar"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full waveform-bar"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default memo(ChatPanel);
