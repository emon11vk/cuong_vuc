import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';
import { History, Globe, Sparkles } from 'lucide-react';

const ERAS = [
  {
    id: '1946' as const,
    label: 'Hà Nội 1946',
    sublabel: 'Chiến Lũy Kháng Chiến',
    badge: 'LŨY HOA',
    sliderValue: 0,
  },
  {
    id: 'present' as const,
    label: 'Hà Nội 2026',
    sublabel: 'Thủ Đô Hiện Đại',
    badge: 'HÒA BÌNH',
    sliderValue: 1,
  },
] as const;

type EraId = (typeof ERAS)[number]['id'];

export const TimelineSlider: React.FC = () => {
  const setSliderValue = useGameStore((state) => state.setSliderValue);
  const setEraId = useGameStore((state) => state.setEraId);
  const sliderValue = useGameStore((state) => state.sliderValue);

  const activeEraId: EraId = sliderValue < 0.5 ? '1946' : 'present';

  const selectEra = (era: (typeof ERAS)[number]) => {
    setSliderValue(era.sliderValue);
    setEraId(era.id);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto select-none"
      style={{ zIndex: 30 }}
    >
      <div className="flex flex-col items-center gap-1.5">
        {/* Instrument Bezel */}
        <div 
          className="flex items-center p-1 rounded-2xl shadow-2xl border transition-all duration-300"
          style={{
            background: 'linear-gradient(180deg, rgba(24, 16, 10, 0.95) 0%, rgba(14, 9, 6, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(229, 186, 99, 0.45)',
            boxShadow: '0 10px 35px rgba(0,0,0,0.85), inset 0 1px 0 rgba(245, 212, 122, 0.25)'
          }}
        >
          {ERAS.map((era) => {
            const isActive = era.id === activeEraId;
            return (
              <button
                key={era.id}
                onClick={() => selectEra(era)}
                aria-pressed={isActive}
                aria-label={`Chọn thời đại: ${era.label}`}
                className={`relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl transition-all duration-300 min-w-[125px] sm:min-w-[170px] cursor-pointer btn-tactile ${
                  isActive 
                    ? 'shadow-lg' 
                    : 'opacity-60 hover:opacity-90'
                }`}
                style={{
                  background: isActive 
                    ? era.id === '1946'
                      ? 'linear-gradient(135deg, rgba(161, 35, 35, 0.35) 0%, rgba(100, 20, 20, 0.35) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.35) 100%)'
                    : 'transparent',
                  border: isActive 
                    ? era.id === '1946'
                      ? '1px solid rgba(229, 186, 99, 0.6)'
                      : '1px solid rgba(147, 197, 253, 0.5)'
                    : '1px solid transparent'
                }}
              >
                {/* Icon Container */}
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive 
                      ? era.id === '1946' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-stone-400'
                  }`}
                >
                  {era.id === '1946' ? (
                    <History className="w-4 h-4" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                </div>

                {/* Text Block */}
                <div className="flex flex-col items-start leading-tight text-left">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs sm:text-sm font-bold font-cinzel tracking-wide"
                      style={{
                        color: isActive 
                          ? era.id === '1946' ? '#f5d47a' : '#bfdbfe' 
                          : '#a89070',
                      }}
                    >
                      {era.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-body font-medium mt-0.5">
                    {era.sublabel}
                  </span>
                </div>

                {/* Active Era Dot Indicator */}
                {isActive && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full ml-auto animate-ping"
                    style={{
                      backgroundColor: era.id === '1946' ? '#e5ba63' : '#60a5fa'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Small tactile era indicator label below */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300/80 px-3 py-0.5 rounded-full bg-black/60 border border-amber-500/20 backdrop-blur">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>
            {activeEraId === '1946' 
              ? 'Đang hiển thị: Địa hình & Mô hình 3D Lũy Hoa 1946' 
              : 'Đang hiển thị: Bản đồ Vệ tinh & Không gian Hiện tại'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
