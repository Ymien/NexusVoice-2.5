import { useI18n } from '../store/useI18n';
import type { FC } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import VoiceControl from '../components/VoiceControl';
import SettingsModal from '../components/SettingsModal';
import { Settings, Radio } from 'lucide-react';
import { useStore } from '../store/useStore';

const Home: FC = () => {
  const { t } = useI18n();
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);

  return (
    <div className="h-full w-full flex flex-col lg:flex-row">
      {/* Left: Video Stage */}
      <section className="relative flex-1 lg:flex-[1.4] bg-black/5 flex items-center justify-center min-h-[40vh] lg:min-h-0">
        <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full h-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card relative">
            <VideoPlayer />
          </div>
        </div>

        {/* Floating header - left */}
        <div className="absolute top-4 left-4 lg:top-6 lg:left-8 z-10">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass border border-border/30 shadow-lg">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Radio size={14} className="text-primary-foreground" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              {t('app.title')}
            </h1>
          </div>
        </div>

        {/* Floating settings button - right */}
        <div className="absolute top-4 right-4 lg:top-6 lg:right-8 z-10">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-xl glass border border-border/30 shadow-lg hover:bg-muted/50 transition-colors"
            title={t('app.settings')}
            aria-label={t('app.settings')}
          >
            <Settings size={18} className="text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* Right: Chat & Controls */}
      <section className="flex-1 lg:flex-[0.8] xl:flex-[0.7] flex flex-col h-full border-t lg:border-t-0 lg:border-l border-border bg-background">
        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>

        {/* Voice control bar */}
        <div className="shrink-0 border-t border-border">
          <VoiceControl />
        </div>
      </section>

      <SettingsModal />
    </div>
  );
};

export default Home;
