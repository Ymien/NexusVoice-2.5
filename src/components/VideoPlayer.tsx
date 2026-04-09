import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles } from 'lucide-react';

const VideoPlayer: React.FC = () => {
  const { videoUrl, isPlayingVideo } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlayingVideo]);

  return (
    <div className="relative w-full h-full bg-[var(--bg-panel)] rounded-3xl overflow-hidden flex items-center justify-center border border-[var(--border-color)]">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isPlayingVideo ? 'opacity-100 scale-100' : 'opacity-40 scale-105 blur-[4px]'}`}
          loop
          muted
          playsInline
        />
      ) : (
        <div className="text-[var(--text-secondary)] font-medium tracking-widest text-sm uppercase">No Video Feed</div>
      )}

      {/* Decorative Glow Effect (Dopamine theme active) */}
      <div className={`absolute inset-0 opacity-40 transition-opacity duration-1000 ${isPlayingVideo ? 'opacity-100' : ''} pointer-events-none`}>
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[100px] mix-blend-screen bg-blue-500/20"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[100px] mix-blend-screen bg-purple-500/20"></div>
      </div>

      {/* Active AI Speaking Indicator */}
      {isPlayingVideo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
           <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-tr from-blue-500 to-purple-500 text-white animate-bounce shadow-blue-500/50">
              <Sparkles className="w-8 h-8 animate-spin-slow" />
           </div>
        </div>
      )}

      {/* Standby Overlay */}
      {!isPlayingVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="bg-[var(--bg-primary)]/90 backdrop-blur-xl px-6 py-3 rounded-full border border-[var(--border-color)] shadow-xl">
            <span className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              System Standby
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
