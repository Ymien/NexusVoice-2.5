import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { SPEECH_RECOGNITION_CONFIG, LANGUAGE_MAP } from '../constants';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface UseSpeechRecognitionOptions {
  wakeWord: string;
  lang: string;
  onWakeUp: () => void;
  onSpeech: (text: string) => void;
}

const isWakeWordDetected = (transcript: string, wakeWord: string): boolean => {
  const normalizedTranscript = transcript.trim();
  const normalizedWakeWord = wakeWord.trim();

  if (!normalizedTranscript || !normalizedWakeWord) return false;

  const idx = normalizedTranscript.indexOf(normalizedWakeWord);
  if (idx === -1) return false;

  const isCJK = (ch: string) => /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/.test(ch);
  const wakeWordIsCJK = isCJK(normalizedWakeWord.charAt(0));

  if (wakeWordIsCJK) {
    const chineseParticles = '的了吗呢吧啊呀哦哈嗯着过在地得上里来去给让被把从向对与和';

    const prevChar = idx > 0 ? normalizedTranscript.charAt(idx - 1) : '';
    const nextIdx = idx + normalizedWakeWord.length;
    const nextChar = nextIdx < normalizedTranscript.length ? normalizedTranscript.charAt(nextIdx) : '';

    const validPrefix =
      idx === 0 ||
      !isCJK(prevChar) ||
      prevChar === ' ' ||
      prevChar === ',' ||
      prevChar === '.' ||
      prevChar === '!' ||
      prevChar === '?';
    const validSuffix =
      nextIdx >= normalizedTranscript.length ||
      !isCJK(nextChar) ||
      chineseParticles.includes(nextChar) ||
      nextChar === ' ' ||
      nextChar === ',' ||
      nextChar === '.' ||
      nextChar === '!' ||
      nextChar === '?';

    return validPrefix && validSuffix;
  } else {
    const escaped = normalizedWakeWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
    return pattern.test(normalizedTranscript);
  }
};

export function useSpeechRecognition({ wakeWord, lang, onWakeUp, onSpeech }: UseSpeechRecognitionOptions) {
  const isListening = useStore((s) => s.isListening);
  const setListening = useStore((s) => s.setListening);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const onWakeUpRef = useRef(onWakeUp);
  const onSpeechRef = useRef(onSpeech);
  useEffect(() => {
    onWakeUpRef.current = onWakeUp;
    onSpeechRef.current = onSpeech;
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = SPEECH_RECOGNITION_CONFIG.CONTINUOUS;
    recognition.interimResults = SPEECH_RECOGNITION_CONFIG.INTERIM_RESULTS;
    recognition.lang = LANGUAGE_MAP[lang as keyof typeof LANGUAGE_MAP] || 'zh-CN';

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (isWakeWordDetected(transcript, wakeWord)) {
        onWakeUpRef.current();
      } else {
        onSpeechRef.current(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionEvent) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [wakeWord, lang, setListening]);

  const startListening = useCallback(() => {
    try {
      recognitionRef.current?.start();
    } catch {
      // recognition already started
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn('Speech Recognition not available');
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return { isListening, startListening, stopListening, toggleListening };
}
