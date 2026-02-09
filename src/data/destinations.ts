import { Destination } from '@/types/navigation';

// GIKI Campus GPS coordinates (approximate)
const GIKI_CENTER = { lat: 33.6844, lng: 73.0479 };

// Convert GPS to local coordinates
function gpsToLocal(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - GIKI_CENTER.lng) * 111320;
  const y = (GIKI_CENTER.lat - lat) * 111320;
  return { x, y };
}

export const destinations: Destination[] = [
  {
    id: 'fcse',
    name: 'Faculty of Computer Science & Engineering',
    building: 'FCSE',
    coordinate: gpsToLocal(33.6852, 73.0485), // FCSE building
    waypoints: [
      gpsToLocal(33.6846, 73.0479), // Entrance
      gpsToLocal(33.6852, 73.0485), // FCSE
    ],
  },
  {
    id: 'fme',
    name: 'Faculty of Mechanical Engineering',
    building: 'FME',
    coordinate: gpsToLocal(33.6848, 73.0475), // FME building
    waypoints: [
      gpsToLocal(33.6846, 73.0479), // Entrance
      gpsToLocal(33.6848, 73.0475), // FME
    ],
  },
  {
    id: 'library',
    name: 'Central Library',
    building: 'Library',
    coordinate: gpsToLocal(33.6840, 73.0482), // Library
    waypoints: [
      gpsToLocal(33.6846, 73.0479), // Start point
      gpsToLocal(33.6840, 73.0482), // Library
    ],
  },
  {
    id: 'cafeteria',
    name: 'Main Cafeteria',
    building: 'Cafeteria',
    coordinate: gpsToLocal(33.6838, 73.0472), // Cafeteria
    waypoints: [
      gpsToLocal(33.6846, 73.0479), // Start point
      gpsToLocal(33.6838, 73.0472), // Cafeteria
    ],
  },
  {
    id: 'acb',
    name: 'Academic Block',
    building: 'ACB',
    coordinate: gpsToLocal(33.6850, 73.0490), // Academic Block
    waypoints: [
      gpsToLocal(33.6846, 73.0479), // Start point
      gpsToLocal(33.6850, 73.0490), // ACB
    ],
  },
];

export const defaultStartPosition = gpsToLocal(33.6846, 73.0479); // Campus entrance
