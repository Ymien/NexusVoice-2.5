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
    <div className="relative w-full h-full bg-panel border border-border rounded-panel overflow-hidden shadow-lg flex items-center justify-center">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isPlayingVideo ? 'opacity-100' : 'opacity-30'}`}
          loop
          muted // 必须静音，否则会干扰TTS的语音播报
          playsInline
        />
      ) : (
        <div className="text-gray-500">暂无视频来源</div>
      )}
      
      {/* 在非播放状态时，在中心显示提示或待机画面效果 */}
      {!isPlayingVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl font-light tracking-widest animate-pulse">
            等待唤醒...
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
