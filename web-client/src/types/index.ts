export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TimelineEra {
  id: string;
  year: number;
  displayName: string;
  visualStyleId: string;
}

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface ARHistoricalMarker {
  id: string;
  eraId: string;
  relativePosition: Vector3Data;
  assetType: '3D_MODEL' | '2D_SPRITE' | 'UI_LABEL';
  assetReference: string;
}

export interface HistoricalLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  eras: TimelineEra[];
  arMarkers: ARHistoricalMarker[];
}

