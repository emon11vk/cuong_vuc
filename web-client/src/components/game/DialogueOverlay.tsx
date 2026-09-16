import { useHanoiStore } from '../../store/useHanoiStore';

export const DialogueOverlay = () => {
  const { currentDialogue, setDialogue } = useHanoiStore();

  if (!currentDialogue) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full p-2 pb-20 sm:p-8 sm:pb-12 flex justify-center z-50 pointer-events-none">
      <div
        className="pointer-events-auto rounded-lg p-4 sm:p-6 max-w-3xl w-full shadow-2xl mx-2 border"
        style={{
          background: 'rgba(18, 10, 4, 0.95)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(212, 160, 23, 0.3)',
        }}
      >
        {/* Speaker name */}
        <h3
          className="text-base sm:text-lg font-bold mb-1 sm:mb-2 uppercase tracking-widest"
          style={{
            color: '#d4a017',
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '0.1em',
          }}
        >
          {currentDialogue.speaker}
        </h3>

        {/* Dialogue text */}
        <p
          className="text-sm sm:text-base leading-relaxed italic mb-3 sm:mb-4"
          style={{ color: '#e8d9b8', fontFamily: "'Inter', sans-serif" }}
        >
          &ldquo;{currentDialogue.text}&rdquo;
        </p>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            onClick={() => setDialogue(null)}
            className="px-4 py-2 sm:px-5 sm:py-2 rounded text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-150 active:scale-95"
            style={{
              background: 'rgba(212, 160, 23, 0.15)',
              color: '#d4a017',
              border: '1px solid rgba(212, 160, 23, 0.4)',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.28)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.15)';
            }}
          >
            Tiếp tục
            {/* Show [Space] hint only on non-touch (keyboard) contexts */}
            <span className="hidden sm:inline ml-1 opacity-50 font-mono text-[10px]">[Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
