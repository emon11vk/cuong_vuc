import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as maplibregl from 'maplibre-gl';
import { useGameStore } from '../../store/gameStore';

interface ModelMeta {
    scene: THREE.Group;
    rawHeight: number;
    rawWidth: number;
    rawDepth: number;
}

export class ThreeDModelLayer implements maplibregl.CustomLayerInterface {
    public id: string = '3d-models-custom-layer';
    public type: 'custom' = 'custom';
    public renderingMode: '3d' = '3d';
    
    private map!: maplibregl.Map;
    private camera!: THREE.Camera;
    private scene!: THREE.Scene;
    private renderer!: THREE.WebGLRenderer;
    private models: Record<string, ModelMeta> = {};
    private placedModels: Map<string, THREE.Group> = new Map();
    private isLoaded: boolean = false;
    private baseCoords: { lng: number; lat: number } | null = null;
    private originMC: maplibregl.MercatorCoordinate | null = null;
    private meterScale: number = 1;
    private originTransform: THREE.Matrix4 = new THREE.Matrix4();
    private debounceTimer: any = null;

    // Danh sách các công trình lịch sử cố định (tồn tại xuyên suốt các thời kỳ)
    private readonly fixedLandmarks = [
        {
            id: 'fixed-thap-rua-hoan-kiem',
            name: 'Tháp Rùa - Hồ Hoàn Kiếm',
            model: 'pagoda',
            lng: 105.85235,
            lat: 21.02877,
            height: 18,
            rot: 0
        },
        {
            id: 'fixed-den-ngoc-son',
            name: 'Đền Ngọc Sơn - Đảo Ngọc',
            model: 'pagoda',
            lng: 105.85330,
            lat: 21.03050,
            height: 20,
            rot: 45
        },
        {
            id: 'fixed-cot-co-ha-noi',
            name: 'Cột Cờ Hà Nội (Kỳ Đài - Thành Lính)',
            model: 'pagoda',
            lng: 105.83980,
            lat: 21.03180,
            height: 33,
            rot: 0
        },
        {
            id: 'fixed-cua-bac-thanh-co',
            name: 'Cửa Bắc (Chính Bắc Môn - Thành Hà Nội)',
            model: 'pagoda',
            lng: 105.84000,
            lat: 21.04100,
            height: 24,
            rot: 0
        },
        {
            id: 'fixed-doan-mon-thanh-co',
            name: 'Đoan Môn (Hoàng Thành Thăng Long)',
            model: 'pagoda',
            lng: 105.84000,
            lat: 21.03350,
            height: 22,
            rot: 0
        },
        {
            id: 'fixed-den-quan-thanh',
            name: 'Đền Quán Thánh (Hồ Trúc Bạch / Hồ Tây)',
            model: 'pagoda',
            lng: 105.83680,
            lat: 21.04570,
            height: 24,
            rot: 15
        },
        {
            id: 'fixed-chua-tran-quoc',
            name: 'Chùa Trấn Quốc (Bảo tháp Đảo Kim Ngư - Hồ Tây)',
            model: 'pagoda',
            lng: 105.83650,
            lat: 21.04780,
            height: 28,
            rot: 0
        },
        {
            id: 'fixed-van-mieu',
            name: 'Văn Miếu - Quốc Tử Giám',
            model: 'pagoda',
            lng: 105.83580,
            lat: 21.02780,
            height: 25,
            rot: 0
        },
        {
            id: 'fixed-chua-hai-ba-trung',
            name: 'Đền & Chùa Hai Bà Trưng (Đồng Nhân)',
            model: 'pagoda',
            lng: 105.85960,
            lat: 21.01180,
            height: 22,
            rot: 0
        },
        {
            id: 'fixed-chua-lang',
            name: 'Chùa Láng - Chiêu Thiền Tự (116 Chùa Láng)',
            model: 'pagoda',
            lng: 105.80215,
            lat: 21.02285,
            height: 32,
            rot: 20,
            era: 'both' as const
        },
        {
            id: 'fixed-ftu-hanoi',
            name: 'Trường Đại học Ngoại Thương (FTU Hà Nội - Thành lập 1960)',
            model: 'university',
            lng: 105.80480,
            lat: 21.02318,
            height: 38,
            rot: -20,
            era: 'modern' as const // Năm 1946 chưa thành lập, chỉ hiển thị ở thời hiện đại
        }
    ];

