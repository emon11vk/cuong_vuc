import React from 'react';
import { CameraControls } from '@react-three/drei';

export const MapController: React.FC = () => {
  return (
    <CameraControls 
      maxPolarAngle={Math.PI / 2.2} // Don't let camera go below ground
      minDistance={2} 
      maxDistance={30}
      mouseButtons={{
        left: 1, // Action.ROTATE
        middle: 8, // Action.DOLLY
        right: 2, // Action.TRUCK
        wheel: 8, // Action.DOLLY
      }}
    />
  );
};

