import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Search, X, Loader2, AlertTriangle, MapPin, Navigation } from 'lucide-react';

export const NavigationPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const userLocation = useGameStore((state) => state.userLocation);
  const setRouteGeoJSON = useGameStore((state) => state.setRouteGeoJSON);
  const routeGeoJSON = useGameStore((state) => state.routeGeoJSON);

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

  const setUserLocation = useGameStore((state) => state.setUserLocation);

  const presets = [
    { name: 'Ụ Pháo Láng', lat: 21.02105, lng: 105.80665 },
    { name: 'Làng Láng', lat: 21.0228, lng: 105.8035 },
    { name: 'Giảng Võ', lat: 21.0275, lng: 105.8175 },
    { name: 'Hồ Hoàn Kiếm', lat: 21.0287, lng: 105.8523 },
    { name: 'Hoàng Thành', lat: 21.0365, lng: 105.8400 },
  ];

  const jumpToLocation = (lat: number, lng: number) => {
    setUserLocation(lat, lng);
    calculateRoute(lat, lng);
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    calculateRoute(lat, lng);
    setResults([]);
    // Truncate display name: take first two comma-separated segments
    const shortName = result.display_name.split(',').slice(0, 2).join(',').trim();
    setSearchQuery(shortName);
  };

  return (
    <div className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-full max-w-xl pointer-events-auto flex flex-col gap-2">

      {/* ── Search card — wartime dispatch aesthetic ── */}
      <div
        className="flex flex-col overflow-hidden rounded-lg shadow-xl border"
        style={{
          background: 'rgba(28, 16, 7, 0.92)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(212, 160, 23, 0.35)',
        }}
      >
        {/* Header strip */}
        <div
          className="px-3 py-1.5 flex items-center gap-2 border-b"
          style={{ borderColor: 'rgba(212, 160, 23, 0.2)' }}
        >
          <Navigation className="w-3 h-3 shrink-0" style={{ color: '#d4a017' }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ fontFamily: "'Playfair Display', serif", color: '#d4a017', letterSpacing: '0.12em' }}
          >
            Chỉ Đường — Hà Nội 1946
          </span>
        </div>

        {/* Search row */}
        <div className="flex gap-2 p-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: '#d4a017' }}
            />
            <input
              type="text"
              className="w-full pl-8 pr-3 py-2 bg-transparent outline-none text-sm font-medium placeholder:text-stone-500 rounded"
              style={{ color: '#f4edd8', fontFamily: "'Inter', sans-serif" }}
              placeholder="Tìm kiếm địa điểm…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Tìm kiếm địa điểm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            aria-label="Tìm đường"
            className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold transition-all duration-150 disabled:opacity-60 active:scale-95"
            style={{
              background: '#d4a017',
              color: '#1c1007',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isSearching ? 'Đang tìm…' : 'Tìm'}</span>
          </button>
          {routeGeoJSON && (
            <button
              onClick={clearRoute}
              title="Xóa đường đi"
              aria-label="Xóa đường đi"
              className="flex items-center px-2 py-2 rounded transition-all duration-150 hover:bg-white/10 active:scale-95"
              style={{ color: '#e8d9b8' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error states */}
        {searchError && (
          <div
            className="flex items-center gap-2 px-3 pb-3 text-xs"
            style={{ color: '#f5a623' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
        {routeError && (
          <div
            className="flex items-center gap-2 px-3 pb-3 text-xs"
            style={{ color: '#e05c5c' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{routeError}</span>
          </div>
        )}

        {/* Search results */}
        {results.length > 0 && (
          <ul
            className="max-h-56 overflow-y-auto border-t hanoi-scrollbar"
            style={{ borderColor: 'rgba(212, 160, 23, 0.2)' }}
          >
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => selectResult(r)}
                className="flex items-start gap-2 px-3 py-2.5 cursor-pointer text-xs font-medium transition-colors duration-100"
                style={{ color: '#e8d9b8', borderBottom: '1px solid rgba(212,160,23,0.1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,160,23,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <MapPin className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#d4a017' }} />
                <span className="line-clamp-2">
                  {r.display_name.split(',').slice(0, 3).join(',')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Preset location pills ── */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => jumpToLocation(p.lat, p.lng)}
            className="px-3 py-2 text-xs font-semibold rounded-full transition-all duration-200 active:scale-95 min-h-[36px]"
            style={{
              background: 'rgba(28, 16, 7, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(212, 160, 23, 0.4)',
              color: '#f4edd8',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,160,23,0.25)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,160,23,0.8)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(28,16,7,0.85)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,160,23,0.4)';
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
};
