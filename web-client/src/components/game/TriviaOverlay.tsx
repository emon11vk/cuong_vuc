import { useHanoiStore } from '../../store/useHanoiStore';
import { useState } from 'react';

export const TriviaOverlay = () => {
  const { activeTrivia, setTrivia } = useHanoiStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!activeTrivia) return null;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    
    // Auto close after showing result for a bit
    setTimeout(() => {
      setTrivia(null);
      setSelected(null);
      setShowResult(false);
    }, 3000);
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-gray-900 border-2 border-yellow-600/50 rounded-xl p-4 sm:p-8 max-w-2xl w-full text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-yellow-500 font-bold uppercase tracking-widest text-xs sm:text-sm mb-2 sm:mb-4 text-center">
          Thông tin Lịch sử
        </div>
        <h2 className="text-lg sm:text-2xl font-semibold mb-4 sm:mb-8 text-center leading-tight">
          {activeTrivia.question}
        </h2>
        
        <div className="space-y-3">
          {activeTrivia.options.map((option, idx) => {
            let btnClass = "w-full text-left p-3 sm:p-4 rounded text-sm sm:text-base bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors";
            
            if (showResult) {
              if (idx === activeTrivia.correctIndex) {
                btnClass = "w-full text-left p-3 sm:p-4 rounded text-sm sm:text-base bg-green-900/50 border border-green-500 text-green-300";
              } else if (idx === selected) {
                btnClass = "w-full text-left p-3 sm:p-4 rounded text-sm sm:text-base bg-red-900/50 border border-red-500 text-red-300";
              } else {
                btnClass = "w-full text-left p-3 sm:p-4 rounded text-sm sm:text-base bg-gray-800 border border-gray-700 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleSelect(idx)}
                className={btnClass}
              >
                <span className="font-mono mr-3 text-gray-400">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`mt-4 sm:mt-6 text-center font-bold text-base sm:text-lg animate-pulse ${
            selected === activeTrivia.correctIndex ? 'text-green-500' : 'text-red-500'
          }`}>
            {selected === activeTrivia.correctIndex ? 'Chính xác! Đã xác nhận thông tin.' : 'Không chính xác. Hồ sơ lịch sử có khác biệt.'}
          </div>
        )}
      </div>
    </div>
  );
};
