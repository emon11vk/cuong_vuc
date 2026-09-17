import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { hanoiAudio } from '../../utils/audioAmbient';
import { 
  VolumeX, 
  BookOpen, 
  Swords, 
  Glasses, 
  Search, 
  Compass
} from 'lucide-react';

interface TopHeaderBarProps {
  onOpenChronicle: () => void;
  isNavOpen: boolean;
  onToggleNav: () => void;
  arSupported?: boolean;
  onEnterAR?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  onOpenChronicle,
  isNavOpen,
  onToggleNav,
  arSupported,
  onEnterAR
}) => {
  const setGameModalOpen = useGameStore((state) => state.setGameModalOpen);
  const [isPlayingAudio, setIsPlayingAudio] = useState(() => hanoiAudio.getStatus());

  const handleToggleAudio = () => {
    const active = hanoiAudio.toggle();
    setIsPlayingAudio(active);
  };

  return (
    <header 
      className="absolute top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto border-b select-none"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 9, 6, 0.94) 0%, rgba(18, 12, 8, 0.88) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(229, 186, 99, 0.35)',
        boxShadow: '0 4px 25px rgba(0,0,0,0.8), inset 0 1px 0 rgba(245, 212, 122, 0.15)'
      }}
    >
      {/* Brand Identity / Seal */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* National / Historical Insignia */}
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg cursor-pointer btn-tactile"
          style={{
            background: 'linear-gradient(135deg, #a12323 0%, #681111 100%)',
            border: '1.5px solid rgba(245, 212, 122, 0.7)',
            boxShadow: '0 0 14px rgba(161, 35, 35, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
          title="Hà Nội 1946 • Lũy Hoa Kháng Chiến"
        >
          <span className="text-amber-300 font-bold text-xs sm:text-sm font-cinzel">1946</span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-base font-bold tracking-wider font-cinzel text-amber-300 leading-none">
              <span className="sm:hidden">HÀ NỘI 1946</span>
              <span className="hidden sm:inline">HÀ NỘI 1946 • LŨY HOA KHÁNG CHIẾN</span>
            </h1>
            <span className="hidden md:inline-flex text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-amber-400 border border-amber-500/40">
              60 Ngày Đêm
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-stone-400 font-body flex items-center gap-1 sm:gap-1.5 mt-0.5">
            <Compass className="w-3 h-3 text-amber-400/80 shrink-0" />
            <span className="hidden sm:inline">Bản đồ Di sản & Tác chiến 3D •</span>
            <span className="text-amber-400 font-medium">91 Chùa Láng</span>
          </p>
        </div>
      </div>

      {/* Right Controls Suite */}
      <div className="flex items-center gap-1 sm:gap-2.5">
        {/* Ambient Wartime Audio Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer btn-tactile border ${
            isPlayingAudio
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(229,186,99,0.3)]'
              : 'bg-stone-900/60 text-stone-400 border-white/10 hover:text-stone-200 hover:border-amber-500/30'
          }`}
          title={isPlayingAudio ? 'Tắt âm thanh khí quyển đêm 1946' : 'Bật âm thanh khí quyển (tiếng gió đông & chuông chùa Láng)'}
          aria-label="Bật hoặc tắt âm thanh khí quyển"
        >
          {isPlayingAudio ? (
            <>
              <div className="flex items-end gap-0.5 h-3.5 mr-0.5">
                <span className="w-0.5 bg-amber-400 rounded-full wave-bar-1" />
                <span className="w-0.5 bg-amber-400 rounded-full wave-bar-2" />
                <span className="w-0.5 bg-amber-400 rounded-full wave-bar-3" />
              </div>
              <span className="hidden md:inline">Âm Khí Quyển</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden md:inline">Âm Khí Quyển</span>
            </>
          )}
        </button>

        {/* Historical Chronicle Button */}
        <button
          onClick={onOpenChronicle}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900/60 hover:bg-stone-800/80 text-amber-200 border border-amber-500/35 hover:border-amber-500/60 transition-all cursor-pointer btn-tactile shadow"
          title="Mở Sổ Tay Sử Lược 60 Ngày Đêm"
          aria-label="Mở sổ tay sử lược"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Sử Lược 1946</span>
        </button>

        {/* Navigation / Search Toggle */}
        <button
          onClick={onToggleNav}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer btn-tactile border ${
            isNavOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
              : 'bg-stone-900/60 text-stone-400 border-white/10 hover:text-stone-200 hover:border-amber-500/30'
          }`}
          title="Bật/Tắt Bảng Tìm Kiếm & Tọa Độ"
          aria-label="Bật tắt bảng điều hướng"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tìm Đường</span>
        </button>

        {/* AR Mode Button (Vintage Brass Styling) */}
        {arSupported && onEnterAR && (
          <button
            onClick={onEnterAR}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-amber-200 transition-all cursor-pointer btn-tactile shadow"
            style={{
              background: 'linear-gradient(135deg, #382414 0%, #1e130a 100%)',
              border: '1px solid rgba(229, 186, 99, 0.65)',
              boxShadow: '0 0 12px rgba(229, 186, 99, 0.25)'
            }}
            title="Kích hoạt Thực tế tăng cường WebXR (AR)"
          >
            <Glasses className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vào AR</span>
          </button>
        )}

        {/* Primary CTA: Launch FTU Mission Game */}
        <button
          onClick={() => setGameModalOpen(true)}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer btn-tactile shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #a12323 0%, #781515 100%)',
            border: '1.5px solid rgba(245, 212, 122, 0.75)',
            boxShadow: '0 0 15px rgba(203, 45, 45, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
          }}
          title="Mở Nhiệm Vụ Tác Chiến Tại Đại Học Ngoại Thương"
          aria-label="Mở nhiệm vụ tác chiến"
        >
          <Swords className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Nhiệm Vụ FTU</span>
          <span className="sm:hidden text-[11px]">FTU</span>
        </button>
      </div>
    </header>
  );
};
