import { useHanoiStore } from '../../store/useHanoiStore';

export const DialogueOverlay = () => {
  const { currentDialogue, setDialogue } = useHanoiStore();

  if (!currentDialogue) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full p-2 pb-20 sm:p-8 sm:pb-12 flex justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto bg-black/90 border-2 border-gray-600 rounded-lg p-4 sm:p-6 max-w-3xl w-full text-white shadow-2xl backdrop-blur-sm mx-2">
        <h3 className="text-lg sm:text-xl font-bold text-yellow-500 mb-1 sm:mb-2 font-mono uppercase tracking-widest">
          {currentDialogue.speaker}
        </h3>
        <p className="text-sm sm:text-lg leading-relaxed italic mb-2 sm:mb-4">
          "{currentDialogue.text}"
        </p>
        <div className="flex justify-end">
          <button 
            onClick={() => setDialogue(null)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs sm:text-sm font-bold uppercase transition-colors"
          >
            Tiếp tục [Space]
          </button>
        </div>
      </div>
    </div>
  );
};
