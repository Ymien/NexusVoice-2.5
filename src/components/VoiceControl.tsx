import { useI18n } from '../store/useI18n';
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
  const { t, lang } = useI18n();
  const {
    wakeWord,
    initialReply,
    ttsVoice,
    modelProvider,
    apiKey,
    customApiUrl,
    customModelName,
    systemPrompt,
    isListening,
    setListening,
    addMessage,
    setPlayingVideo,
    isGenerating,
    setGenerating,
    abortController,
    setAbortController,
    undoLastInteraction,
    messages
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

    // 如果当前正在播报，才取消，避免在 Chrome PC 上频繁 cancel 导致直接无声
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setPlayingVideo(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    let voices = window.speechSynthesis.getVoices();
    
    // 如果浏览器声音列表未加载（常见于 Chrome 刚打开时），尝试注册回调重新获取
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak(utterance, voices);
      };
    } else {
      setVoiceAndSpeak(utterance, voices);
    }
  };

  const setVoiceAndSpeak = (utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[]) => {
    const isMale = ttsVoice === 'male';
    
    // 优先选择微软的高质量自然神经网络语音（Natural / Online / Xiaoxiao / Yunxi 等），这些语音极像真人
    let preferredVoice = voices.find(v => {
      const isZh = v.lang.includes('zh') || v.lang.includes('cmn');
      if (!isZh) return false;
      const name = v.name.toLowerCase();
      
      if (isMale) {
        return name.includes('yunxi') || name.includes('yunjian') || name.includes('男') || name.includes('male');
      } else {
        // 女性优先匹配高质量人声
        return name.includes('xiaoxiao') || name.includes('natural') || name.includes('online') || name.includes('女') || name.includes('female');
      }
    });

    // 如果找不到指定的高质量人声，降级为普通的中文语音
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Selected TTS Voice:', preferredVoice.name);
    }

    utterance.onend = () => {
      setPlayingVideo(false);
    };

    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      setPlayingVideo(false);
    };

    // 将对象挂载在全局，防止由于长文本被 Chrome 垃圾回收机制中途掐断导致无声
    (window as any)._currentUtterance = utterance;

    // 加入小延迟执行 speak() 解决 Chrome PC 端的 Bug
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);      // 移除导致声音鬼畜和中断的 pause/resume 轮询 Hack
      // 改用仅查询 speaking 状态的方法来维持引擎活跃
      const intervalId = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(intervalId);
        } else {
          console.debug('Keeping TTS engine alive...');
        }
      }, 5000);
      
      // 当播报彻底结束或出错时，清除定时器
      const cleanup = () => clearInterval(intervalId);
      utterance.addEventListener('end', cleanup);
      utterance.addEventListener('error', cleanup);
    }, 50);
  };

  /**
   * 发送消息给后端，并处理返回结果
   * @param message 用户消息
   */
  const handleSend = async (message: string = textInput) => {
    if (!message.trim() || isGenerating) return;

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

    const ctrl = new AbortController();
    setAbortController(ctrl);
    setGenerating(true);

    try {
      let replyText = "";

      // 通过本地 Vercel Serverless Function 代理请求
      // 如果本地没有配置 apiKey，后端会自动尝试使用部署环境中的环境变量（如 VITE_DEEPSEEK_API_KEY）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: msgText,
          model_provider: modelProvider,
          api_key: apiKey || "", // 允许前端不传，由后端 fallback 读取环境变量
          api_url: customApiUrl || "",
          custom_model_name: customModelName || "",
          system_prompt: systemPrompt || ""
        }),
        signal: ctrl.signal
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API 请求失败 (状态码: ${response.status})`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      replyText = data.reply || "抱歉，我没有获取到有效的回复。";

      // 添加AI消息到聊天面板
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: replyText
      });

      // 将AI回复转为语音播报并播放视频
      speakText(replyText);

        } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('用户中止了生成');
        return;
      }
      console.error('发送消息失败:', error);
      const errorMsg = `抱歉，发生错误：${error.message}`;
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: errorMsg
      });
      // 出错时也要语音播报错误信息
      speakText(errorMsg);
    } finally {
      setGenerating(false);
      setAbortController(null);
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


  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setGenerating(false);
      setAbortController(null);
    }
  };

  const handleUndo = () => {
    undoLastInteraction();
  };

  const handleEdit = () => {
    const content = undoLastInteraction();
    if (content) {
      setTextInput(content);
    }
  };

  return (

    <div className="w-full flex flex-col relative bg-panel border border-border shadow-lg rounded-[2rem] overflow-hidden">
      {/* 动态交互动作栏 */}
      {(messages.length > 0 || isGenerating) && (
        <div className="flex items-center justify-center gap-3 px-4 pt-3 pb-1">
          {isGenerating && (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-full shadow-sm transition-all animate-pulse"
            >
              <div className="w-2 h-2 bg-white rounded-sm"></div>
              {t('app.stop')}
            </button>
          )}
          {!isGenerating && messages.length > 0 && (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-main bg-base hover:bg-border border border-border rounded-full shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                {t('app.edit')}
              </button>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-main bg-base hover:bg-border border border-border rounded-full shadow-sm transition-all hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                {t('app.undo')}
              </button>
            </>
          )}
        </div>
      )}
      <div className="w-full flex items-center gap-3 p-4">
      {/* 录音按钮 */}
      <button
        onClick={toggleListening}
        className={`p-4 rounded-btn transition-all duration-300 shadow-md ${
          isListening 
            ? 'bg-red-500  animate-pulse shadow-red-500/50' 
            : 'bg-base text-primary hover:bg-panel'
        }`}
        title={isListening ? "停止录音" : "开始录音"}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
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
        placeholder={t("voice.placeholder")}
        className="flex-1 p-3 bg-base border-border border-none rounded-xl text-main focus:ring-2 focus:ring-primary outline-none transition-all"
      />

            {/* 发送按钮 */}
      <button
        onClick={() => handleSend()}
        disabled={!textInput.trim() || isGenerating}
        title={t('voice.send')}
        className="p-3 bg-primary hover:bg-primary-hover text-on-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
      >
        <Send size={20} />
      </button>
    </div>
    </div>
  );
};

export default VoiceControl;
