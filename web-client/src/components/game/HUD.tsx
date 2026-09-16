import { useHanoiStore } from '../../store/useHanoiStore';
import { Heart, Activity, Package, VolumeX } from 'lucide-react';

const StatPill = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm"
    style={{
      background: 'rgba(18, 10, 4, 0.88)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(212, 160, 23, 0.25)',
      color: '#e8d9b8',
      fontFamily: "'Inter', sans-serif",
    }}
  >
    {icon}
    {children}
  </div>
);

const BarMeter = ({
  value,
  color,
  wClass = 'w-16 sm:w-24',
}: {
  value: number;
  color: string;
  wClass?: string;
}) => (
  <div
    className={`${wClass} h-1.5 sm:h-2 rounded-full overflow-hidden`}
    style={{ background: 'rgba(255,255,255,0.12)' }}
  >
    <div
      className="h-full rounded-full transition-all duration-300"
      style={{ width: `${value}%`, background: color }}
    />
  </div>
);

export const HUD = () => {
  const { currentMinigameId, health, stamina, cratesCollected, noiseLevel } = useHanoiStore();

  if (!currentMinigameId) return null;

  const noiseMeterColor =
    noiseLevel > 75 ? '#ef4444' : noiseLevel > 40 ? '#f59e0b' : '#22c55e';

  return (
    <div className="absolute top-0 left-0 w-full p-2 sm:p-4 pointer-events-none flex justify-between items-start z-40">
      {/* Left: Health + Stamina */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <StatPill
          icon={<Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: '#ef4444' }} />}
        >
          <span className="font-bold tabular-nums">{health}%</span>
        </StatPill>

        {['level1', 'chua_lang1'].includes(currentMinigameId) && (
          <StatPill
            icon={<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: '#60a5fa' }} />}
          >
            <BarMeter value={stamina} color="#3b82f6" />
          </StatPill>
        )}
      </div>

      {/* Right: Objectives */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-end">
        {currentMinigameId === 'level2' && (
          <StatPill
            icon={<Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: '#f59e0b' }} />}
          >
            <span className="font-bold tabular-nums">{cratesCollected}</span>
            <span className="text-stone-400 text-[10px] sm:text-xs ml-0.5">/ 3 Hòm</span>
          </StatPill>
        )}

        {['level3', 'chua_lang1'].includes(currentMinigameId) && (
          <StatPill
            icon={<VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: noiseMeterColor }} />}
          >
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: noiseMeterColor }}>
              Ồn
            </span>
            <BarMeter value={noiseLevel} color={noiseMeterColor} wClass="w-20 sm:w-32" />
          </StatPill>
        )}
      </div>
    </div>
  );
};
