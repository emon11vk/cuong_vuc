import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import Map, { Marker, GeolocateControl, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ThreeDModelLayer } from './ThreeDModelLayer';
import { CameraModeControl } from './CameraModeControl';
import {
  hanoi1946WaterGeoJSON,
  hanoi1946CitadelGeoJSON,
  hanoi1946RoadsGeoJSON,
  hanoi1946LabelsGeoJSON
} from '../../data/hanoi1946GeoData';
import { MapPin } from 'lucide-react';

const QUESTS = [
  { id: 'level1', name: 'Đục tường (Chợ Đồng Xuân)', lat: 21.0371, lng: 105.8504 },
  { id: 'level2', name: 'The Night Raid (Cửa Bắc)', lat: 21.0378, lng: 105.8427 },
  { id: 'level3', name: 'The Retreat (Long Biên)', lat: 21.0423, lng: 105.8569 },
  { id: 'chua_lang1', name: 'Mud & Lotus (Chùa Láng)', lat: 21.0215, lng: 105.8021 },
  { id: 'chua_lang2', name: 'Láng Road Ambush (Đê Láng)', lat: 21.0205, lng: 105.8035 },
  { id: 'chua_lang3', name: 'Courier Maze (FTU)', lat: 21.0232, lng: 105.8048 },
];

export const MapLoader: React.FC = () => {
  const fetchUserLocation = useGameStore((state) => state.fetchUserLocation);
  const userLocation = useGameStore((state) => state.userLocation);
  const setUserLocation = useGameStore((state) => state.setUserLocation);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const sliderValue = useGameStore((state) => state.sliderValue);
  const routeGeoJSON = useGameStore((state) => state.routeGeoJSON);
  const [labelLayerId, setLabelLayerId] = useState<string | undefined>(undefined);
  const mapRef = useRef<any>(null);
  const navigate = useNavigate();

  const keysPressed = useRef(new Set<string>());
  const requestRef = useRef<number>(0);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

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
  }, [cameraMode]);

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
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-bold">
        Đang lấy định vị GPS...
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

        {/* --- QUEST MARKERS --- */}
        {QUESTS.map((quest) => {
          // Calculate distance to check if player is close enough to start
          const dist = Math.sqrt(Math.pow(userLocation.lat - quest.lat, 2) + Math.pow(userLocation.lng - quest.lng, 2));
          const isClose = dist < 0.005; // rough proximity

          return (
            <Marker key={quest.id} longitude={quest.lng} latitude={quest.lat} anchor="bottom">
              <div 
                className="flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform z-20 group"
                onClick={(e) => {
                  e.stopPropagation();
                  if (document.pointerLockElement) {
                    document.exitPointerLock();
                  }
                  navigate(`/minigame/${quest.id}`);
                }}
              >
                <div className="bg-yellow-500 text-black px-2 py-1 rounded shadow-lg font-bold text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 pointer-events-none">
                  {quest.name}
                </div>
                <div className="bg-black text-yellow-500 rounded-full p-2 border-2 border-yellow-500 shadow-[0_0_15px_#eab308]">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                {isClose && (
                  <div className="mt-1 bg-green-500 text-white text-[10px] font-bold px-1 rounded animate-pulse">
                    AVAILABLE
                  </div>
                )}
              </div>
            </Marker>
          );
        })}

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
