# Validation Quickstart: Timeline Map

This guide outlines how to validate the core features of the Timeline Map Unity application once implemented.

## Prerequisites

- Unity 2022.3 LTS (or newer) with iOS/Android Build Support.
- A compatible physical device (iOS with ARKit support or Android with ARCore support) for testing AR features.
- The `location-data.json` mock file loaded into the project's `StreamingAssets` folder.

## Scenario 1: Spatial and Temporal Navigation

**Goal**: Verify that the 3D map renders correctly and transitions between eras smoothly.

1. Open the project in Unity Editor.
2. Open the scene `Scenes/MainMap`.
3. Enter Play Mode.
4. **Validation**:
   - The map should render the "Hiện tại" (Present) modern 3D view.
   - Click and drag the map area with the mouse to verify panning works.
   - Click and drag the UI Timeline Slider at the bottom to the "1972" (Past) position.
   - The map visual style MUST transition smoothly to the hand-drawn sketch style.
   - Ensure there are no generative AI artifacts; materials should look hand-crafted.

## Scenario 2: AR Camera View

**Goal**: Verify that the AR camera initializes and renders historical markers in real space.

1. Build the project to a physical mobile device (ARFoundation does not fully simulate in the standard editor without a companion app).
2. Launch the app on the device.
3. Tap the "Bật AR/Camera" button in the bottom right corner of the map.
4. **Validation**:
   - The device camera feed should appear on screen.
   - Pan the device slowly to allow ARFoundation to detect environmental planes.
   - Move the timeline slider to "1972".
   - Virtual assets (e.g., a 2D sketch soldier or 3D bunker entrance) should appear superimposed over the camera feed.
   - Moving the slider back to "Hiện tại" should fade out the historical assets.

