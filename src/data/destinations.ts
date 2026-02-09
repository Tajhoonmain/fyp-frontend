import { Destination } from '@/types/navigation';

// GIKI Campus local coordinates (matching backend coordinate system)
// These coordinates should align with your giki_graph.json nodes
export const destinations: Destination[] = [
  {
    id: 'fcse',
    name: 'Faculty of Computer Science & Engineering',
    building: 'FCSE',
    coordinate: { x: 1377, y: 279 }, // Node from giki_graph.json
    waypoints: [
      { x: 1200, y: 200 }, // Entrance area
      { x: 1377, y: 279 }, // FCSE building
    ],
  },
  {
    id: 'library',
    name: 'Central Library',
    building: 'Library',
    coordinate: { x: 890, y: 450 }, // Approximate library location
    waypoints: [
      { x: 1200, y: 200 }, // Start point
      { x: 890, y: 450 }, // Library
    ],
  },
  {
    id: 'fme',
    name: 'Faculty of Mechanical Engineering',
    building: 'FME',
    coordinate: { x: 1100, y: 350 }, // Approximate FME location
    waypoints: [
      { x: 1200, y: 200 }, // Start point
      { x: 1100, y: 350 }, // FME
    ],
  },
  {
    id: 'cafeteria',
    name: 'Main Cafeteria',
    building: 'Cafeteria',
    coordinate: { x: 950, y: 600 }, // Approximate cafeteria location
    waypoints: [
      { x: 1200, y: 200 }, // Start point
      { x: 950, y: 600 }, // Cafeteria
    ],
  },
  {
    id: 'acb',
    name: 'Academic Block',
    building: 'ACB',
    coordinate: { x: 1500, y: 400 }, // Approximate ACB location
    waypoints: [
      { x: 1200, y: 200 }, // Start point
      { x: 1500, y: 400 }, // ACB
    ],
  },
];

export const defaultStartPosition = { x: 1200, y: 200 }; // Campus entrance/starting point
