import { create } from 'zustand';
import type { HistoricalLocation } from '../types';

interface GameState {
  currentLocation: HistoricalLocation | null;
  userLocation: { lat: number; lng: number } | null;
  currentEraId: string;
  isARMode: boolean;
  sliderValue: number; // 0 for past, 1 for present
  cameraMode: 'fpv' | 'tpv'; // First-person vs Third-person
  routeGeoJSON: any | null; // Dữ liệu đường đi
  isGameModalOpen: boolean;
  
  setLocation: (location: HistoricalLocation) => void;
  setUserLocation: (lat: number, lng: number) => void;
  setEraId: (id: string) => void;
  setARMode: (isAR: boolean) => void;
  setSliderValue: (val: number) => void;
  setCameraMode: (mode: 'fpv' | 'tpv') => void;
  setRouteGeoJSON: (geojson: any) => void;
  setGameModalOpen: (open: boolean) => void;
  loadLocationData: () => Promise<void>;
  fetchUserLocation: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLocation: null,
  userLocation: { lat: 21.02877, lng: 105.85235 }, // Mặc định: Trung tâm Hà Nội (Tháp Rùa - Hoàn Kiếm) để bản đồ luôn tải ngay
  currentEraId: 'present',
  isARMode: false,
  sliderValue: 1,
  cameraMode: 'tpv',
  routeGeoJSON: null,
  isGameModalOpen: false,

  setLocation: (location) => set({ currentLocation: location }),
  setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  setEraId: (id) => set({ currentEraId: id }),
  setARMode: (isAR) => set({ isARMode: isAR }),
  setSliderValue: (val) => set({ sliderValue: val }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setRouteGeoJSON: (geojson) => set({ routeGeoJSON: geojson }),
  setGameModalOpen: (open) => set({ isGameModalOpen: open }),
  
  fetchUserLocation: () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({ userLocation: { lat: position.coords.latitude, lng: position.coords.longitude } });
        },
        (error) => {
          console.warn('GPS location unavailable or denied, retaining default location:', error);
          set({ userLocation: { lat: 21.02877, lng: 105.85235 } });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      set({ userLocation: { lat: 21.02877, lng: 105.85235 } });
    }
  },

  loadLocationData: async () => {
    try {
      const response = await fetch('/data/location-data.json');
      if (response.ok) {
        const data: HistoricalLocation = await response.json();
        set({ currentLocation: data });
      } else {
        console.error('Failed to load location data');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  },
}));

