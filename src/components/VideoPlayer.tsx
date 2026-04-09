import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * 视频播放组件
 * 功能：根据应用状态（isPlayingVideo）决定是否播放视频，以及切换视频地址
 */
const VideoPlayer: React.FC = () => {
  // 从全局状态中获取视频播放地址和播放状态
  const { videoUrl, isPlayingVideo } = useStore();
  // 引用原生的 video 元素
  const videoRef = useRef<HTMLVideoElement>(null);

  // 监听播放状态，当 AI 开始讲话时播放视频，结束时暂停并重置视频
  useEffect(() => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        // AI讲话中，开始播放视频
        videoRef.current.play().catch(e => console.error("视频播放失败:", e));
      } else {
        // 讲话结束，暂停视频并回到开头
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isPlayingVideo]);

  return (
    <div className="relative w-full h-full bg-[#0B0F19] rounded-3xl overflow-hidden flex items-center justify-center">
      {/* 装饰性渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-overlay"></div>
      
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isPlayingVideo ? 'opacity-100 scale-100' : 'opacity-20 scale-105 blur-sm'}`}
          loop
          muted // 必须静音，否则会干扰TTS的语音播报
          playsInline
        />
      ) : (
        <div className="text-slate-500 font-medium tracking-widest text-sm uppercase">No Video Feed</div>
      )}

      {/* 在非播放状态时，在中心显示提示或待机画面效果 */}
      {!isPlayingVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* 涟漪动画圆圈 */}
            <div className="absolute w-32 h-32 border border-blue-500/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute w-24 h-24 border border-blue-400/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-10">
              <span className="text-white text-sm font-semibold tracking-widest animate-pulse flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                SYSTEM STANDBY
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
