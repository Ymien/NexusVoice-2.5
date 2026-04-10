import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useStore } from './store/useStore';

function App() {
  const { theme } = useStore();
  const [ttsPrimed, setTtsPrimed] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    let timer: number | undefined;
    const onScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 700);
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as any);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  // Prime TTS engine on first user interaction to bypass Chrome PC bug
  useEffect(() => {
    const handleInteraction = () => {
      if (!ttsPrimed && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        setTtsPrimed(true);
        
        // Remove listeners after priming
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      }
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [ttsPrimed]);

  return (
    <div className="App">
      <Home />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
