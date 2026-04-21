import { useCallback, useRef } from 'react';
import { TTS_CONFIG, LANGUAGE_MAP } from '../constants';

interface UseTTSOptions {
  lang: string;
  ttsVoice: 'male' | 'female';
  onStart: () => void;
  onEnd: () => void;
}

export function useTTS({ lang, ttsVoice, onStart, onEnd }: UseTTSOptions) {
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const ttsVoiceRef = useRef(ttsVoice);
  const langRef = useRef(lang);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onStartRef.current = onStart;
  onEndRef.current = onEnd;
  ttsVoiceRef.current = ttsVoice;
  langRef.current = lang;

  const cleanupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const applyVoiceAndSpeak = useCallback(
    (utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[]) => {
      const isMale = ttsVoiceRef.current === 'male';

      let preferredVoice = voices.find((v) => {
        const isZh = v.lang.includes('zh') || v.lang.includes('cmn');
        if (!isZh) return false;
        const name = v.name.toLowerCase();

        if (isMale) {
          return (
            name.includes('yunxi') ||
            name.includes('yunjian') ||
            name.includes('male')
          );
        } else {
          return (
            name.includes('xiaoxiao') ||
            name.includes('natural') ||
            name.includes('online') ||
            name.includes('female')
          );
        }
      });

      if (!preferredVoice) {
        preferredVoice = voices.find((v) => v.lang.includes('zh') || v.lang.includes('cmn'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        cleanupPolling();
        onEndRef.current();
        currentUtteranceRef.current = null;
      };

      utterance.onerror = () => {
        cleanupPolling();
        onEndRef.current();
        currentUtteranceRef.current = null;
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        pollingIntervalRef.current = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            cleanupPolling();
          }
        }, TTS_CONFIG.POLLING_INTERVAL_MS);
      }, TTS_CONFIG.SPEAK_DELAY_MS);
    },
    [cleanupPolling]
  );

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      cleanupPolling();

      onStartRef.current();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;
      const targetLang = LANGUAGE_MAP[langRef.current as keyof typeof LANGUAGE_MAP] || 'zh-CN';
      utterance.lang = targetLang;
      utterance.rate = TTS_CONFIG.RATE;
      utterance.pitch = TTS_CONFIG.PITCH;
      utterance.volume = TTS_CONFIG.VOLUME;

      const voices = window.speechSynthesis.getVoices();

      if (voices.length === 0) {
        const handleVoicesChanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices();
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          applyVoiceAndSpeak(utterance, loadedVoices);
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      } else {
        applyVoiceAndSpeak(utterance, voices);
      }
    },
    [cleanupPolling, applyVoiceAndSpeak]
  );

  const cancelSpeech = useCallback(() => {
    cleanupPolling();
    currentUtteranceRef.current = null;
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    onEndRef.current();
  }, [cleanupPolling]);

  return { speak, cancelSpeech };
}
