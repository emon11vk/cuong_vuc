import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, ExternalLink } from 'lucide-react';

export const GameScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0c0a08] overflow-hidden">
      {/* Top Header */}
      <header 
        className="flex items-center justify-between px-4 py-2 border-b select-none z-10"
        style={{
          background: 'linear-gradient(90deg, #1c140e 0%, #261b12 50%, #1c140e 100%)',
          borderColor: 'rgba(212, 160, 23, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer shadow hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #a12323 0%, #781515 100%)',
              border: '1px solid rgba(205, 163, 79, 0.4)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Bản Đồ Hà Nội 1946</span>
          </button>

          <div className="h-4 w-px bg-stone-700 mx-1" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide" style={{ color: '#e5ba63', fontFamily: "'Playfair Display', Georgia, serif" }}>
                NHIỆM VỤ ĐỊA BÀN: TRƯỜNG ĐẠI HỌC NGOẠI THƯƠNG
              </span>
              <span 
                className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(205, 163, 79, 0.15)',
                  color: '#cda34f',
                  border: '1px solid rgba(205, 163, 79, 0.35)'
                }}
              >
                91 Chùa Láng • Vành Đai Tô Lịch
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-amber-500" />
              Game tương tác lịch sử Top-Down 2D Narrative RPG
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/game/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-stone-300 hover:text-amber-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở cửa sổ riêng</span>
          </a>
        </div>
      </header>

      {/* Main Game Frame */}
      <main className="flex-1 w-full h-full relative bg-[#0c0a08]">
        <iframe
          src="/game/index.html"
          title="Game Lịch Sử Ngoại Thương"
          className="w-full h-full border-0"
          allow="autoplay; audio"
        />
      </main>
    </div>
  );
};