    public onAdd(map: maplibregl.Map, gl: WebGL2RenderingContext) {
        this.map = map;
        this.camera = new THREE.Camera();
        this.camera.matrixAutoUpdate = false;
        this.scene = new THREE.Scene();

        // 1. Ánh sáng toàn cảnh & mặt trời
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x555555, 2.5);
        this.scene.add(hemiLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight1.position.set(100, 100, 200).normalize();
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight2.position.set(-100, -100, 100).normalize();
        this.scene.add(dirLight2);

        // 2. Tải 14 mô hình 3D (.glb)
        const loader = new GLTFLoader();
        const base = import.meta.env.BASE_URL || '/';
        const origin = (base.endsWith('/') ? base : base + '/') + 'models/';
        
        const modelFiles = [
            { id: 'pagoda', url: origin + 'commercial/pagoda.glb', defaultHeight: 35 },
            { id: 'church', url: origin + 'commercial/church.glb', defaultHeight: 30 },
            { id: 'hospital', url: origin + 'commercial/Hospital.glb', defaultHeight: 25 },
            { id: 'school', url: origin + 'commercial/school.glb', defaultHeight: 20 },
            { id: 'university', url: origin + 'commercial/university.glb', defaultHeight: 28 },
            { id: 'supermarket', url: origin + 'commercial/lowpoly_supermarket.glb', defaultHeight: 18 },
            { id: 'skyscraper_1', url: origin + 'commercial/skycrapper_1.glb', defaultHeight: 60 },
            { id: 'skyscraper_2', url: origin + 'commercial/Skycrapper_2.glb', defaultHeight: 65 },
            { id: 'skyscraper_3', url: origin + 'commercial/Skycrapper_3.glb', defaultHeight: 75 },
            { id: 'tree', url: origin + 'commercial/Tree.glb', defaultHeight: 12 },
            { id: 'townhouse', url: origin + 'residential/Town_house.glb', defaultHeight: 16 },
            { id: 'small_house', url: origin + 'residential/small_house.glb', defaultHeight: 12 },
            { id: 'vietnamese_house', url: origin + 'residential/vietnamese_house.glb', defaultHeight: 10 },
            { id: 'abandoned_house', url: origin + 'residential/abandoned_house.glb', defaultHeight: 9 },
            { id: 'rice_field', url: origin + 'rice_field.glb', defaultHeight: 14 },
            { id: 'cannon', url: origin + 'cannon.glb', defaultHeight: 3.5 },
            { id: 'apartment', url: origin + 'residential/Appartment_building.glb', defaultHeight: 35 },
            { id: 'default_building', url: origin + 'default_building.glb', defaultHeight: 15 }
        ];

        let loadedCount = 0;
        modelFiles.forEach(mf => {
            loader.load(
                mf.url, 
                (gltf) => {
                    const modelScene = gltf.scene;

                    // Nếu model là Z-Up (rice_field hoặc abandoned_house), xoay -90 độ quanh trục X
                    if (mf.id === 'rice_field' || mf.id === 'abandoned_house') {
                        modelScene.rotation.x = -Math.PI / 2;
                        modelScene.updateMatrixWorld(true);
                    }

                    const box = new THREE.Box3().setFromObject(modelScene);
                    const size = new THREE.Vector3();
                    box.getSize(size);

                    const center = new THREE.Vector3();
                    box.getCenter(center);
                    modelScene.position.x = -center.x;
                    modelScene.position.y = -box.min.y;
                    modelScene.position.z = -center.z;

                    const pivotGroup = new THREE.Group();
                    pivotGroup.add(modelScene);

                    pivotGroup.traverse((child: any) => {
                        if (child.isMesh) {
                            child.frustumCulled = true;
                            child.castShadow = true;
                            child.receiveShadow = true;

                            if (child.material) {
                                const materials = Array.isArray(child.material) ? child.material : [child.material];
                                materials.forEach((mat: any) => {
                                    mat.side = THREE.DoubleSide;
                                    mat.depthWrite = true;
                                    mat.depthTest = true;
                                    mat.needsUpdate = true;
                                });
                            }
                        }
                    });

                    this.models[mf.id] = {
                        scene: pivotGroup,
                        rawHeight: size.y > 0.01 ? size.y : 1,
                        rawWidth: size.x > 0.01 ? size.x : 1,
                        rawDepth: size.z > 0.01 ? size.z : 1
                    };

                    loadedCount++;
                    this.isLoaded = true;
                    this.scheduleUpdateModels(50);
                },
                undefined,
                (error) => {
                    console.warn('Lỗi khi tải model:', mf.url, error);
                    loadedCount++;
                    if (loadedCount === modelFiles.length) {
                        this.isLoaded = true;
                        this.scheduleUpdateModels(50);
                    }
                }
            );
        });

        // 3. Khởi tạo WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
        });
        this.renderer.autoClear = false;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        map.on('moveend', () => this.scheduleUpdateModels(300));
        map.on('sourcedata', (e: any) => {
            if (e.sourceDataType === 'visibility' || e.isSourceLoaded) {
                this.scheduleUpdateModels(300);
            }
        });
    }

    private initLocalOrigin() {
        if (this.baseCoords) return;
        const center = this.map.getCenter();
        if (!center || isNaN(center.lng) || isNaN(center.lat)) return;

        this.baseCoords = { lng: center.lng, lat: center.lat };
        this.originMC = maplibregl.MercatorCoordinate.fromLngLat([center.lng, center.lat], 0);
        this.meterScale = this.originMC.meterInMercatorCoordinateUnits();

        const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.originTransform = new THREE.Matrix4()
            .makeTranslation(this.originMC.x, this.originMC.y, this.originMC.z)
            .scale(new THREE.Vector3(this.meterScale, -this.meterScale, this.meterScale))
            .multiply(rotationX);
    }

    private scheduleUpdateModels(delayMs: number = 300) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.updateModels();
        }, delayMs);
    }

    /**
     * Dựng toàn bộ kiến trúc cảnh quan 3D Hà Nội năm 1946 (36 Phố Phường, Thành Cổ, Phố Pháp, Cầu Long Biên)
     */
    private build1946HistoricalCity() {
        // A. 36 PHỐ PHƯỜNG HÀ NỘI 1946 (Nhà phố cổ mái ngói truyền thống 1-2 tầng)
        const oldQuarterStreets = [
            // Trục Hàng Đào - Hàng Ngang - Hàng Đường - Đồng Xuân
            { baseLng: 105.8520, baseLat: 21.0325, count: 5, dLng: -0.0006, dLat: 0.0018, model: 'townhouse', h: 10, rot: 15 },
            // Trục Hàng Bạc - Hàng Buồm - Hàng Chiếu (Đông sang Tây)
            { baseLng: 105.8550, baseLat: 21.0335, count: 6, dLng: -0.0010, dLat: 0.0001, model: 'townhouse', h: 11, rot: 90 },
            { baseLng: 105.8555, baseLat: 21.0360, count: 6, dLng: -0.0010, dLat: 0.0001, model: 'townhouse', h: 10, rot: 90 },
            { baseLng: 105.8560, baseLat: 21.0385, count: 6, dLng: -0.0010, dLat: 0.0001, model: 'townhouse', h: 12, rot: 90 },
            // Trục Mã Mây - Đào Duy Từ
            { baseLng: 105.8540, baseLat: 21.0340, count: 4, dLng: 0.0002, dLat: 0.0015, model: 'townhouse', h: 9, rot: -10 },
            // Trục Hàng Gai - Hàng Bông
            { baseLng: 105.8520, baseLat: 21.0315, count: 6, dLng: -0.0012, dLat: -0.0002, model: 'townhouse', h: 11, rot: 85 },
            // Trục Hàng Mã - Hàng Cót - Hàng Lược
            { baseLng: 105.8490, baseLat: 21.0370, count: 5, dLng: 0.0001, dLat: 0.0014, model: 'small_house', h: 9, rot: 0 },
            { baseLng: 105.8510, baseLat: 21.0380, count: 4, dLng: 0.0012, dLat: 0.0001, model: 'townhouse', h: 10, rot: 90 }
        ];

        let bIdx = 0;
        oldQuarterStreets.forEach(st => {
            for (let i = 0; i < st.count; i++) {
                const lng = st.baseLng + st.dLng * i;
                const lat = st.baseLat + st.dLat * i;
                const id = '1946-oldq-' + (bIdx++);
                this.placeModelAtCoords(id, st.model, lng, lat, st.h, st.rot + (i % 2 === 0 ? 5 : -5), '1946');
                if (i % 3 === 0) {
                    const treeId = '1946-oldq-tree-' + (bIdx++);
                    this.placeModelAtCoords(treeId, 'tree', lng + 0.00015, lat + 0.0001, 12, 0, '1946');
                }
            }
        });

        // A2. CÁC NẾP NHÀ CỔ TRUYỀN THỐNG (VIETNAMESE HOUSES) TRONG HÀ NỘI CŨ 1946
        const oldHanoiVietnameseHouses = [
            // 1. Khu Phố Cổ 36 Phố Phường (Hàng Bạc, Hàng Buồm, Mã Mây, Hàng Mã, Hàng Gai, Chợ Đồng Xuân, Ô Quan Chưởng)
            { id: '1946-vn-oldq-1', lng: 105.8542, lat: 21.0345, rot: 25 }, // Gần Mã Mây - Hàng Bạc
            { id: '1946-vn-oldq-2', lng: 105.8562, lat: 21.0338, rot: -15 }, // Phố Hàng Bè
            { id: '1946-vn-oldq-3', lng: 105.8532, lat: 21.0358, rot: 80 }, // Phố Hàng Buồm
            { id: '1946-vn-oldq-4', lng: 105.8512, lat: 21.0352, rot: -30 }, // Phố Lãn Ông
            { id: '1946-vn-oldq-5', lng: 105.8498, lat: 21.0368, rot: 15 }, // Phố Hàng Mã
            { id: '1946-vn-oldq-6', lng: 105.8522, lat: 21.0378, rot: -45 }, // Phố Hàng Đồng
            { id: '1946-vn-oldq-7', lng: 105.8572, lat: 21.0368, rot: 60 }, // Gần Cửa Ô Quan Chưởng
            { id: '1946-vn-oldq-8', lng: 105.8538, lat: 21.0385, rot: 0 }, // Gần Chợ Đồng Xuân
            { id: '1946-vn-oldq-9', lng: 105.8502, lat: 21.0308, rot: 40 }, // Phố Hàng Gai
            { id: '1946-vn-oldq-10', lng: 105.8485, lat: 21.0335, rot: -20 }, // Phố Cửa Đông
            { id: '1946-vn-oldq-11', lng: 105.8552, lat: 21.0350, rot: 90 }, // Phố Hàng Chĩnh
            { id: '1946-vn-oldq-12', lng: 105.8515, lat: 21.0392, rot: -10 }, // Phố Hàng Khoai

            // 2. Khu ven Hồ Hoàn Kiếm (Hồ Gươm) & Cầu Gỗ - Tràng Thi
            { id: '1946-vn-guom-1', lng: 105.8538, lat: 21.0315, rot: 30 }, // Cầu Gỗ - Đinh Liệt
            { id: '1946-vn-guom-2', lng: 105.8502, lat: 21.0312, rot: -60 }, // Phố Bảo Khánh
            { id: '1946-vn-guom-3', lng: 105.8492, lat: 21.0298, rot: 15 }, // Phố Hàng Hành
            { id: '1946-vn-guom-4', lng: 105.8522, lat: 21.0268, rot: -35 }, // Phố Hàng Khay
            { id: '1946-vn-guom-5', lng: 105.8492, lat: 21.0275, rot: 50 }, // Phố Tràng Thi

            // 3. Khu vực Ngoại vi Thành Cổ Thăng Long, Cột Cờ & Cửa Bắc
            { id: '1946-vn-citadel-1', lng: 105.8408, lat: 21.0425, rot: 10 }, // Phố Quán Thánh - Cửa Bắc
            { id: '1946-vn-citadel-2', lng: 105.8438, lat: 21.0420, rot: -25 }, // Phố Hàng Than - Hòe Nhai
            { id: '1946-vn-citadel-3', lng: 105.8472, lat: 21.0415, rot: 45 }, // Phố Hòe Nhai
            { id: '1946-vn-citadel-4', lng: 105.8378, lat: 21.0402, rot: -10 }, // Phố Phan Đình Phùng
            { id: '1946-vn-citadel-5', lng: 105.8402, lat: 21.0310, rot: 35 }, // Khu Cột Cờ Hà Nội
            { id: '1946-vn-citadel-6', lng: 105.8428, lat: 21.0305, rot: -40 }, // Phố Cửa Nam - Điện Biên Phủ

            // 4. Khu vực Văn Miếu - Quốc Tử Giám & Ga Hàng Cỏ & Khâm Thiên
            { id: '1946-vn-vanmieu-1', lng: 105.8358, lat: 21.0278, rot: 15 }, // Ven Văn Miếu Quốc Tử Giám
            { id: '1946-vn-vanmieu-2', lng: 105.8372, lat: 21.0285, rot: -20 }, // Phố Sinh Từ (Nguyễn Khuyến)
            { id: '1946-vn-vanmieu-3', lng: 105.8348, lat: 21.0292, rot: 55 }, // Phố Hàng Bột (Tôn Đức Thắng)
            { id: '1946-vn-khamthien-1', lng: 105.8372, lat: 21.0205, rot: -15 }, // Phố Khâm Thiên
            { id: '1946-vn-khamthien-2', lng: 105.8398, lat: 21.0210, rot: 30 }, // Xóm Nam Hương

            // 5. Khu vực Bán đảo Ngũ Xã & Ven Hồ Trúc Bạch / Hồ Tây
            { id: '1946-vn-nguxa-1', lng: 105.8392, lat: 21.0462, rot: 20 }, // Làng đúc đồng Ngũ Xã
            { id: '1946-vn-nguxa-2', lng: 105.8408, lat: 21.0452, rot: -30 }, // Bán đảo Ngũ Xã
            { id: '1946-vn-trucbach-1', lng: 105.8372, lat: 21.0475, rot: 45 }, // Phố Trấn Vũ
            { id: '1946-vn-yenphu-1', lng: 105.8452, lat: 21.0505, rot: -10 }, // Làng cổ Yên Phụ
            { id: '1946-vn-yenphu-2', lng: 105.8482, lat: 21.0492, rot: 40 } // Ven Đê Sông Hồng
        ];

        oldHanoiVietnameseHouses.forEach(vh => {
            this.placeModelAtCoords(vh.id, 'vietnamese_house', vh.lng, vh.lat, 6.5, vh.rot, '1946');
            // Cây xanh rợp bóng mát ven nhà
            this.placeModelAtCoords(vh.id + '-tree', 'tree', vh.lng + 0.00015, vh.lat + 0.00012, 13, 0, '1946');
        });

        // B. KHU VỰC THÀNH LÍNH (THÀNH HÀ NỘI 1946)
        const wallSegments = [
            // Tường Bắc (Phan Đình Phùng)
            { lng: 105.8380, lat: 21.0410, rot: 90 }, { lng: 105.8400, lat: 21.0410, rot: 90 }, { lng: 105.8420, lat: 21.0410, rot: 90 },
            // Tường Nam (Điện Biên Phủ)
            { lng: 105.8380, lat: 21.0320, rot: 90 }, { lng: 105.8400, lat: 21.0320, rot: 90 }, { lng: 105.8420, lat: 21.0320, rot: 90 },
            // Tường Tây (Hùng Vương)
            { lng: 105.8370, lat: 21.0340, rot: 0 }, { lng: 105.8370, lat: 21.0370, rot: 0 }, { lng: 105.8370, lat: 21.0390, rot: 0 },
            // Tường Đông (Nguyễn Tri Phương)
            { lng: 105.8430, lat: 21.0340, rot: 0 }, { lng: 105.8430, lat: 21.0370, rot: 0 }, { lng: 105.8430, lat: 21.0390, rot: 0 }
        ];
        wallSegments.forEach((w, idx) => {
            this.placeModelAtCoords('1946-wall-' + idx, 'townhouse', w.lng, w.lat, 14, w.rot, '1946');
        });

        const citadelBuildings = [
            { lng: 105.8390, lat: 21.0360, model: 'university', h: 18, rot: 0 },
            { lng: 105.8410, lat: 21.0360, model: 'default_building', h: 16, rot: 0 },
            { lng: 105.8400, lat: 21.0380, model: 'small_house', h: 12, rot: 90 },
            { lng: 105.8390, lat: 21.0345, model: 'small_house', h: 12, rot: 90 }
        ];
        citadelBuildings.forEach((cb, idx) => {
            this.placeModelAtCoords('1946-citadel-bld-' + idx, cb.model, cb.lng, cb.lat, cb.h, cb.rot, '1946');
        });

        // C. KHU PHỐ PHÁP CỔ (FRENCH QUARTER 1946)
        const frenchQuarterLandmarks = [
            { id: '1946-nha-hat-lon', name: 'Nhà Hát Lớn Hà Nội (Opera House 1946)', model: 'university', lng: 105.8575, lat: 21.0240, h: 28, rot: 45 },
            { id: '1946-nha-tho-lon', name: 'Nhà Thờ Lớn Hà Nội (St. Joseph)', model: 'church', lng: 105.8495, lat: 21.0285, h: 34, rot: 0 },
            { id: '1946-ga-hang-co', name: 'Ga Hàng Cỏ (Ga Hà Nội 1946)', model: 'university', lng: 105.8410, lat: 21.0245, h: 26, rot: 0 },
            { id: '1946-benh-vien-phu-doan', name: 'Bệnh viện Phủ Doãn', model: 'hospital', lng: 105.8475, lat: 21.0290, h: 22, rot: 0 },
            { id: '1946-truong-chu-van-an', name: 'Trường Bưởi (Chu Văn An)', model: 'school', lng: 105.8335, lat: 21.0450, h: 20, rot: 15 }
        ];
        frenchQuarterLandmarks.forEach(fl => {
            this.placeModelAtCoords(fl.id, fl.model, fl.lng, fl.lat, fl.h, fl.rot, '1946');
        });

        const frenchAvenues = [
            // Đại lộ Gambetta (Trần Hưng Đạo)
            { baseLng: 105.8440, baseLat: 21.0235, count: 5, dLng: 0.0040, dLat: -0.0010, model: 'apartment', h: 18, rot: -15 },
            // Phố Lý Thường Kiệt
            { baseLng: 105.8460, baseLat: 21.0250, count: 5, dLng: 0.0040, dLat: -0.0010, model: 'apartment', h: 16, rot: -15 },
            // Phố Hai Bà Trưng
            { baseLng: 105.8470, baseLat: 21.0265, count: 5, dLng: 0.0040, dLat: -0.0010, model: 'townhouse', h: 15, rot: -15 }
        ];
        frenchAvenues.forEach((fa, aIdx) => {
            for (let i = 0; i < fa.count; i++) {
                const lng = fa.baseLng + fa.dLng * i;
                const lat = fa.baseLat + fa.dLat * i;
                this.placeModelAtCoords('1946-french-villa-' + aIdx + '-' + i, fa.model, lng, lat, fa.h, fa.rot, '1946');
                this.placeModelAtCoords('1946-french-tree-' + aIdx + '-' + i, 'tree', lng + 0.0003, lat + 0.0003, 14, 0, '1946');
            }
        });

        // D. CẦU LONG BIÊN (PAUL DOUMER) 1946 VƯỢT SÔNG HỒNG
        const bridgeSpans = [
            { lng: 105.8560, lat: 21.0435, h: 22, rot: 35 },
            { lng: 105.8595, lat: 21.0450, h: 24, rot: 35 },
            { lng: 105.8630, lat: 21.0465, h: 24, rot: 35 },
            { lng: 105.8670, lat: 21.0480, h: 24, rot: 35 },
            { lng: 105.8710, lat: 21.0495, h: 22, rot: 35 }
        ];
        bridgeSpans.forEach((span, idx) => {
            this.placeModelAtCoords('1946-longbien-span-' + idx, 'townhouse', span.lng, span.lat, span.h, span.rot, '1946');
        });

        // E. CÂY CỔ THỤ VEN HỒ HOÀN KIẾM & VEN ĐÊ SÔNG HỒNG 1946
        const hoanKiemTrees = [
            { lng: 105.8510, lat: 21.0320 }, { lng: 105.8530, lat: 21.0325 },
            { lng: 105.8540, lat: 21.0290 }, { lng: 105.8540, lat: 21.0265 },
            { lng: 105.8525, lat: 21.0245 }, { lng: 105.8505, lat: 21.0270 },
            { lng: 105.8505, lat: 21.0300 }
        ];
        hoanKiemTrees.forEach((t, idx) => {
            this.placeModelAtCoords('1946-guom-tree-' + idx, 'tree', t.lng, t.lat, 15, idx * 30, '1946');
        });

        // F. CÁC LÀNG NGOẠI THÀNH 1946 (Kim Liên, Thịnh Hào, Phúc Xá, An Dương)
        const villageSpots = [
            { lng: 105.8340, lat: 21.0110, model: 'small_house' },
            { lng: 105.8310, lat: 21.0180, model: 'small_house' },
            { lng: 105.8560, lat: 21.0490, model: 'small_house' },
            { lng: 105.8300, lat: 21.0480, model: 'small_house' }
        ];
        villageSpots.forEach((v, idx) => {
            this.placeModelAtCoords('1946-village-' + idx, v.model, v.lng, v.lat, 10, 0, '1946');
            this.placeModelAtCoords('1946-village-tree-' + idx, 'tree', v.lng + 0.0002, v.lat + 0.0001, 14, 0, '1946');
        });

        // G. KHU VỰC LÀNG LÁNG & CHÙA LÁNG (CHIÊU THIỀN TỰ) NĂM 1946 VEN SÔNG TÔ LỊCH
        this.placeModelAtCoords('1946-chua-lang-tam-quan', 'pagoda', 105.80250, 21.02270, 20, 20, '1946');
        this.placeModelAtCoords('1946-chua-lang-tree-1', 'tree', 105.80220, 21.02310, 16, 0, '1946');
        this.placeModelAtCoords('1946-chua-lang-tree-2', 'tree', 105.80190, 21.02260, 16, 45, '1946');
        this.placeModelAtCoords('1946-chua-lang-tree-3', 'tree', 105.80240, 21.02240, 15, 90, '1946');

        // G2. DI TÍCH LỊCH SỬ PHÁO ĐÀI LÁNG (SỐ 8 PHỐ PHÁO ĐÀI LÁNG, LÁNG THƯỢNG, ĐỐNG ĐA, HÀ NỘI)
        // Nơi nổ những phát pháo lịch sử lúc 20h03 ngày 19/12/1946 mở màn Toàn quốc Kháng chiến
        this.placeModelAtCoords('1946-phao-dai-lang-cannon-1', 'cannon', 105.80665, 21.02105, 2.2, 45, '1946');
        this.placeModelAtCoords('1946-phao-dai-lang-cannon-2', 'cannon', 105.80685, 21.02095, 2.2, 40, '1946');
        this.placeModelAtCoords('1946-phao-dai-lang-bunker', 'small_house', 105.80645, 21.02120, 6, 45, '1946');
        this.placeModelAtCoords('1946-phao-dai-lang-tree-1', 'tree', 105.80640, 21.02090, 14, 0, '1946');
        this.placeModelAtCoords('1946-phao-dai-lang-tree-2', 'tree', 105.80695, 21.02120, 15, 30, '1946');

        // H. QUANG CẢNH NÔNG THÔN & MẠNG LƯỚI ĐỒNG RUỘNG RỘNG LỚN GIỮA LÁNG VÀ HÀ NỘI CŨ
        // 13 khối ruộng kéo rộng (mỗi khối 400m - 480m) phủ trọn toàn bộ các vùng đồng quê
        const ruralFarmlandZones = [
            // 1. Cánh đồng Làng Láng Thượng & Chùa Láng ven Sông Tô Lịch
            { id: '1946-rf-lang-1', lng: 105.8025, lat: 21.0245, span: 420, rot: 15 },
            { id: '1946-rf-lang-2', lng: 105.8045, lat: 21.0200, span: 420, rot: -10 },
            { id: '1946-rf-lang-3', lng: 105.8065, lat: 21.0250, span: 400, rot: 25 },

            // 2. Cánh đồng Giảng Võ trung tâm & Đê La Thành
            { id: '1946-rf-gv-1', lng: 105.8155, lat: 21.0275, span: 480, rot: 5 },
            { id: '1946-rf-gv-2', lng: 105.8205, lat: 21.0260, span: 480, rot: -15 },

            // 3. Cánh đồng Ngọc Khánh & Liễu Giai
            { id: '1946-rf-nk-1', lng: 105.8160, lat: 21.0325, span: 450, rot: 20 },
            { id: '1946-rf-nk-2', lng: 105.8210, lat: 21.0310, span: 450, rot: -5 },

            // 4. Cánh đồng Thành Công & Láng Hạ
            { id: '1946-rf-tc-1', lng: 105.8115, lat: 21.0195, span: 450, rot: -10 },
            { id: '1946-rf-tc-2', lng: 105.8165, lat: 21.0175, span: 450, rot: 15 },

            // 5. Cánh đồng Thái Hà & Nam Đồng & Khương Thượng
            { id: '1946-rf-th-1', lng: 105.8215, lat: 21.0150, span: 480, rot: 10 },
            { id: '1946-rf-nd-1', lng: 105.8250, lat: 21.0115, span: 480, rot: -20 },

            // 6. Cánh đồng Cầu Giấy & Voi Phục & Quan Hoa
            { id: '1946-rf-cg-1', lng: 105.8075, lat: 21.0325, span: 450, rot: -15 },
            { id: '1946-rf-cg-2', lng: 105.8105, lat: 21.0360, span: 450, rot: 20 }
        ];

        ruralFarmlandZones.forEach(rf => {
            this.placeModelAtCoords(rf.id, 'rice_field', rf.lng, rf.lat, rf.span, rf.rot, '1946');
        });

        // 2. Các xóm làng cổ nông thôn với nhà tranh, nhà gỗ truyền thống nằm giữa đồng ruộng
        const ruralVillages = [
            // Xóm Làng Láng (Láng Thượng / Chùa Láng)
            { id: '1946-lh-1', model: 'vietnamese_house', lng: 105.80320, lat: 21.02350, h: 6, rot: 15 },
            { id: '1946-lh-2', model: 'abandoned_house', lng: 105.80400, lat: 21.02280, h: 5.5, rot: -20 },
            { id: '1946-lh-3', model: 'small_house', lng: 105.80150, lat: 21.02180, h: 6, rot: 35 },
            { id: '1946-lh-4', model: 'vietnamese_house', lng: 105.80280, lat: 21.02120, h: 6, rot: 0 },
            { id: '1946-lh-5', model: 'abandoned_house', lng: 105.80480, lat: 21.02150, h: 5.5, rot: 80 },
            { id: '1946-lh-6', model: 'vietnamese_house', lng: 105.80550, lat: 21.02050, h: 6, rot: -45 },
            { id: '1946-lh-7', model: 'small_house', lng: 105.80380, lat: 21.01950, h: 6, rot: 10 },
            { id: '1946-lh-8', model: 'vietnamese_house', lng: 105.80620, lat: 21.01850, h: 6, rot: 40 },

            // Cụm Làng Giảng Võ (quanh Đầm Giảng Võ / Đê La Thành)
            { id: '1946-gv-1', model: 'vietnamese_house', lng: 105.8195, lat: 21.0260, h: 6, rot: 20 },
            { id: '1946-gv-2', model: 'abandoned_house', lng: 105.8205, lat: 21.0255, h: 5.5, rot: -30 },
            { id: '1946-gv-3', model: 'small_house', lng: 105.8185, lat: 21.0245, h: 6, rot: 75 },
            { id: '1946-gv-4', model: 'vietnamese_house', lng: 105.8210, lat: 21.0240, h: 6, rot: 0 },
            { id: '1946-gv-5', model: 'abandoned_house', lng: 105.8225, lat: 21.0270, h: 5.5, rot: 45 },
            { id: '1946-gv-6', model: 'small_house', lng: 105.8170, lat: 21.0275, h: 6, rot: -15 },

            // Cụm Làng Ngọc Khánh & Vạn Phúc
            { id: '1946-nk-1', model: 'vietnamese_house', lng: 105.8150, lat: 21.0305, h: 6, rot: 45 },
            { id: '1946-nk-2', model: 'small_house', lng: 105.8160, lat: 21.0298, h: 6, rot: -15 },
            { id: '1946-nk-3', model: 'abandoned_house', lng: 105.8140, lat: 21.0315, h: 5.5, rot: 60 },
            { id: '1946-nk-4', model: 'vietnamese_house', lng: 105.8175, lat: 21.0320, h: 6, rot: 10 },

            // Cụm Làng Thành Công & Hào Nam
            { id: '1946-tc-1', model: 'vietnamese_house', lng: 105.8140, lat: 21.0190, h: 6, rot: -10 },
            { id: '1946-tc-2', model: 'abandoned_house', lng: 105.8155, lat: 21.0175, h: 5.5, rot: 50 },
            { id: '1946-tc-3', model: 'small_house', lng: 105.8170, lat: 21.0200, h: 6, rot: 0 },
            { id: '1946-tc-4', model: 'vietnamese_house', lng: 105.8180, lat: 21.0210, h: 6, rot: -40 },
            { id: '1946-tc-5', model: 'abandoned_house', lng: 105.8125, lat: 21.0165, h: 5.5, rot: 25 },

            // Cụm Làng Thái Hà & Khương Thượng
            { id: '1946-th-1', model: 'vietnamese_house', lng: 105.8210, lat: 21.0150, h: 6, rot: 30 },
            { id: '1946-th-2', model: 'abandoned_house', lng: 105.8225, lat: 21.0135, h: 5.5, rot: -20 },
            { id: '1946-th-3', model: 'small_house', lng: 105.8245, lat: 21.0145, h: 6, rot: 90 },
            { id: '1946-th-4', model: 'vietnamese_house', lng: 105.8260, lat: 21.0120, h: 6, rot: -10 },

            // Cụm Làng Voi Phục & Cầu Giấy & Quan Hoa
            { id: '1946-vp-1', model: 'vietnamese_house', lng: 105.8075, lat: 21.0320, h: 6, rot: 15 },
            { id: '1946-vp-2', model: 'abandoned_house', lng: 105.8085, lat: 21.0305, h: 5.5, rot: -45 },
            { id: '1946-vp-3', model: 'small_house', lng: 105.8105, lat: 21.0330, h: 6, rot: 30 },
            { id: '1946-vp-4', model: 'vietnamese_house', lng: 105.8055, lat: 21.0345, h: 6, rot: 60 }
        ];

        ruralVillages.forEach(rv => {
            this.placeModelAtCoords(rv.id, rv.model, rv.lng, rv.lat, rv.h, rv.rot, '1946');
            // Cây xanh rợp bóng mát quanh mỗi nếp nhà
            this.placeModelAtCoords(rv.id + '-tree-1', 'tree', rv.lng + 0.00015, rv.lat + 0.00012, 14, 0, '1946');
            this.placeModelAtCoords(rv.id + '-tree-2', 'tree', rv.lng - 0.00012, rv.lat - 0.00010, 12, 45, '1946');
        });
    }

    /**
     * Quét và đặt mô hình 3D khít theo footprint thật của vector tile 'building'
     */
    private updateModels() {
        if (!this.isLoaded || !this.map) return;
        this.initLocalOrigin();
        if (!this.baseCoords || !this.originMC) return;

        // 1. Dựng các công trình lịch sử cố định / đại học
        this.fixedLandmarks.forEach(landmark => {
            if (this.models[landmark.model] && !this.placedModels.has(landmark.id)) {
                const era = (landmark as any).era || 'both';
                this.placeModelAtCoords(landmark.id, landmark.model, landmark.lng, landmark.lat, landmark.height, landmark.rot, era);
            }
        });

        // 2. Dựng cảnh quan đô thị và địa hình 3D Hà Nội năm 1946
        this.build1946HistoricalCity();

        // 3. Quét source-layer 'building' từ vector tile (công trình hiện đại)
        try {
            const style = this.map.getStyle();
            if (style && style.sources) {
                const center = this.map.getCenter();
                const candidateFeatures: Array<{ feature: any; distSq: number }> = [];

                for (const srcKey of Object.keys(style.sources)) {
                    const src = style.sources[srcKey];
                    if (src.type === 'vector') {
                        const features = this.map.querySourceFeatures(srcKey, { sourceLayer: 'building' });
                        for (const f of features) {
                            if (!f.geometry || (f.geometry.type !== 'Polygon' && f.geometry.type !== 'MultiPolygon')) continue;

                            const featureId = f.id != null ? f.id.toString() : (f.properties?.id?.toString() || null);
                            if (featureId && this.placedModels.has(featureId)) continue;

                            const rawCoords = f.geometry.type === 'Polygon'
                                ? f.geometry.coordinates[0]
                                : f.geometry.coordinates[0]?.[0];

                            if (!rawCoords || rawCoords.length < 3) continue;

                            const firstPt = rawCoords[0];
                            const dLng = firstPt[0] - center.lng;
                            const dLat = firstPt[1] - center.lat;
                            const distSq = dLng * dLng + dLat * dLat;

                            candidateFeatures.push({ feature: f, distSq });
                        }
                    }
                }

                candidateFeatures.sort((a, b) => a.distSq - b.distSq);
                const maxBuildingsToProcess = 50;
                const topCandidates = candidateFeatures.slice(0, maxBuildingsToProcess);

                for (const { feature: f } of topCandidates) {
                    const rawFirst = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0][0] : f.geometry.coordinates[0][0][0];
                    const featureId = f.id != null
                        ? f.id.toString()
                        : (f.properties?.id?.toString() || (rawFirst[0].toFixed(6) + '_' + rawFirst[1].toFixed(6)));

                    if (this.placedModels.has(featureId)) continue;

                    this.placeBuildingFromFeature(featureId, f);
                }
            }
        } catch (err) {
            console.warn('[3D Layer] Lỗi khi query source features:', err);
        }

        this.map.triggerRepaint();
    }

    private placeBuildingFromFeature(featureId: string, feature: any): boolean {
        const geom = feature.geometry;
        const outerRing = geom.type === 'Polygon' 
            ? geom.coordinates[0] 
            : geom.coordinates[0]?.[0];

        if (!outerRing || outerRing.length < 3) return false;

        const points: Array<{ x: number; z: number }> = [];
        for (let i = 0; i < outerRing.length; i++) {
            const coord = outerRing[i];
            const mc = maplibregl.MercatorCoordinate.fromLngLat([coord[0], coord[1]], 0);
            const x = (mc.x - this.originMC!.x) / this.meterScale;
            const z = (mc.y - this.originMC!.y) / this.meterScale;
            points.push({ x, z });
        }

        let signedArea = 0;
        let cx = 0;
        let cz = 0;
        const n = points.length;
        for (let i = 0; i < n - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const cross = p1.x * p2.z - p2.x * p1.z;
            signedArea += cross;
            cx += (p1.x + p2.x) * cross;
            cz += (p1.z + p2.z) * cross;
        }

        const area = Math.abs(signedArea / 2);
        if (area < 15) return false;

        if (Math.abs(signedArea) > 1e-4) {
            cx = cx / (3 * signedArea);
            cz = cz / (3 * signedArea);
        } else {
            cx = points.reduce((s, p) => s + p.x, 0) / points.length;
            cz = points.reduce((s, p) => s + p.z, 0) / points.length;
        }

        // Bỏ qua nếu đè lên landmark cố định
        for (const landmark of this.fixedLandmarks) {
            const mc = maplibregl.MercatorCoordinate.fromLngLat([landmark.lng, landmark.lat], 0);
            const lx = (mc.x - this.originMC!.x) / this.meterScale;
            const lz = (mc.y - this.originMC!.y) / this.meterScale;
            const distSq = (cx - lx) * (cx - lx) + (cz - lz) * (cz - lz);
            if (distSq < 50 * 50) {
                return false;
            }
        }

        let maxEdgeLenSq = 0;
        let bestAngle = 0;
        for (let i = 0; i < n - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            const dz = points[i + 1].z - points[i].z;
            const lenSq = dx * dx + dz * dz;
            if (lenSq > maxEdgeLenSq) {
                maxEdgeLenSq = lenSq;
                bestAngle = Math.atan2(dz, dx);
            }
        }

        const cosA = Math.cos(-bestAngle);
        const sinA = Math.sin(-bestAngle);
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (let i = 0; i < points.length; i++) {
            const relX = points[i].x - cx;
            const relZ = points[i].z - cz;
            const rotX = relX * cosA - relZ * sinA;
            const rotZ = relX * sinA + relZ * cosA;
            if (rotX < minX) minX = rotX;
            if (rotX > maxX) maxX = rotX;
            if (rotZ < minZ) minZ = rotZ;
            if (rotZ > maxZ) maxZ = rotZ;
        }

        const width = Math.max(maxX - minX, 4);
        const depth = Math.max(maxZ - minZ, 4);

        const props = feature.properties || {};
        let height = 15;
        if (props.render_height) height = Number(props.render_height);
        else if (props.height) height = Number(props.height);
        else if (props.levels) height = Number(props.levels) * 3.5;
        else if (props.building_levels) height = Number(props.building_levels) * 3.5;

        const modelId = this.pickModel(props, height, area, width, depth);
        const modelMeta = this.models[modelId];
        if (!modelMeta) return false;

        const clone = modelMeta.scene.clone(true);

        let scaleX = width / modelMeta.rawWidth;
        let scaleZ = depth / modelMeta.rawDepth;
        let scaleY = height / modelMeta.rawHeight;

        const buildingAspect = width / depth;
        const modelAspect = modelMeta.rawWidth / modelMeta.rawDepth;
        const aspectDiff = buildingAspect / modelAspect;

        if (aspectDiff > 1.5 || aspectDiff < 0.67) {
            const uniformScale = Math.min(scaleX, scaleZ);
            scaleX = uniformScale;
            scaleZ = uniformScale;
        }

        clone.scale.set(scaleX, scaleY, scaleZ);
        clone.position.set(cx, 0, cz);
        clone.rotation.set(0, -bestAngle, 0);
        clone.userData = {
            era: 'modern',
            baseScaleY: scaleY
        };

        this.scene.add(clone);
        this.placedModels.set(featureId, clone);
        return true;
    }

    private pickModel(properties: any, height: number, area: number, _width: number, _depth: number): string {
        const cls = (properties.class || properties.subclass || properties.type || properties.building || '').toLowerCase();

        if (['hospital', 'clinic', 'health'].includes(cls)) return 'hospital';
        if (['university', 'college'].includes(cls)) return 'university';
        if (['school', 'kindergarten'].includes(cls)) return 'school';
        if (['place_of_worship', 'church', 'cathedral', 'chapel'].includes(cls)) return 'church';
        if (['pagoda', 'temple', 'shrine'].includes(cls)) return 'pagoda';
        if (['supermarket', 'mall', 'shop', 'retail', 'commercial'].includes(cls)) return 'supermarket';
        if (['park', 'garden', 'forest', 'tree'].includes(cls)) return 'tree';

        if (height >= 45) {
            const highRises = ['skyscraper_1', 'skyscraper_2', 'skyscraper_3'];
            return highRises[Math.floor(Math.random() * highRises.length)];
        }
        if (height >= 25) {
            const mids = ['skyscraper_1', 'skyscraper_2', 'apartment', 'default_building'];
            return mids[Math.floor(Math.random() * mids.length)];
        }
        if (area < 100 && height <= 14) {
            return Math.random() > 0.4 ? 'small_house' : 'townhouse';
        }
        if (area < 250 && height <= 20) {
            return Math.random() > 0.5 ? 'townhouse' : 'apartment';
        }
        if (height > 18) {
            return 'apartment';
        }
        
        return 'default_building';
    }

    /**
     * Đặt mô hình 3D với phân loại thời kỳ lịch sử ('1946', 'modern', 'both')
     */
    public placeModelAtCoords(id: string, modelType: string, lng: number, lat: number, targetHeightMeters: number = 25, rotationDeg: number = 0, era: '1946' | 'modern' | 'both' = 'both') {
        if (!this.models[modelType] || this.placedModels.has(id) || !this.originMC) return;

        const modelMeta = this.models[modelType];
        const clone = modelMeta.scene.clone(true);

        const mc = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], 0);
        const posX = (mc.x - this.originMC.x) / this.meterScale;
        const posZ = (mc.y - this.originMC.y) / this.meterScale;

        let scaleX = targetHeightMeters / modelMeta.rawHeight;
        let scaleY = scaleX;
        let scaleZ = scaleX;

        if (modelType === 'rice_field') {
            // Kéo rộng khối ruộng ra phủ trọn cả vùng (380m - 480m mỗi khối)
            const targetSpan = targetHeightMeters > 50 ? targetHeightMeters : 420;
            scaleX = targetSpan / modelMeta.rawWidth;
            scaleZ = targetSpan / modelMeta.rawDepth;
            scaleY = 0.8 / modelMeta.rawHeight; // Cây lúa phẳng sát mặt đất (cao ~80cm)
        } else if (modelType === 'vietnamese_house') {
            // Nhà tranh cổ Việt Nam: kích thước thực tế ~12m x 8.5m, cao 6m
            scaleX = 12 / modelMeta.rawWidth;
            scaleZ = 8.5 / modelMeta.rawDepth;
            scaleY = 6.0 / modelMeta.rawHeight;
        } else if (modelType === 'abandoned_house') {
            // Nhà mái rạ mộc mạc: kích thước ~11m x 9m, cao 5.5m
            scaleX = 11 / modelMeta.rawWidth;
            scaleZ = 9 / modelMeta.rawDepth;
            scaleY = 5.5 / modelMeta.rawHeight;
        } else if (modelType === 'cannon') {
            // Ụ pháo lịch sử Pháo Đài Láng: dài ~5.5m, rộng ~4.0m, cao ~2.2m
            scaleX = 5.5 / modelMeta.rawWidth;
            scaleZ = 4.0 / modelMeta.rawDepth;
            scaleY = 2.2 / modelMeta.rawHeight;
        }

        clone.scale.set(scaleX, scaleY, scaleZ);
        clone.position.set(posX, 0, posZ);
        clone.rotation.set(0, (-rotationDeg * Math.PI) / 180, 0);

        clone.userData = {
            era,
            baseScaleY: scaleY
        };

        this.scene.add(clone);
        this.placedModels.set(id, clone);
    }

    /**
     * Render Scene và biến đổi mượt mà giữa không gian 1946 và 2026
     */
    public render(_gl: WebGL2RenderingContext, args: any) {
        if (!this.isLoaded || !this.renderer || !this.baseCoords) return;
        
        const sliderVal = useGameStore.getState().sliderValue;
        const modernFactor = Math.max(0.001, sliderVal);
        const pastFactor = Math.max(0.001, 1 - sliderVal);

        // Chuyển đổi trạng thái hiển thị và độ cao theo thời gian thực
        this.placedModels.forEach((group) => {
            const era = group.userData?.era || 'both';
            if (era === 'modern') {
                // Công trình hiện đại hạ thấp và ẩn khi lướt về quá khứ 1946
                group.scale.y = (group.userData?.baseScaleY || 1) * modernFactor;
                group.visible = sliderVal > 0.04;
            } else if (era === '1946') {
                // Công trình lịch sử 1946 trỗi dậy khi lướt về 1946
                group.scale.y = (group.userData?.baseScaleY || 1) * pastFactor;
                group.visible = (1 - sliderVal) > 0.04;
            } else {
                // Di tích trường tồn (Tháp Rùa, Văn Miếu, Chùa Láng...)
                group.visible = true;
            }
        });

        const matrix = args?.defaultProjectionData?.mainMatrix || args?.modelViewProjectionMatrix || args;
        if (!matrix) return;
        
        const mainMatrix = new THREE.Matrix4().fromArray(matrix);
        this.camera.projectionMatrix = mainMatrix.clone().multiply(this.originTransform);
        this.camera.matrixWorldInverse.identity();

        if (this.renderer.state?.reset) {
            this.renderer.state.reset();
        }

        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}
