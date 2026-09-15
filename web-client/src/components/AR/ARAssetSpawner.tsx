import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ARAssetSpawner: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);
  const isARMode = useGameStore((state) => state.isARMode);

  if (!isARMode || !currentLocation || !currentLocation.arMarkers || currentLocation.arMarkers.length === 0) {
    return null;
  }

  return null;
};


