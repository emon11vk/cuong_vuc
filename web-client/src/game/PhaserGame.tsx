import { useEffect, useRef } from 'react';
import StartGame from './main';

import { XCircle } from 'lucide-react';

interface PhaserGameProps {
  minigameId: string;
  onExit: () => void;
}

export const PhaserGame = ({ minigameId, onExit }: PhaserGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Initialize Phaser only once
    if (!gameRef.current) {
      gameRef.current = StartGame('phaser-container');
    }
    
    const game = gameRef.current;
    
    // Pass the target minigame to the registry so BootScene knows what to load
    game.registry.set('targetMinigame', minigameId);
    
    // If BootScene is active, or if we need to restart it
    if (game.scene.isSleeping('Boot') || !game.scene.isActive('Boot')) {
      game.scene.start('Boot');
    }

    return () => {
      // Cleanup Phaser on unmount
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        
        // Remove custom global plugins from cache so they can be re-registered
        if (window.Phaser && window.Phaser.Plugins && window.Phaser.Plugins.PluginCache) {
          window.Phaser.Plugins.PluginCache.removeCustom('rexVirtualJoystick');
        }
      }
    };
  }, [minigameId]);

  return (
    <div className="relative w-full h-full">
      {/* Container for Phaser Canvas */}
      <div id="phaser-container" className="absolute inset-0 flex items-center justify-center bg-black" />
      
      {/* Exit Button (Top Right) */}
      <button 
        onClick={onExit}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-lg pointer-events-auto transition-transform hover:scale-110 flex items-center gap-2 font-bold uppercase text-sm"
      >
        <XCircle className="w-5 h-5" />
        Abort Quest
      </button>
    </div>
  );
};
