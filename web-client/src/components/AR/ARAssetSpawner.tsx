import React, { useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FadingAsset: React.FC<{ marker: any; currentEraId: string }> = ({ marker, currentEraId }) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const isVisible = marker.eraId === currentEraId;

  useFrame(() => {
    if (materialRef.current) {
      const targetOpacity = isVisible ? 1 : 0;
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        0.05
      );
      // Optional: Disable rendering if fully invisible to save performance
      materialRef.current.visible = materialRef.current.opacity > 0.01;
    }
  });

  return (
    <group position={[marker.relativePosition.x, marker.relativePosition.y, marker.relativePosition.z]}>
      {marker.assetType === '3D_MODEL' ? (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial ref={materialRef} color="hotpink" transparent opacity={0} />
        </mesh>
      ) : (
        <mesh>
          <planeGeometry args={[1, 2]} />
          <meshStandardMaterial ref={materialRef} color="cyan" transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};

export const ARAssetSpawner: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);
  const currentEraId = useGameStore((state) => state.currentEraId);

  if (!currentLocation) return null;

  return (
    <group>
      {currentLocation.arMarkers.map((marker) => (
        <FadingAsset key={marker.id} marker={marker} currentEraId={currentEraId} />
      ))}
    </group>
  );
};

