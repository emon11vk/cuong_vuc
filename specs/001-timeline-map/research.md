# Phase 0: Research

## Technology Choice: Core Framework & 3D/AR Engine

**Decision**: Unity 3D (with ARFoundation) exported as an iOS/Android mobile application.

**Rationale**: 
- **3D & Smooth Movement**: Unity is an industry-standard game engine optimized for 3D rendering and smooth camera movement. It easily handles panning, zooming, and transitioning between 3D states on mobile devices without dropping frames (meeting the 60fps/smooth movement requirement).
- **Dual-Era Visual Transformation**: The requirement to transition from a "modern 3D" look to a "historical sketch" look can be elegantly achieved using Unity's Shader Graph or custom post-processing materials. The timeline slider can simply drive a float parameter in a global shader to blend between the two styles, or swap textures/models seamlessly.
- **AR Camera**: Unity's ARFoundation provides a unified framework to compile to both ARKit (iOS) and ARCore (Android), ensuring high-quality AR experiences for placing historical assets in the real world.
- **Non-AI Design Mandate**: Unity supports traditional asset pipelines (FBX, OBJ, hand-drawn 2D sprites, custom materials) perfectly, allowing human artists to implement the required visual styles without relying on generative AI.

**Alternatives considered**:
- *React Native (with React Three Fiber + ViroReact)*: Excellent for the UI portion, but creating complex, performant custom shaders (for the sketch effect) and handling robust cross-platform AR is more fragile and less performant than Unity.
- *Flutter (with Flame3D or flutter_3d_controller)*: 3D and AR ecosystems in Flutter are currently too immature for a production-grade 3D map with seamless shader transitions and AR overlays.
- *Web App / PWA (Three.js + WebXR)*: WebXR AR support is excellent on Android but severely limited on iOS (Safari), making it unsuitable for a cross-platform mobile AR app.

## Project Structure & Architecture

**Decision**: Unity Mobile Project with standard C# architecture (MVC/MVP for UI).

**Rationale**: Since the entire experience (3D map, slider UI, AR Camera) revolves around 3D rendering, building the entire app in Unity is the most cohesive approach. Unity UI (uGUI or UI Toolkit) can easily handle the bottom slider and buttons shown in the sample design.

## Asset Pipeline for Non-AI Mandate

**Decision**: 
- 3D Models: Created in Blender/Maya (by humans).
- Textures & Sketch Style: Hand-drawn textures mapped to 3D models, or a custom toon/sketch shader applied to the geometry. 

**Rationale**: Ensures compliance with the constitution's strict prohibition on AI-generated assets while delivering the "hồi cổ, xưa cũ" aesthetic.

