import { Coordinate } from '@/types/navigation';

export function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateAngle(from: Coordinate, to: Coordinate): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Convert to degrees, 0 degrees = north (up)
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  return angle;
}

export function moveTowardsPoint(
  current: Coordinate,
  target: Coordinate,
  speed: number
): Coordinate {
  const distance = calculateDistance(current, target);
  
  if (distance <= speed) {
    return target;
  }
  
  const ratio = speed / distance;
  return {
    x: current.x + (target.x - current.x) * ratio,
    y: current.y + (target.y - current.y) * ratio,
  };
}
