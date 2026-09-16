import { useHanoiStore } from '../../store/useHanoiStore';
import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export const TriviaOverlay = () => {
  const { activeTrivia, setTrivia } = useHanoiStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!activeTrivia) return null;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);

    // Give player enough time to read the correct answer: 5s instead of 3s
    setTimeout(() => {
      setTrivia(null);
      setSelected(null);
      setShowResult(false);
    }, 5000);
  };

  const isCorrect = (idx: number) => idx === activeTrivia.correctIndex;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto p-3 sm:p-6"
      style={{ background: 'rgba(12, 7, 2, 0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border"
        style={{
          background: 'rgba(22, 13, 5, 0.98)',
          borderColor: 'rgba(212, 160, 23, 0.4)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 sm:px-8 py-4 sm:py-5 border-b"
          style={{ borderColor: 'rgba(212, 160, 23, 0.2)' }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: '#d4a017', letterSpacing: '0.15em' }}
          >
            Hồ Sơ Lịch Sử
          </p>
          <h2
            className="text-base sm:text-xl font-bold leading-snug"
            style={{
              color: '#f4edd8',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {activeTrivia.question}
          </h2>
        </div>

        {/* Options */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 space-y-2.5">
          {activeTrivia.options.map((option, idx) => {
            let bgColor = 'rgba(255,255,255,0.04)';
            let borderColor = 'rgba(212,160,23,0.15)';
            let textColor = '#c8b08a';
            let icon = null;

            if (showResult) {
              if (isCorrect(idx)) {
                bgColor = 'rgba(45,106,79,0.35)';
                borderColor = '#22c55e';
                textColor = '#86efac';
                icon = <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />;
              } else if (idx === selected) {
                bgColor = 'rgba(139,27,27,0.35)';
                borderColor = '#ef4444';
                textColor = '#fca5a5';
                icon = <XCircle className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />;
              } else {
                bgColor = 'rgba(255,255,255,0.02)';
                borderColor = 'rgba(212,160,23,0.08)';
                textColor = '#6b5b3e';
              }
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleSelect(idx)}
                className="w-full text-left flex items-center gap-3 p-3 sm:p-4 rounded-lg transition-all duration-150 border disabled:cursor-default active:scale-[0.99]"
                style={{
                  background: bgColor,
                  borderColor,
                  color: textColor,
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!showResult) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.1)';
                }}
                onMouseLeave={(e) => {
                  if (!showResult) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: showResult ? 'transparent' : 'rgba(212,160,23,0.15)',
                    color: '#d4a017',
                    border: '1px solid rgba(212,160,23,0.3)',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm sm:text-base flex-1">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div
            className="px-5 sm:px-8 pb-5 sm:pb-6 flex items-center gap-2.5"
          >
            {selected === activeTrivia.correctIndex ? (
              <div
                className="flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 w-full"
                style={{ background: 'rgba(45,106,79,0.3)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Chính xác! Hồ sơ được xác nhận.
              </div>
            ) : (
              <div
                className="flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 w-full"
                style={{ background: 'rgba(139,27,27,0.3)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <XCircle className="w-4 h-4" />
                Không chính xác. Đáp án đúng đã được đánh dấu.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
