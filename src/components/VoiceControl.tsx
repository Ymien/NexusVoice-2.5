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
    isListening,
    setListening,
    addMessage,
    setPlayingVideo,
    setSettingsOpen
  } = useStore();

  const [textInput, setTextInput] = useState('');
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
      content: initialReply
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

    // 播放视频
    setPlayingVideo(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    
    // 尝试根据设置选择男声或女声（不同的系统/浏览器支持情况不同）
    const voices = window.speechSynthesis.getVoices();
    const isMale = ttsVoice === 'male';
    const preferredVoice = voices.find(v => 
      v.lang.includes('zh') && 
      (isMale ? v.name.toLowerCase().includes('male') || v.name.includes('男') : v.name.toLowerCase().includes('female') || v.name.includes('女'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      // 播报结束，停止视频
      setPlayingVideo(false);
    };

    utterance.onerror = () => {
      setPlayingVideo(false);
    };

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
      content: msgText
    });

    try {
      // 准备发送给后端的请求数据
      const requestData = {
        message: msgText,
        model_provider: modelProvider,
        api_key: apiKey,
        api_url: customApiUrl
      };

      // 调用 Vercel 上的 Python Serverless 接口或本地的 Vite 代理
      const response = await fetch('/api/chat', {
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
        content: data.reply
      });

      // 将AI回复转为语音播报并播放视频
      speakText(data.reply);

    } catch (error: any) {
      console.error('发送消息失败:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `抱歉，发生了错误: ${error.message}`
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
    <div className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      {/* 录音按钮 */}
      <button
        onClick={toggleListening}
        className={`p-3 sm:p-4 rounded-full transition-all duration-300 shadow-md shrink-0 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-red-500/50'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-zinc-800 dark:text-blue-400'
        }`}
        title={isListening ? "停止录音" : "开始录音"}
      >
        {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* 文本输入框 */}
      <input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
        placeholder="说出唤醒词或手动输入..."
        className="flex-1 min-w-0 p-2 sm:p-3 text-sm sm:text-base bg-gray-100 dark:bg-zinc-800 border-none rounded-xl text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />

      {/* 发送按钮 */}
      <button
        onClick={() => handleSend()}
        disabled={!textInput.trim()}
        className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all shrink-0"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* 设置按钮 */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="hidden sm:block p-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-400 rounded-xl transition-all shrink-0"
        title="系统设置"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default VoiceControl;
