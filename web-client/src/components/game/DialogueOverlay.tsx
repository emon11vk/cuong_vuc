import { useHanoiStore } from '../../store/useHanoiStore';

export const DialogueOverlay = () => {
  const { currentDialogue, setDialogue } = useHanoiStore();

  if (!currentDialogue) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full p-8 pb-12 flex justify-center z-50 pointer-events-auto">
      <div className="bg-black/90 border-2 border-gray-600 rounded-lg p-6 max-w-3xl w-full text-white shadow-2xl backdrop-blur-sm">
        <h3 className="text-xl font-bold text-yellow-500 mb-2 font-mono uppercase tracking-widest">
          {currentDialogue.speaker}
        </h3>
        <p className="text-lg leading-relaxed italic mb-4">
          "{currentDialogue.text}"
        </p>
        <div className="flex justify-end">
          <button 
            onClick={() => setDialogue(null)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold uppercase transition-colors"
          >
            Continue [Space]
          </button>
        </div>
      </div>
    </div>
  );
};
