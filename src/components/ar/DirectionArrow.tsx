import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '@/contexts/NavigationContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { calculateAngle } from '@/utils/navigation';

export function DirectionArrow() {
  const { isNavigating, currentDestination, currentWaypointIndex, distanceToWaypoint, hasArrived } =
    useNavigation();
  const { currentPosition } = useLocalization();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isNavigating || !currentDestination || hasArrived) {
      return;
    }

    const waypoints = currentDestination.waypoints;
    if (currentWaypointIndex >= waypoints.length) {
      return;
    }

    const targetWaypoint = waypoints[currentWaypointIndex];
    const angle = calculateAngle(currentPosition, targetWaypoint);
    setRotation(angle);

    // Scale up when within 10m
    setScale(distanceToWaypoint < 10 ? 1.1 : 1);
  }, [
    isNavigating,
    currentDestination,
    currentWaypointIndex,
    currentPosition,
    distanceToWaypoint,
    hasArrived,
  ]);

  if (!isNavigating || hasArrived) {
    return null;
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      animate={{ rotate: rotation, scale }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        animate={
          distanceToWaypoint < 10
            ? {
                filter: [
                  'drop-shadow(0 0 20px rgba(0, 229, 255, 0.6))',
                  'drop-shadow(0 0 40px rgba(0, 229, 255, 0.9))',
                  'drop-shadow(0 0 20px rgba(0, 229, 255, 0.6))',
                ],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        >
          {/* Arrow body */}
          <path
            d="M60 10 L70 50 L65 50 L65 80 L55 80 L55 50 L50 50 Z"
            fill="url(#arrowGradient)"
            stroke="#00E5FF"
            strokeWidth="2"
          />
          {/* Arrow head */}
          <path
            d="M60 0 L80 30 L60 20 L40 30 Z"
            fill="#00E5FF"
            stroke="#00E5FF"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="arrowGradient" x1="60" y1="10" x2="60" y2="80">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="rgba(0, 229, 255, 0.4)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  );
}
