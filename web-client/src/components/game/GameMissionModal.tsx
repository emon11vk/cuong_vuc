import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { X, Maximize2, Minimize2, ExternalLink, Compass } from 'lucide-react';

export const GameMissionModal: React.FC = () => {
  const isGameModalOpen = useGameStore((state) => state.isGameModalOpen);
  const setGameModalOpen = useGameStore((state) => state.setGameModalOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGameModalOpen) {
        setGameModalOpen(false);
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CLOSE_GAME') {
        setGameModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, [isGameModalOpen, setGameModalOpen]);

  if (!isGameModalOpen) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 pointer-events-auto"
      style={{
        background: 'rgba(10, 8, 6, 0.92)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        ref={containerRef}
        className={`relative flex flex-col w-full overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'h-full max-w-none rounded-none' 
            : 'h-full sm:h-[92vh] max-w-6xl rounded-none sm:rounded-xl border-0 sm:border-2'
        }`}
        style={{
          background: '#120e0b',
          borderColor: 'rgba(212, 160, 23, 0.45)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(212, 160, 23, 0.2)',
        }}
      >
        {/* Top Control Bar with Imperial Wartime Dispatch Theme */}
        <div
          className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b select-none"
          style={{
            background: 'linear-gradient(90deg, #1c140e 0%, #261b12 50%, #1c140e 100%)',
            borderColor: 'rgba(212, 160, 23, 0.3)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm crimson-badge text-amber-200 shrink-0 font-cinzel shadow"
            >
              FTU
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-wider font-cinzel text-amber-300">
                  <span className="hidden sm:inline">NHIỆM VỤ ĐỊA BÀN: </span>ĐẠI HỌC NGOẠI THƯƠNG
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/35">
                  91 Chùa Láng
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400 font-body flex items-center gap-1 sm:gap-1.5 mt-0.5">
                <Compass className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">Game RPG 2D • Di chuyển bằng Cảm ứng / Phím</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/game/index.html"
              target="_blank"
              rel="noopener noreferrer"
              title="Mở tab riêng"
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors btn-tactile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer btn-tactile"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setGameModalOpen(false)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer btn-tactile shadow crimson-badge"
              title="Quay lại Bản đồ (Phím ESC)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại Bản đồ</span>
              <span className="sm:hidden">Đóng</span>
            </button>
          </div>
        </div>

        {/* Game Iframe Container */}
        <div className="relative flex-1 w-full h-full bg-[#0c0a08] overflow-hidden">
          <iframe
            src="/game/index.html"
            title="Nhiệm vụ Đại học Ngoại Thương"
            className="w-full h-full border-0"
            allow="autoplay; audio"
          />
        </div>
      </div>
    </div>
  );
};
