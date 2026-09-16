import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameUI } from '../components/game/GameUI';
import { useHanoiStore } from '../store/useHanoiStore';
// Note: PhaserGame component will be created next
import { PhaserGame } from '../game/PhaserGame';

export const GameScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const startGame = useHanoiStore((state) => state.startGame);

  useEffect(() => {
    if (id) {
      startGame(id);
    }
  }, [id, startGame]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* React UI Overlays */}
      <GameUI />
      
      {/* Phaser Canvas Container */}
      <PhaserGame minigameId={id || 'level1'} onExit={() => navigate('/')} />
    </div>
  );
};
