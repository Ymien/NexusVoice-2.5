import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Mic, MicOff, Settings, Send } from 'lucide-react';

// 声明全局变量，防止 TS 报错，因为不是所有浏览器都有 webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/**
 * 语音控制与输入组件
 * 功能：处理语音唤醒、录音转文字、调用后端大模型、以及文字转语音播报
 */
const VoiceControl: React.FC = () => {
  const {
    wakeWord,
    initialReply,
    ttsVoice,
    modelProvider,
    apiKey,
    customApiUrl,
    customModelName,
    isPlayingVideo,
    setPlayingVideo,
    messages,
    addMessage,
    clearMessages,
    isSettingsOpen,
    setSettingsOpen
  } = useStore();

  const [textInput, setTextInput] = useState('');
  const [isListening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 初始化语音识别对象
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // 每次识别完一句话就停止
      recognition.interimResults = false;
      recognition.lang = 'zh-CN'; // 默认中文

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('识别结果:', transcript);
        
        // 检查是否包含唤醒词
        if (transcript.includes(wakeWord)) {
          handleWakeUp();
        } else {
          // 如果没有唤醒词，但当前处于录音状态，就把这段话作为用户输入发送
          handleSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('当前浏览器不支持语音识别 Web Speech API');
    }
  }, [wakeWord]);

  /**
   * 处理唤醒逻辑
   */
  const handleWakeUp = () => {
    // 播报初始回复
    speakText(initialReply);
    addMessage({
      id: Date.now().toString(),
      role: 'ai',
      content: initialReply,
      timestamp: Date.now()
    });
    // 可以在此处重新启动录音，听取用户后续问题
    setTimeout(() => {
      startListening();
    }, 2000);
  };

  /**
   * 将文字转为语音播放 (TTS)
   * @param text 要播报的文本
   */
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    // 清除可能卡住的语音队列
    window.speechSynthesis.cancel();

    // 播放视频
    setPlayingVideo(true);

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
      setPlayingVideo(false);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setPlayingVideo(false);
    };

    (window as any)._currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  /**
   * 发送消息给后端，并处理返回结果
   * @param message 用户消息
   */
  const handleSend = async (message: string = textInput) => {
    if (!message.trim()) return;

    // 停止当前的语音识别（如果有）
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const msgText = message.trim();
    setTextInput(''); // 清空输入框

    // 添加用户消息到聊天面板
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: msgText,
      timestamp: Date.now()
    });

    try {
      // 准备发送给后端的请求数据
      // 如果用户选择了默认模型，不传递 apiKey，让后端使用系统环境变量或默认密钥
      const requestData = {
        message: msgText,
        model_provider: modelProvider,
        api_key: modelProvider === 'custom' ? apiKey : '', // 默认模型不再从前端传key，由后端管理
        api_url: modelProvider === 'custom' ? customApiUrl : '',
        custom_model_name: customModelName
      };

      // 如果在桌面客户端 (file://) 中运行，则使用你部署在云端的 Vercel 后端地址；否则使用相对路径
      const isDesktop = window.location.protocol === 'file:';
      const apiUrl = isDesktop ? 'https://nexusvoice-2-5.vercel.app/api/chat' : '/api/chat';

      // 发起请求
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 添加AI消息到聊天面板
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply,
        timestamp: Date.now() + 1
      });

      // 将AI回复转为语音播报并播放视频
      speakText(data.reply);

    } catch (error: any) {
      console.error('发送消息失败:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `抱歉，发生了错误: ${error.message}`,
        timestamp: Date.now() + 1
      });
    }
  };

  /**
   * 手动点击开始/停止录音
   */
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      startListening();
    }
  };

  /**
   * 启动录音
   */
  const startListening = () => {
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('识别已经启动', e);
    }
  };

  return (
    <div className="w-full flex items-center gap-3 p-3 lg:p-4 bg-transparent rounded-3xl">
      {/* 录音按钮 (Morphing design) */}
      <button
        onClick={toggleListening}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl sm:rounded-3xl transition-all duration-500 shadow-xl shrink-0 border group ${
          isListening
            ? 'bg-rose-500 text-white border-rose-400/50 shadow-rose-500/40 animate-pulse'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400/50 shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1'
        }`}
        title={isListening ? "停止录音" : "开始录音"}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
        ) : (
          <Mic className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
        )}
      </button>

      {/* 文本输入框 */}
      <div className="flex-1 relative group h-14 sm:h-16">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="Type or speak a command..."
          className="w-full h-full pl-5 pr-14 text-[15px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner placeholder-slate-400 dark:placeholder-slate-500"
        />
        
        {/* 内置发送按钮 */}
        <button
          onClick={() => handleSend()}
          disabled={!textInput.trim()}
          className="absolute right-2 top-2 bottom-2 w-10 sm:w-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl sm:rounded-2xl flex items-center justify-center transition-all"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default VoiceControl;
