# Feature Specification: Timeline Map

**Feature Branch**: `[001-timeline-map]`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "Xây dựng Giao diện Bản đồ và Thanh trượt: Khởi tạo layout chính với bản đồ 3D và thanh trượt (slider) thời gian ở dưới cùng màn hình (tương tự UI mẫu). Cơ chế Biến đổi Hình ảnh (Dual-Era Transformation): Lập trình logic để đổi style bản đồ từ 3D hiện đại (Hiện tại) sang dạng vẽ tay/sketch cổ xưa (Quá khứ) dựa trên vị trí của thanh trượt. Chế độ AR Camera: Thiết kế và tích hợp chế độ xem AR để hiển thị các công trình/nhân vật lịch sử đè lên camera thực tế."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Spatial and Temporal Navigation (Priority: P1)

As an app user, I want to view a 3D map and use a timeline slider to switch the visual representation between the modern day and a historical era, so that I can explore how a location looked in the past.

**Why this priority**: This is the core mechanic of the application (Timeline Map) and provides the primary interactive value.

**Independent Test**: Can be fully tested by loading a location, panning the map, and dragging the slider to observe the visual style change from 3D modern to sketch historical.

**Acceptance Scenarios**:

1. **Given** the app is open on the main map view, **When** the timeline slider is at the "Hiện tại" (Present) position, **Then** the map is rendered in a modern 3D isometric style.
2. **Given** the timeline slider is at the "Hiện tại" position, **When** the user drags the slider to the "Quá khứ" (Past) position, **Then** the map visual style transitions to a historical, hand-drawn sketch style.
3. **Given** the user is viewing the map in either era, **When** the user drags the map, **Then** the camera pans across the spatial environment smoothly.

---

### User Story 2 - Augmented Reality Historical View (Priority: P2)

As a visitor at a historical site, I want to activate an AR camera view to see historical structures and figures overlaid onto my physical surroundings, so that I can experience history in context.

**Why this priority**: Extends the core map experience into the real world, providing a highly engaging, location-based feature.

**Independent Test**: Can be tested independently by opening the AR view and verifying that virtual historical assets (structures, UI markers, characters) are correctly rendered over the live camera feed.

**Acceptance Scenarios**:

1. **Given** the user is on the main map view, **When** they tap the "Bật AR/Camera" (Enable AR/Camera) button, **Then** the app switches to a live camera feed view.
2. **Given** the AR camera view is active, **When** the device is pointed at a recognized physical location, **Then** historical 3D models or 2D assets are superimposed onto the camera feed at the correct positions.
3. **Given** the AR camera view is active, **When** the user interacts with the timeline slider on the AR screen, **Then** the AR overlays fade in or out depending on the selected era.

---

### Edge Cases

- What happens when the user's device does not support AR functionalities? (System should hide the AR button or show a polite "Not Supported" message).
- How does the system handle the map transition if the user drags the slider very quickly back and forth?
- What happens if GPS signal is lost while attempting to align AR overlays?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a primary map view capable of rendering 3D isometric environments.
- **FR-002**: System MUST render a timeline slider UI element persistently at the bottom of the main map view and AR view.
- **FR-003**: System MUST transition the map's rendering style from modern 3D to hand-drawn sketch style when the slider is moved from Present to Past.
- **FR-004**: System MUST allow users to pan and zoom the map in both visual styles.
- **FR-005**: System MUST provide a button to enter an AR camera mode.
- **FR-006**: System MUST access the device's camera and render virtual assets (structures, characters, markers) over the live feed in AR mode.
- **FR-007**: All visual assets used for the map and AR MUST have a high-quality, curated aesthetic (avoiding generic "AI-slop" look, though AI tools may be used to assist creation).

### Key Entities

- **Location Asset Bundle**: Represents the 3D models (present) and sketch models/textures (past) for a specific geographical area.
- **AR Marker/Anchor**: A spatial coordinate representing where historical assets should be placed in the real world.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The visual transition between Present (3D) and Past (Sketch) completes smoothly without dropping below 30 FPS on target devices.
- **SC-002**: Users can successfully launch the AR camera view and see overlays within 3 seconds of tapping the AR button.
- **SC-003**: The app successfully loads and renders the initial 3D map environment within 5 seconds on startup.

## Assumptions

- Users have devices with a Web Browser capable of rendering WebGL and supporting WebXR (e.g., Chrome on Android) for AR features.
- The "Past" visual style is a predefined alternative asset pack or a custom ShaderMaterial applied to the existing 3D geometry in Three.js.
- Location data and historical assets will be served statically from the Web server (`public/` directory).

