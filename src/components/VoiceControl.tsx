import { useState, memo, useCallback, useRef } from 'react';
import type { FC } from 'react';
import { useI18n } from '../store/useI18n';
import { useStore } from '../store/useStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTTS } from '../hooks/useTTS';
import { useChatApi } from '../hooks/useChatApi';
import { Mic, MicOff, Send, Pencil, Undo2, Square } from 'lucide-react';
import { CHAT_CONFIG } from '../constants';
import { cn } from '../lib/utils';

const VoiceControl: FC = memo(() => {
  const { t, lang } = useI18n();
  const wakeWord = useStore((state) => state.wakeWord);
  const initialReply = useStore((state) => state.initialReply);
  const ttsVoice = useStore((state) => state.ttsVoice);
  const addMessage = useStore((state) => state.addMessage);
  const setPlayingVideo = useStore((state) => state.setPlayingVideo);
  const undoLastInteraction = useStore((state) => state.undoLastInteraction);
  const messages = useStore((state) => state.messages);

  const [textInput, setTextInput] = useState('');

  const { speak } = useTTS({
    lang,
    ttsVoice,
    onStart: () => setPlayingVideo(true),
    onEnd: () => setPlayingVideo(false),
  });

  const { sendMessage, isGenerating, stopGeneration } = useChatApi();

  const handleSendAndSpeakRef = useRef<((message?: string) => Promise<void>) | null>(null);
  const handleWakeUpRef = useRef<(() => void) | null>(null);

  const { isListening, toggleListening, startListening, stopListening } = useSpeechRecognition({
    wakeWord,
    lang,
    onWakeUp: () => handleWakeUpRef.current?.(),
    onSpeech: (text: string) => handleSendAndSpeakRef.current?.(text),
  });

  const handleSendAndSpeak = useCallback(
    async (message: string = textInput) => {
      if (!message.trim() || isGenerating) return;
      stopListening();
      setTextInput('');
      const reply = await sendMessage(message.trim());
      if (reply) speak(reply);
    },
    [isGenerating, stopListening, sendMessage, speak, textInput]
  );
  handleSendAndSpeakRef.current = handleSendAndSpeak;

  const handleWakeUp = useCallback(() => {
    speak(initialReply);
    addMessage({
      id: crypto.randomUUID(),
      role: 'ai',
      content: initialReply,
    });
    setTimeout(() => startListening(), CHAT_CONFIG.RESTART_LISTENING_DELAY_MS);
  }, [speak, initialReply, addMessage, startListening]);
  handleWakeUpRef.current = handleWakeUp;

  const handleEdit = useCallback(() => {
    const content = undoLastInteraction();
    if (content) setTextInput(content);
  }, [undoLastInteraction]);

  return (
    <div className="px-4 lg:px-5 py-3 space-y-2.5">
      {/* Action buttons row */}
      {(messages.length > 0 || isGenerating) && (
        <div className="flex items-center gap-2">
          {isGenerating && (
            <button
              onClick={stopGeneration}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
              aria-label={t('app.stop')}
            >
              <Square size={10} className="fill-current" />
              {t('app.stop')}
            </button>
          )}
          {!isGenerating && messages.length > 0 && (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                aria-label={t('app.edit')}
              >
                <Pencil size={12} />
                {t('app.edit')}
              </button>
              <button
                onClick={() => undoLastInteraction()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors hover:text-destructive"
                aria-label={t('app.undo')}
              >
                <Undo2 size={12} />
                {t('app.undo')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Mic button */}
        <button
          onClick={toggleListening}
          className={cn(
            'p-2.5 rounded-xl transition-all duration-300 shrink-0',
            isListening
              ? 'bg-primary text-primary-foreground mic-pulse'
              : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
          )}
          title={isListening ? t('app.stopRecord') : t('app.startRecord')}
          aria-label={isListening ? t('app.stopRecord') : t('app.startRecord')}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Text input */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendAndSpeak();
          }}
          placeholder={t('voice.placeholder')}
          className="flex-1 px-3.5 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          aria-label={t('voice.placeholder')}
        />

        {/* Send button */}
        <button
          onClick={() => handleSendAndSpeak()}
          disabled={!textInput.trim() || isGenerating}
          className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shrink-0"
          aria-label={t('voice.send')}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
});

VoiceControl.displayName = 'VoiceControl';

export default VoiceControl;
