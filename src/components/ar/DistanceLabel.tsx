import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '@/contexts/NavigationContext';

export function DistanceLabel() {
  const { isNavigating, distanceToWaypoint, hasArrived } = useNavigation();
  const [displayDistance, setDisplayDistance] = useState(0);

  useEffect(() => {
    setDisplayDistance(Math.round(distanceToWaypoint));
  }, [distanceToWaypoint]);

  if (!isNavigating) {
    return null;
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-24 z-20"
      key={displayDistance}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <div
          className="text-[72px] font-bold tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            color: '#00E5FF',
            textShadow: '0 0 30px rgba(0, 229, 255, 0.8), 0 0 60px rgba(0, 229, 255, 0.4)',
          }}
        >
          {hasArrived ? 'Arrived' : `${displayDistance}m`}
        </div>
        {hasArrived && (
          <motion.div
            className="mt-4 w-32 h-32 mx-auto rounded-full border-4 border-[#00E5FF]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 40px rgba(0, 229, 255, 0.8)',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
