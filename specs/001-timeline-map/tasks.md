---
description: "Task list for Timeline Map feature implementation (Web Pivot)"
---

# Tasks: Timeline Map (Web)

**Input**: Design documents from `/specs/001-timeline-map/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Vite React + TS project `web-client`
- [x] T002 Initialize `web-client` with dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/xr`, `tailwindcss`, `framer-motion`, `zustand`
- [x] T003 [P] Create project folder structure (`src/components`, `src/shaders`, `src/store`, `public/data`, etc.)
- [x] T004 [P] Create `location-data.json` based on contract schema in `web-client/public/data/location-data.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create `HistoricalLocation`, `TimelineEra`, and `ARHistoricalMarker` TypeScript interfaces in `web-client/src/types/index.ts`
- [x] T006 [P] Setup global state management with Zustand for current location and era in `web-client/src/store/gameStore.ts`
- [x] T007 Implement data fetching logic to load `location-data.json` in `web-client/src/store/gameStore.ts`
- [x] T008 Setup base `App.tsx` layout with full-screen `@react-three/fiber` Canvas in `web-client/src/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Spatial and Temporal Navigation (Priority: P1) 🎯 MVP

**Goal**: View a 3D map and use a timeline slider to switch the visual representation between the modern day and a historical era.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create Dual-Era Transition ShaderMaterial (`TimelineBlendMaterial`) in `web-client/src/shaders/TimelineBlendMaterial.ts`
- [x] T010 [US1] Implement Map Loader component to render dummy 3D geometry with the shader in `web-client/src/components/Map/MapLoader.tsx`
- [x] T011 [P] [US1] Integrate `<CameraControls>` from `@react-three/drei` for pan/zoom in `web-client/src/components/Map/MapController.tsx`
- [x] T012 [P] [US1] Implement Timeline Slider UI component using Tailwind in `web-client/src/components/UI/TimelineSlider.tsx`
- [x] T013 [US1] Link Timeline Slider value to Zustand store and update the ShaderMaterial uniform in `web-client/src/components/UI/TimelineSlider.tsx`
- [x] T014 [US1] Integrate Map Loader, Camera Controls, and UI into `web-client/src/App.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently in the browser.

---

## Phase 4: User Story 2 - Augmented Reality Historical View (Priority: P2)

**Goal**: Activate an AR camera view to see historical structures and figures overlaid onto physical surroundings via WebXR.

### Implementation for User Story 2

- [x] T015 [P] [US2] Integrate `<ARButton>` and wrap Canvas with `<XR>` provider from `@react-three/xr` in `web-client/src/App.tsx`
- [x] T016 [P] [US2] Create AR Marker Manager component to place virtual anchors based on JSON data in `web-client/src/components/AR/ARMarkerManager.tsx`
- [x] T017 [US2] Implement AR Asset Spawner to render basic 3D shapes/sprites at marker locations in `web-client/src/components/AR/ARAssetSpawner.tsx`
- [x] T018 [US2] Implement AR Era Controller logic to fade AR assets in/out based on Zustand era state in `web-client/src/components/AR/AREraController.tsx`
- [x] T019 [US2] Handle WebXR unsupported edge cases (hide AR button gracefully) using `navigator.xr` check.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T020 [P] Add Framer Motion animations for smooth UI appearance in `web-client/src/components/UI/TimelineSlider.tsx`
- [x] T021 Code cleanup and WebGL performance profiling.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Sequentially in priority order (US1 -> US2).
- **Polish (Final Phase)**: Depends on all desired user stories being complete



## Phase 6: Convergence

- [x] T022 Implement AR Era Controller logic to smoothly fade AR assets in/out per US2/AC3 (missing)
- [x] T023 Add Framer Motion animations to TimelineSlider for smooth UI appearance per T020 (missing)
