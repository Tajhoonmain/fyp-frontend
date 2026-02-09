import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

export function CaptureButton() {
  const { captureAndLocalize, isCapturing } = useLocalization();

  const handleClick = () => {
    captureAndLocalize();
  };

  return (
    <motion.button
      className="absolute bottom-6 right-6 z-30 w-16 h-16 rounded-full backdrop-blur-[20px] flex items-center justify-center"
      style={{
        background: 'rgba(15, 25, 35, 0.7)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
      }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={isCapturing}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      {isCapturing ? (
        <motion.div
          className="w-6 h-6 border-2 border-[#00E5FF] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <Camera className="w-6 h-6 text-[#00E5FF]" />
      )}
    </motion.button>
  );
}
