import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

export function DebugOverlay() {
  const { currentPosition, debugGPS, localizationMode, captureConfidence, getCurrentGPSPosition, isCapturing } = useLocalization();

  return (
    <AnimatePresence>
      {debugGPS && (
        <motion.div
          className="absolute bottom-32 right-6 z-30 px-4 py-3 rounded-lg backdrop-blur-[20px]"
          style={{
            background: 'rgba(15, 25, 35, 0.9)',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="text-xs text-[#00E5FF] mb-2">
            Mode: {localizationMode}
          </div>
          <div className="text-xs text-[#00E5FF] mb-2">
            x: {currentPosition.x.toFixed(1)}, y: {currentPosition.y.toFixed(1)}
          </div>
          {captureConfidence && (
            <div className="text-xs text-[#00E5FF] mb-2">
              Confidence: {(captureConfidence * 100).toFixed(1)}%
            </div>
          )}
          <button
            onClick={getCurrentGPSPosition}
            disabled={isCapturing}
            className="flex items-center gap-2 px-3 py-1 text-xs bg-[#00E5FF]/20 text-[#00E5FF] rounded hover:bg-[#00E5FF]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MapPin className="w-3 h-3" />
            Get GPS
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
