export interface Coordinate {
  x: number;
  y: number;
}

export interface Waypoint extends Coordinate {
  id: string;
  name: string;
}

export interface Destination {
  id: string;
  name: string;
  building: string;
  coordinate: Coordinate;
  waypoints: Coordinate[];
}

export type LocalizationMode = 'Simulated' | 'Backend CV' | 'GPS' | 'AR (Stubbed)';

export interface BackendLocalizationResponse {
  x: number;
  y: number;
  building: string;
  confidence: number;
}

export interface NavigationState {
  isNavigating: boolean;
  currentDestination: Destination | null;
  currentWaypointIndex: number;
  distanceToWaypoint: number;
  hasArrived: boolean;
}
