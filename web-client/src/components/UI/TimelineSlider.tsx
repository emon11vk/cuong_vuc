import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';

export const TimelineSlider: React.FC = () => {
  const sliderValue = useGameStore((state) => state.sliderValue);
  const setSliderValue = useGameStore((state) => state.setSliderValue);
  const setEraId = useGameStore((state) => state.setEraId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val);
    if (val < 0.5) {
      setEraId('1946');
    } else {
      setEraId('present');
    }
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[80%] max-w-lg bg-black/50 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto"
    >
      <div className="flex justify-between text-white/80 font-bold mb-2 px-2 text-sm">
        <span>Quá khứ (1946)</span>
        <span>Hiện tại (2026)</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={sliderValue}
        onChange={handleChange}
        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </motion.div>
  );
};
