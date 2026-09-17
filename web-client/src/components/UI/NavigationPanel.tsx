import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Search, X, Loader2, AlertTriangle, MapPin, Navigation, ChevronUp, ChevronDown } from 'lucide-react';

interface NavigationPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({ isOpen = true, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userLocation = useGameStore((state) => state.userLocation);
  const setRouteGeoJSON = useGameStore((state) => state.setRouteGeoJSON);
  const routeGeoJSON = useGameStore((state) => state.routeGeoJSON);
  const setUserLocation = useGameStore((state) => state.setUserLocation);
  const setGameModalOpen = useGameStore((state) => state.setGameModalOpen);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.length === 0) {
        setSearchError('Không tìm thấy địa điểm. Thử từ khóa khác?');
      }
      setResults(data);
    } catch {
      setSearchError('Không kết nối được. Kiểm tra mạng và thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRoute = async (destLat: number, destLng: number) => {
    if (!userLocation) return;
    setRouteError(null);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Route error');
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        setRouteGeoJSON(data.routes[0].geometry);
      } else {
        setRouteError('Không tìm được đường đi tới đích này.');
      }
    } catch {
      setRouteError('Lỗi tính đường. Thử lại sau.');
    }
  };

  const clearRoute = () => {
    setRouteGeoJSON(null);
    setRouteError(null);
  };

  const presets = [
    { name: '🏛️ ĐH Ngoại Thương (FTU)', lat: 21.0227, lng: 105.8045, isMission: true },
    { name: '💥 Ụ Pháo Láng', lat: 21.02105, lng: 105.80665 },
    { name: '🎋 Làng Láng', lat: 21.0228, lng: 105.8035 },
    { name: '🛡️ Giảng Võ', lat: 21.0275, lng: 105.8175 },
    { name: '🌊 Hồ Hoàn Kiếm', lat: 21.0287, lng: 105.8523 },
    { name: '🏯 Hoàng Thành', lat: 21.0365, lng: 105.8400 },
  ];

  const jumpToLocation = (lat: number, lng: number, isMission?: boolean) => {
    setUserLocation(lat, lng);
    calculateRoute(lat, lng);
    if (isMission) {
      setTimeout(() => {
        setGameModalOpen(true);
      }, 500);
    }
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    calculateRoute(lat, lng);
    setResults([]);
    const shortName = result.display_name.split(',').slice(0, 2).join(',').trim();
    setSearchQuery(shortName);
  };

  return (
    <div className="absolute top-16 sm:top-16 left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-full max-w-xl pointer-events-auto flex flex-col gap-2">
      {/* Search & Dispatch Card */}
      <div className="glass-lacquer rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
        {/* Header Bar */}
        <div className="px-3.5 py-2 flex items-center justify-between border-b border-amber-500/25 bg-black/20">
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider font-cinzel text-amber-300">
              Bản Đồ Tác Chiến & Lộ Trình
            </span>
            <span className="text-[10px] text-stone-500 font-mono">1946 / 2026</span>
          </div>

          <div className="flex items-center gap-1.5">
            {routeGeoJSON && (
              <button
                onClick={clearRoute}
                className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30 hover:bg-red-900/60 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Xóa lộ trình</span>
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-stone-400 hover:text-amber-300 transition-colors cursor-pointer btn-tactile"
              title={isCollapsed ? 'Mở rộng bảng' : 'Thu nhỏ bảng'}
              aria-label="Thu nhỏ hoặc mở rộng"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded text-stone-400 hover:text-red-400 transition-colors cursor-pointer btn-tactile"
                title="Đóng bảng tìm kiếm"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Row (Hidden when collapsed) */}
        {!isCollapsed && (
          <>
            <div className="flex gap-2 p-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-amber-400/80" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-black/40 outline-none text-sm font-medium text-amber-100 placeholder:text-stone-500 rounded-lg border border-amber-500/20 focus:border-amber-400/60 transition-colors"
                  placeholder="Nhập tên địa danh, phố cổ, chiến khu…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  aria-label="Tìm kiếm địa điểm"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={isSearching}
                aria-label="Tìm đường"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-60 cursor-pointer btn-tactile shadow"
                style={{
                  background: 'linear-gradient(135deg, #c59b27 0%, #a17812 100%)',
                  color: '#120b07',
                  border: '1px solid rgba(245, 212, 122, 0.6)'
                }}
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isSearching ? 'Đang tìm…' : 'Tìm Kiếm'}</span>
              </button>
            </div>

            {/* Error alerts */}
            {searchError && (
              <div className="flex items-center gap-2 px-3 pb-2.5 text-xs text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
            {routeError && (
              <div className="flex items-center gap-2 px-3 pb-2.5 text-xs text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{routeError}</span>
              </div>
            )}

            {/* Results dropdown */}
            {results.length > 0 && (
              <ul className="max-h-52 overflow-y-auto border-t border-amber-500/20 bg-black/40 hanoi-scrollbar">
                {results.map((r, i) => (
                  <li
                    key={i}
                    onClick={() => selectResult(r)}
                    className="flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer text-xs font-medium text-amber-100 hover:bg-amber-500/15 border-b border-amber-500/10 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span className="line-clamp-2">
                      {r.display_name.split(',').slice(0, 3).join(',')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Preset Location Pills */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => jumpToLocation(p.lat, p.lng, (p as any).isMission)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer btn-tactile flex items-center gap-1 shadow-md ${
              (p as any).isMission
                ? 'crimson-badge text-white font-bold animate-pulse'
                : 'bg-stone-950/80 text-amber-200 border border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400/70'
            }`}
            title={(p as any).isMission ? 'Trọng điểm nhiệm vụ: Nhấn để bay đến và mở nhiệm vụ RPG' : `Bay đến ${p.name}`}
          >
            <span>{p.name}</span>
            {(p as any).isMission && (
              <span className="text-[9px] bg-amber-400 text-stone-950 font-extrabold px-1 rounded ml-0.5">
                HOT
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
