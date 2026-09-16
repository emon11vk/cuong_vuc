import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';

const ERAS = [
  {
    id: '1946' as const,
    label: 'Hà Nội 1946',
    sublabel: 'Thời kháng chiến',
    icon: '🕰',
    sliderValue: 0,
  },
  {
    id: 'present' as const,
    label: 'Hiện Tại',
    sublabel: '2026',
    icon: '🗺',
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
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="absolute bottom-28 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto"
      style={{ zIndex: 30 }}
    >
      <div
        className="flex items-center gap-px rounded-xl overflow-hidden shadow-2xl border"
        style={{
          background: 'rgba(18, 10, 4, 0.88)',
          backdropFilter: 'blur(14px)',
          borderColor: 'rgba(212, 160, 23, 0.3)',
        }}
      >
        {/* Decorative divider line between buttons */}
        {ERAS.map((era, idx) => {
          const isActive = era.id === activeEraId;
          return (
            <React.Fragment key={era.id}>
              <button
                onClick={() => selectEra(era)}
                aria-pressed={isActive}
                aria-label={`Chọn thời đại: ${era.label}`}
                className="relative flex items-center gap-2.5 px-5 py-3 transition-all duration-300 min-w-[130px] sm:min-w-[160px] focus-visible:outline-none group"
                style={{
                  background: isActive
                    ? 'rgba(212, 160, 23, 0.18)'
                    : 'transparent',
                }}
              >
                {/* Active indicator bar (top) */}
                {isActive && (
                  <motion.div
                    layoutId="era-active-bar"
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-b"
                    style={{ background: '#d4a017' }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}

                {/* Icon */}
                <span
                  className="text-xl leading-none shrink-0 transition-transform duration-300 group-hover:scale-110"
                  role="img"
                  aria-hidden
                >
                  {era.icon}
                </span>

                {/* Text */}
                <div className="flex flex-col items-start">
                  <span
                    className="text-xs font-bold leading-tight"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: isActive ? '#f5c842' : '#a89070',
                      transition: 'color 0.3s',
                    }}
                  >
                    {era.label}
                  </span>
                  <span
                    className="text-[10px] font-medium leading-tight mt-0.5"
                    style={{
                      color: isActive ? 'rgba(245,200,66,0.7)' : 'rgba(168,144,112,0.5)',
                      transition: 'color 0.3s',
                    }}
                  >
                    {era.sublabel}
                  </span>
                </div>
              </button>

              {/* Vertical divider between buttons */}
              {idx < ERAS.length - 1 && (
                <div
                  className="w-px self-stretch"
                  style={{ background: 'rgba(212, 160, 23, 0.2)' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
};
