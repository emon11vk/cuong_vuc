# Implementation Plan: Timeline Map

**Branch**: `001-timeline-map` | **Date**: 2026-08-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-timeline-map/spec.md`

## Summary

The Timeline Map feature enables users to view a 3D isometric map of historical locations and use a timeline slider to transition the visual style from modern 3D to a hand-drawn historical sketch style. It also includes an AR Camera mode to overlay historical assets onto the real world. Based on the requirement for Web deployment, **React, Three.js, and WebXR** have been chosen as the core technology stack.

## Technical Context

**Language/Version**: TypeScript, HTML, CSS
**Framework**: React 18 (via Vite)
**Primary Dependencies**: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/xr`, `tailwindcss`, `framer-motion`
**Storage**: Static JSON and GLTF/GLB models in the `public/` directory
**Testing**: Vitest, React Testing Library
**Target Platform**: Web Browsers (Chrome for Android recommended for WebXR AR support)
**Project Type**: Web Application (SPA)
**Performance Goals**: Maintain 60 fps during 3D map panning and shader transitions; 30-60 fps in AR mode.
**Constraints**: Must run smoothly on mid-range mobile devices via browser. Assets must have a polished, deliberate aesthetic that avoids the generic "AI-slop" look (AI tools can be used for creation, provided the final quality is high and curated).
**Scale/Scope**: Initial release focuses on 1-2 historical locations (e.g., Quảng Trị Citadel) packaged with the app.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Curated Aesthetic Mandate**: PASS. Three.js supports custom shaders and materials to achieve a high-quality, bespoke historical look without falling into generic "AI-slop" aesthetics.
- **Dual-Era Visual Transformation**: PASS. Easily achievable via Three.js ShaderMaterial and React state.
- **Interactive Exploration & AR**: PASS. `@react-three/xr` is perfectly suited for WebAR.

## Project Structure

### Documentation (this feature)

```text
specs/001-timeline-map/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (pending)
```

### Source Code (repository root)

```text
web-client/
├── public/                   # Static assets
│   ├── data/                 # location-data.json
│   ├── models/               # GLTF/GLB files
│   └── textures/             # Image textures
├── src/
│   ├── components/
│   │   ├── AR/               # AR setup, markers, XR buttons
│   │   ├── Map/              # MapLoader, CameraControls
│   │   └── UI/               # TimelineSlider, HUD
│   ├── shaders/              # GLSL shader files for Dual-Era blend
│   ├── store/                # Zustand/Context for global state
│   ├── types/                # TypeScript interfaces (Location, Era)
│   ├── App.tsx               # Main entry with Canvas
│   └── main.tsx
├── package.json
└── tailwind.config.js
```

**Structure Decision**: A standard Vite/React project structure separating 3D logic into `@react-three/fiber` components. Assets are kept in `public/` for easy fetching.

## Complexity Tracking

No constitution violations detected. Complexity is justified by the requirement for smooth 3D rendering and WebAR in the browser.
