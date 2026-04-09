import React from 'react';
import Home from './pages/Home';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <div className="App">
      <Home />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
