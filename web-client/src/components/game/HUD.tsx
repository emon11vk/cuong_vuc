import { useHanoiStore } from '../../store/useHanoiStore';
import { Heart, Activity, Package, VolumeX } from 'lucide-react';

export const HUD = () => {
  const { currentMinigameId, health, stamina, cratesCollected, noiseLevel } = useHanoiStore();

  if (!currentMinigameId) return null;

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start z-40 font-mono">
      {/* Left Side: General Stats */}
      <div className="flex flex-col gap-2">
        <div className="bg-black/60 text-white px-3 py-1.5 rounded-md flex items-center gap-2 border border-white/20">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="font-bold">{health}%</span>
        </div>
        
        {/* Stamina for Level 1, Chua Lang 1 */}
        {['level1', 'chua_lang1'].includes(currentMinigameId) && (
          <div className="bg-black/60 text-white px-3 py-1.5 rounded-md flex items-center gap-2 border border-white/20">
            <Activity className="w-5 h-5 text-blue-400" />
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-200" 
                style={{ width: `${stamina}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Specific Objectives */}
      <div className="flex flex-col gap-2 items-end">
        {/* Crates for Level 2 */}
        {currentMinigameId === 'level2' && (
          <div className="bg-black/60 text-white px-3 py-1.5 rounded-md flex items-center gap-2 border border-white/20">
            <Package className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{cratesCollected} / 3 Crates</span>
          </div>
        )}

        {/* Noise Meter for Level 3, Chua Lang 1 */}
        {['level3', 'chua_lang1'].includes(currentMinigameId) && (
          <div className="bg-black/60 text-white px-3 py-1.5 rounded-md flex items-center gap-2 border border-white/20">
            <VolumeX className="w-5 h-5 text-red-400" />
            <span className="font-bold mr-2 text-sm uppercase">Noise</span>
            <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${
                  noiseLevel > 75 ? 'bg-red-500' : noiseLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${noiseLevel}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
