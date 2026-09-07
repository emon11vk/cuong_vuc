import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { useGameStore } from './store/gameStore';
import { MapLoader } from './components/Map/MapLoader';
import { TimelineSlider } from './components/UI/TimelineSlider';
import { ARAssetSpawner } from './components/AR/ARAssetSpawner';

// Create XR store for react-three/xr v6
const xrStore = createXRStore();

function App() {
  const loadLocationData = useGameStore((state) => state.loadLocationData);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    loadLocationData();
    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setArSupported(supported);
      });
    }
  }, [loadLocationData]);

  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 relative">
      <div className="absolute top-4 left-4 z-50 pointer-events-auto flex gap-2">
        <button 
          onClick={() => setCameraMode(cameraMode === 'fpv' ? 'tpv' : 'fpv')}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg font-bold shadow-lg border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          {cameraMode === 'fpv' ? '🎥 Chuyển sang Góc nhìn thứ 3' : '🏃 Chuyển sang Góc nhìn thứ 1'}
        </button>
      </div>

      {arSupported && (
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => xrStore.enterAR()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg cursor-pointer hover:bg-blue-500 pointer-events-auto"
          >
            Enter AR
          </button>
        </div>
      )}

      {/* Lớp Bản đồ 2D/3D (MapLibre) nằm dưới cùng */}
      <MapLoader />

      {/* Lớp thực tế ảo 3D (React Three Fiber) nằm đè lên trên, trong suốt, để hứng các vật thể AR */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <Canvas camera={{ position: [0, 10, 10], fov: 50 }} shadows style={{ pointerEvents: 'none' }}>
          <XR store={xrStore}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
            <ARAssetSpawner />
          </XR>
        </Canvas>
      </div>
      
      <div className="absolute inset-0 pointer-events-none z-20">
        <TimelineSlider />
      </div>
    </div>
  );
}

export default App;
