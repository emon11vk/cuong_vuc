import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { useGameStore } from '../store/gameStore';
import { MapLoader } from '../components/Map/MapLoader';
import { TimelineSlider } from '../components/UI/TimelineSlider';
import { NavigationPanel } from '../components/UI/NavigationPanel';
import { TopHeaderBar } from '../components/UI/TopHeaderBar';
import { HistoricalChronicleModal } from '../components/UI/HistoricalChronicleModal';
import { GameMissionModal } from '../components/game/GameMissionModal';
import { ARAssetSpawner } from '../components/AR/ARAssetSpawner';

// Create XR store for react-three/xr v6
const xrStore = createXRStore();

export const MapScreen: React.FC = () => {
  const loadLocationData = useGameStore((state) => state.loadLocationData);
  const isARMode = useGameStore((state) => state.isARMode);
  const setARMode = useGameStore((state) => state.setARMode);

  const [arSupported, setArSupported] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isChronicleOpen, setIsChronicleOpen] = useState(false);

  useEffect(() => {
    loadLocationData();
    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setArSupported(supported);
      });
    }
  }, [loadLocationData]);

  const handleEnterAR = () => {
    setARMode(true);
    xrStore.enterAR();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0c0806] relative">
      {/* Cinematic Historical Vignette */}
      <div className="vintage-vignette" />

      {/* Top Tactical Header Bar */}
      <TopHeaderBar
        onOpenChronicle={() => setIsChronicleOpen(true)}
        isNavOpen={isNavOpen}
        onToggleNav={() => setIsNavOpen(!isNavOpen)}
        arSupported={arSupported}
        onEnterAR={handleEnterAR}
      />

      {/* Lớp Bản đồ 2D/3D (MapLibre) nằm dưới cùng */}
      <MapLoader />

      {/* Lớp thực tế ảo 3D (React Three Fiber) nằm đè lên trên, chỉ kích hoạt khi vào chế độ AR */}
      {isARMode && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <Canvas camera={{ position: [0, 10, 10], fov: 50 }} shadows style={{ pointerEvents: 'none' }}>
            <XR store={xrStore}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
              <ARAssetSpawner />
            </XR>
          </Canvas>
        </div>
      )}
      
      {/* Tactical Overlay: Navigation & Timeline Controls */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <NavigationPanel 
          isOpen={isNavOpen} 
          onClose={() => setIsNavOpen(false)} 
        />
        <TimelineSlider />
      </div>

      {/* Modal Sổ Tay Sử Lược 60 Ngày Đêm */}
      <HistoricalChronicleModal
        isOpen={isChronicleOpen}
        onClose={() => setIsChronicleOpen(false)}
      />

      {/* Modal nhiệm vụ game tương tác tại Đại học Ngoại Thương */}
      <GameMissionModal />
    </div>
  );
};
