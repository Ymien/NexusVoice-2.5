import { useRef, useEffect, memo } from 'react';
import type { FC } from 'react';
import { useStore } from '../store/useStore';
import { useI18n } from '../store/useI18n';
import { Volume2 } from 'lucide-react';

const VideoPlayer: FC = memo(() => {
  const { t } = useI18n();
  const videoUrl = useStore((s) => s.videoUrl);
  const isPlayingVideo = useStore((s) => s.isPlayingVideo);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastPlayStateRef = useRef(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.play().catch((e) => console.error('Video play failed:', e));
      } else {
        videoRef.current.pause();
        if (lastPlayStateRef.current) {
          videoRef.current.currentTime = 0;
        }
      }
    }
    lastPlayStateRef.current = isPlayingVideo;
  }, [isPlayingVideo]);

  return (
    <div className="relative w-full h-full bg-card flex items-center justify-center overflow-hidden">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isPlayingVideo ? 'opacity-100' : 'opacity-30'
          }`}
          loop
          muted
          playsInline
        />
      ) : (
        <div className="text-muted-foreground text-sm">{t('video.noSource')}</div>
      )}

      {/* Idle overlay */}
      {!isPlayingVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
            <Volume2 size={20} className="text-muted-foreground" />
          </div>
          <div className="text-muted-foreground text-sm font-medium tracking-wider">
            {t('video.waiting')}
          </div>
        </div>
      )}

      {/* Subtle gradient overlay when playing */}
      {isPlayingVideo && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
