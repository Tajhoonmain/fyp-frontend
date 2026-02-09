import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface DestinationsButtonProps {
  onClick: () => void;
}

export function DestinationsButton({ onClick }: DestinationsButtonProps) {
  return (
    <motion.button
      className="absolute bottom-6 left-6 z-30 px-5 py-3 rounded-full backdrop-blur-[20px] flex items-center gap-2"
      style={{
        background: 'rgba(15, 25, 35, 0.7)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      whileHover={{
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.6)',
      }}
    >
      <MapPin className="w-5 h-5 text-[#00E5FF]" />
      <span
        className="text-sm font-medium text-[#00E5FF]"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Destinations
      </span>
    </motion.button>
  );
}
