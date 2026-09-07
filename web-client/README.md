# 🏛️ Hà Nội 1946 – 2026: Timeline 3D Map & AR Spatial Experience (Web Client)

> **Mã nguồn ứng dụng Frontend Web Client: Sa bàn bản đồ 3D lịch sử, tương tác dòng thời gian đa thời kỳ (Dual-Era Timeline) và thực tế tăng cường (WebXR AR).**

---

## 📌 1. Giới thiệu Tổng quan

`web-client` là ứng dụng Single Page Application (SPA) xây dựng trên nền tảng **React 19 + TypeScript + Vite**, kết hợp các công nghệ đồ họa không gian tiên tiến nhất:
- **MapLibre GL JS**: Kết xuất bản đồ vector và dữ liệu GIS WGS84 Hà Nội 1946 & 2026.
- **Three.js Custom Layer**: Dựng cảnh quan 3D đô thị, công trình lịch sử, cánh đồng lúa, bóng đổ và chiếu sáng thực tế.
- **WebXR Device API (@react-three/xr)**: Chế độ AR tương tác trực tiếp với thế giới thực.
- **Zustand**: Quản lý trạng thái toàn cục (State Management).
- **Tailwind CSS v4 & Framer Motion**: Giao diện Glassmorphism và hiệu ứng chuyển cảnh mượt mà.

---

## 🏗️ 2. Danh mục Công nghệ sử dụng

| Lĩnh vực | Thư viện / Công nghệ | Phiên bản | Vai trò & Mục đích |
| :--- | :--- | :--- | :--- |
| **Core Framework** | `React` / `React-DOM` | `^19.2.8` | UI Framework hiện đại nhất |
| **Language & Tooling**| `TypeScript` | `~6.0.2` | Đảm bảo an toàn kiểu dữ liệu và mô hình tọa độ GIS |
| **Build Tool** | `Vite` | `^5.4.11` | Dev server HMR siêu nhanh & build tối ưu |
| **Linter** | `Oxlint` | `^1.79.0` | Rust-based linter tốc độ cao |
| **Spatial Map Engine** | `MapLibre GL JS` | `^6.6.0` | Render bản đồ vector tile 60 FPS |
| **React Map Binding** | `react-map-gl/maplibre` | `^8.1.2` | Tích hợp MapLibre với vòng đời React |
| **3D Graphics Engine** | `Three.js` | `^0.185.1` | Dựng hình 3D, chiếu sáng, bóng đổ và ACESFilmic Tone Mapping |
| **React 3D Bridge** | `@react-three/fiber` | `^9.7.0` | Khai báo Three.js component theo mô hình React |
| **3D Helpers** | `@react-three/drei` | `^10.7.8` | Shader materials, loaders, camera helpers |
| **Augmented Reality** | `@react-three/xr` | `^6.6.30` | Chuẩn WebXR `immersive-ar` kết nối camera di động |
| **State Management** | `Zustand` | `^5.0.15` | Quản lý state toàn cục (GPS, FPV/TPV, Timeline, AR) |
| **Styling** | `Tailwind CSS` | `^4.3.3` | Thiết kế giao diện Glassmorphism HUD |
| **Animation** | `Framer Motion` | `^13.1.1` | Hiệu ứng chuyển động mượt mà cho slider và HUD |
| **Geocoding & Search**| `OSM Nominatim API` | REST API | Tìm kiếm địa danh và địa chỉ tiếng Việt |
| **Navigation & Routing**| `OSRM Routing Engine` | REST API | Tính toán lộ trình đường đi thực tế |

---

## 🚀 3. Hướng dẫn Phát triển & Vận hành

### Cài đặt dependencies:
```bash
npm install
```

### Chạy môi trường Development:
```bash
npm run dev
```

### Kiểm tra cú pháp (Linting):
```bash
npm run lint
```

### Đóng gói Production (Build):
```bash
npm run build
```

---

## 📂 4. Cấu trúc Source Code

```text
src/
├── components/
│   ├── AR/               # WebXR AR Asset Spawner & Fading Asset
│   ├── Map/              # MapLoader (MapLibre), ThreeDModelLayer (Three.js WebGL Layer)
│   └── UI/               # TimelineSlider, NavigationPanel, Teleport Presets
├── data/                 # hanoi1946GeoData.ts (GeoJSON Sông ngòi, Đê điều, Thành Cổ 1946)
├── shaders/              # TimelineBlendMaterial (Custom GLSL Shader)
├── store/                # gameStore.ts (Zustand Global State)
├── types/                # TypeScript Interfaces & Data Models
├── App.tsx               # Root Component tích hợp Map, R3F, XR & HUD
└── main.tsx              # React DOM Entrypoint
```
