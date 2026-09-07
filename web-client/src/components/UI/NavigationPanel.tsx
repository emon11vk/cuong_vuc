import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export const NavigationPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const userLocation = useGameStore((state) => state.userLocation);
  const setRouteGeoJSON = useGameStore((state) => state.setRouteGeoJSON);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRoute = async (destLat: number, destLng: number) => {
    if (!userLocation) return;
    try {
      // OSRM yêu cầu kinh độ (lon) trước, vĩ độ (lat) sau
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        setRouteGeoJSON(data.routes[0].geometry);
      }
    } catch (e) {
      console.error('Route error', e);
    }
  };

  const setUserLocation = useGameStore((state) => state.setUserLocation);

  const presets = [
    { name: '💥 Số 8 Pháo Đài Láng (Ụ Pháo)', lat: 21.02105, lng: 105.80665 },
    { name: '🌾 Làng Láng & Đồng Ruộng', lat: 21.0228, lng: 105.8035 },
    { name: '🌾 Giảng Võ - Ngọc Khánh', lat: 21.0275, lng: 105.8175 },
    { name: '🏛️ Hồ Hoàn Kiếm', lat: 21.0287, lng: 105.8523 },
    { name: '🏰 Hoàng Thành Thăng Long', lat: 21.0365, lng: 105.8400 }
  ];

  const jumpToLocation = (lat: number, lng: number) => {
    setUserLocation(lat, lng);
    calculateRoute(lat, lng);
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Di chuyển người chơi và tìm đường đến đích
    setUserLocation(lat, lng);
    calculateRoute(lat, lng);
    
    setResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl pointer-events-auto flex flex-col gap-2">
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-200">
        <div className="flex p-2 gap-2">
          <input
            type="text"
            className="flex-1 p-2 bg-transparent outline-none text-gray-800 placeholder-gray-500 font-medium text-sm"
            placeholder="Tìm kiếm địa điểm (VD: Chùa Láng, Hồ Gươm)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors shadow text-sm"
          >
            {isSearching ? 'Đang tìm...' : 'Tìm đường'}
          </button>
        </div>
        {results.length > 0 && (
          <ul className="max-h-60 overflow-y-auto border-t border-gray-200 bg-white">
            {results.map((r, i) => (
              <li
                key={i}
                className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                onClick={() => selectResult(r)}
              >
                📍 {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Nút dịch chuyển tức thời tới các địa danh tiêu biểu */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => jumpToLocation(p.lat, p.lng)}
            className="px-3 py-1.5 bg-gray-900/80 hover:bg-blue-700 text-white text-xs font-semibold rounded-full backdrop-blur shadow border border-white/20 transition-all transform hover:scale-105 active:scale-95"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
};

