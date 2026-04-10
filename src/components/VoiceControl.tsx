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
  const { t } = useI18n();
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
    setSettingsOpen,
    isGenerating,
    setGenerating,
    abortController,
    setAbortController,
    undoLastInteraction
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

    // 先取消当前可能卡住的语音
    window.speechSynthesis.cancel();
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
      window.speechSynthesis.speak(utterance);
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

      if (!apiKey) {
        throw new Error("${t('voice.noApiKey')}");
      }

      let apiUrl = "https://api.deepseek.com/chat/completions";
      let modelName = "deepseek-chat";

      if (modelProvider === 'doubao') {
        apiUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
        modelName = "ep-20240521171539-7b9mc"; // 豆包默认接入点示例
      } else if (modelProvider === 'custom' && customApiUrl) {
        apiUrl = customApiUrl;
        modelName = "default-model";
      } else if (modelProvider === 'xiaomi') {
        apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions"; // 假设小米或智谱
        modelName = "glm-4";
      }

      // 直接从前端调用大模型 API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: "你是一个贴心的AI助手，请用简短、自然的中文口语回答。" },
            { role: "user", content: msgText }
          ]
        }),
        signal: ctrl.signal
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API 请求失败 (状态码: ${response.status})`);
      }

      const data = await response.json();
      replyText = data.choices?.[0]?.message?.content || "抱歉，我没有获取到有效的回复。";

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

    <div className="w-full flex flex-col">
      <div className="w-full flex items-center gap-3 p-4 bg-panel border-t border-l border-r border-border shadow-panel">
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
        placeholder="说出唤醒词或手动输入..."
        className="flex-1 p-3 bg-base border-border border-none rounded-xl text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />

            {/* 发送按钮 */}
      {isGenerating ? (
        <button
          onClick={handleStop}
          title={t('app.stop')}
          className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all font-medium text-sm flex items-center justify-center whitespace-nowrap"
        >
          {t('app.stop')}
        </button>
      ) : (
        <button
          onClick={() => handleSend()}
          disabled={!textInput.trim()}
          title={t('voice.send')}
          className="p-3 bg-primary hover:bg-primary-hover text-on-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
        >
          <Send size={20} />
        </button>
      )}

      {/* 设置按钮 */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-muted rounded-xl transition-all"
        title="系统设置"
      >
        <Settings size={20} />
      </button>
      {/* 操作按钮区：撤回、更改输入 */}
      <div className="w-full flex items-center justify-end px-4 pb-3 bg-panel border-b border-l border-r border-border shadow-panel rounded-b-panel -mt-2">
        <div className="flex space-x-3 text-xs">
          <button 
            onClick={handleEdit}
            className="text-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            {t('app.edit')}
          </button>
          <button 
            onClick={handleUndo}
            className="text-muted hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
            {t('app.undo')}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default VoiceControl;
