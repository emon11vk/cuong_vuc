import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapScreen } from './screens/MapScreen';
import { GameScreen } from './screens/GameScreen';
import { TutorialOverlay } from './components/UI/TutorialOverlay';
import { useGameStore } from './store/gameStore';

// ─── Help button ──────────────────────────────────────────────────────────────
// Rendered at App root so it is never inside a Three.js <Canvas> or MapGL tree.

function HelpButton() {
  const startTutorial = useGameStore((state) => state.startTutorial);

  return (
    <button
      onClick={startTutorial}
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all cursor-pointer select-none shadow-xl hover:scale-110 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #c59b27 0%, #8a6810 100%)',
        border: '2px solid rgba(245, 212, 122, 0.75)',
        color: '#120b07',
        boxShadow:
          '0 4px 20px rgba(0,0,0,0.7), 0 0 14px rgba(197,155,39,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
      aria-label="Mở hướng dẫn sử dụng"
      title="Hướng dẫn sử dụng"
    >
      ?
    </button>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const startTutorial = useGameStore((state) => state.startTutorial);

  // Show tutorial automatically on the very first visit.
  // localStorage persists across refreshes, so subsequent loads skip this.
  useEffect(() => {
    if (!localStorage.getItem('hasSeenTutorial')) {
      localStorage.setItem('hasSeenTutorial', 'true');
      startTutorial();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally runs once on mount

  return (
    // Root shell: full-screen, relative — gives TutorialOverlay and HelpButton
    // a stable stacking context that is always above any child canvas/map layer.
    <div className="relative w-screen h-screen overflow-hidden">
      <BrowserRouter>
        <Routes>
          {/* The main map is the default route */}
          <Route path="/" element={<MapScreen />} />
          {/* Dedicated game mission route */}
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </BrowserRouter>

      {/*
        TutorialOverlay and HelpButton are intentionally placed OUTSIDE of
        <BrowserRouter> / <Routes> / any screen component so they are never
        adopted into a Three.js <Canvas> renderer or a MapLibre GL context.
        They are plain DOM nodes managed by React's default renderer.
      */}
      <TutorialOverlay />
      <HelpButton />
    </div>
  );
}

export default App;

