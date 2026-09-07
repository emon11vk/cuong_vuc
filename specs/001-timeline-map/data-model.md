# Data Model: Timeline Map

This application primarily relies on 3D asset bundles and configuration data rather than a traditional relational database.

## Core Entities

### 1. `HistoricalLocation`
Represents a geographical location that has a map and historical data available (e.g., "Quảng Trị Citadel").

**Fields**:
- `id` (String): Unique identifier (e.g., `quang-tri-citadel`).
- `name` (String): Display name (e.g., "Thành cổ Quảng Trị").
- `coordinates` (LatLong): Real-world GPS coordinates of the center point.
- `mapAssetBundleId` (String): Reference to the 3D map asset bundle.

### 2. `TimelineEra`
Represents a specific time period for a location.

**Fields**:
- `id` (String): Unique identifier (e.g., `1972`, `present`).
- `year` (Integer): The year represented (e.g., 1972, 2026).
- `displayName` (String): Label for the UI (e.g., "Hiện tại", "1972").
- `visualStyleId` (String): Identifier for the shader/material profile to apply (e.g., `style_modern_3d`, `style_antique_sketch`).

### 3. `ARHistoricalMarker`
Represents an object or point of interest to be overlaid in AR space at a specific location.

**Fields**:
- `id` (String): Unique identifier.
- `locationId` (String): The `HistoricalLocation` this marker belongs to.
- `eraId` (String): The `TimelineEra` this marker is visible in.
- `relativePosition` (Vector3): 3D coordinates relative to the location's center point or a specific real-world anchor.
- `assetType` (Enum: `3D_MODEL`, `2D_SPRITE`, `UI_LABEL`): What type of asset to render.
- `assetReference` (String): Path or ID to the actual visual asset (e.g., `soldier_1972_model`, `bunker_entrance_label`).

## State Transitions

- **Timeline Slide**: When the UI slider moves between 0 (Past) and 1 (Present), a global shader variable (`_TimelineBlend`) is updated. The map materials read this variable to blend between the modern textures/geometry and the sketch textures/geometry.
- **View Mode Switch**: Toggling between `MapMode` and `ARMode`. 
  - `MapMode`: Renders the top-down isometric 3D camera.
  - `ARMode`: Activates ARFoundation, disables the isometric camera, turns on the device camera feed, and aligns the `ARHistoricalMarker` objects to physical anchors.

