import { Destination } from '@/types/navigation';

export const destinations: Destination[] = [
  {
    id: 'fcse',
    name: 'Faculty of Computer Science & Engineering',
    building: 'FCSE',
    coordinate: { x: 0, y: 0 },
    waypoints: [{ x: 0, y: 0 }],
  },
  {
    id: 'fme',
    name: 'Faculty of Mechanical Engineering',
    building: 'FME',
    coordinate: { x: 50, y: 30 },
    waypoints: [
      { x: 20, y: 10 },
      { x: 35, y: 20 },
      { x: 50, y: 30 },
    ],
  },
  {
    id: 'fmce',
    name: 'Faculty of Materials & Chemical Engineering',
    building: 'FMCE',
    coordinate: { x: 100, y: 50 },
    waypoints: [
      { x: 20, y: 10 },
      { x: 35, y: 20 },
      { x: 50, y: 30 },
      { x: 75, y: 40 },
      { x: 100, y: 50 },
    ],
  },
  {
    id: 'fbs',
    name: 'Faculty of Basic Sciences',
    building: 'FBS',
    coordinate: { x: 30, y: 80 },
    waypoints: [
      { x: 20, y: 20 },
      { x: 25, y: 50 },
      { x: 30, y: 80 },
    ],
  },
  {
    id: 'acb',
    name: 'Academic Block',
    building: 'ACB',
    coordinate: { x: 120, y: 90 },
    waypoints: [
      { x: 20, y: 20 },
      { x: 50, y: 40 },
      { x: 80, y: 60 },
      { x: 100, y: 75 },
      { x: 120, y: 90 },
    ],
  },
  {
    id: 'library',
    name: 'Central Library',
    building: 'Library',
    coordinate: { x: 150, y: 40 },
    waypoints: [
      { x: 30, y: 10 },
      { x: 60, y: 15 },
      { x: 90, y: 20 },
      { x: 120, y: 30 },
      { x: 150, y: 40 },
    ],
  },
  {
    id: 'cafeteria',
    name: 'Main Cafeteria',
    building: 'Cafeteria',
    coordinate: { x: 80, y: 120 },
    waypoints: [
      { x: 20, y: 30 },
      { x: 40, y: 60 },
      { x: 60, y: 90 },
      { x: 80, y: 120 },
    ],
  },
];

export const defaultStartPosition = { x: 0, y: 0 }; // FCSE
