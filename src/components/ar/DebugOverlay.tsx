import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '@/contexts/LocalizationContext';

export function DebugOverlay() {
  const { currentPosition, debugGPS } = useLocalization();

  return (
    <AnimatePresence>
      {debugGPS && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg backdrop-blur-[20px]"
          style={{
            background: 'rgba(15, 25, 35, 0.9)',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="text-xs text-[#00E5FF]">
            x: {currentPosition.x.toFixed(1)}, y: {currentPosition.y.toFixed(1)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
