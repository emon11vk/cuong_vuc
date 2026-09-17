import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import Map, { Marker, GeolocateControl, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGameStore } from '../../store/gameStore';
import { ThreeDModelLayer } from './ThreeDModelLayer';
import { CameraModeControl } from './CameraModeControl';
import {
  hanoi1946WaterGeoJSON,
  hanoi1946CitadelGeoJSON,
  hanoi1946RoadsGeoJSON,
  hanoi1946LabelsGeoJSON
} from '../../data/hanoi1946GeoData';

export const MapLoader: React.FC = () => {
  const fetchUserLocation = useGameStore((state) => state.fetchUserLocation);
  const userLocation = useGameStore((state) => state.userLocation);
  const setUserLocation = useGameStore((state) => state.setUserLocation);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const sliderValue = useGameStore((state) => state.sliderValue);
  const routeGeoJSON = useGameStore((state) => state.routeGeoJSON);
  const setGameModalOpen = useGameStore((state) => state.setGameModalOpen);
  const [labelLayerId, setLabelLayerId] = useState<string | undefined>(undefined);
  const mapRef = useRef<any>(null);

  const FTU_COORDS = { lat: 21.0227, lng: 105.8045 };
  const distToFTU = userLocation 
    ? Math.sqrt(
        Math.pow(userLocation.lat - FTU_COORDS.lat, 2) + 
        Math.pow(userLocation.lng - FTU_COORDS.lng, 2)
      ) 
    : 999;
  const isNearFTU = distToFTU < 0.0008; // Khoảng cách ~80m quanh khuôn viên Ngoại Thương

  const keysPressed = useRef(new Set<string>());
  const requestRef = useRef<number>(0);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  // Phím tắt [E] hoặc [F] để vào nhiệm vụ khi ở gần FTU
  useEffect(() => {
    const handleTriggerKey = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F') && isNearFTU) {
        setGameModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleTriggerKey);
    return () => window.removeEventListener('keydown', handleTriggerKey);
  }, [isNearFTU, setGameModalOpen]);

  // Xử lý chuyển đổi Góc nhìn tức thời
  useEffect(() => {
    if (mapRef.current && userLocation) {
      if (cameraMode === 'fpv') {
        // Góc nhìn FPS: Gần mặt đất, góc thấp
        mapRef.current.jumpTo({ pitch: 80, zoom: 19.5 });
      } else {
        // Góc nhìn thứ 3
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        mapRef.current.jumpTo({ pitch: 60, zoom: 17 });
      }
    }
  }, [cameraMode, userLocation]);

  // Xử lý Mouselook (Xoay camera bằng chuột như game FPS)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement && mapRef.current) {
        const map = mapRef.current.getMap();
        const sensitivity = 0.25; // Độ nhạy chuột
        
        let newBearing = map.getBearing() + e.movementX * sensitivity;
        let newPitch = map.getPitch() - e.movementY * sensitivity;
        
        // Giới hạn góc ngước/cúi
        newPitch = Math.max(0, Math.min(85, newPitch));
        
        map.jumpTo({ bearing: newBearing, pitch: newPitch });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Vòng lặp game để xử lý di chuyển bằng bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const updatePosition = () => {
      if (keysPressed.current.size > 0 && mapRef.current) {
        const map = mapRef.current.getMap();
        const currentState = useGameStore.getState();
        const loc = currentState.userLocation;
        const mode = currentState.cameraMode;
        
        // FPV đi chậm hơn TPV
        const speed = mode === 'fpv' ? 0.000003 : 0.00001; 
        
        if (loc && map) {
          let newLat = loc.lat;
          let newLng = loc.lng;
          let bearing = map.getBearing();
          let moved = false;

          // W/S tiến/lùi
          if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
            newLat += Math.cos((bearing * Math.PI) / 180) * speed;
            newLng += Math.sin((bearing * Math.PI) / 180) * speed;
            moved = true;
          }
          if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
            newLat -= Math.cos((bearing * Math.PI) / 180) * speed;
            newLng -= Math.sin((bearing * Math.PI) / 180) * speed;
            moved = true;
          }

          // A/D strafe trái/phải
          if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
            newLat += Math.cos(((bearing - 90) * Math.PI) / 180) * speed;
            newLng += Math.sin(((bearing - 90) * Math.PI) / 180) * speed;
            moved = true;
          }
          if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
            newLat += Math.cos(((bearing + 90) * Math.PI) / 180) * speed;
            newLng += Math.sin(((bearing + 90) * Math.PI) / 180) * speed;
            moved = true;
          }

          if (moved) {
            currentState.setUserLocation(newLat, newLng);
            map.jumpTo({ center: [newLng, newLat] });
          }
        }
      }
      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Ép map vẽ lại tức thì khi kéo thanh slider thời gian
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.getMap()?.triggerRepaint();
    }
  }, [sliderValue]);

  const onMapLoad = (event: any) => {
    const map = event.target;
    
    const layers = map.getStyle().layers;
    let firstLabelId: string | undefined = undefined;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
        firstLabelId = layers[i].id;
        break;
      }
    }
    setLabelLayerId(firstLabelId);

    try {
      // 1. Lighting: Cấu hình Ánh sáng toàn cục (Lighting & Shadows)
      map.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.85,
        position: [1.15, 210, 30] // Tạo bóng đổ sắc nét
      });

      // 2c. Custom Layer dùng Three.js để vẽ mô hình 3D (.glb)
      map.addLayer(new ThreeDModelLayer(), firstLabelId);

    } catch (e) {
      console.warn('Could not add 3D buildings layer', e);
    }
  };

  const handleContextMenu = async (e: any) => {
    e.preventDefault();
    const { lng, lat } = e.lngLat;
    if (e.originalEvent.shiftKey) {
      setUserLocation(lat, lng);
      mapRef.current?.jumpTo({ center: [lng, lat] });
    }
  };

  const handleMapClick = () => {
    if (cameraMode === 'fpv') {
      document.body.requestPointerLock();
    }
  };

  if (!userLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-950 flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#d4a017', borderTopColor: 'transparent' }} />
        <p className="text-sm font-medium" style={{ color: '#d4a017', fontFamily: "'Inter', sans-serif" }}>Đang xác định vị trí…</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: 17,
          pitch: 60,
          bearing: 0
        }}
        mapStyle={{
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        }}
        onLoad={onMapLoad}
        onContextMenu={handleContextMenu}
        onClick={handleMapClick}
        interactive={true}
        keyboard={false}
        maxPitch={85}
        style={{ width: '100%', height: '100%' }}
      >
        {/* === BẢN ĐỒ LỊCH SỬ & ĐỊA HÌNH GIS HÀ NỘI 1946 (KHỚP 1:1 VỚI HỆ TỌA ĐỘ HIỆN TẠI) === */}
        {/* 1. Mặt nước & Sông Hồng (Sông Nhị Hà) & Các Hồ Lịch Sử */}
        <Source id="hanoi-1946-water-source" type="geojson" data={hanoi1946WaterGeoJSON}>
          {/* Lòng sông & Mặt hồ cổ kính */}
          <Layer
            id="hanoi-1946-water-fill-layer"
            type="fill"
            filter={['all', ['!=', 'type', 'sandbank'], ['==', '$type', 'Polygon']]}
            paint={{
              'fill-color': '#3b6b64',
              'fill-opacity': Math.max(0, Math.min(1, 1 - sliderValue)) * 0.85
            }}
            beforeId={labelLayerId}
          />
          {/* Viền bờ nước cổ kính */}
          <Layer
            id="hanoi-1946-water-line-layer"
            type="line"
            paint={{
              'line-color': '#23433e',
              'line-width': 2.0,
              'line-opacity': Math.max(0, Math.min(1, 1 - sliderValue))
            }}
            beforeId={labelLayerId}
          />
          {/* Bãi cát Phúc Xá */}
          <Layer
            id="hanoi-1946-sandbank-layer"
            type="fill"
            filter={['==', 'type', 'sandbank']}
            paint={{
              'fill-color': '#e0cca3',
              'fill-opacity': Math.max(0, Math.min(1, 1 - sliderValue)) * 0.9
            }}
            beforeId={labelLayerId}
          />
        </Source>

        {/* 2. Khu vực Thành Lính (Hoàng Thành Thăng Long 1946) */}
        <Source id="hanoi-1946-citadel-source" type="geojson" data={hanoi1946CitadelGeoJSON}>
          <Layer
            id="hanoi-1946-citadel-fill-layer"
            type="fill"
            paint={{
              'fill-color': '#cb997e',
              'fill-opacity': Math.max(0, Math.min(1, 1 - sliderValue)) * 0.75
            }}
            beforeId={labelLayerId}
          />
          <Layer
            id="hanoi-1946-citadel-line-layer"
            type="line"
            paint={{
              'line-color': '#6b4226',
              'line-width': 3.5,
              'line-opacity': Math.max(0, Math.min(1, 1 - sliderValue))
            }}
            beforeId={labelLayerId}
          />
        </Source>

        {/* 4. Mạng lưới đường xá, Đê điều & Đường sắt 1946 */}
        <Source id="hanoi-1946-roads-source" type="geojson" data={hanoi1946RoadsGeoJSON}>
          {/* Đê Sông Hồng */}
          <Layer
            id="hanoi-1946-dike-layer"
            type="line"
            filter={['==', 'type', 'dike']}
            paint={{
              'line-color': '#582f0e',
              'line-width': 4.0,
              'line-opacity': Math.max(0, Math.min(1, 1 - sliderValue))
            }}
            beforeId={labelLayerId}
          />
          {/* Tuyến Đường sắt xuyên Đông Dương & Cầu Long Biên */}
          <Layer
            id="hanoi-1946-railway-layer"
            type="line"
            filter={['==', 'type', 'railway']}
            paint={{
              'line-color': '#212529',
              'line-width': 2.5,
              'line-dasharray': [2, 2],
              'line-opacity': Math.max(0, Math.min(1, 1 - sliderValue))
            }}
            beforeId={labelLayerId}
          />
          {/* Đường phố & Đại lộ */}
          <Layer
            id="hanoi-1946-streets-layer"
            type="line"
            filter={['in', 'type', 'street', 'boulevard', 'main_street']}
            paint={{
              'line-color': '#7f4f24',
              'line-width': 2.2,
              'line-opacity': Math.max(0, Math.min(1, 1 - sliderValue))
            }}
            beforeId={labelLayerId}
          />
        </Source>

        {/* 5. Địa danh & Cửa Ô Hà Nội 1946 */}
        <Source id="hanoi-1946-labels-source" type="geojson" data={hanoi1946LabelsGeoJSON}>
          <Layer
            id="hanoi-1946-labels-layer"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 12,
              'text-anchor': 'center',
              'text-allow-overlap': true
            }}
            paint={{
              'text-color': '#2b1e16',
              'text-halo-color': '#f4ebd9',
              'text-halo-width': 2.0,
              'text-opacity': Math.max(0, Math.min(1, 1 - sliderValue))
            }}
          />
        </Source>

        <NavigationControl position="top-right" visualizePitch={true} />
        <GeolocateControl 
          position="top-right" 
          showAccuracyCircle={false}
          showUserLocation={false}
          positionOptions={{ enableHighAccuracy: true }}
          onGeolocate={(e: any) => {
            if (e.coords) {
              setUserLocation(e.coords.latitude, e.coords.longitude);
              mapRef.current?.jumpTo({ center: [e.coords.longitude, e.coords.latitude], zoom: 17 });
            }
          }}
        />
        <CameraModeControl position="top-right" />
        
        {/* Render Marker người chơi gọn gàng (không bị vòng tròn xanh khổng lồ che phủ) */}
        <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
          <div className={`relative flex items-center justify-center ${cameraMode === 'fpv' ? 'hidden' : 'flex'}`}>
            <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="w-8 h-8 bg-blue-400/40 rounded-full absolute animate-ping pointer-events-none" />
          </div>
        </Marker>

        {/* Điểm Ghim Nhiệm Vụ Đặc Biệt: Trường Đại Học Ngoại Thương (FTU) */}
        <Marker longitude={FTU_COORDS.lng} latitude={FTU_COORDS.lat} anchor="bottom">
          <div 
            onClick={() => setGameModalOpen(true)}
            className="cursor-pointer group flex flex-col items-center pointer-events-auto select-none transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            {/* Tag name */}
            <div 
              className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-xl flex items-center gap-1.5 whitespace-nowrap mb-1"
              style={{
                background: 'linear-gradient(135deg, rgba(161, 35, 35, 0.95) 0%, rgba(120, 21, 21, 0.95) 100%)',
                color: '#f8f1e5',
                border: '1.5px solid #d4a017',
                boxShadow: '0 4px 15px rgba(0,0,0,0.6), 0 0 10px rgba(212, 160, 23, 0.4)'
              }}
            >
              <span className="text-xs">🏛️</span>
              <span>ĐH Ngoại Thương</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400/30 text-amber-200 border border-amber-300/40">
                NHIỆM VỤ
              </span>
            </div>

            {/* Glowing Pin */}
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-red-600/30 animate-ping absolute" />
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-lg"
                style={{
                  background: 'radial-gradient(circle, #cb2d2d 0%, #781515 100%)',
                }}
              >
                <span className="text-white text-xs font-black">⚔️</span>
              </div>
              <div className="w-1.5 h-2 bg-amber-400 mt-7 absolute rounded-b-sm" />
            </div>
          </div>
        </Marker>

        {/* 6. Lớp vẽ Lộ trình đường đi (Routing) bằng OSRM */}
        {routeGeoJSON && (
          <Source id="osrm-route-source" type="geojson" data={routeGeoJSON}>
            <Layer
              id="osrm-route-line-layer"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#3b82f6', // Màu xanh dương (blue-500)
                'line-width': 6,
                'line-opacity': 0.8
              }}
            />
            {/* Viền ngoài cho đường đi thêm nổi bật */}
            <Layer
              id="osrm-route-outline-layer"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#1e3a8a', // Màu xanh dương đậm
                'line-width': 10,
                'line-opacity': 0.5
              }}
              beforeId="osrm-route-line-layer"
            />
          </Source>
        )}

      </Map>

      {/* Thông báo Hỏa Tốc Quân Lệnh - Tiếp cận địa bàn Nhiệm vụ Ngoại Thương */}
      {isNearFTU && (
        <div 
          onClick={() => setGameModalOpen(true)}
          className="absolute bottom-28 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 cursor-pointer pointer-events-auto flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-2xl border shadow-2xl transition-all hover:scale-105 btn-tactile animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(28, 14, 8, 0.98) 0%, rgba(68, 18, 18, 0.98) 100%)',
            borderColor: 'rgba(245, 212, 122, 0.85)',
            boxShadow: '0 15px 45px rgba(0,0,0,0.9), 0 0 25px rgba(229, 186, 99, 0.45)',
          }}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-amber-200 shrink-0 shadow-inner"
            style={{
              background: 'linear-gradient(135deg, #cb2d2d 0%, #8b1818 100%)',
              border: '1.5px solid rgba(245, 212, 122, 0.75)'
            }}
          >
            ⚔️
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold font-cinzel text-amber-300 tracking-wide flex items-center gap-2">
              <span>HỎA TỐC: ĐỊA BÀN ĐẠI HỌC NGOẠI THƯƠNG</span>
              <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded font-mono border border-red-500/50">
                SẴN SÀNG
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5 font-body">
              Nhấn phím <kbd className="px-1.5 py-0.5 bg-black/60 text-amber-400 font-mono rounded border border-amber-500/40 text-[11px] font-bold">[E]</kbd> hoặc bấm vào đây để bước vào trận đánh!
            </p>
          </div>
        </div>
      )}

      {/* Tactical HUD Coordinates Readout (Bottom Left) */}
      <div className="hidden sm:flex absolute bottom-6 left-6 z-30 pointer-events-auto items-center gap-2.5 px-3.5 py-2 rounded-xl glass-lacquer text-xs select-none shadow-xl">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-mono text-[9px] text-amber-400/90 font-bold uppercase tracking-wider">
            TỌA ĐỘ TÁC CHIẾN 1946
          </span>
          <span className="font-mono text-[11px] text-stone-200">
            {userLocation 
              ? `${userLocation.lat.toFixed(5)}°B • ${userLocation.lng.toFixed(5)}°Đ`
              : '21.02270°B • 105.80450°Đ'}
          </span>
        </div>
      </div>

      {/* Giao diện Hồng tâm FPS */}
      {cameraMode === 'fpv' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          <div className="w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_#0f0]"></div>
          <div className="w-8 h-8 border-2 border-green-400/50 rounded-full absolute"></div>
          {!document.pointerLockElement && (
            <div className="absolute top-32 text-green-400 font-mono text-sm bg-black/60 px-4 py-2 rounded border border-green-400/30 shadow-[0_0_10px_rgba(0,255,0,0.2)]">
              👉 CLICK CHUỘT TRÁI ĐỂ KÍCH HOẠT NHÌN QUANH BẰNG CHUỘT (ESC để thoát)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
